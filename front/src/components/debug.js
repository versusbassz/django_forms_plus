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
