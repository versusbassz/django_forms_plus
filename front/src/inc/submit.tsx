import React from "react";

import { DfpFormContext, JsonFormResponse } from "../types";
import { sprintf } from "./utils";
import { dumpFormData } from "../components/debug";

/**
 * The "SubmitHandler" param of useForm().handleSubmit function
 *
 * @link https://react-hook-form.com/docs/useform/handlesubmit
 */
export async function submitForm(
    data: Object,
    e: React.BaseSyntheticEvent,
    context: DfpFormContext,
    reset: Function, // for further features in submit logic. don't remove
    setCommonErrors: Function,
    setLoading: Function,
    setSubmitResult: Function,
): Promise<void> {
  console.log('SUBMIT - START');

  const { spec } = context;
  const { fields, i18n_phrases } = spec;

  const form = e.target;

  const form_data = new FormData(form); // TODO what's with files uploading ???\

  console.log('## Form request');
  console.log('rhf_data:', data);
  dumpFormData(form_data);

  context.closeSuccessMsg();

  setLoading(true);

  emit_onsubmit_event(spec.id);

  const response_raw = await fetch(spec.action, {
    method: spec.method,
    headers: {
      // 'Content-Type': 'application/json;charset=utf-8',
      // 'Content-Type': 'multipart/form-data',
    },
    body: form_data,
  });

  if (! response_raw.ok) {
    setLoading(false);
    const error = sprintf(i18n_phrases.http_error, response_raw.status) + ' ' + i18n_phrases.try_again_late;
    setCommonErrors([error]);
    return;
  }

  let response: JsonFormResponse;
  try {
    response = await response_raw.json();
  } catch (e) {
    setLoading(false);
    const error = i18n_phrases.http_response_invalid + ' ' + i18n_phrases.try_again_late;
    setCommonErrors([error]);
    return;
  }

  console.log('Form response:', response);
  setLoading(false);

  switch (response?.status) {
    case 'success':
      console.info('SUCCESS');
      const has_payload = response?.payload && !! Object.keys(response?.payload).length;
      if (has_payload) {
        Object.entries(response.payload).forEach(([key, value], index) => {
          // console.log('NEW KEY', key, value, index);
          if (fields[key].type === 'image') {
            value = '';
          }
          context.rhf.setValue(key, value, { shouldValidate: true });
        });
      } else {
        // should we really reset if a payload is an empty object ???
        // reset();
      }
      setSubmitResult(response?.payload)
      setCommonErrors([]);
      do_action(response, context);
      break;
    case 'fail':
      console.info('FAIL')
      let errors: string[] = [];
      if (response?.errors && Object.keys(response?.errors)?.length) {
        const error_keys = Object.keys(response.errors);
        error_keys.forEach(key => {
          for (const err of response.errors[key]) {
            errors.push(err);
          }
        });
      }
      setCommonErrors(errors);
      break;
    default:
      // TODO
  }
}

function do_action(response: JsonFormResponse, form_context: DfpFormContext): void {
  console.log('Response:', response);
  const action = response.result_action
  switch (action.type) {

    case 'url':
      console.log('ACTION: CHANGE_URL')
      document.location.href = action.meta.url
      break

    case 'custom':
      console.log('ACTION: CUSTOM');
      const event = new CustomEvent('dfp:custom_action', {
        detail: {
          form_id: form_context.spec.id,
          response: response,
          form_context: form_context,
        },
      });
      document.dispatchEvent(event);
      break;

    case 'message':
    default:
      console.log('ACTION: MESSAGE')
      form_context.setSuccessMsg(
        action?.meta?.message,
        'bottom',
        action?.meta?.external_block,
      );
  }
}

function emit_onsubmit_event(form_id: string): void {
  const event = new CustomEvent('dfp:onsubmit', {
      detail: {form_id},
    });
  document.dispatchEvent(event);
}
