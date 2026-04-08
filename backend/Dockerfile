FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app/

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.7.3 /uv /uvx /bin/

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Compile bytecode for faster startup
ENV UV_COMPILE_BYTECODE=1

# Use copy link mode for uv cache
ENV UV_LINK_MODE=copy

# Install dependencies only (not the project itself) — separate layer for caching
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

ENV PYTHONPATH=/app

# Copy app source
COPY ./scripts /app/scripts
COPY ./pyproject.toml ./alembic.ini /app/
COPY ./app /app/app

# Sync the full project
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

# Create non-root user and hand off ownership
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
