/**
 * How to import:
 *   {import("../types").FormSpec
 *
 * Contractions:
 *   Conditional logic = CL
 */


/**
 * CL rule of a field.
 *
 * @typedef {Object} CLSpecRule
 * @property {string} field
 * @property {string} operator
 * @property {?string} value
 */

/**
 * A set of CL rules for a certain field.
 *
 * @typedef {CLSpecRule[][]} CLSpec
 */

/**
 * @typedef {Object<string, string>} I18nPhrases
 */

/**
 * A hashmap of a field attr:name => CL spec for a field
 *
 * @typedef {Object<string, CLSpec>} CLSpecsDict
 */

/**
 * A "set"-like object with info about what fields are followed.
 * The format: field_name => true
 *
 * @typedef {Object<string, boolean>} FollowedCLFields
 */

/**
 * @typedef {Object<string, *>} followedFieldsStateType - (tech) field name => field current value
 */


/**
 * A field spec.
 *
 * @typedef {Object} FieldSpec
 * @property {string} name - attr:name or such
 * @property {string} type - The according form attr
 * @property {string} label
 * @property {string} help_text
 * @property {boolean} required
 * @property {boolean} disabled
 * @property {boolean | string} readonly
 * @property {*} initial
 * @property {Object<string, *>} errors
 * @property {Object<string, *>} attrs
 * @property {Object<string, *>[]} validators
 * @property {Object<string, *>[]} validators
 * @property {Object<string, *>} css_classes
 */


/**
 * A form spec.
 * Provided by a Python (Django) backend.
 *
 * @typedef {Object} FormSpec
 * @property {string} id - The form id (to be able to use several forms on a page)
 * @property {string} action - The according form attr
 * @property {string} method - The according form attr
 * @property {string} enctype - The according form attr
 * @property {string} button_text
 * @property {string[]} hidden_fields - attr:name of <input type:hidden> fields
 * @property {Object<string, Object>} fields - The most important part. The fields specs by attr:name
 * @property {Object[]} fieldsets - The fieldsets specs
 * @property {CLSpecsDict} conditional_logic - Fields conditional logic rules by field attr:name
 * @property {I18nPhrases} i18n_phrases - Translated phrases for UI
 */


/**
 * "react-hook-forms" API exposed in DfpFormContext
 *
 * TODO maybe add more details
 *
 * @typedef {Object} SharedRHF
 * @property {function} register
 * @property {function} watch
 * @property {function} trigger
 * @property {function} control
 * @property {function} formState
 * @property {function} getFieldState
 * @property {function} setValue
 * @property {function} clearErrors
 */

/**
 * @typedef {Object} DfpFormContext
 * @property {FormSpec} spec
 * @property {boolean} loading
 * @property {SharedRHF} rhf
 * @property {*} submitResult - A form submission result
 * @property {function} setSuccessMsg - TODO
 * @property {function} closeSuccessMsg - TODO
 * @property {?string} focusedField - attr:name of a focused field in a form
 * @property {function} setFocusedField - TODO
 * @property {boolean} validateOnStart - Is validation of a form enabled during page loading
 *                                       (without any action from a user)
 * @property {boolean} debugEnabled - Is debug panel enabled for a form
 */

// TODO window.dfp   see dfp_init_forms()
