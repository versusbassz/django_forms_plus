/**
 * The code for entry points of the library code (no side effects during importing)
 */

import ReactDOM from "react-dom/client";
import React from "react";

import { Form } from "../parts";

/**
 * Find all forms placeholders and initialize forms in them
 */
export function dfp_init_forms(devtool) {
  const form_containers = document.querySelectorAll('.js-dj-form-wrapper')

  form_containers.forEach(($wrapper) => {
    const $form = $wrapper.querySelector('.js-dj-form')

    const form_state_raw = $wrapper.querySelector('.js-dj-form__data')
    const form_state = JSON.parse(form_state_raw.innerHTML)

    const csrf_token = $wrapper.querySelector('.js-csrf-token').innerHTML

    dfp_render_form($form, form_state, csrf_token, devtool)
  });
}

/**
 * Renders a form in DOM
 *
 * @param {HTMLElement} form_root
 * @param {object} form_state
 * @param {string} csrf_token
 * @param {function} devtool
 */
export function dfp_render_form(form_root, form_state, csrf_token, devtool) {
  const root = ReactDOM.createRoot(form_root)
  root.render(
    <React.StrictMode>
      <Form spec={form_state.spec}
            csrf_token={csrf_token}
            devtool={devtool}
            debug_enabled={form_state.debug_enabled}
      />
    </React.StrictMode>
  )
}
