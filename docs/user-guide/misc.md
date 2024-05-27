# Other features and notes

## JS Events

- add `dfp_validate_onstart` query argument to a URL,
e.g.: `https://example.org/mypage/?dfp_validate_onstart`

## Change customize form via JavaScript

### Events

```plain
dfp:init
    detail: Object
    detail.form_id: string
    detail.form_context: any - TODO specify

dfp:onsubmit
    detail: Object
    form_id: string

dfp:custom_action
    detail: Object
    detail.form_id: string
    detail.response: any - TODO specify
    detail.form_context: any - TODO specify
```

```javascript
// Do smth on form submit

(function(){
    const myFormId = 'my_form'; // in Jinja: {{ form.helper.form_id|tojson }}

    document.addEventListener('dfp:onsubmit', (e) => {
        if (myFormId !== e.detail.form_id) {
            return;
        }

        // do what you need
    }, false);
})();
```
