import React, { JSX, BaseSyntheticEvent, KeyboardEventHandler, MouseEventHandler } from "react";
import classNames from "classnames";
import { NumericFormat, PatternFormat } from 'react-number-format';

import { FieldSpec, SharedRHF } from "../types";
import { useFieldSpec } from "../inc/hooks";
import { useFormContext } from "../parts";
import { ImageUpload } from "./field-file";


export const fieldspec_to_input = (name: string, field_spec: FieldSpec): JSX.Element => {
  switch (field_spec.type) {
    case 'text':
      if (field_spec?.input_format) {
        return <MaskedInputText name={name} />;
      } else {
        return <InputText name={name} />;
      }
    case 'slug':
      return <InputSlug name={name} />;
    case 'url':
      return <InputURL name={name} />;
    case 'date':
      return <InputDate name={name} />;
    case 'number':
      return <InputNumber name={name} />;
    case 'positive_number':
      return <InputPositiveNumber name={name} />;
    case 'email':
      return <InputEmail name={name} />;
    case 'textarea':
      return <Textarea name={name} />;
    case 'checkbox':
      return <InputCheckbox name={name} />;
    case 'select':
      return <Select name={name} />;
    case 'radio':
      return <RadioSelect name={name} />;
    case 'image':
      return <ImageUpload name={name} />;
    case 'hidden':
      return <InputHidden name={name} />;
    case 'captcha':
      return <InputText name={name} />;
    default:
      return <div style={{fontWeight: 'bold', color: 'red'}}>Unknown field</div>;
  }
};

export function useFieldAttrs(name: string): [SharedRHF, RhfOptions, OtherAttrs] {
  const [field_spec, rhf] = useFieldSpec(name);
  const { setFocusedField, rhf: { trigger } } = useFormContext();
  return [
    rhf,
    rhf_options(field_spec, setFocusedField, trigger),
    other_attrs(field_spec, setFocusedField),
  ];
}

type RhfOptions = {
  disabled: boolean;
  value: any;
  onBlur: Function;
};

/**
 * @see https://react-hook-form.com/api/useform/register
 *
 * "disabled" input will result in an undefined form value.
 * If you want to prevent users from updating the input, you can use readOnly or disable the entire <fieldset />.
 */
const rhf_options = (field_spec: FieldSpec, setFocusedField: Function, trigger: Function): RhfOptions => {
  const attrs: RhfOptions = {
    disabled: field_spec.disabled,
    value: field_spec.initial,
    onBlur: (): void => { // rhf doesn't use onFocus: see: https://react-hook-form.com/api/useform/register
      console.log(`blur: ${field_spec.name}`);
      setFocusedField(null);
      trigger(field_spec.name);
    },
  }
  return attrs;
}

/**
 * HTML attributes (name => value) of an input tag in a field component
 */
type OtherAttrs = Record<string, any>;

const other_attrs = (field_spec: FieldSpec, setFocusedField: Function): OtherAttrs => {
  const attrs: OtherAttrs = {
    ...field_spec.attrs,
    readOnly: field_spec.readonly,
    onFocus: () => {
      console.log(`focus: ${field_spec.name}`);
      setFocusedField(field_spec.name);
    },
  }

  const attrs_map: Record<string, string> = {
    class: 'className',
    minlength: 'minLength',
    maxlength: 'maxLength',
    readonly: 'readOnly',
    autocomplete: 'autoComplete',
  }

  for (let key of Object.keys(attrs)) {
    if (key in attrs_map) {
      attrs[attrs_map[key]] = attrs[key];
      delete attrs[key];
    }
  }

  return attrs;
}

export function Label({text}: {text: string}): JSX.Element {
  return <label htmlFor="">{text}</label>;
}

function InputText({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="text" {...rhf.register(name, rhf_options)} {...other_attrs} />
  );
}

type RfnProps = {
  format?: string;
  mask?: string;
  allowEmptyFormatting?: boolean;
}

