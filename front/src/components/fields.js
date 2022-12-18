import React, { useContext } from "react";
import classNames from "classnames";

import { useFieldSpec } from "../inc/hooks";
import { FormContext } from "../parts";


export const fieldspec_to_input = (name, field_spec) => {
  switch (field_spec.type) {
    case 'text':
      return <InputText name={name} />;
    case 'number':
      return <InputNumber name={name} />;
    case 'email':
      return <InputEmail name={name} />;
    case 'textarea':
      return <Textarea name={name} />;
    case 'checkbox':
      return <InputCheckbox name={name} />;
    case 'hidden':
      return <InputHidden name={name} />;
    case 'captcha':
      return <InputText name={name} />;
    default:
      return <div style={{fontWeight: 'bold', color: 'red'}}>Unknown field</div>;
  }
};

function useFieldAttrs(name) {
  const [field_spec, rhf] = useFieldSpec(name);
  const { setFocusedField, rhf: { trigger } } = useContext(FormContext);
  return [
    rhf,
    rhf_options(field_spec, setFocusedField, trigger),
    other_attrs(field_spec, setFocusedField),
  ];
}


/**
 * Prepares HTML attributes names for React
 * Mutates a props of a provided object.
 */
function transformAttrs(attrs) {
  const attrs_map = {
    class: 'className',
    minlength: 'minLength',
    maxlength: 'maxLength',
    readonly: 'readOnly',
    autocomplete: 'autoComplete',
  };

  for (let key of Object.keys(attrs)) {
    if (key in attrs_map) {
      attrs[attrs_map[key]] = attrs[key];
      delete attrs[key];
    }
  }
  return attrs;
}

/**
 *
 * @see https://react-hook-form.com/api/useform/register
 *
 * "disabled" input will result in an undefined form value.
 * If you want to prevent users from updating the input, you can use readOnly or disable the entire <fieldset />.
 */
const rhf_options = (field_spec, setFocusedField, trigger) => {
  const attrs = {
    disabled: field_spec.disabled,
    value: field_spec.initial,
    onBlur: () => { // rhf dosn't use onFocus: see: https://react-hook-form.com/api/useform/register
      console.log(`blur: ${field_spec.name}`);
      setFocusedField(null);
      trigger(field_spec.name);
    },
  }
  return attrs;
}

/**
 *
 */
const other_attrs = (field_spec, setFocusedField) => {
  const attrs = {
    ...field_spec.attrs,
    readOnly: field_spec.readonly,
    onFocus: () => {
      console.log(`focus: ${field_spec.name}`);
      setFocusedField(field_spec.name);
    },
  }

  transformAttrs(attrs);
  return attrs;
}

export function Label({text}) {
  return <label htmlFor="">{text}</label>;
}

function InputText({name}) {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="text" {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

function InputNumber({name}) {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="number" {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

function InputEmail({name}) {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="email" {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

export function InputHidden({name}) {
   const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="hidden" {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

function Textarea({name}) {
 const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <textarea {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

function InputCheckbox({name}) {
   const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
   const [field_spec, _] = useFieldSpec(name);
  return (
    <div className="form-check">
      <input type="checkbox" id={name} {...rhf.register(name, rhf_options)} {...other_attrs} />
      <label htmlFor={name}>{field_spec.label_hint}</label>
    </div>
  )
}

export function Submit({button_text}) {
  const { loading } = useContext(FormContext);
  const css_classes = classNames('dfp-submit-button', {'dfp-submit-button--loading': loading});

  const onClick = (e) => {
    if (loading) {
      e.preventDefault();
    }
  }
  return (
    <button type="submit" className={css_classes} onClick={onClick}>{button_text}</button>
  );
}

export function SubmitIndicator() {
  return (
    <div className="dpf-submit-indicator" />
  );
}

export function Separator() {
  return (
    <div className="dfp-separator" />
  );
}
