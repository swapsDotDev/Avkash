MAKEFLAGS += --silent

PYTHON_CMD = poetry run python
POETRY_CMD = poetry
RUN = poetry run

.PHONY: help install run format lint clean deps migrate

help:
	@echo "Available targets:"
	@echo "		install		Install dependencies with poetry"
	@echo "		run			Run FastAPI server with uvicorn"
	@echo "		format		Format code with black"
	@echo "		lint		Check code formatting with black"
	@echo "		clean		Remove Python cache files"
	@echo "		deps		Show dependency tree"
	@echo "		migrate		Run MongoDB migration script"

install:
	$(POETRY_CMD) install

run:install
	$(RUN) uvicorn main:app --reload

format:install
	$(RUN) black .

lint:install
	$(RUN) black --check .

clean:install
	@echo "Cleaning up cache files..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

deps:install
	$(POETRY_CMD) show --tree

setup:install
	$(RUN) python connection/scripts/migration.py

