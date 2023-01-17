import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

import { CSRF_TOKEN_NAME} from "../inc/constants";
import { FormContext, build_validation_schema, submitForm } from '../parts';
import { DebugPanel, SuccessMessage,
         InputHidden, Submit, SubmitIndicator,
         Fieldset, FieldsetFull, FieldsetSimple } from "../parts";

export function Form({spec, csrf_token, devtool = null, debug_enabled = false}) {
  const validation_schema = build_validation_schema(spec);
  const { handleSubmit, reset, register, watch, control, setValue, trigger, formState, getFieldState } = useForm({
    resolver: yupResolver(validation_schema),
  });
  const form_ref = useRef();

  const [ successMsg, setSuccessMsg ] = useState('');
  const [ commonErrors, setCommonErrors ] = useState([]);
  const closeSuccessMsg = () => setSuccessMsg('');

  const [loading, setLoading] = useState(false);

  const [ focusedField, setFocusedField ] = useState(null);
  const [validateOnStart, setValidateOnStart] = useState(false);

  const validate_on_start = () => {
    for (const [key, value] of Object.entries(spec.fields)) {
      trigger(key);
    }
    setValidateOnStart(true);
  }

  useEffect(() => {
    if (document.location.search.includes('dfp_validate_onstart')) {
      console.log('validate on start');
      validate_on_start();
    }
  }, []);

  const [debugEnabled, setDebugEnabled] = useState(debug_enabled);

  useEffect(() => {
    if (document.location.search.includes('dfp_debug')) {
      setDebugEnabled(true);
    }
  }, []);

  const context = {
    spec: spec,
    rhf: { register, watch, trigger, formState, getFieldState },
    loading: loading,
    setSuccessMsg: setSuccessMsg,
    focusedField: focusedField, setFocusedField: setFocusedField,
    validateOnStart: validateOnStart,
  };
  const fieldsets = spec.fieldsets;

  const onSubmit = (data, e) => {
    submitForm(data, e, context, reset, setValue, setCommonErrors, setLoading, spec.i18n_phrases);
  }

  return (
    <FormContext.Provider value={context}>
      <div className="dfp-form">
        {debugEnabled && (<DebugPanel spec={spec} />)}

        <form className="dfp-form__tag"
              action={spec.action} method={spec.method} encType={spec.enctype}
              onSubmit={handleSubmit(onSubmit)}
              ref={form_ref}
        >
          <div className="dfp-form__inner">

            {/* hidden fields */}
            <div style={{'display': 'none'}}>
              <input type="hidden" {...register(CSRF_TOKEN_NAME)} value={csrf_token} />
              {spec.hidden_fields.map((name, index) => {
                return <InputHidden key={index} name={name} />
              })}
            </div>

            {/* Fieldsets */}
            {fieldsets.map((_, index) => {
                return <Fieldset key={index} index={index} />
            })}

            {/* Common errors */}
            {commonErrors.length ? (
              <div className="dfp-common-errors">
                {commonErrors.map((item, index) => (
                  <div className="dfp-common-errors__item" key={index}>{item}</div>
                ))}
              </div>
            ) : null}

            {/* Submit indicator */}
            {loading && <SubmitIndicator />}

            {/* "Success" message */}
            {successMsg && (
              <FieldsetSimple>
                <SuccessMessage content={successMsg} close={closeSuccessMsg} />
              </FieldsetSimple>
            )}

            {/* "Submit" button */}
            <FieldsetFull key={fieldsets.length}>
              <Submit button_text={spec.button_text} />
            </FieldsetFull>

          </div>{/* __inner */}
        </form>

        {/* "react-hook-form" - debugging widget */}
        {devtool && devtool(control)}
      </div>
    </FormContext.Provider>
  )
}
