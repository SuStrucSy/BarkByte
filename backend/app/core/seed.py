# app/scripts/seed_specimens.py
import argparse
import csv
import uuid
import re

from sqlmodel import Session, select
from sqlalchemy import func

from app.core.db import engine
from app.core.config import settings
from app.models.user import User
from app.models.failuremode import FailureMode
from app.models.joinerytype import JoineryType
from app.models.subjoinerytype import SubJoineryType
from app.models.fastenertype import FastenerType
from app.models.loadingdirection import LoadingDirection
from app.schemas.specimen import SpecimenCreate
from app.schemas.doi import DOICreate
from app.schemas.fastenertype import FastenerTypeCreate
from app.enums import AssemblyType, Practice, TestLoadingType, YieldPointMethod
from app.core.config import settings
from app.crud import specimen as specimen_crud
from app.crud import doi as doi_crud
from app.crud import fastenertype as fastener_type_crud

def normalize_label(label: str) -> str:
    """Normalize text: lowercase, remove spaces, hyphens, and underscores."""
    return re.sub(r"[\s\-_]+", "", label.strip().lower())

def normalize_failure_label_spacing(label: str) -> str:
    """Ensure a single space after a colon so 'Dowel:Pullout' matches 'Dowel: Pullout'."""
    return re.sub(r":\s*", ": ", label.strip())

def normalize_doi_cell(raw: str, spec_id: str) -> str | None:
    """
    Clean DOI/URL cells:
    - unwrap surrounding '#...#'
    - if duplicated back-to-back, take the first URL
    """
    s = (raw or "").strip()
    if not s:
        return None
    # unwrap #...#
    if s.startswith("#") and s.endswith("#") and len(s) > 2:
        s = s[1:-1].strip()
    # grab first URL
    match = re.search(r"https?://[^\s,#]+(?:\s+[^\s,#]+)*", s)
    if match:
        url = re.sub(r"\s+", "", match.group(0))
        if url != s:
            print(f"⚠️ Spec ID {spec_id}: DOI cleaned from '{raw}' to '{url}'")
        return url
    print(f"⚠️ Spec ID {spec_id}: DOI looks invalid ('{raw}'), using raw value")
    return s

def parse_numeric_field(value: str, field_name: str, spec_id: str) -> float:
    """
    Parse a numeric field, default to 0 with a warning if it's not a number.
    """
    s = str(value).strip() if value is not None else ""
    try:
        return float(s)
    except (ValueError, TypeError):
        print(f"⚠️ Spec ID {spec_id}: '{field_name}' is non-numeric ('{value}'), defaulting to 0")
        return 0.0

def map_loading_direction_labels_to_ids(session: Session, labels: list[str]) -> list[uuid.UUID]:
    result_ids = []
    # Fetch all loading directions once for efficiency
    all_dirs = session.exec(select(LoadingDirection)).all()

    for label in labels:
        normalized_label = normalize_label(label)
        match = None

        for direction in all_dirs:
            if normalize_label(direction.label) == normalized_label:
                match = direction
                break

        if match:
            result_ids.append(match.id)
        else:
            print(f"⚠️ Warning: loading direction not found for label '{label}'")

    return result_ids

def map_failure_labels_to_ids(session: Session, labels: list[str]) -> list[uuid.UUID]:
    result_ids = []
    for label in labels:
        label = normalize_failure_label_spacing(label)
        failure_mode = session.exec(
            select(FailureMode)
            .where(FailureMode.label.ilike(f"%{label.strip()}%"))
        ).first()
        if failure_mode:
            result_ids.append(failure_mode.id)
        else:
            print(f"⚠️ Warning: failure mode not found for label '{label}'")
    return result_ids

def map_fastener_labels_to_ids(session: Session, labels_string: str, fastener_numbers: int) -> list[uuid.UUID]:
    result_ids = []
    if fastener_numbers == 0:
        return result_ids
    elif fastener_numbers > 0:
        labels=labels_string.split(';')

    for label in labels:
        normalized_label = label.strip().lower()

        if normalized_label == "" or normalized_label == "n/a" or normalized_label == "na" or normalized_label == "none":
            continue

        fastener_type = session.exec(
            select(FastenerType)
            .where(func.lower(FastenerType.label) == normalized_label)
        ).first()
        
        if not fastener_type:    
            print(f"⚠️ Warning: fastener type not found for label '{label}'. Adding...")
            # need to add logic to create new fastener types if not found
            fastener_type = fastener_type_crud.create_fastener_type(session=session, fastener_type_in=FastenerTypeCreate(label=label.strip()))
        
        result_ids.append(fastener_type.id)

    return result_ids

