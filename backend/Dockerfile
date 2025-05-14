# First stage: build
FROM python:3-alpine AS builder

# Set the working directory in the container
WORKDIR /app

COPY . .

# Install the dependencies
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt && rm -rf ~/.cache/pip


# Expose the port that the app runs on
EXPOSE 80

# Command to run the FastAPI application using Uvicorn
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
