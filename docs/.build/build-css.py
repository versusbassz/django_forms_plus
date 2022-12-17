import json
from pathlib import Path

import yaml

NEW_LINE = '\n'
SELECTOR_CLASS = '.'
BRACES = '{}'
BRACE_OPEN = '{'
BRACE_CLOSE = '}'
TAB = '    '
PREFIX_ELEM = '__'
PREFIX_MOD = '--'


def main():
    cur_dir = Path(__file__).parent

    conf_path = cur_dir / 'css.yml'
    result_path = cur_dir.parent / 'user-guide' / 'css.md'

    struct = load_schema(conf_path)
    # print(json.dumps(struct, indent=4))

    code_schema = generate_code_schema(struct)
    code_css = generate_code_css(struct)
    code_scss = generate_code_scss(struct)

    content = generate_content(code_schema, code_css, code_scss)
    write_result(result_path, content)

    print('[docs] "CSS" page has been generated')


def load_schema(file_path: Path):
    with open(file_path.resolve(), 'r') as conf_fd:
        content = conf_fd.read()

    return yaml.safe_load(content)

def generate_code_schema(struct: list) -> str:
    def parse_item(item: dict, result: str):
        result += f"{SELECTOR_CLASS}{item['name']}"
        if 'modifiers' in item:
            modifiers_str = ' '.join([f'{PREFIX_MOD}{m}' for m in item['modifiers']])
            result += f'  {modifiers_str}'
        result += NEW_LINE
        if 'elements' in item:
            result += ''.join([f'{TAB}{PREFIX_ELEM}{e}{NEW_LINE}' for e in item['elements']])
        result += NEW_LINE
        return result

    result = ''
    for item in struct:
        result = parse_item(item, result)
    return result.strip()


def generate_code_css(struct: list) -> str:
    def parse_item(item: dict, result: str):
        block_name = item['name']
        result += f"{SELECTOR_CLASS}{block_name} {BRACES}{NEW_LINE}"
        if 'modifiers' in item:
            result += ''.join([f'{SELECTOR_CLASS}{block_name}{PREFIX_MOD}{m} {BRACES}{NEW_LINE}' for m in item['modifiers']])
        if 'elements' in item:
            result += ''.join([f'{SELECTOR_CLASS}{block_name}{PREFIX_ELEM}{e} {BRACES}{NEW_LINE}' for e in item['elements']])
        result += NEW_LINE
        return result

    result = ''
    for item in struct:
        result = parse_item(item, result)
    return result.strip()


def generate_code_scss(struct: list) -> str:
    def parse_item(item: dict, result: str):
        result += f"{SELECTOR_CLASS}{item['name']} {BRACE_OPEN}{NEW_LINE}"
        if 'modifiers' in item:
            result += ''.join([f'{TAB}&{PREFIX_MOD}{m} {BRACES}{NEW_LINE}' for m in item['modifiers']])
        if 'elements' in item:
            result += ''.join([f'{TAB}&{PREFIX_ELEM}{e} {BRACES}{NEW_LINE}' for e in item['elements']])
        result += f'{BRACE_CLOSE}{NEW_LINE}{NEW_LINE}'
        return result

    result = ''
    for item in struct:
        result = parse_item(item, result)
    return result.strip()


def generate_content(schema: str, css: str, scss: str) -> str:
    return f"""
# CSS styles

## Specification

```text
{schema}
```

## CSS styles (empty)

```css
{css}
```

## SCSS styles (empty)

```scss
{scss}
```
"""


def write_result(file_path: Path, content: str) -> None:
    with open(file_path.resolve(), 'w') as result_fd:
        result_fd.write(content.lstrip())

main()
