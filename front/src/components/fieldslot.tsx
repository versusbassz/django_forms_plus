import { useEffect, useState, JSX } from "react";
import classNames from "classnames";

import { useFormContext, fieldspec_to_input, FieldError } from "../parts";
import { check_cl_state, collect_followed_fields,
         fieldHasCL, getFieldCLGroups } from "../inc/conditional-logic";
import { validate_soft_errors } from "../inc/validation-soft";
import { CLSpec, FollowedCLFields, followedFieldsStateType, FormSpec } from "../types";


function useFieldCL(spec: FormSpec, name: string, watch: Function
): [boolean, CLSpec, followedFieldsStateType] {
  let field_has_cl = fieldHasCL(spec, name);
  const cl_groups = getFieldCLGroups(spec, name);

  const [followedFields, setFollowedFields] = useState<FollowedCLFields>({} as FollowedCLFields);

  let followedFieldsState: followedFieldsStateType = {};
  Object.keys(followedFields).forEach(item => {followedFieldsState[item] = watch(item);});

  useEffect(() => {
    if (! field_has_cl) {return;}
    const followed_fields = collect_followed_fields(cl_groups);
    setFollowedFields(followed_fields);
  }, [])

  return [field_has_cl, cl_groups, followedFieldsState];
}


export function FieldSlot({ name }: {name: string}): JSX.Element | null {
  const { spec,  rhf: { watch, formState }, focusedField, validateOnStart, loading } = useFormContext();
  const field_spec = spec.fields[name];
  const input = fieldspec_to_input(name, field_spec);

  const value = watch(name);
  const formSubmittedOnce = formState.isSubmitted && ! loading;
  const isTouched = name in formState.touchedFields
  const isFocused = focusedField === name;

  // Validation
  const hasErrors: boolean = !! formState.errors[name]; // TODO IS IT CORRECT ???

  // Soft validation
  const [softErrors, setSoftErrors] = useState([])
  const hasSoftChecks: boolean = !! field_spec.soft_validators?.length;
  const allowSoftErrors: boolean = validateOnStart || isTouched || formSubmittedOnce;

  useEffect(function () {
    // TODO the performance of this solution is quite bad, try to fix it one day
    if (hasSoftChecks && allowSoftErrors) {
      const newState = validate_soft_errors(name, field_spec, value);
      if (JSON.stringify(newState) !== JSON.stringify(softErrors)) { // TODO slow: JSON.stringify comparison
        setSoftErrors(newState);
      }
    }
  }); // TODO slow: useEffect is triggered on any change

  const hasSoftErrors: boolean = !! softErrors.length;
  const showSoftErrors: boolean = ! isFocused && ! hasErrors && hasSoftErrors;

  // Conditional logic
  // If CL rules are not satisfied for a field => its HTML nodes are removed from DOM completely
  const [field_has_cl, cl_groups, followedFieldsState] = useFieldCL(spec, name, watch);
  const enabled: boolean = ! field_has_cl || check_cl_state(cl_groups, followedFieldsState);
  if (! enabled) {
    return null;
  }

  // CSS
  const show_valid_class: boolean = isTouched && ! isFocused  && ! hasErrors && ! showSoftErrors;

  const css_classes: Record<string, boolean> = {
      'dfp-fieldslot': true,
      'dfp-fieldslot--required': field_spec.required,
      'dfp-fieldslot--focus': isFocused,
      'dfp-fieldslot--valid': show_valid_class,
      'dfp-fieldslot--invalid': hasErrors,
      'dfp-fieldslot--softly-invalid': showSoftErrors,
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
      {hasErrors && (
        <div className="dfp-fieldslot__errors">
          <FieldError name={name} />
        </div>
      )}
      {showSoftErrors ? (
        <div className="dfp-fieldslot__soft-errors">
          {softErrors.map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
