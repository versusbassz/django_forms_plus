import { ReactElement, useState, useEffect, JSX } from "react";

import { useFormContext, FieldSlot, ExternalHtml } from '../parts'
import { isString } from "../inc/utils";
import classNames from "classnames";
import { check_cl_state, collect_followed_fields } from "../inc/conditional-logic";
import { followedFieldsStateType, LayoutItemSpec } from "../types";


const mapFieldsetItem = (item: string | LayoutItemSpec, index: number): ReactElement | null => {
  if (isString(item)) {
    // simple field name as a string
    return <FieldSlot name={item} key={index} />;
  } else {
    // object definition of a fieldset item
    switch (item.type) {
      case 'external_html':
        return <ExternalHtml key={index} itemSpec={item} />;
      default:
        console.warn(`Unknown type of the fieldset item: ${item.type}`);
        return null;
    }
  }
}

export function Fieldset({ index }: {index: number}): JSX.Element | null {
  const {spec, rhf: {watch}} = useFormContext();
  const fieldset_spec = spec.fieldsets[index];

  // Conditional logic
  const [allowedByCL, setAllowedByCL] = useState(true);

  const CLGroups = fieldset_spec?.conditional_logic || [];
  const hasCL: boolean = !! CLGroups.length;

  useEffect(() => {
    if (! hasCL) return;

    const followedFields = collect_followed_fields(CLGroups);

    let followedFieldsState: followedFieldsStateType = {};
    Object.keys(followedFields).forEach(item => {
      followedFieldsState[item] = watch(item);
    });

    const CLEnabled = check_cl_state(CLGroups, followedFieldsState);
    if (CLEnabled !== allowedByCL) {
      setAllowedByCL(CLEnabled);
    }
  });  // on any change/render

  if (! allowedByCL) return null;

  const elems: JSX.Element[] = fieldset_spec.fields.map(mapFieldsetItem).filter(value => !! value);

  // Render
  return (
    <FieldsetFull
      title={fieldset_spec.title}
      desc={fieldset_spec.desc}
      css_classes={fieldset_spec?.css_classes}
    >
      <>{elems}</>
    </FieldsetFull>
  );
}

export function FieldsetFull(
    {title = '', desc = '', css_classes = [], children}:
    {title?: string, desc?: string, css_classes?: string[], children: JSX.Element}
): JSX.Element {
  return (
    <div className={classNames(['dfp-fieldset', ...css_classes])}>
      {title && <div className="dfp-fieldset__title ">{title}</div>}
      {desc && <div className="dfp-fieldset__desc">{desc}</div>}
      <div className="dfp-fieldset__items">{children}</div>
    </div>
  );
}

export function FieldsetSimple({ children }: {children: ReactElement}) {
  return (
    <div className="dfp-fieldset">{children}</div>
  );
}
