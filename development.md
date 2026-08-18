# Running and Development

This page explains how to run the Timverse application locally on your own computer.

Docker is an application that runs the app and its supporting services in isolated [containers](https://en.wikipedia.org/wiki/Containerization_(computing)), so you do not have to manually install and configure everything yourself. This is recommended because it starts the frontend, backend, database, and helper tools together.

- [Running Locally With Docker](#running-locally-with-docker)

Some people may prefer not to use Docker because they want to install and control each tool directly on their computer.

- [Running Locally Without Docker](#running-locally-without-docker)

Some people may only need to run part of the app when they are working on the frontend, working on the backend, or troubleshooting one service.

- [Running Individual Services](#running-individual-services)

Other useful sections:

- [Common Local Problems](#common-local-problems)
- [Development Tooling](#development-tooling)

## Running Locally With Docker

The easiest way to try Timverse is to visit the live application at [https://timverse.ca](https://timverse.ca). When you need a local copy for development, Docker is the recommended way to run it on your own computer because it starts the frontend, backend, PostgreSQL database, Mailcatcher, Adminer, and Traefik together.

- [0. Prerequisites](#0-prerequisites)
- [1. Open or Clone the Repository](#1-open-or-clone-the-repository)
- [2. Create the `.env` File](#2-create-the-env-file)
- [3. Start the Application](#3-start-the-application)
- [4. Open Local URLs](#4-open-local-urls)
- [5. Verify That It Is Running](#5-verify-that-it-is-running)
- [6. Stop the Application](#6-stop-the-application)

### 0. Prerequisites

Before you start, make sure these two applications are installed on your computer:

1. Git ([macOS](https://github.com/UofT-DSI/onboarding/blob/main/environment_setup/os_guides/tech_onboarding_mac.md#git), [Linux](https://github.com/UofT-DSI/onboarding/blob/main/environment_setup/os_guides/tech_onboarding_linux.md#git), [Windows](https://github.com/UofT-DSI/onboarding/blob/main/environment_setup/os_guides/tech_onboarding_windows.md#git))
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Git lets you download the project. Docker Desktop lets your computer run the app in containers.

After installing Docker Desktop, open it and wait until it says Docker is running.

To check that Docker is ready, open a terminal and run:

```bash
docker --version
docker compose version
```

Both commands should print version numbers. If either command fails, open Docker Desktop, wait until it is running, then close and reopen your terminal and try again. If it still fails, reinstall or update Docker Desktop before continuing.

### 1. Open or Clone the Repository

Open a terminal and go to the folder where you keep projects. For example:

```bash
cd ~/Documents
```

Download the project if you do not already have it:

```bash
git clone https://github.com/SuStrucSy/BarkByte.git
```

If you already downloaded the project another way, skip this command.

Go into the project folder:

```bash
cd BarkByte
```

All commands below should be run from this project root folder unless a step explicitly says otherwise. You are in the right place if you can see `README.md`, `docker-compose.dev.yml`, `backend`, and `frontend`.

### 2. Create the `.env` File

The app needs a settings file named `.env` in the project root.

If `.env` already exists, leave it in place.

If `.env` does not exist, create it by copying the example file:

```bash
cp .env.example .env
```

For running locally with Docker, the example values are enough to start the app.

The `.env` file is for local settings such as database names, passwords, frontend URLs, and email settings. Do not commit real production secrets to the repository, and do not reuse local example secrets for production.

### 3. Start the Application

From the project root, run this command:

```bash
docker compose -f docker-compose.dev.yml up --build
```

The first run can take several minutes because Docker has to download and build everything the app needs.

Leave this terminal open while you use the application. It shows status messages for the frontend, backend, database, and helper services.

To check logs in another terminal, run:

```bash
docker compose -f docker-compose.dev.yml logs
```

To check logs for one service, add the service name:

```bash
docker compose -f docker-compose.dev.yml logs backend
```

### 4. Open Local URLs

These links only work after Step 3 has started successfully. If Docker is still downloading, building, starting services, or showing errors, wait for it to finish or fix the error before opening these links.

Open these URLs in your browser:

> ⚠️ URLs containing `localhost` only work on the computer running the application. Do not send a `localhost` link to someone else and expect it to work for them.

- Frontend application: http://localhost:5173
- Backend API: http://localhost:8000
- Backend API docs: http://localhost:8000/docs
- Adminer database UI: http://localhost:8081
- Traefik dashboard: http://localhost:8090
- Mailcatcher email inbox: http://localhost:1080

### 5. Verify That It Is Running

Check the frontend:

1. Open http://localhost:5173.
2. Confirm that the Timverse page loads in the browser.

Check the backend:

1. Open http://localhost:8000/docs.
2. Confirm that the Swagger API documentation page loads.

Check Docker:

```bash
docker compose -f docker-compose.dev.yml ps
```

The main services should be running. The `prestart` service may show as exited because it only runs setup tasks, such as database migrations and seed data, and then stops.

### 6. Stop the Application

In the terminal where Docker is running, press:

```text
Control+C
```

Then run:

```bash
docker compose -f docker-compose.dev.yml down
```

This stops the app but keeps the local database data.

If you want to delete the local database and start from an empty database next time, run:

```bash
docker compose -f docker-compose.dev.yml down -v
```

> ⚠️ `down -v` deletes Docker volumes for this compose file, including local database data.

## Running Locally Without Docker

Use this workflow if you want to run the backend, frontend, and database directly on your computer without Docker. This gives you more control over each tool, but it also means you are responsible for installing, starting, and troubleshooting each tool yourself.

- [0. Prerequisites](#0-prerequisites-1)
- [1. Open the Project Root](#1-open-the-project-root)
- [2. Create the `.env` File](#2-create-the-env-file-1)
- [3. Start PostgreSQL](#3-start-postgresql)
- [4. Install and Start the Backend](#4-install-and-start-the-backend)
- [5. Install and Start the Frontend](#5-install-and-start-the-frontend)
- [6. Open Local URLs](#6-open-local-urls)
- [7. Stop the Application](#7-stop-the-application)
- [Notes for Non-Docker Setup](#notes-for-non-docker-setup)

### 0. Prerequisites

Before you start, make sure these applications are installed on your computer:

1. Git ([macOS](https://github.com/UofT-DSI/onboarding/blob/main/environment_setup/os_guides/tech_onboarding_mac.md#git), [Linux](https://github.com/UofT-DSI/onboarding/blob/main/environment_setup/os_guides/tech_onboarding_linux.md#git), [Windows](https://github.com/UofT-DSI/onboarding/blob/main/environment_setup/os_guides/tech_onboarding_windows.md#git))
2. [Node.js](https://nodejs.org/) for the frontend
3. [uv](https://docs.astral.sh/uv/) for the Python interpreter and dependency management
4. [PostgreSQL](https://www.postgresql.org/download/) for the database

Git lets you download the project. Node.js lets your computer run the frontend. `uv` manages the Python environment for the backend. PostgreSQL stores the app data.

To check that the tools are ready, open a terminal and run:

```bash
git --version
node --version
npm --version
uv --version
psql --version
```

Each command should print a version number. If any command fails, install or fix that tool before continuing.

### 1. Open or Clone the Repository

Open a terminal and go to the folder where you keep projects. For example:

```bash
cd ~/Documents
```

Download the project if you do not already have it:

```bash
git clone https://github.com/SuStrucSy/BarkByte.git
```

If you already downloaded the project another way, skip this command.

Go into the project folder:

```bash
cd BarkByte
```

All commands below should be run from this project root folder unless a step explicitly says otherwise. You are in the right place if you can see `README.md`, `docker-compose.dev.yml`, `backend`, and `frontend`.

### 2. Create the `.env` File

The app needs a settings file named `.env` in the project root.

If `.env` already exists, leave it in place.

If `.env` does not exist, create it by copying the example file:

```bash
cp .env.example .env
```

For running locally without Docker, open `.env` in a text editor and make sure these values match your local PostgreSQL setup:

```dotenv
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changethis
FRONTEND_HOST=http://localhost:5173
```

For non-Docker local development, `POSTGRES_SERVER=localhost` means the backend will connect to PostgreSQL running on your own computer.

The `.env` file is for local settings such as database names, passwords, frontend URLs, and email settings. Do not commit real production secrets to the repository, and do not reuse local example secrets for production.

### 3. Start PostgreSQL

Start PostgreSQL using the app or service manager installed with PostgreSQL.

To check that PostgreSQL is running, use:

```bash
pg_isready -h localhost -p 5432
```

Create the local database if it does not already exist:

```bash
createdb -h localhost -U postgres app
```

If your PostgreSQL admin user is not named `postgres`, replace `postgres` with the user from your PostgreSQL installation and update `POSTGRES_USER` in `.env` to match.

If the database already exists, `createdb` may print an error saying it already exists. That is okay.

### 4. Install and Start the Backend

Open a terminal from the project root and go into the backend folder:

```bash
cd backend
```

Install the backend dependencies:

```bash
uv sync
```

Load the root `.env` settings into this terminal:

```bash
set -a
source ../.env
set +a
```

Run database migrations:

```bash
uv run alembic upgrade head
```

Create the initial admin user and initial data:

```bash
uv run python app/initial_data.py
```

Start the backend:

```bash
uv run fastapi dev app/main.py
```

Leave this terminal open. The backend keeps running in this terminal.

### 5. Install and Start the Frontend

Open a second terminal from the project root and go into the frontend folder:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Create a frontend local environment file so the frontend knows where the backend is running:

```bash
printf "VITE_API_URL=http://localhost:8000\n" > .env.local
```

Start the frontend:

```bash
npm run dev
```

Leave this second terminal open. The frontend keeps running in this terminal.

### 6. Open Local URLs

Open these URLs in your browser:

> ⚠️ URLs containing `localhost` only work on the computer running the application. Do not send a `localhost` link to someone else and expect it to work for them.

- Frontend application: http://localhost:5173
- Backend API: http://localhost:8000
- Backend API docs: http://localhost:8000/docs

### 7. Stop the Application

To stop the frontend, go to the frontend terminal and press:

```text
Control+C
```

To stop the backend, go to the backend terminal and press:

```text
Control+C
```

PostgreSQL keeps running until you stop it using the PostgreSQL app or service manager installed on your computer.

### Notes for Non-Docker Setup

Mailcatcher is not included in the non-Docker setup. Email-related features need real SMTP settings in `.env`, or a separately installed local mail testing tool.

If the backend cannot connect to the database, check these three things:

1. PostgreSQL is running.
2. The database named in `POSTGRES_DB` exists.
3. `POSTGRES_USER` and `POSTGRES_PASSWORD` in `.env` match your local PostgreSQL credentials.

## Running Individual Services

Use this workflow when you only want to run part of the app. This is useful when you are working on one side of the project, such as only the frontend or only the backend, or when you are troubleshooting one service.

For most users, the full Docker setup is easier:

```bash
docker compose -f docker-compose.dev.yml up --build
```

- [Frontend Only With Docker](#frontend-only-with-docker)
- [Backend and Database With Docker](#backend-and-database-with-docker)
- [Frontend Directly on Your Computer](#frontend-directly-on-your-computer)
- [Backend Directly on Your Computer](#backend-directly-on-your-computer)

### Frontend Only With Docker

Use this when you want Docker to run only the frontend container.

From the project root, run:

```bash
docker compose -f docker-compose.dev.yml up --build frontend
```

This starts the frontend development server, but it does not start the backend or database. API calls will fail unless a backend is already running at the URL configured by `VITE_API_URL`.

Open the frontend in your browser:

> ⚠️ URLs containing `localhost` only work on the computer running the application. Do not send a `localhost` link to someone else and expect it to work for them.

- Frontend application: http://localhost:5173

### Backend and Database With Docker

Use this when you want Docker to run the database and backend, but not the frontend.

From the project root, run:

```bash
docker compose -f docker-compose.dev.yml up --build db prestart backend
```

This starts PostgreSQL, runs database setup through `prestart`, and starts the backend.

Open the backend API docs in your browser:

> ⚠️ URLs containing `localhost` only work on the computer running the application. Do not send a `localhost` link to someone else and expect it to work for them.

- Backend API docs: http://localhost:8000/docs
- Backend API: http://localhost:8000

### Frontend Directly on Your Computer

Use this if the backend is already running and you want to run the frontend directly on your computer.

Open a terminal from the project root and go into the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Create the frontend local environment file:

```bash
printf "VITE_API_URL=http://localhost:8000\n" > .env.local
```

Start the frontend:

```bash
npm run dev
```

Leave this terminal open while you use the frontend.

Open the frontend in your browser:

> ⚠️ URLs containing `localhost` only work on the computer running the application. Do not send a `localhost` link to someone else and expect it to work for them.

- Frontend application: http://localhost:5173

### Backend Directly on Your Computer

Use this if PostgreSQL is already running and `.env` contains local database settings.

Open a terminal from the project root and go into the backend folder:

```bash
cd backend
```

Install backend dependencies:

```bash
uv sync
```

Load the root `.env` settings into this terminal:

```bash
set -a
source ../.env
set +a
```

Run database migrations:

```bash
uv run alembic upgrade head
```

Start the backend:

```bash
uv run fastapi dev app/main.py
```

Leave this terminal open while you use the backend.

Open the backend API docs in your browser:

> ⚠️ URLs containing `localhost` only work on the computer running the application. Do not send a `localhost` link to someone else and expect it to work for them.

- Backend API docs: http://localhost:8000/docs
- Backend API: http://localhost:8000

## Common Local Problems

### Port Already in Use

If Docker says the port is already in use, another program is using one of the required ports. Stop the other program or change the port mapping in `docker-compose.dev.yml`.

Common ports used by this project:

- `5173`: frontend
- `8000`: backend
- `5432`: PostgreSQL
- `8081`: Adminer
- `8090`: Traefik dashboard
- `1080`: Mailcatcher web UI
- `1025`: Mailcatcher SMTP

### Frontend Cannot Reach Backend

Check that the backend is running and that the frontend is using a local API URL such as:

```text
http://localhost:8000
```

### Backend Cannot Connect to PostgreSQL

If the backend cannot connect to PostgreSQL inside Docker, confirm that `docker-compose.dev.yml` sets `POSTGRES_SERVER: db` for backend services.

If the backend is running directly on your computer, confirm that PostgreSQL is running locally and that `.env` has the correct `POSTGRES_*` values.

### Frontend Dependency Issues

If frontend dependencies behave strangely in Docker, rebuild the frontend container:

```bash
docker compose -f docker-compose.dev.yml up --build frontend
```

### Resetting the Local Database

If the database gets into a bad local state and you do not need the local data, reset it:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

> ⚠️ `down -v` deletes Docker volumes for this compose file, including local database data.

## Development Tooling

### Pre-Commit and Code Linting

The backend dependencies include [pre-commit](https://pre-commit.com/) for code linting and formatting.

Install pre-commit hooks from the backend directory:

```bash
cd backend
uv run pre-commit install
```

Run all pre-commit hooks manually:

```bash
cd backend
uv run pre-commit run --all-files
```

### Regenerating the Frontend API Client

The frontend API client is generated from the backend OpenAPI schema.

If the backend API changes, start the backend and run:

```bash
cd frontend
curl http://localhost:8000/api/v1/openapi.json -o openapi.json
npx --yes @redocly/cli bundle openapi.json --output openapi.yaml
npm run generate-client
rm openapi.json
```

This updates generated files in:

- `frontend/src/api/endpoints`
- `frontend/src/api/model`
