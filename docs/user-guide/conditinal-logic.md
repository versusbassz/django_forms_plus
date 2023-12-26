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
```
