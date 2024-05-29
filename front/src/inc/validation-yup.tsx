import { object, string, number, boolean, mixed, ObjectSchema, Schema, NumberSchema, TestContext } from 'yup';
import * as dayjs from "dayjs";
import customParseFormat from "dayjs/esm/plugin/customParseFormat";

import { CLSpec, FieldSpec, FormSpec, I18nPhrases, ValidatorSpec } from "../types";
import { CSRF_TOKEN_NAME } from "./constants";
import {collect_followed_fields, check_cl_state, getFieldsCLSpecs, fieldHasCL} from "./conditional-logic";

dayjs.extend(customParseFormat);


/**
 * A function for "is" param of Yup's .when() method
 */
type YupIsFunc = (...args: any) => boolean;

/**
 * A function for 3-rd param of Yup's Schema.test() method
 */
type YupTestFunc = (value: any, context: TestContext) => boolean;


export function build_validation_schema(spec: FormSpec, i18n_phrases: I18nPhrases): ObjectSchema<any> {
  let cl_fields = getFieldsCLSpecs(spec);

  const items: Record<string, Schema> = {}

  items[CSRF_TOKEN_NAME] = string().required();

  Object.entries(spec.fields).forEach(([name, field]) => {
    if (field.disabled) {
      return;
    }

    let rule: Schema;
    let base_type: Schema;

    switch (field.type) {
      case 'text':
      case 'slug':
        base_type = string();
        rule = string();
        rule = applyValidators(rule, [name, field], spec);
        break;
      case 'url':
        base_type = string();
        rule = string().url(i18n_phrases.invalid_url);
        rule = applyValidators(rule, [name, field], spec);
        break;
      case 'email':
        base_type = string();
        rule = string().email();
        break;
      case 'date':
        base_type = string();
        rule = string().nullable();
        rule = rule.test('valid_date', i18n_phrases.invalid_date, validateDate);
        break;
      case 'number':
        base_type = number();
        rule = number();
        break;
      case 'positive_number':
        // the field's formatting is restricted by "react-number-format" library for now
        // therefore it isn't necessary to validate "number" here
        // if the field is allowed to be empty it requires the related Model.field to be nullable
        // because "empty string" value is transformed to None in django.forms.fields.IntegerField.to_python
        // otherwise you'll get DB integrity exception
        base_type = string();
        rule = string();
        break;
      case 'checkbox':
        base_type = boolean();
        rule = boolean();

        // if a checkbox is required it means it has to be boolean:true
        if (field.required) {
          rule = rule.test(
            'checkbox_is_true',
            field.errors.required,
            (value, context) => value === true,
          );
        }
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

    // Conditional logic
    const has_cl = fieldHasCL(spec, name);
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

const applyValidators = (rule: Schema, [name, field]: [string, FieldSpec], spec: FormSpec): Schema => {
  let _rule = rule;
  field.validators.forEach(validator => {
    const error_text = field.errors[validator.name];

    switch (validator.type) {
      case 'max_length':
        _rule = (_rule as NumberSchema).max(validator.value);
        break;
      case 'min_length':
        _rule = (_rule as NumberSchema).min(validator.value);
        break;
      case 'regexp':
        _rule = _rule.test(validator.name, validator.message, get_regexp_validator(validator));
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

const get_regexp_validator = (validator: ValidatorSpec): YupTestFunc => {
  return (value, context) => {
    if (validator.allow_empty && ! value) {
      return true;
    }
    const regexp = RegExp(validator.value);
    const matches = regexp.exec(value) !== null;
    const valid = validator.inverse ? ! matches : matches;
    return valid;
  };
};

const get_file_size_validator = (validator: ValidatorSpec): YupTestFunc => {
  return (value, context) => {
    if (! value?.length) {
      return true; // attachment is optional
    }
    return value[0].size <= validator.value;
  };
};

const get_file_type_validator = (validator: ValidatorSpec): YupTestFunc => {
  return (value, context) => {
    if (! value?.length) {
      return true; // attachment is optional
    }
    const validTypes = validator.value;
    return validTypes.includes(value[0].type);
  };
};

const validateDate: YupTestFunc = (value, context): boolean => {
  return isDate(value);
};

/**
 * TODO maybe typeguard ???
 */
const isDate = function(date: any): boolean {
  if (! date?.length) {
    return true;  // TODO is it correct ???
  }
  const d = dayjs(date, 'DD.MM.YYYY', true);
  return d.isValid();
}

/**
 * Return a function for "is" param of Yup's .when() method
 */
function getIsFunc(cl_groups: CLSpec, followed_fields_list: string[]): YupIsFunc {
  return (...args) => {
    const followedFieldsState: Record<string, any> = {};
    args.forEach((value, index) => {
      const name = followed_fields_list[index];
      followedFieldsState[name] = value;
    });

    return check_cl_state(cl_groups, followedFieldsState);
  };
}
