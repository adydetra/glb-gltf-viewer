function ScreenshotToast({ message }) {
  if (!message) return null;

  return (
    <div className="screenshot-toast" role="status">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export default ScreenshotToast;
