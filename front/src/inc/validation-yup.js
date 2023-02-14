import { object, string, number, boolean, mixed, setLocale } from 'yup';

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
      case 'slug':
        base_type = string();
        rule = string();
        rule = applyValidators(rule, [name, field], spec);
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
      case 'image':
        base_type = mixed();
        rule = mixed();
        rule = applyValidators(rule, [name, field], spec);
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

  return object(items);
}

const applyValidators = (rule, [name, field], spec) => {
  let _rule = rule;
  field.validators.forEach(validator => {
    const error_text = field.errors[validator.name];

    switch (validator.type) {
      case 'max_length':
        _rule = _rule.max(validator.value);
        break;
      case 'min_length':
        _rule = _rule.min(validator.value);
        break;
      case 'file_size':
        _rule = _rule.test('file_size', error_text, get_file_size_validator(validator));
        break;
      case 'file_type':
        _rule = _rule.test('file_type', error_text, get_file_type_validator(validator));
        break;
      default:
        console.warn(`Unknown validator: ${validator.name} for field_name: ${name}`);
        // throw Error(`Unknown validator: ${validator?.name}`); // TODO ???
    }
  });

  return _rule;
};

const get_file_size_validator = (validator) => {
  return (value, context) => {
    if (! value?.length) {
      return true; // attachment is optional
    }
    return value[0].size <= validator.value;
  };
};

const get_file_type_validator = (validator) => {
  return (value, context) => {
    if (! value?.length) {
      return true; // attachment is optional
    }
    const validTypes = validator.value;
    return validTypes.includes(value[0].type);
  };
};

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
