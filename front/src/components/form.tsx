import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

import { CSRF_TOKEN_NAME} from "../inc/constants";
import { FormContext, build_validation_schema, submitForm } from '../parts';
import { DebugPanel, SuccessMessage,
         InputHidden, Submit, SubmitIndicator,
         Fieldset, FieldsetFull, FieldsetSimple } from "../parts";
import { i18n_phrases as default_i18n_phrases } from "../inc/i18n";
import { DfpFormContext, DfpFormValues, FormSpec, I18nPhrases, RhfDevtoolBuilder } from "../types";

type SuccessMessageState = {
  content: string,
  position: string;
  externalBlock: string;
};

export type FormParams = {
  spec: FormSpec;
  csrf_token: string;
  buildDevtool?: RhfDevtoolBuilder;
  debug_enabled?: boolean;
};

export function Form({spec, csrf_token, buildDevtool = null, debug_enabled = false}: FormParams) {
  const i18n_phrases: I18nPhrases = Object.keys(spec.i18n_phrases).length ? spec.i18n_phrases : default_i18n_phrases;

  const validation_schema = build_validation_schema(spec, i18n_phrases);
  const {
    handleSubmit, reset, register, watch, control, setValue, getValues, trigger, formState, getFieldState,
    clearErrors,
  } = useForm<DfpFormValues>({
    resolver: yupResolver(validation_schema),
  });

  const [ successMsg, _setSuccessMsg ] = useState<SuccessMessageState | null>(null);
  const setSuccessMsg = (content: string, position: string = 'bottom', externalBlock: string = ''): void => {
    _setSuccessMsg({content, position, externalBlock});
  };
  const closeSuccessMsg = () => _setSuccessMsg(null);

  const [ commonErrors, setCommonErrors ] = useState([]);

  const [debugCount, setDebugCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState();

  const [ focusedField, setFocusedField ] = useState(null);
  const [validateOnStart, setValidateOnStart] = useState(false);

  const validate_on_start = () => {
    for (const [key, _] of Object.entries(spec.fields)) {
      trigger(key);
    }
    setValidateOnStart(true);
  }

  useEffect(() => {
    if (document.location.search.includes('dfp_validate_onstart')) {
      console.log('validate on start');
      setTimeout(() => validate_on_start(), 100); // TODO a dirty fix
    }
  }, []);

  // add the context to window.dfp
  useEffect(() => {
    window.dfp.forms[spec.id].context = context;
  }, []);

  // emit "dfp:init" event
  useEffect(() => {
    const event = new CustomEvent('dfp:init', {
      detail: {
        form_id: spec.id,
        form_context: context,
      },
    });
    document.dispatchEvent(event);
  }, []);

  const [debugEnabled, setDebugEnabled] = useState(debug_enabled);

  useEffect(() => {
    if (document.location.search.includes('dfp_debug')) {
      setDebugEnabled(true);
    }
  }, []);

  const context: DfpFormContext = {
    spec: spec,
    rhf: { register, watch, trigger, control, formState, getFieldState, setValue, getValues, clearErrors },
    loading: loading,
    submitResult: submitResult,
    setSuccessMsg, closeSuccessMsg,
    focusedField: focusedField, setFocusedField: setFocusedField,
    validateOnStart: validateOnStart,
    debugEnabled: debugEnabled,
    debugCount, setDebugCount,
  };

  const onSubmit = async (data: Object, e: React.BaseSyntheticEvent): Promise<void> => {
    await submitForm(data, e, context, reset, setCommonErrors, setLoading, setSubmitResult);
  };

  return (
    <FormContext.Provider value={context}>
      <div className="dfp-form">
        {debugEnabled && (<DebugPanel spec={spec} />)}

        <form className="dfp-form__tag"
              action={spec.action} method={spec.method} encType={spec.enctype}
              onSubmit={handleSubmit(onSubmit)}
              noValidate={true}
        >
          <div className="dfp-form__inner">

            {/* hidden fields */}
            <div style={{'display': 'none'}}>
              <input type="hidden" {...register(CSRF_TOKEN_NAME)} value={csrf_token} />
              {spec.hidden_fields.map((name, index) => {
                return <InputHidden key={index} name={name} />
              })}
            </div>

            {/* "Success" message - top */}
            {successMsg && successMsg.position === 'top' && (
              <FieldsetSimple>
                <SuccessMessage
                  content={successMsg.content}
                  close={closeSuccessMsg}
                  externalBlock={successMsg.externalBlock}
                />
              </FieldsetSimple>
            )}

            {/* Fieldsets */}
            {spec.fieldsets.map((_, index) => {
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

            {/* "Success" message - bottom */}
            {successMsg && successMsg.position === 'bottom' && (
              <FieldsetSimple>
                <SuccessMessage
                  content={successMsg.content}
                  close={closeSuccessMsg}
                  externalBlock={successMsg.externalBlock}
                />
              </FieldsetSimple>
            )}

            {/* "Submit" button */}
            <FieldsetFull key={spec.fieldsets.length}>
              <Submit button_text={spec.button_text} />
            </FieldsetFull>

          </div>{/* __inner */}
        </form>

        {/* "react-hook-form" - debugging widget */}
        {buildDevtool && buildDevtool(control)}
      </div>
    </FormContext.Provider>
  )
}
