import React, { JSX } from "react";

import { useFormContext } from "../parts";


export function FieldError({ name }: {name: string}): JSX.Element | null {
  const {rhf: {formState: {errors}}} = useFormContext();
  return errors[name] ? <Error>{errors[name].message as string}</Error> : null; // dirty
}

function Error({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="dfp-field-error">{children}</div>;
}