function InputDate({name}: {name: string}): JSX.Element {
  const rfn_props: RfnProps = {
    format: '##.##.####',
    mask: '_',
    allowEmptyFormatting: false,
  };
  return <MaskedInputText name={name} rfn_props={rfn_props} />
}

function MaskedInputText({name, rfn_props = {}}: {name: string, rfn_props?: RfnProps}): JSX.Element {
  const [field_spec, _] = useFieldSpec(name);

  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const rhf_props = rhf.register(name, rhf_options);

  return (
    <PatternFormat
      format={field_spec?.input_format}  // rfnum, required
      customInput={MaskedInnerInput} // rfnum
      // getInputRef={field.ref} // rfnum  warning
      // valueIsNumericString={true} // rfnum

      {...rfn_props}

      name={name}
      value={rhf_options.value}

      rhf_props={rhf_props}
      other_props={other_attrs}
    />
  );
}

type ReactNumberFormatRelatedProps = {
  rhf_props: any;
  other_props: any;
  onFocus: Function;
  onBlur: Function;
  onChange: Function;
  onKeyDown: KeyboardEventHandler;
  onMouseUp: MouseEventHandler;
  name: string;
  type: string;
  value: any;
};

type MaskedInnerInputProps = ReactNumberFormatRelatedProps;

function MaskedInnerInput (props: MaskedInnerInputProps): JSX.Element {
  const rhf_props = props.rhf_props;
  const other_props = props.other_props;

  const onFocus = (e: BaseSyntheticEvent): void => {
    props.onFocus(e);
    other_props.onFocus(e);
  };

  const onBlur = (e: BaseSyntheticEvent): void => {
    props.onBlur(e);
    rhf_props.onBlur(e);
  };

  const onChange = (e: BaseSyntheticEvent): void => {
    props.onChange(e);
    rhf_props.onChange(e);
  };

  return (
    <input
      name={props.name}
      type={props.type}
      value={props.value} // ???
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={props.onKeyDown} // rfnum
      onMouseUp={props.onMouseUp} // rfnum

      disabled={rhf_props?.disabled}
      ref={rhf_props.ref}

      placeholder={other_props.placeholder}
      readOnly={other_props?.readOnly}
    />
  );
}

/**
 * TODO allow changing props of NumericFormat on Django side
 * @link https://s-yadav.github.io/react-number-format/docs/numeric_format
 */
function InputPositiveNumber({name}: {name: string}) {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const rhf_props = rhf.register(name, rhf_options);

  return (
    <NumericFormat
      customInput={NumericInnerInput} // rfnum
      allowNegative={false} // rfnum
      decimalScale={0} // rfnum
      allowLeadingZeros={false} // rfnum

      name={name}
      value={rhf_options.value}

      rhf_props={rhf_props}
      other_props={other_attrs}
    />
  );
}

type NumericInnerInputProps = ReactNumberFormatRelatedProps;

function NumericInnerInput (props: NumericInnerInputProps): JSX.Element {
  const rhf_props = props.rhf_props;
  const other_props = props.other_props;
  
  // const setDefaultValue = (e, default_value) => {
  //   if (! e.target.value) {
  //     e.target.value = default_value;
  //   }
  // };

  const onFocus = (e: BaseSyntheticEvent): void => {
    props.onFocus(e);
    other_props.onFocus(e);
  };

  const onBlur = (e: BaseSyntheticEvent): void => {
    props.onBlur(e);
    rhf_props.onBlur(e);
  };

  const onChange = (e: BaseSyntheticEvent): void => {
    // setDefaultValue(e, '0');
    props.onChange(e);
    rhf_props.onChange(e);
  };

  return (
    <input
      name={props.name}
      type={props.type}
      value={props.value} // ???
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={props.onKeyDown} // rfnum
      onMouseUp={props.onMouseUp} // rfnum

      disabled={rhf_props?.disabled}
      ref={rhf_props.ref}

      placeholder={other_props.placeholder}
      readOnly={other_props?.readOnly}

      inputMode="numeric" // TODO move to Django widget.attrs
    />
  );
}

