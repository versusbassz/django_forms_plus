import { useContext } from "react";
import { FormContext } from "../parts";

export const useFieldSpec = (name) => {
  const { spec, rhf } = useContext(FormContext)
  return [spec.fields[name], rhf]
}
