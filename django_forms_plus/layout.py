from abc import ABC


__all__ = [
    'LayoutItem',
    'ExternalHtml',
]


class LayoutItem(ABC):
    pass


class ExternalHtml(LayoutItem):
    TYPE = 'external_html'

    def __init__(self, selector: str) -> None:
        self.selector = selector

    def to_spec(self):
        return {
            'type': self.TYPE,
            'selector': self.selector,
        }
