from __future__ import annotations
from abc import ABC, abstractmethod

from .types import LayoutItemSpec


__all__ = [
    'LayoutItem',
    'ExternalHtml',
]


class LayoutItem(ABC):
    @abstractmethod
    def to_spec(self) -> LayoutItemSpec:
        ...


class ExternalHtml(LayoutItem):
    TYPE = 'external_html'

    def __init__(self, selector: str) -> None:
        self.selector = selector

    def to_spec(self) -> LayoutItemSpec:
        return {
            'type': self.TYPE,
            'selector': self.selector,
        }
