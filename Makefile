.PHONY: setup up down logs test lint clean

setup:
	./scripts/setup.sh

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

test:
	docker compose run --rm backend pytest
	docker compose run --rm frontend npm run typecheck

lint:
	docker compose run --rm backend ruff check app tests
	docker compose run --rm frontend npm run lint

clean:
	docker compose down --remove-orphans
