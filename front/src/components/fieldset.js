import React, { useContext } from "react";

import { FormContext, FieldSlot, ExternalHtml } from '../parts'
import { isString } from "../inc/utils";
import classNames from "classnames";


const mapFieldsetItem = (item, index) => {
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

export function Fieldset({index}) {
  const {spec} = useContext(FormContext);
  const fieldset_spec = spec.fieldsets[index];
  return (
    <FieldsetFull
      title={fieldset_spec.title}
      desc={fieldset_spec.desc}
      css_classes={fieldset_spec?.css_classes}
    >
      {fieldset_spec.fields.map(mapFieldsetItem)}
    </FieldsetFull>
  );
}

export function FieldsetFull({title = '', desc = '', css_classes = [], children}) {
  return (
    <div className={classNames(['dfp-fieldset', ...css_classes])}>
      {title && <div className="dfp-fieldset__title ">{title}</div>}
      {desc && <div className="dfp-fieldset__desc">{desc}</div>}
      <div className="dfp-fieldset__items">{children}</div>
    </div>
  );
}

export function FieldsetSimple({children}) {
  return (
    <div className="dfp-fieldset">{children}</div>
  );
}
