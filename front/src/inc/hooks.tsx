import { useFormContext } from "../parts";
import { FieldSpec, SharedRHF } from "../types";

export const useFieldSpec = (name: string): [FieldSpec, SharedRHF] => {
  const { spec, rhf } = useFormContext();
  return [spec.fields[name], rhf]
}
