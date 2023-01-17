def get_global_error_messages() -> dict:
    return {
        'required': 'i18n-global: Required field.',
    }


def get_error_message(name: str, error_name: str, meta, global_messages: dict) -> str:
    error_value = f'error_code: {error_name}'

    # search in DfpMeta.error_messages -> name
    # TODO use native Form.Meta.errors_messages and remove the custom helper attribute
    if hasattr(meta, 'error_messages') \
            and name in meta.error_messages \
            and error_name in meta.error_messages[name]:
        error_value = meta.error_messages[name][error_name]

    # search in DfpMeta.globel_error_messages -> error_name
    elif hasattr(meta, 'global_error_messages') \
            and error_name in meta.global_error_messages:
        error_value = meta.global_error_messages[error_name]

    # search in global messages (defaults)
    elif error_name in global_messages:
        error_value = global_messages[error_name]

    return error_value
