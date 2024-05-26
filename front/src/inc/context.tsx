import React, { createContext, useContext } from "react";

export const FormContext = createContext({});


/**
 * @return {import("../types").DfpFormContext}
 */
export const useFormContext = () => {
  return useContext(FormContext);
};
