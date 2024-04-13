# JS APIs and interfaces

## Events

```js
// on DFP logic init
document.addEventListener('dfp:init', (e) => {
    // e.detail.form_id: string
}, false);

// when a form submission get started
document.addEventListener('dfp:onsubmit', (e) => {
    // e.detail.form_id: string
}, false);

// when a form gets a successful response with action=custom
document.addEventListener('dfp:custom_action', (e) => {
    // e.detail.form_id: string
    // e.detail.response: object (key/value)
    // e.detail.form_context: object (key/value, React)
}, false);
```
