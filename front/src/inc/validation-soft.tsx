import { FieldSpec } from "../types";


export function validate_soft_errors(name: string, field_spec: FieldSpec, value: any): string[] {
    const errors: string[] = [];

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
