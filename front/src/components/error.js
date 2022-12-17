import React, { useContext } from "react";

import { FormContext } from "../parts";

export function FieldError({name}) {
  const {rhf: {formState: {errors}}} = useContext(FormContext)

  if (! errors[name]) return null;
  return (
    errors[name] && <div className="dfp-field-error">{errors[name].message}</div>
  )
}

export function FieldSoftError({name}) {
  const {rhf: {formState: {errors}}} = useContext(FormContext)

  if (! errors[name]) return null;
  return (
    errors[name] && <div className="dfp-field-error">{errors[name].message}</div>
  )
}
