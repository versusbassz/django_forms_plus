from abc import ABC, abstractmethod


__all__ = [
    'LayoutItem',
    'ExternalHtml',
]


class LayoutItem(ABC):
    @abstractmethod
    def to_spec(self) -> dict:
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
