
```javascript
// JSX results
import { JSX } from "react";

function Button({ text = '' }: { text: string }): JSX.Element | null {
    return text ? <button>{text}</button> : null;
}

// Children
// https://react.dev/learn/typescript#typing-children
React.ReactElement  // use it until you need ReactNode. Only ReactElement (no scalar types)
React.ReactNode  // string | number | ReactElement | ...
// wrap array of Elements to <></>

// Events
React.BaseSyntheticEvent

```


## react-hook-forms

```javascript
// devtool
import { Control } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

// useForm() call has to be typed
const formInfo = useForm<DfpFormValues>({});
```


## DOM

```javascript
// DOM event
e: Event
```
