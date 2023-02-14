Tags: new, enhancement, fix, refactor, deps, internals, bc
Sections: Spec, Features, Backend, Frontend

# The changelog

## 0.4.0 - 2023.02.14

Spec:
- bc, new: Support "regexp" validators + change spec in "validators / soft_validators"
- bc: Remove "placeholders" section (use `Meta.widgets[WIDGET].attrs instead)

Backend:
- fix: Copy (shallowly) dict props of Dfp meta instead of just getting a link var to a same dict

Frontend:
- enhancement: Apply to 'slug' field type the same rules as for 'text' type during validation on frontend

## 0.3.1 - 2023.02.08
- fix: Fix displaying of server validation errors

## 0.3.0 - 2023.01.31

Features:
- new, experimental: Add "suggestions" feature to SlugInput
- new: Add "regexp" soft validator

Spec:
- enhancement, bc: change soft validators spec - introduce "name,value,inverse,message" structure

Backend:
- new: Add "dfp_field_name" optional attribute for Form Fields (to overwrite type of field during a spec generation)
- enhancement, bc: Process bound fields (instead of Form.fields) during a spec generation
- refactor, bc: Rename "django_forms_plus.fields" to "django_forms_plus.widgets"

Frontend:
- new: Add "regexp" soft validator

## 0.2.0 - 2023.01.17

Backend, Spec:
- add support for custom validators
- add basic support for files uploading
- add custom widgets: SlugInput, ClearableFileInput, CroppedImageInput

Frontend:
- new: add ImageUpload component
- new: add InputSlug component
- deps: add "@mui/base" NPM package (for "Crop image" modal window)
- deps: add "react-image-crop" NPM package (for "Crop image" modal window)
- internals: add submitResult, debugEnabled, rhf: {setValue, clearErrors} to FormContext.Provider

## 0.1.0 - 2022.12.17

The initial release.
