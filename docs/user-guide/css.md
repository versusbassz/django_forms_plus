# CSS styles

## Specification

```text
.dfp-form-container

.dfp-preloader

.dfp-form
    __tag
    __inner

.dfp-fieldset  --simple
    __title
    __desc
    __items

.dfp-fieldslot  --valid --invalid --softly-invalid --focus
    __title
    __field
    __help-text
    __errors
    __soft-errors

.dfp-field-error

.dfp-separator

.dfp-message  --success --error
    __content
    __close-wrapper
    __close

.dfp-submit-button  --loading

.dpf-submit-indicator

.dfp-common-errors
    __item
```

## CSS styles (empty)

```css
.dfp-form-container {}

.dfp-preloader {}

.dfp-form {}
.dfp-form__tag {}
.dfp-form__inner {}

.dfp-fieldset {}
.dfp-fieldset--simple {}
.dfp-fieldset__title {}
.dfp-fieldset__desc {}
.dfp-fieldset__items {}

.dfp-fieldslot {}
.dfp-fieldslot--valid {}
.dfp-fieldslot--invalid {}
.dfp-fieldslot--softly-invalid {}
.dfp-fieldslot--focus {}
.dfp-fieldslot__title {}
.dfp-fieldslot__field {}
.dfp-fieldslot__help-text {}
.dfp-fieldslot__errors {}
.dfp-fieldslot__soft-errors {}

.dfp-field-error {}

.dfp-separator {}

.dfp-message {}
.dfp-message--success {}
.dfp-message--error {}
.dfp-message__content {}
.dfp-message__close-wrapper {}
.dfp-message__close {}

.dfp-submit-button {}
.dfp-submit-button--loading {}

.dpf-submit-indicator {}

.dfp-common-errors {}
.dfp-common-errors__item {}
```

## SCSS styles (empty)

```scss
.dfp-form-container {
}

.dfp-preloader {
}

.dfp-form {
    &__tag {}
    &__inner {}
}

.dfp-fieldset {
    &--simple {}
    &__title {}
    &__desc {}
    &__items {}
}

.dfp-fieldslot {
    &--valid {}
    &--invalid {}
    &--softly-invalid {}
    &--focus {}
    &__title {}
    &__field {}
    &__help-text {}
    &__errors {}
    &__soft-errors {}
}

.dfp-field-error {
}

.dfp-separator {
}

.dfp-message {
    &--success {}
    &--error {}
    &__content {}
    &__close-wrapper {}
    &__close {}
}

.dfp-submit-button {
    &--loading {}
}

.dpf-submit-indicator {
}

.dfp-common-errors {
    &__item {}
}
```
