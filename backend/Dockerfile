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

# ✅ Copy dependency files (MUST include uv.lock)
COPY pyproject.toml uv.lock ./

# Install dependencies only (cached layer)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Copy application code
COPY ./scripts /app/scripts
COPY ./app /app/app
COPY ./alembic.ini /app/

ENV PYTHONPATH=/app

# Sync the full project
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

# Create non-root user and hand off ownership
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
