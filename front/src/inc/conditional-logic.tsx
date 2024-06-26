import { CLSpec, CLSpecsDict, FollowedCLFields, followedFieldsStateType, FormSpec } from "../types";

/**
 * Check if a field have conditional logic
 */
export const fieldHasCL = (spec: FormSpec, fieldName: string): boolean => {
  return !! spec?.conditional_logic && !! spec.conditional_logic[fieldName];
};

/**
 * Get conditional logic rules of a field
 */
export const getFieldCLGroups = (spec: FormSpec, fieldName: string): CLSpec => {
  return fieldHasCL(spec, fieldName) ? spec.conditional_logic[fieldName] : [];
};

/**
 * Get current fields CL specs from a provided FormSpec
 */
export const getFieldsCLSpecs = (spec: FormSpec): CLSpecsDict => {
  return spec?.conditional_logic ? spec.conditional_logic : {};
};

/**
 * Transform field CL rules to a set of these fields names.
 */
export function collect_followed_fields(groups: CLSpec): FollowedCLFields {
  let followed_fields: FollowedCLFields = {};
  groups.forEach((group) => {
    group.forEach((rule) => {
      if (! followed_fields[rule.field]) {
        followed_fields[rule.field] = true;
      }
    });
  });
  return followed_fields;
}

/**
 * Checks if all CL rules are satisfied for a provided fields state.
 * Returns true If a field should be displayed, false - otherwise.
 */
export function check_cl_state(
    cl_groups: CLSpec,
    followedFieldsState: followedFieldsStateType,
): boolean {
  for (const group of cl_groups) {
    let group_valid = true;

    for (const rule of group) {
      let rule_result;
      switch (rule.operator) {
        case 'checked':
          rule_result = followedFieldsState[rule.field] === true;
          if (! rule_result) {
            group_valid = false;
          }
          break;
        case 'non_checked':
          rule_result = followedFieldsState[rule.field] === false;
          if (! rule_result) {
            group_valid = false;
          }
          break;
        case 'equal':
          rule_result = followedFieldsState[rule.field] === rule.value;
          if (! rule_result) {
            group_valid = false;
          }
          break;
        default:
          console.warn(`Unknown conditional logic operator: ${rule.operator}`);
      }
      if (! group_valid) break;
    } // loop: rules of a group

    if (group_valid) {
      return true;
    }
  } // loop: groups

  return false;
}
