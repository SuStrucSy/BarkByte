# Full Stack Timverse

Shield: [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

This work is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg

## Overview

Timverse is a web application for collecting, reviewing, searching, comparing, and visualizing experimental timber connection specimen data. It gives researchers and engineering groups a shared place to manage curated test records instead of spreading them across spreadsheets, CSV files, and local databases.

The application has three main parts: a React frontend for users, a FastAPI backend for the API and review workflow, and a PostgreSQL database for durable structured storage.

## Technology Stack and Features

- ⚡ [**FastAPI**](https://fastapi.tiangolo.com) for the Python backend API.
  - 🧰 [SQLModel](https://sqlmodel.tiangolo.com) for the Python SQL database interactions (ORM).
  - 🔍 [Pydantic](https://docs.pydantic.dev), used by FastAPI, for the data validation and settings management.
  - 💾 [PostgreSQL](https://www.postgresql.org) as the SQL database.
- 🚀 [React](https://react.dev) for the frontend.
  - 💃 Using TypeScript, hooks, [Vite](https://vitejs.dev), and other parts of a modern frontend stack.
  - 🎨 [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) for the frontend components.
  - 🤖 Auto-generated TypeScript API client for calling the FastAPI backend from its OpenAPI schema.
  - 🦇 Dark mode support.
- 🐋 [Docker Compose](https://www.docker.com) for development and production.
- 🔒 Secure password hashing by default.
- 🔑 JWT (JSON Web Token) authentication.
- 📫 Email based password recovery.
- 📬 [Mailcatcher](https://mailcatcher.me) for local email testing during development.
- 📞 [Traefik](https://traefik.io) as a reverse proxy / load balancer.
- 🚢 Deployment instructions using Docker Compose, including how to set up a frontend Traefik proxy to handle automatic HTTPS certificates.
- 🏭 CI (continuous integration) and CD (continuous deployment) based on GitHub Actions.

## Run Locally

The quickest way to start the full local stack is:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build --watch
```

This starts the frontend, backend, PostgreSQL database, Traefik, Adminer, and Mailcatcher with Docker Compose. When the stack is ready, open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- Adminer: http://localhost:8080
- Traefik dashboard: http://localhost:8090
- Mailcatcher: http://localhost:1080

To stop the local stack, run:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml down --remove-orphans
```

More detailed local development notes are in [development.md](./development.md).

### Configure

Update the `.env` files to customize local or production configuration.

Before deploying it, make sure you change at least the values for:

- `SECRET_KEY`
- `FIRST_SUPERUSER_PASSWORD`
- `POSTGRES_PASSWORD`

You can (and should) pass these as environment variables from secrets.

Read the [Deployment.md](./Deployment.md) docs for more details.

### Generate Secret Keys

Some environment variables in the `.env` file have a default value of `changethis`.

You have to change them with a secret key, to generate secret keys you can run the following command:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the content and use that as password / secret key. And run that again to generate another secure key.



## Backend Development

Backend docs: [backend/README.md](./backend/README.md).

## Frontend Development

Frontend docs: [frontend/README.md](./frontend/README.md).

## Deployment

Deployment docs: [Deployment.md](./Deployment.md).

## Development

General development docs: [development.md](./development.md).

This includes using Docker Compose, custom local domains, `.env` configurations, etc.

## Release Notes

Check the file [CHANGELOG.md](./CHANGELOG.md).

## License

The Full Stack Timverse portal is licensed under the terms of the Creative Commons Attribution-NonCommercial 4.0 International [License](./LICENSE)
