/**
 * The code for entry points of the library code (no side effects during importing)
 */

import ReactDOM from "react-dom/client";
import React from "react";

import { FormState, RhfDevtoolBuilder } from "../types";
import { Form } from "../parts";

/**
 * Find all forms placeholders and initialize forms in them
 */
export function dfp_init_forms(buildDevtool: RhfDevtoolBuilder | null = null): void {
  const form_containers = document.querySelectorAll('.js-dj-form-wrapper')

  // todo avoid multiple invocations

  window.dfp = {
    forms: {},
  };

  form_containers.forEach(($wrapper) => {
    const $form = $wrapper.querySelector('.js-dj-form') as HTMLElement;

    const form_state_raw = $wrapper.querySelector('.js-dj-form__data');
    const form_state = JSON.parse(form_state_raw.innerHTML) as FormState;

    const csrf_token = $wrapper.querySelector('.js-csrf-token').innerHTML
    
    window.dfp.forms[form_state.spec.id] = {
      backendInitial: {...form_state},
      context: null,
    }

    dfp_render_form($form, form_state, csrf_token, buildDevtool)
  });
}

/**
 * Renders a form in DOM
 */
export function dfp_render_form(form_root: HTMLElement, form_state: FormState, csrf_token: string,
                                buildDevtool: RhfDevtoolBuilder | null = null): void {
  const root = ReactDOM.createRoot(form_root)
  root.render(
    <React.StrictMode>
      <Form spec={form_state.spec}
            csrf_token={csrf_token}
            buildDevtool={buildDevtool}
            debug_enabled={form_state.debug_enabled}
      />
    </React.StrictMode>
  )
}
