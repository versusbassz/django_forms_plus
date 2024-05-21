# Conditional logic

Details on the current behaviour:
- If CL rules are not satisfied for a field => its HTML nodes are removed from DOM completely.
- If a field was hidden be CL and displayed back after that => its entered value is preserved
- If a field hidden by CL was submitted => its value is removed in DB

The structure for versions `>= 0.9.0`:
```python
class DfpMeta:
    conditional_logic = {
        'middle_name': [
            [
                {
                    'field': 'no_middle_name',
                    'operator': 'non_checked',
                },
            ],
        ],
    }

    fieldsets = [
        {
            'fields': ['field_2', 'field_3'],
            'conditional_logic': [
                [
                    {
                        'field': 'field_1',
                        'operator': 'equal',
                        'value': 'any_exact_value',
                    },
                ],
            ],
        },
    ]
```

The structure for old versions `<= 0.8.0`:
```python
class DfpMeta:
    conditional_logic = {
        'version': 1,
        'rules': {
            'middle_name': [
                [
                    {
                        'field': 'no_middle_name',
                        'operator': 'non_checked',
                    },
                ],
            ],
        },
    }
```

## Operators

```python
[
    # checked
    {
        'field': 'my_field',
        'operator': 'checked',
    },
    
    # non_checked
    {
        'field': 'my_field',
        'operator': 'non_checked',
    },
    
    # equal
    {
        'field': 'my_field',
        'operator': 'equal',
        'value': 'any_exact_value'
    },
]
```