def map_joinery_type_label_to_id(session: Session, label: str) -> tuple[uuid.UUID, bool] | None:
    
    if not label:
        return None
    normalized_label = label.strip().lower()

    joinery_type = session.exec(
        select(JoineryType)
        .where(func.lower(JoineryType.label) == normalized_label)
    ).first()
    if joinery_type:
        return joinery_type.id, bool(joinery_type.has_dowel)
    else:
        print(f"⚠️ Warning: joinery type not found for label '{label}'")
        return None
    
def map_sub_joinery_type_label_to_id(session: Session, label: str) -> uuid.UUID | None:    
    normalized_label = label.strip().lower()

    sub_joinery_type = session.exec(
        select(SubJoineryType)
        .where(
            func.lower(SubJoineryType.label) == normalized_label
        )
    ).first()
    if sub_joinery_type:
        return sub_joinery_type.id
    else:
        print(f"⚠️ Warning: sub-joinery type not found for label '{label}''")
        return None

def map_assembly_type(label: str) -> AssemblyType | None:
    if not label or not label.strip():
        return None

    # Normalize spacing and casing
    parts = [p.strip().lower() for p in label.split(';') if p.strip()]
    parts = sorted(set(parts))  # remove duplicates and normalize order

    if parts == ["wall-floor", "wall-wall"]:
        return AssemblyType.WALLWALLFLOOR
    elif len(parts) == 1:
        if parts[0] == "wall-floor":
            return AssemblyType.WALLFLOOR
        elif parts[0] == "wall-wall":
            return AssemblyType.WALLWALL
    else:
        print(f"⚠️ Warning: Unknown assembly type combination '{label}'")
        return None

def map_practice_type(label: str) -> Practice | None:
    normalized_label = label.strip().lower()
    if normalized_label == "conventional":
        return Practice.CONVENTIONAL
    elif normalized_label == "r&d":
        return Practice.RESEARCHANDDEVELOPMENT
    else:
        print(f"⚠️ Warning: Unknown practice type '{label}'")
        return None

def map_test_loading_type(label: str) -> str | None:
    normalized_label = label.strip().lower()
    if normalized_label == "cyclic load":
        return TestLoadingType.CYCLIC
    elif normalized_label == "monotonic load":
        return TestLoadingType.MONOTONIC
    elif normalized_label == "cyclic load;monotonic load":
        return TestLoadingType.MONOTONICANDCYCLIC
    else:
        print(f"⚠️ Warning: Unknown test loading type '{label}'")
        return None

def map_yield_point_method(label: str) -> str | None:
    normalized_label = label.strip().lower()
    if normalized_label == "cen 1/6 method":
        return YieldPointMethod.CEN16
    elif normalized_label == "eeep method":
        return YieldPointMethod.EEEP
    elif normalized_label == "fema p795":
        return YieldPointMethod.FEMAP795
    else:
        print(f"⚠️ Warning: Unknown yield point method '{label}'")
        return None

def have_connector(connector_mechanical_properties: str) -> bool:
    if not connector_mechanical_properties or not connector_mechanical_properties.strip():
        return False
    return True

def map_fastener_numbers(fastener_numbers_str: str) -> int:
    if not fastener_numbers_str or not fastener_numbers_str.strip():
        return 0
    try:
        return int(fastener_numbers_str.strip())
    except ValueError:
        return 0

def get_admin(session: Session) -> User:
    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).one_or_none()
    if not user:
        raise SystemExit("FIRST_SUPERUSER not found. Make sure init created it.")
    return user

