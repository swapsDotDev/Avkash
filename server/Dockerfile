# Use an official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libgl1 libglib2.0-0

# Install Poetry
RUN pip install --upgrade pip
RUN pip install poetry

# Copy only requirements to cache dependencies
COPY pyproject.toml poetry.lock* /app/

# Install dependencies (no dev dependencies)
RUN pip install torch==2.2.2+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html
RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi --only main

# Copy the rest of the code
COPY . /app

# Expose the port (Render uses $PORT)
EXPOSE 10000

# Start the server (Render sets $PORT)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --ws-ping-interval 30 --ws-ping-timeout 30"] 