up:
	docker compose up --build

down:
	docker compose down

seed:
	docker compose exec -T api python scripts/seed.py

test:
	docker compose exec -T api pytest -q

logs:
	docker compose logs -f api web worker
