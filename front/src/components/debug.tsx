import React, { useState } from "react"

export function DebugPanel({spec}) {
  const [opened, setOpened] = useState(false)
  const OpenButton = () => <button type="button" onClick={() => setOpened(! opened)}>open/close</button>;
  return (
    <div className="dfp-debug-panel" style={{margin: '20px 0 40px 0'}}>
      <div className="dfp-debug-panel__header">
        Debug - <OpenButton />
      </div>
      {opened && (
        <div className="dfp-debug-panel__content">
          <pre style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>{JSON.stringify(spec, null, 4)}</pre>
        </div>
      )}
      {opened && <OpenButton />}
    </div>
  );
}

/**
 *
 * @param {string} name
 * @param {*} value
 */
export function dumpVar(name, value) {
  const specialClasses = [
    HTMLElement,
  ];
  let special_value = false;

  for (let cls of specialClasses) {
    if (value instanceof cls) {
      special_value = true;
      break;
    }
  }

  if (special_value) {
    console.log(`[${name}]`, typeof value, '###');
    console.dir(value);
  } else {
    console.log(`[${name}]`, typeof value, '#', value);
  }
}
