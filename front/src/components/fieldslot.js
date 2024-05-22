import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames";

import { FormContext, fieldspec_to_input, FieldError } from "../parts";
import { check_cl_state, collect_followed_fields,
         fieldHasCL, getFieldClGroups } from "../inc/conditional-logic";

/**
 * @param {import("../types").FormSpec} spec
 * @param {string} name
 * @param {function} watch
 * @return {[boolean, import("../types").FollowedCLFields, followedFieldsStateType]}
 */
function useFieldCL(spec, name, watch) {
  let field_has_cl = fieldHasCL(spec, name);
  const cl_groups = getFieldClGroups(spec, name);

  const [followedFields, setFollowedFields] = useState([]);

  /** @type {followedFieldsStateType} */
  let followedFieldsState = {};
  Object.keys(followedFields).forEach(item => {followedFieldsState[item] = watch(item);});

  useEffect(() => {
    if (! field_has_cl) {return;}
    const followed_fields = collect_followed_fields(cl_groups);
    setFollowedFields(followed_fields);
  }, [])

  return [field_has_cl, cl_groups, followedFieldsState];
}


/**
 * @param {Object} props
 * @param {string} props.name
 * @return {React.FC|null}
 */
export function FieldSlot({ name }) {
  const { spec,  rhf: { watch, formState }, focusedField, validateOnStart, loading } = useContext(FormContext);
  const field_spec = spec.fields[name];
  const input = fieldspec_to_input(name, field_spec);

  const [field_has_cl, cl_groups, followedFieldsState] = useFieldCL(spec, name, watch);

  const enabled = ! field_has_cl || check_cl_state(cl_groups, followedFieldsState);

  if (! enabled) {return null;}

  const value = watch(name);
  const formSubmittedOnce = formState.isSubmitted && ! loading;
  // const { isTouched } = getFieldState(name);
  const isTouched = name in formState.touchedFields
  const isFocused = focusedField === name;

  const has_errors = formState.errors[name];

  // Soft errors
  const has_soft_checks = field_spec.soft_validators?.length;
  const allow_soft_errors = validateOnStart || isTouched || formSubmittedOnce;

  let has_soft_errors = false;
  let soft_errors = [];
  if (has_soft_checks && allow_soft_errors) {
    soft_errors = validate_soft_errors(name, field_spec, value);
    has_soft_errors = !! soft_errors.length;
  }
  const show_soft_errors = ! isFocused && ! has_errors && has_soft_errors;

  // CSS
  const show_valid_class = isTouched && ! isFocused  && ! has_errors && ! show_soft_errors;

  const css_classes = {
      'dfp-fieldslot': true,
      'dfp-fieldslot--required': field_spec.required,
      'dfp-fieldslot--focus': isFocused,
      'dfp-fieldslot--valid': show_valid_class,
      'dfp-fieldslot--invalid': has_errors,
      'dfp-fieldslot--softly-invalid': show_soft_errors,
  }

  if (field_spec.css_classes?.fieldslot) {
    css_classes[field_spec.css_classes?.fieldslot] = true;
  }

  let field_css_classes = ['dfp-fieldslot__field'];
  if (field_spec.css_classes?.field) {
    field_css_classes.push(field_spec.css_classes.field);
  }

  return (
    <div className={classNames(css_classes)}>
      {field_spec.label ? <div className="dfp-fieldslot__title">{field_spec.label}</div> : null}
      {field_spec.help_text && (
        <div className="dfp-fieldslot__help-text"
             dangerouslySetInnerHTML={{__html: field_spec.help_text}} />
      )}
      <div className={classNames(field_css_classes)}>{input}</div>
      {has_errors && (
        <div className="dfp-fieldslot__errors">
          <FieldError name={name} />
        </div>
      )}
      {show_soft_errors ? (
        <div className="dfp-fieldslot__soft-errors">
          {soft_errors.map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function validate_soft_errors(name, field_spec, value) {
    const errors = [];

    for (const check of field_spec.soft_validators) {
      switch (check.type) {
        case 'required':
          ! value && errors.push(check.message)
          break;
        case 'regexp':
          const regexp = RegExp(check.value);
          const is_match_raw = regexp.exec(value) !== null;
          const is_err = check.inverse ? is_match_raw : ! is_match_raw;
          is_err && errors.push(check.message);
          break;
        default:
          console.warn(`Unknown validator: name:${check.name} type:${check.type}`);
          break;
      }
    }
    return errors;
}
