function FloatingActions({ onScreenshot, onToggleControls }) {
  return (
    <div className="floating-controls">
      <button className="screenshot-btn" onClick={onScreenshot} title="Take Screenshot (Save Image)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>

      <button className="controls-toggle" onClick={onToggleControls} title="Toggle Controls">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
        </svg>
      </button>
    </div>
  );
}

export default FloatingActions;
