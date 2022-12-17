/**
 * Not used for now.
 *
 * in form.js:
 *     imports
 *         import { superstructResolver } from "@hookform/resolvers/superstruct"
 *         import { build_validation_schema } from "../inc/validation-superstruct";
 *
 *     in useForm() call
 *         resolver: superstructResolver(validation_schema),
 */

import {object, string, number, optional, refine, nonempty, unknown, coerce} from 'superstruct'

import { CSRF_TOKEN_NAME } from "./constants";

// const Positive = refine(number(), 'positive', (value) => (value >= 5 || 'Has to be >5'))
const PositiveCoerce = coerce(number(), string(), (value) => parseInt(value));
// const Positive = refine(number(), 'positive', (value) => (value >= 5 || 'Has to be >5'))
const Positive = refine(PositiveCoerce, 'positive', (value) => (value >= 5 || 'Has to be >5'))

/**
 * @see https://legacy.react-hook-form.com/get-started#Applyvalidation
 * RHF HTML-compatible validations: required, min, max, minLength, maxLength, pattern, validate
 * RHF own validations: never
 *
 * @param spec
 * @return {Struct}
 */
export function build_validation_schema(spec) {
  const items = {}
  items[CSRF_TOKEN_NAME] = string();

  Object.entries(spec.fields).forEach(([name, field]) => {
    if (field.disabled) {
      items[name] = unknown();
      return;
    }
    let rule = null;

    if (name === 'first_name') {
      items[name] = Positive;
      return;
    }

    switch (field.type) {
      case 'text':
      case 'email': rule = string(); break;
      case 'number': rule = number(); break;
      default: rule = string()
    }

    if (! field.required) {
       rule = optional(rule);
    } else {
       rule = nonempty(rule);
    }

    items[name] = rule;
  });

  console.log(items);
  return object(items);
}
