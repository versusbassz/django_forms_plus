Tags: new, enhancement, fix, refactor, deps, internals, bc
Sections: Spec, Features, Backend, Frontend

# The changelog

## 0.11.1 - 2024.04.14

new: Add a feature to display a custom layout instead of the default "Success message" (via "external_block" param for "Response action" of type "message")
new: Add "Response Action" type "custom"

docs: Add drafts for some topics


## 0.10.0 - 2024.03.26

new: Add json_fail_common_response() py-helper
fix: Require true value for checkboxes with required=true (on frontend). It's the expected behaviour


## 0.9.0 - 2024.01.16

new: Add PositiveNumberInput widget
refactor, bc: Remove unnecessary "DumbInput" widget
refactor, bc: Move "dfp_field=True" to DfpInputMixin

fix, maintenance: Update "react-number-format" package: 5.1.3 -> 5.3.1

## 0.8.0 - 2023.10.27

new: Add support for `django.forms.URLInput` widget
bc, enhancement: Disable browser native form validation (form attr:novalidate=true)

## 0.7.0 - 2023.09.21

new, js: Add window.dfp global variable
new, js: Add "dfp:init" JS event
new, js: Add "dfp:onsubmit" JS event
enhancement, js: Add "position" setting to "success message"

## 0.6.0 - 2023.09.20

new: Add support for django.forms.Select widget
new: Add "additional custom CSS-classes in widget" feature

bc, js: Don't do reset() if a form gets an empty payload in a response (for now)

fix: Several bug fixes
dev: Add "ruff" linter

## 0.5.0 - 2023.03.15

- new: Add masked input feature to TextInput widget
- new: Add "date" (DateInput) field
- enhancement: Add "allow_empty" setting to regexp validators

Backend:
- enhancement: Allow set a custom widget name via "dfp_widget_name" attribute
- enhancement: Add FormattedInput widget

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
