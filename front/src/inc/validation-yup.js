import { object, string, number, boolean, setLocale } from 'yup';

import { CSRF_TOKEN_NAME } from "./constants";
import {collect_followed_fields, check_cl_state} from "./conditional-logic";

export function build_validation_schema(spec) {
  let cl_fields = spec?.conditional_logic?.rules ? spec.conditional_logic.rules : [];

  const items = {}
  items[CSRF_TOKEN_NAME] = string().required();

  Object.entries(spec.fields).forEach(([name, field]) => {
    if (field.disabled) {
      return;
    }
    let rule;
    let base_type; // for CL

    switch (field.type) {
      case 'text':
        base_type = string();
        rule = string();
        if (field.validators && field.validators.length) {
          field.validators.forEach((validator) => {
            switch (validator.name) {
              case 'max_length': rule = rule.max(validator.value); break;
              case 'min_length': rule = rule.min(validator.value); break;
              default: console.warn(`Unknown validator: ${validator.name} for field_name: ${name}`);
            }
          });
        }
        break;
      case 'email':
        base_type = string();
        rule = string();
        rule = rule.email();
        break;
      case 'number':
        base_type = number();
        rule = number();
        break;
      case 'checkbox':
        base_type = boolean();
        rule = boolean();
        break;
      default:
        base_type = string();
        rule = string();
    }

    if (field.required) {
       rule = rule.required(field.errors.required);
    }

    const has_cl = !! cl_fields[name];
    if (has_cl) {
      const followed_fields = collect_followed_fields(cl_fields[name]);
      const followed_fields_list = Object.keys(followed_fields);
      const normal_rule = rule;
      rule = base_type.when(
        followed_fields_list,
        {
          is: getIsFunc(cl_fields[name], followed_fields_list),
          then: _ => normal_rule,
          otherwise: schema => schema.optional().nullable(),
        }
      );
    }

    items[name] = rule;
  });

  const schema = object(items);
  // console.log('validation rules:', items);
  // console.log('validation schema:', schema);

  return schema;
}

function getIsFunc(cl_groups, followed_fields_list) {
  return (...args) => {
    const followedFieldsState = {};
    args.forEach((value, index) => {
      const name = followed_fields_list[index];
      followedFieldsState[name] = value;
    });

    return check_cl_state(cl_groups, followedFieldsState);
  };
}
