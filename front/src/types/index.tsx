/**
 * Contractions:
 *   Conditional logic = CL
 */

import { Control, FormState as xRhfFormState } from "react-hook-form";
import { JSX } from "react";

export type HiddenFields = string[];

export type ImageFileInfo = {
    exists: boolean;
    url: string;
};

export type LayoutItemSpec = {
    type: string;
    selector: string;
};


export type ValidatorSpec = {
    name: string
    type: string
    value: any;
    inverse: boolean;
    allow_empty: boolean;
    message?: string;
};

export type CssClasses = Record<string, string>;

/**
 * A field spec.
 */
export type FieldSpec = {
    name: string; // attr:name or such
    type: string; // The according form attr
    label: string;
    help_text: string;
    required: boolean;
    disabled: boolean;
    readonly: boolean | string;
    initial: any;
    errors: Record<string, any>;
    attrs: Record<string, any>;
    validators: ValidatorSpec[];
    soft_validators: ValidatorSpec[];
    css_classes: CssClasses;

    prefix?: any;
    suggestions?: string[];
    input_format?: any;
    label_hint?: string[][];
    choices?: Array<Array<string | number>>;
    checkbox_name?: any;
    checkbox_id?: any;
    expected_width?: any;
    expected_height?: any;
};

export type FieldSpecsDict = Record<string, FieldSpec>;

export type FieldsetField = string | LayoutItemSpec;
export type FieldsetFieldList = FieldsetField[];
export type FieldsetSpec = {
    fields: FieldsetFieldList
    title?: string;
    desc?: string;
    css_classes?: string[];
    conditional_logic?: CLSpec;
};

export type FieldsetSpecList = FieldsetSpec[];

/**
 * CL rule of a field.
 */
export type CLSpecRule = {
    field: string;
    operator: string;
    value?: string;
}

/**
 * A set of CL rules for a certain field.
 */
export type CLSpec = CLSpecRule[][];

/**
 * A hashmap of a field attr:name => CL spec for a field
 */
export type CLSpecsDict = Record<string, CLSpec>;


export type I18nPhrases = Record<string, string>;


export type FormSpec = {
    id: string;
    action: string;
    method: string;
    enctype: string;
    button_text: string;
    hidden_fields: HiddenFields;
    fields: FieldSpecsDict;
    fieldsets: FieldsetSpecList;
    conditional_logic: CLSpecsDict;
    i18n_phrases: I18nPhrases;
};

export type FormData = {
    value: Record<string, any>;
};

export type FormState = {
    spec: FormSpec;
    data: FormData;
    debug_enabled: boolean;
};

export type FormResponseAction = {
    type: string;
    meta: Record<string, any>;
};

export type JsonFormResponse = {
    status: string;
    errors: Record<string, string[]>;
    result_action?: FormResponseAction;
    payload: Record<string, any>;
};



// ====-
// JavaScript only types
// ====-

export type RhfDevtoolBuilder = (control: Control) => JSX.Element;

/**
 * A "set"-like object with info about what fields are followed.
 * The format: field_name => true
 */
export type FollowedCLFields = Record<string, boolean>;

/**
 * (tech) field name => field value
 */
export type followedFieldsStateType = Record<string, any>;

/**
 * FormState of useForm() hook
 */
export type DfpFormValues = Record<string, any>;

/**
 * "react-hook-forms" API exposed in DfpFormContext
 *
 * TODO maybe add more details
 */
export type SharedRHF = {
    register: Function;
    watch: Function;
    trigger: Function;
    control: Control<DfpFormValues>;
    formState: xRhfFormState<DfpFormValues>;
    getFieldState: Function;
    setValue: Function;
    getValues: Function;
    clearErrors: Function;
};

export type DfpFormContext = {
    spec: FormSpec;
    loading: boolean;
    rhf: SharedRHF;
    submitResult: any; // A form submission result
    setSuccessMsg: Function;
    closeSuccessMsg: Function; // TODO
    focusedField?: string; // attr:name of a focused field in a form
    setFocusedField: Function; // TODO
    validateOnStart: boolean; // Is validation of a form enabled during page loading
                              // (without any action from a user)
    debugEnabled: boolean; // Is debug panel enabled for a form
    debugCount: number; // for debugging purposes
    setDebugCount: Function;
};

// window.dfp
// see dfp_init_forms()
export type FormGlobalInfo = {
    backendInitial: FormState,
    context: DfpFormContext | null,
}
export type DfpWindowVar = {
    forms: Record<string, FormGlobalInfo>;
};
declare global {
    interface Window { dfp: DfpWindowVar; }
}
