export const fieldHasCL = (spec, name) => spec?.conditional_logic?.rules && !! spec.conditional_logic.rules[name];
export const getFieldClGroups = (spec, name) => fieldHasCL(spec, name) ? spec?.conditional_logic?.rules[name] : [];

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
        default:
          console.warn(`Unknown conditional logic operator: ${rule.operator}`);
      }
      if (! group_valid) break;
    } // loop: rules of a group

    if (group_valid) {
      console.log('CL_RESULT:', true);
      return true;
    }
  } // loop: groups

  console.log('CL_RESULT:', false);
  return false;
}
