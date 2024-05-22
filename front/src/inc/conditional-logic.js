/**
 * Check if a field have conditional logic
 *
 * @param {import("../types").FormSpec} spec
 * @param {string} fieldName - Field name
 * @return {boolean}
 */
export const fieldHasCL = (spec, fieldName) => {
  return !! spec?.conditional_logic && !! spec.conditional_logic[fieldName];
};

/**
 * Get conditional logic rules of a field
 *
 * @param {import("../types").FormSpec} spec
 * @param {string} fieldName - Field name
 * @return {import("../types").CLSpec}
 */
export const getFieldCLGroups = (spec, fieldName) => {
  return fieldHasCL(spec, fieldName) ? spec.conditional_logic[fieldName] : [];
};

/**
 * Get current fields CL specs from a provided FormSpec
 *
 * @param {import("../types").FormSpec} spec
 * @return {import("../types").CLSpecsDict}
 */
export const getFieldsCLSpecs = (spec) => {
  return spec?.conditional_logic ? spec.conditional_logic : {};
};

/**
 * Transform field CL rules to .
 *
 * @param {import("../types").CLSpec} groups
 * @return {import("../types").FollowedCLFields}
 */
export function collect_followed_fields(groups) {
  let followed_fields = {};
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
 *
 * @param {import("../types").CLSpec} cl_groups
 * @param {import("../types").followedFieldsStateType} followedFieldsState
 * @returns {boolean} - true If a field should be displayed, false - otherwise
 */
export function check_cl_state(cl_groups, followedFieldsState) {
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
