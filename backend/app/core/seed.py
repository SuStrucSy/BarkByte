# app/scripts/seed_specimens.py
import argparse
import csv
from sqlmodel import Session, select
from sqlalchemy import func
from app.core.db import engine  # reuse your app's engine
from app.core.config import settings
from app.models.models import User, FailureMode, JoineryType, SubJoineryType, FastenerType, LoadingDirection, SpecimenCreate, AssemblyType, Practice, TestLoadingType, YieldPointMethod, FastenerTypeCreate
from app.core.config import settings
from app.crud import crud
import uuid
import re

def normalize_label(label: str) -> str:
    """Normalize text: lowercase, remove spaces, hyphens, and underscores."""
    return re.sub(r"[\s\-_]+", "", label.strip().lower())

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
            fastener_type = crud.create_fastener_type(session=session, fastener_type_in=FastenerTypeCreate(label=label.strip()))
        
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
    result_id = None
    
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
        print(f"⚠️ Warning: sub-joinery type not found for label '{label}' under parent ID '{parent_joinery_type_id}'")
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
    
    failure_modes_from_csv=row['Qualitative Failure Measure'].split(';')

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
        reference_title=row['Ref Title'],
        author=row['Author(s)'],
        publication_year=row['Pub_year'],
        specimen_reference_id=row['Spec Ref'],
        doi=row['DOI'],

        replicate_tests=row['Replicates'],
        note=row['Note'],
        connector=int(row['Connector'].strip())==1,
        connection_description=row['Connection Detail'],
        element_dimension=row['Elements Dimensions'],
        fastener_numbers=map_fastener_numbers(row['Fastener Numbers']),
        moisture_percentage=row['Moisture Content (%)'],
        wood_type=row['Wood Type (Members)'],

        e_stiffness=row['Ks'],
        e_yield_displacement=row['Δy'],
        e_yield_force=row['Fy'],
        e_max_displacement=row['Δmax'],
        e_max_force=row['Fmax'],
        e_ultimate_displacement=row['Δu'],
        e_ultimate_force=row['Fu'],
        e_ductility=row['µ'],
        e_measurement_unit=row['Unit'],
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
                    specimen = crud.create_specimen(session=session, specimen_in=body, current_user_id=admin.id)
                except Exception as e:
                    print(f"❌ Error processing row with Spec ID {row['Spec ID']}: {e}")
                    continue
                created += 1
            
    print(f"Seed complete, created: {created}")

if __name__ == "__main__":
    main()