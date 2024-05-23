# How to release a new version

- `make shell`
- check prod JS bundle parameters (size, parts, etc.):
    - `make front.profile`
    - `make front.build && make front.gzip`
- prepare `CHANGELOG.md`
- change version in `pyproject.toml` + `poetry lock --no-update && poetry check --lock`
- COMMIT !!! final changes
- `git tag -a <version> -m "<version>"`
- `git push origin main --tags`
- `make release`
- log in to https://pypi.org/manage/projects/
- `poetry publish`

The example of Bash script (starts on "commit" step):

```shell
DFP_RELEASE_VER=0.1.0 && \
git add . && \
git commit -m "$DFP_RELEASE_VER" && \
git tag -a $DFP_RELEASE_VER -m "$DFP_RELEASE_VER" && \
git push origin main --tags && \
make release && \
poetry publish && \
echo "Done"
```

## How to update in client projects

`poetry add django-forms-plus==<new_version>`
