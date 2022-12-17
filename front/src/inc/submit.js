import { sprintf } from "./utils";
import { i18n_phrases as default_i18n_phrases } from "./i18n";

export async function submitForm(data, e, context, reset, setValue, setCommonErrors, setLoading, cur_i18n_phrases) {
  console.log('SUBMIT - START');
  const i18n_phrases = Object.keys(cur_i18n_phrases).length ? cur_i18n_phrases : default_i18n_phrases;

  const form = e.target
  const {spec} = context

  const form_data = new FormData(form); // TODO what's with files uploading ???\

  console.log('## Form request');
  console.log('rhf_data:', data);
  console.table(Object.fromEntries(form_data));

  context.setSuccessMsg('');

  setLoading(true);
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

  let response;
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
          setValue(key, value, { shouldValidate: true });
        });
      } else {
        reset();
      }
      setCommonErrors([]);
      do_action(response, context);
      break;
    case 'fail':
      console.info('FAIL')
      let errors = [];
      if (response?.errors && Object.keys(response?.errors)?.length) {
        const error_keys = Object.keys(response.errors);
        error_keys.forEach(key => {
          errors.push(response.errors[key]);
        })
      }
      setCommonErrors(errors);
      break;
    default:
      // TODO
  }
}

function do_action(response, form_context) {
  console.log('Response:', response);
  const action = response.result_action
  switch (action.type) {
    case 'url':
      console.log('ACTION: CHANGE_URL')
      document.location.href = action.meta.url
      break
    case 'message':
    default:
      console.log('ACTION: MESSAGE')
      form_context.setSuccessMsg(action?.meta?.message)
  }
}
