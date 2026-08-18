# Timverse

[![GPL-3.0][gpl-3-shield]][gpl-3]
[![Python 3.10+][python-shield]][python]
[![FastAPI][fastapi-shield]][fastapi]
[![React][react-shield]][react]
[![TypeScript][typescript-shield]][typescript]
[![PostgreSQL][postgres-shield]][postgres]
[![Docker Compose][docker-shield]][docker]
[![GitHub Actions][actions-shield]][actions]

This work is licensed under a
[GNU General Public License v3.0][gpl-3].

[gpl-3]: https://www.gnu.org/licenses/gpl-3.0.en.html
[gpl-3-shield]: https://img.shields.io/badge/License-GPLv3-blue.svg
[python]: https://www.python.org/
[python-shield]: https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white
[fastapi]: https://fastapi.tiangolo.com/
[fastapi-shield]: https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white
[react]: https://react.dev/
[react-shield]: https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=111111
[typescript]: https://www.typescriptlang.org/
[typescript-shield]: https://img.shields.io/badge/TypeScript-Frontend-3178C6?logo=typescript&logoColor=white
[postgres]: https://www.postgresql.org/
[postgres-shield]: https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white
[docker]: https://docs.docker.com/compose/
[docker-shield]: https://img.shields.io/badge/Docker%20Compose-Dev%20%26%20Deploy-2496ED?logo=docker&logoColor=white
[actions]: https://github.com/features/actions
[actions-shield]: https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white

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

The Timverse portal is licensed under the terms of the GNU General Public License v3.0 [License](./LICENSE).