def row_to_specimen_create(row: dict, session: Session) -> SpecimenCreate:

    spec_id = row.get("Spec ID", "").strip()
    doi_value = normalize_doi_cell(row.get('DOI'), spec_id)

    doi = doi_crud.get_doi_by_link(session=session, link=doi_value)
    if doi is None:
        doi_in = DOICreate(
            link=doi_value,
            ref_title=row['Ref Title'],
            authors=row['Author(s)'],
            pub_year=row['Pub_year'],
        )

        doi = doi_crud.create_doi(session=session, doi_in=doi_in)
    
    failure_modes_from_csv=[normalize_failure_label_spacing(fm) for fm in row['Qualitative Failure Measure'].split(';')]
    has_connector_failure = any("connector:" in fm.lower() for fm in failure_modes_from_csv)
    connector_raw = row.get('Connector')
    connector_from_csv = False
    if connector_raw is not None and str(connector_raw).strip() != "":
        try:
            connector_from_csv = int(str(connector_raw).strip()) == 1
        except ValueError:
            print(f"⚠️ Spec ID {spec_id}: 'Connector' is non-numeric ('{connector_raw}'), defaulting to 0")
    connector_value = connector_from_csv or has_connector_failure

    loading_direction_labels=row['Loading Direction'].split(';')

    joinery_type_label=row['Joinery Type']
    sub_joinery_type_label=row['Sub-Joinery Type']

    assembly_type_label=row['Assembly Type']

    practice_label=row['Source']
    test_loading_type=row['Test Loading Type']
    yield_point_method=row['Yield Point Method']

    output = map_joinery_type_label_to_id(session, joinery_type_label)

    if output is None:
        joinery_type_from_csv = None
        dowel_from_csv = False
    else:
        joinery_type_from_csv, dowel_from_csv = output
    
    specimen_in = SpecimenCreate(

        specimen_reference_id=row['Spec Ref'],
        doi_id=doi.id,

        replicate_tests=row['Replicates'],
        note=row['Note'],
        connector=connector_value,
        # connection_description=row['Connection Detail'],
        element_dimension=row['Elements Dimensions'],
        fastener_numbers=map_fastener_numbers(row['Fastener Numbers']),
        moisture_percentage=row['Moisture Content (%)'],
        wood_type=row['Wood Type (Members)'],

        e_stiffness=parse_numeric_field(row['Ks'], 'Ks', spec_id),
        e_yield_displacement=parse_numeric_field(row['Δy'], 'Δy', spec_id),
        e_yield_force=parse_numeric_field(row['Fy'], 'Fy', spec_id),
        e_max_displacement=parse_numeric_field(row['Δmax'], 'Δmax', spec_id),
        e_max_force=parse_numeric_field(row['Fmax'], 'Fmax', spec_id),
        e_ultimate_displacement=parse_numeric_field(row['Δu'], 'Δu', spec_id),
        e_ultimate_force=parse_numeric_field(row['Fu'], 'Fu', spec_id),
        e_ductility=parse_numeric_field(row['µ'], 'µ', spec_id),
        e_qfm_description=row['QFM-Description'],
        
        wood_mechanical_properties=row['Wood Type (Members)'],
        connector_mechanical_properties=row['Connector Mechanical Properties'],
        fastener_mechanical_properties=row['Fastener Mechnical Properties'],
        
        e_qualitative_failure_measure = map_failure_labels_to_ids(session, failure_modes_from_csv),
        fastener_type_ids = map_fastener_labels_to_ids(session, row['Fastener Type'], map_fastener_numbers(row['Fastener Numbers'])),
        loading_direction_ids = map_loading_direction_labels_to_ids(session, loading_direction_labels),
        
        
        
        joinery_type_id = joinery_type_from_csv, # but what if the joinery type doesn't exist? what would this be?
        
        dowel = dowel_from_csv,
        
        sub_joinery_type_id = map_sub_joinery_type_label_to_id(session, sub_joinery_type_label),
        
        
        
        assembly_type=map_assembly_type(assembly_type_label),
        practice=map_practice_type(practice_label),
        e_test_loading_type=map_test_loading_type(test_loading_type),
        e_yield_point_method=map_yield_point_method(yield_point_method)
    )
    
    return specimen_in
    

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Path to CSV inside the container, e.g. /app/data/specimens.csv")
    args = parser.parse_args()

    # ./data/table_1_dowel_free_connection.csv

    created = 0
    with Session(engine) as session:
        admin = get_admin(session)
        with open(args.csv, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                print("Importing Specimen Id: ", row["Spec ID"])
                # This try is needed since a lot of the data is messy and will cause errors
                try:
                    body = row_to_specimen_create(row, session=session)
                    specimen = specimen_crud.create_specimen(session=session, specimen_in=body, current_user_id=admin.id)
                except Exception as e:
                    session.rollback()
                    print(f"❌ Error processing row with Spec ID {row['Spec ID']}: {e}")
                    continue
                created += 1
            
    print(f"Seed complete, created: {created}")

if __name__ == "__main__":
    main()
