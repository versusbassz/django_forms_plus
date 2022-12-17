@:
	@ echo "Nothing"

up:
	@ docker compose up -d

start:
	@ docker compose start

stop:
	@ docker compose stop

restart:
	make stop && make start

prune:
	@ docker compose down -v

recreate:
	@ make prune && make up
