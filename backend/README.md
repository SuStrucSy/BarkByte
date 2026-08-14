# Timverse Backend

The backend is the FastAPI service for Timverse. It handles the API, authentication, server-side validation, specimen data access, pending specimen review workflows, and database migrations.

It uses FastAPI, SQLModel, PostgreSQL, Alembic, Pydantic, JWT authentication, and email templates for account-related messages.

## Local Development

For most development, start the full stack from the project root so the backend has PostgreSQL and the frontend available:

```bash
docker compose -f docker-compose.dev.yml up --build
```

The backend runs at:

```text
http://localhost:8000
```

Interactive API documentation is available at:

```text
http://localhost:8000/docs
```

If the database and environment variables are already available, the backend can also be run directly from this directory:

```bash
fastapi dev app/main.py
```

## Startup and Migrations

The container startup flow uses `scripts/prestart.sh` to:

- Wait for the database.
- Run Alembic migrations.
- Create initial data, including the first superuser.
- Seed specimen data when the database has not already been seeded.

Migrations live in:

```text
app/migrations/versions
```

## Project Structure

- `app/main.py`: FastAPI application entry point.
- `app/api`: API router setup and route modules.
- `app/api/routes`: Endpoint groups such as users, specimens, DOI records, pending specimens, and reference tables.
- `app/models`: SQLModel database models.
- `app/schemas`: Request and response schemas.
- `app/crud`: Database access logic.
- `app/core`: Configuration, database setup, security, and seed logic.
- `app/migrations`: Alembic migration environment and migration files.
- `app/email-templates`: Account email templates.

## Main API Areas

- Authentication and user accounts.
- Specimen search, detail, creation, and update workflows.
- Pending specimen submissions and review decisions.
- DOI/reference records.
- Controlled vocabularies such as joinery types, sub-joinery types, loading directions, fastener types, and failure modes.
- Health checks and utility endpoints.

## Configuration

Configuration is read from environment variables. Important values include:

- `SECRET_KEY`
- `FIRST_SUPERUSER`
- `FIRST_SUPERUSER_PASSWORD`
- `BACKEND_CORS_ORIGINS`
- `POSTGRES_SERVER`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- SMTP/email settings for account emails

See the root [README.md](../README.md) for the project overview and [development.md](../development.md) for Docker, non-Docker, and individual-service workflows.

## Data Model

The specimen is the central domain record. It connects to DOI/reference data, users, joinery classifications, loading directions, fastener types, failure modes, and pending review records. The root README includes the ERD image for a visual overview.
