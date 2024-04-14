# How to release a new version

- `make shell`
- check prod JS bundle parameters (size, parts, etc.)
- prepare `CHANGELOG.md`
- change version in `pyproject.toml` + `poetry lock --no-update && poetry check --lock`
- commit final changes
- `git tag -a <version> -m "<version>"`
- `git push origin main --tags`
- `make release`
- log in to https://pypi.org/manage/projects/
- `poetry publish`
