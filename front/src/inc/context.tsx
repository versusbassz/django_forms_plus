import { createContext, useContext } from "react";

import { DfpFormContext } from "../types";

export const FormContext = createContext<DfpFormContext>({} as DfpFormContext); // dirty, but should work

export const useFormContext = (): DfpFormContext => {
  return useContext(FormContext);
};
