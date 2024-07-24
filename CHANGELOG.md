Tags: new, enhancement, fix, refactor, deps, internals, bc
Sections: Spec, Features, Backend, Frontend

# The changelog


## 0.14.1 - 2024.07.24

fix: Fix some issues for HiddenInput fields
maintenance: Update some NPM-dependecies

## 0.14.0 - 2024.05.27

new, js: Add DfpFormContext.rhf.getValues
enhancement, js: Add detail.form_context for dfp:init event
docs: Add docs about JS events

dev, js: Add debugCount, setDebugCount to the DfpFormContext
dev: Move JS codebase to TypeScript

## 0.13.0 - 2024.05.23

new, feature: Add RadioSelect field
new, spec, feature: Add conditional logic for fieldsets
new, spec: Add "equal" conditional logic rule
bc, spec: Implement "Conditional logic" spec format v2 (more flatten and simple)
new: add prepare_regexp_validator() py-helper

fix: Handle "payload" param better in json_success_response() py-helper
fix: Fix how pydantic v2 handles regexps (2nd attempt)
fix: Adjust the logic of json_fail_response() py-helper
fix: Fix the bug when soft_validators are applied before actual initial values are set to fields

dev: Add useFormContext() hook
dev, tests: Add the simplest e2e tests setup ("pytest" + "pytest-playwright" py-packages)
dev: Update dev_site codebase
refactor: Add more Python types for project's entries and fix some typing issues
...

## 0.12.2 - 2024.05.03

fix: Fix FormattedInput.attrs
fix: Fix handling of regexp-validators during spec building (after pydantic v2 update)

## 0.12.1 - 2024.05.03

refactor: Replace deprecated "pydantic" v1 method calls

## 0.12.0 - 2024.05.02

bc, maintenance: Update pydantic: 1.10.4 -> 2.7.1
dev: Update ruff: 0.0.256 -> 0.4.2

## 0.11.2 - 2024.05.01

fix: Fix XSS in how JSON-spec of a form used to be inserted in HTML during a page rendering

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
