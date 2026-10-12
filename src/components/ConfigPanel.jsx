function ConfigPanel({
  isOpen,
  onClose,
  color,
  setColor,
  useCustomColor,
  setUseCustomColor,
  scale,
  setScale,
  showGrid,
  setShowGrid,
  showTransform,
  setShowTransform,
  showGizmo,
  setShowGizmo,
  ambientIntensity,
  setAmbientIntensity,
  directionalIntensity,
  setDirectionalIntensity,
  bgColor,
  setBgColor,
  onReset,
}) {
  if (!isOpen) return null;

  return (
    <div className="config-panel">
      <div className="config-header">
        <h3>Configuration</h3>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close configuration">
          ×
        </button>
      </div>

      <div className="config-group">
        <label>
          <span>Model Color</span>
        </label>
        <label className={`color-label-container ${!useCustomColor ? 'muted' : ''}`}>
          <div className="color-input-wrapper">
            <div className="color-preview">
              <div className="color-preview-inner" style={{ backgroundColor: useCustomColor ? color : '#ffffff' }}></div>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setUseCustomColor(true);
                }}
                className="color-input"
                aria-label="Choose custom tint"
              />
            </div>
            <div className="color-info">
              <span className="color-value">{useCustomColor ? color.toUpperCase() : 'ORIGINAL'}</span>
              <span className="color-label">{useCustomColor ? 'HEX TINT COLOR' : 'ASSET COLOR PRESERVED'}</span>
            </div>
          </div>
        </label>
        {useCustomColor && (
          <button
            type="button"
            className="revert-color-btn"
            onClick={() => setUseCustomColor(false)}
          >
            Revert to Original Color
          </button>
        )}
      </div>

      <div className="config-group">
        <label>
          <span>Scale</span>
          <div className="scale-controls">
            <input
              type="range"
              min="0.1"
              max="30"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="scale-slider"
              aria-label="Scale Slider"
            />
            <span className="scale-value">{scale.toFixed(1)}x</span>
          </div>
        </label>
      </div>

      <div className="config-group">
        <label className="toggle-label">
          <span>Show Grid</span>
          <button className={`toggle-switch ${showGrid ? 'active' : ''}`} onClick={() => setShowGrid(!showGrid)} aria-label="Toggle Grid">
            <span className="toggle-slider"></span>
          </button>
        </label>
      </div>

      <div className="config-group">
        <label className="toggle-label">
          <span>Transform Controls</span>
          <button className={`toggle-switch ${showTransform ? 'active' : ''}`} onClick={() => setShowTransform(!showTransform)} aria-label="Toggle Transform Controls">
            <span className="toggle-slider"></span>
          </button>
        </label>
      </div>

      <div className="config-group">
        <label className="toggle-label">
          <span>Gizmo</span>
          <button className={`toggle-switch ${showGizmo ? 'active' : ''}`} onClick={() => setShowGizmo(!showGizmo)} aria-label="Toggle Gizmo">
            <span className="toggle-slider"></span>
          </button>
        </label>
      </div>

      <div className="config-divider"></div>

      <div className="config-group">
        <label>
          <span>Ambient Light</span>
          <div className="scale-controls">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={ambientIntensity}
              onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
              className="scale-slider"
              aria-label="Ambient Light Slider"
            />
            <span className="scale-value">{ambientIntensity.toFixed(1)}</span>
          </div>
        </label>
      </div>

      <div className="config-group">
        <label>
          <span>Directional Light</span>
          <div className="scale-controls">
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={directionalIntensity}
              onChange={(e) => setDirectionalIntensity(parseFloat(e.target.value))}
              className="scale-slider"
              aria-label="Directional Light Slider"
            />
            <span className="scale-value">{directionalIntensity.toFixed(1)}</span>
          </div>
        </label>
      </div>

      <div className="config-group">
        <label>
          <span>Background Color</span>
          <div className="color-input-wrapper">
            <div className="color-preview">
              <div className="color-preview-inner" style={{ backgroundColor: bgColor }}></div>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="color-input" />
            </div>
            <div className="color-info">
              <span className="color-value">{bgColor}</span>
              <span className="color-label">BACKGROUND</span>
            </div>
          </div>
        </label>
      </div>

      <div className="config-actions">
        <button
          className="preset-btn"
          onClick={onReset}
        >
          Reset Configuration
        </button>
      </div>
    </div>
  );
}

export default ConfigPanel;
