# Timverse

Shield: [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

This work is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc] - CC BY-NC 4.0.

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg

## Overview

Timverse is a web application for collecting, reviewing, searching, comparing, and visualizing experimental timber connection specimen data. It gives researchers and engineering groups a shared place to manage curated test records instead of spreading them across spreadsheets, CSV files, and local databases.

The application has three main parts:

- A React frontend for the browser interface.
- A FastAPI backend for the API, authentication, and review workflow.
- A PostgreSQL database for persistent data storage.

The software is publicly presented as Timverse, while BarkByte is the internal name retained for this source-code repository.

## Technology Stack and Features

- ⚡ [**FastAPI**](https://fastapi.tiangolo.com) for the Python backend API.
  - 🧰 [SQLModel](https://sqlmodel.tiangolo.com) for the Python SQL database interactions (ORM).
  - 🔍 [Pydantic](https://docs.pydantic.dev), used by FastAPI, for data validation and settings management.
  - 💾 [PostgreSQL](https://www.postgresql.org) as the SQL database.
- 🚀 [React](https://react.dev) for the frontend.
  - 💃 TypeScript, hooks, [Vite](https://vitejs.dev), and other parts of a modern frontend stack.
  - 🎨 [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) for frontend components.
  - 🤖 Auto-generated TypeScript API client for calling the FastAPI backend from its OpenAPI schema.
  - 🦇 Dark mode support.
- 🐋 [Docker Compose](https://www.docker.com) for development and production.
- 🔒 Secure password hashing by default.
- 🔑 JWT (JSON Web Token) authentication.
- 📫 Email based password recovery.
- 📬 [Mailcatcher](https://mailcatcher.me) for local email testing during development.
- 📞 [Traefik](https://traefik.io) as a reverse proxy / load balancer.
- 🚢 Deployment instructions using Docker Compose, including how to set up Traefik for HTTPS certificates.
- 🏭 CI (continuous integration) and CD (continuous deployment) based on GitHub Actions.

## Running

Timverse can be run in several ways depending on whether you are using the active deployment, developing locally, or deploying your own production instance.

If you want to run Timverse yourself, see [Running and Development](./development.md) to run it locally on your own computer for testing or development, or [Deployment](./Deployment.md) to run a production version on a public server for real users.

An active production deployment is currently available at [timverse.ca](https://timverse.ca).

## Additional Documentation

- Backend docs: [backend/README.md](./backend/README.md)
- Frontend docs: [frontend/README.md](./frontend/README.md)
- Running and development guide: [development.md](./development.md)
- Deployment guide: [Deployment.md](./Deployment.md)
- Release notes: [CHANGELOG.md](./CHANGELOG.md)

## License

The Timverse portal is licensed under the terms of the Creative Commons Attribution-NonCommercial 4.0 International [License](./LICENSE).
