#! /usr/bin/env bash
set -e
set -x

# Let the DB start
python app/backend_pre_start.py

# Run migrations
alembic upgrade head

# Create initial data in DB (creates superuser etc.)
python app/initial_data.py

# Seed specimens — skips automatically if already seeded
SPECIMEN_COUNT=$(python -c "
from sqlmodel import Session, select, func
from app.core.db import engine
from app.models.specimen import Specimen
with Session(engine) as s:
    count = s.exec(select(func.count()).select_from(Specimen)).one()
    print(count)
")

if [ "$SPECIMEN_COUNT" -gt "0" ]; then
    echo "Specimens already seeded ($SPECIMEN_COUNT rows), skipping."
else
    echo "Seeding dowel-free connections..."
    python app/core/seed.py --csv /app/data/table_a_1_dowelfree_connection_20251223_amir.csv

    echo "Seeding dowel connections..."
    python app/core/seed.py --csv /app/data/table_a_2_dowel_connection_20251219_amir.csv

    echo "Seeding complete."
fi
