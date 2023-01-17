import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames";

import { FormContext, fieldspec_to_input, FieldError } from "../parts";
import { check_cl_state, collect_followed_fields,
         fieldHasCL, getFieldClGroups } from "../inc/conditional-logic";

function useFieldCL(spec, name, watch) {
  let field_has_cl = fieldHasCL(spec, name);
  const cl_groups = getFieldClGroups(spec, name);

  const [followedFields, setFollowedFields] = useState([]);

  let followedFieldsState = {};
  Object.keys(followedFields).forEach(item => {followedFieldsState[item] = watch(item);});

  useEffect(() => {
    if (! field_has_cl) {return;}
    const followed_fields = collect_followed_fields(cl_groups);
    setFollowedFields(followed_fields);
  }, [])

  return [field_has_cl, cl_groups, followedFieldsState];
}

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

  const has_soft_checks = field_spec.soft_validators?.length;
  const has_soft_errors = has_soft_checks && (validateOnStart || isTouched || formSubmittedOnce) && ! value;
  const show_soft_errors = ! isFocused && ! has_errors && has_soft_errors;

  const show_valid_class = isTouched && ! isFocused  && ! has_errors && ! show_soft_errors;

  const css_classes = {
      'dfp-fieldslot': true,
      'dfp-fieldslot--required': field_spec.required,
      'dfp-fieldslot--focus': isFocused,
      'dfp-fieldslot--valid': show_valid_class,
      'dfp-fieldslot--invalid': has_errors,
      'dfp-fieldslot--softly-invalid': show_soft_errors,
  }

  return (
    <div className={classNames(css_classes)}>
      {field_spec.label ? <div className="dfp-fieldslot__title">{field_spec.label}</div> : null}
      {field_spec.help_text && (
        <div className="dfp-fieldslot__help-text"
             dangerouslySetInnerHTML={{__html: field_spec.help_text}} />
      )}
      <div className="dfp-fieldslot__field">{input}</div>
      {has_errors && (
        <div className="dfp-fieldslot__errors">
          <FieldError name={name} />
        </div>
      )}
      {show_soft_errors ? (
        <div className="dfp-fieldslot__soft-errors">{field_spec.soft_errors.required}</div>
      ) : null}
    </div>
  );
}
