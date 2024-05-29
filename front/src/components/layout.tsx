import { useState, useEffect, JSX } from "react";

import { LayoutItemSpec } from "../types";

export function ExternalHtml({ itemSpec }: {itemSpec: LayoutItemSpec}): JSX.Element | null {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const dom_node = document.querySelector(itemSpec.selector);
    if (! dom_node) {
      console.warn(`External block not found: ${itemSpec.selector}`)
      return;
    }
    const newContent = dom_node.innerHTML;
    setContent(newContent);
  }, [])

  if (! content) {
    return null;
  }
  return (
    <div className="dfp-fieldslot">
      <div dangerouslySetInnerHTML={{__html: content}} />
    </div>
  );
}
