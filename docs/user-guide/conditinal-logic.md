# Conditional logic


The structure for versions `<= 0.8.0`:
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
            'title': 'Section title',
            'fields': ['field_2', 'field_3'],
            'conditional_logic': [
                [
                    {
                        'field': 'field_1',
                        'operator': 'equal',
                        'operator': 'value_1',
                    },
                ],
            ],
        },
    ]
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