function InputSlug({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const [field_spec, _] = useFieldSpec(name);
  const applySuggestion = (e: BaseSyntheticEvent, value: string): void => {
    e.preventDefault();
    console.log(value);
    rhf.setValue(name, value, { shouldValidate: true })
  };

  return (
    <div className="dfp-input-slug">
      <div className="dfp-input-slug__prefix">{field_spec.prefix}</div>
      <div className="dfp-input-slug__input-wrapper">
        <input type="text" {...rhf.register(name, rhf_options)} {...other_attrs} />
      </div>

      {/* Suggestions */}
      {field_spec?.suggestions?.length ? (
        <div className="dfp-input-slug__suggestions dfp-suggestions">
          <div className="dfp-suggestions__prefix">Например</div>
          <div className="dfp-suggestions__list">
            {field_spec.suggestions.map((item, index) => {
              return (
                <div className="dfp-suggestions__item" key={index}>
                  <a href="#"
                     className="dfp-suggestions__item-link"
                     onClick={(e: BaseSyntheticEvent) => applySuggestion(e, item)}
                  >{item}</a>
                </div>
              );
            })}
          </div>
        </div>
      ): null}

    </div>
  )
}

function InputURL({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="url" {...rhf.register(name, rhf_options)} {...other_attrs} />
  );
}

function InputNumber({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="number" {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

function InputEmail({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="email" {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

export function InputHidden({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  return (
    <input type="hidden" {...rhf.register(name, rhf_options)} {...other_attrs} />
  )
}

function Textarea({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const rhf_attrs = rhf.register(name, rhf_options);
  return (
    <textarea {...rhf_attrs} {...other_attrs} />
  );
}

function InputCheckbox({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const [field_spec, _] = useFieldSpec(name);
  return (
    <div className="form-check">
      <input type="checkbox" id={name} {...rhf.register(name, rhf_options)} {...other_attrs} />
      <label htmlFor={name}>{field_spec.label_hint}</label>
    </div>
  )
}

function RadioSelect({name}: {name: string}): JSX.Element {
  const {spec} = useFormContext();
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const [field_spec, _] = useFieldSpec(name);
  return (
    <div className="dfp-radio-list">
      {field_spec.choices.map((item, index) => {
        const inputId = `${spec.id}--${name}--${index}`;
        return (
          <div className="dfp-radio-list__item dfp-radio-item" key={index}>
            <div className="dfp-radio-item__input-wrapper">
              <input
                type="radio"
                className="dfp-radio-item__input"
                value={item[0]}
                id={inputId}
                {...rhf.register(name, rhf_options)}
                {...other_attrs}
              />
            </div>
            <label htmlFor={inputId} className="dfp-radio-item__label">{item[1]}</label>
          </div>
        );
      })}
    </div>
  );
}

function Select({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const [field_spec, _] = useFieldSpec(name);
  return (
    <select {...rhf.register(name, rhf_options)} {...other_attrs}>
      {field_spec.choices.map((item, index) => {
        return <option value={item[0]} key={index}>{item[1]}</option>;
      })}
    </select>
  )
}


export function Submit({button_text}: {button_text: string}): JSX.Element {
  const { loading } = useFormContext();
  const css_classes = classNames('dfp-submit-button', {'dfp-submit-button--loading': loading});

  const onClick = (e: BaseSyntheticEvent): void => {
    if (loading) {
      e.preventDefault();
    }
  }
  return (
    <button type="submit" className={css_classes} onClick={onClick}>{button_text}</button>
  );
}

export function SubmitIndicator(): JSX.Element {
  return (
    <div className="dpf-submit-indicator" />
  );
}

export function Separator(): JSX.Element {
  return (
    <div className="dfp-separator" />
  );
}
