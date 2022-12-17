@:
	@ echo "No default task"

shell:
	@ poetry shell

install:
	poetry install
	npm ci

release:
	make front.build
	rm -f ./dist/*
	poetry build

# Frontend (JS, webpack, React)
front.watch:
	npx webpack --mode=development --watch --progress

front.build:
	npx webpack --mode=production

front.profile:
	npx webpack --mode=production --profile --json > build/stats.json && npx webpack-bundle-analyzer build/stats.json

front.gzip:
	cd django_forms_plus/static/django_forms_plus; gzip -1 -k -c dfp.build.js > 1.gz
	cd django_forms_plus/static/django_forms_plus; gzip -2 -k -c dfp.build.js > 2.gz
	cd django_forms_plus/static/django_forms_plus; gzip -3 -k -c dfp.build.js > 3.gz
	cd django_forms_plus/static/django_forms_plus; gzip -4 -k -c dfp.build.js > 4.gz
	cd django_forms_plus/static/django_forms_plus; gzip -5 -k -c dfp.build.js > 5.gz
	cd django_forms_plus/static/django_forms_plus; gzip -6 -k -c dfp.build.js > 6.gz
	cd django_forms_plus/static/django_forms_plus; gzip -7 -k -c dfp.build.js > 7.gz
	cd django_forms_plus/static/django_forms_plus; gzip -8 -k -c dfp.build.js > 8.gz
	cd django_forms_plus/static/django_forms_plus; gzip -9 -k -c dfp.build.js > 9.gz

# Backend (Python, Django)
backend.run:
	cd dev_site && ./manage.py runserver localhost:8001

# Docs
# see: https://www.mkdocs.org/user-guide/cli/#mkdocs-serve
docs.gen-css:
	python docs/.build/build-css.py

docs.serve:
	make docs.gen-css
	mkdocs serve --dev-addr=127.0.0.1:8002

docs.build:
	make docs.gen-css
	mkdocs build --clean --strict --theme=mkdocs --site-dir=./build/docs
