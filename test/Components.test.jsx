import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigPanel from '../src/components/ConfigPanel';
import FloatingActions from '../src/components/FloatingActions';
import ScreenshotToast from '../src/components/ScreenshotToast';
import CanvasLoader from '../src/components/CanvasLoader';

vi.mock('@react-three/drei', () => ({
  useProgress: () => ({ active: true, progress: 65 }),
}));

describe('Modular UI Components', () => {
  it('renders ScreenshotToast when message is provided and hides when empty', () => {
    const { rerender } = render(<ScreenshotToast message="Saved!" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved!');

    rerender(<ScreenshotToast message="" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders FloatingActions and fires callback events', () => {
    const onScreenshot = vi.fn();
    const onToggleControls = vi.fn();

    render(<FloatingActions onScreenshot={onScreenshot} onToggleControls={onToggleControls} />);

    fireEvent.click(screen.getByTitle('Take Screenshot (Save Image)'));
    expect(onScreenshot).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Toggle Controls'));
    expect(onToggleControls).toHaveBeenCalledTimes(1);
  });

  it('renders CanvasLoader with active progress percentage', () => {
    render(<CanvasLoader />);
    expect(screen.getByText('Loading 3D model... 65%')).toBeInTheDocument();
  });

  it('renders ConfigPanel and handles resets', () => {
    const onReset = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <ConfigPanel
        isOpen={false}
        onClose={onClose}
        color="#ffffff"
        setColor={vi.fn()}
        useCustomColor={false}
        setUseCustomColor={vi.fn()}
        scale={1}
        setScale={vi.fn()}
        showGrid={true}
        setShowGrid={vi.fn()}
        showTransform={true}
        setShowTransform={vi.fn()}
        showGizmo={true}
        setShowGizmo={vi.fn()}
        ambientIntensity={0.5}
        setAmbientIntensity={vi.fn()}
        directionalIntensity={1}
        setDirectionalIntensity={vi.fn()}
        bgColor="#1a1a1a"
        setBgColor={vi.fn()}
        onReset={onReset}
      />
    );

    expect(screen.queryByText('Configuration')).not.toBeInTheDocument();

    rerender(
      <ConfigPanel
        isOpen={true}
        onClose={onClose}
        color="#ffffff"
        setColor={vi.fn()}
        useCustomColor={false}
        setUseCustomColor={vi.fn()}
        scale={1}
        setScale={vi.fn()}
        showGrid={true}
        setShowGrid={vi.fn()}
        showTransform={true}
        setShowTransform={vi.fn()}
        showGizmo={true}
        setShowGizmo={vi.fn()}
        ambientIntensity={0.5}
        setAmbientIntensity={vi.fn()}
        directionalIntensity={1}
        setDirectionalIntensity={vi.fn()}
        bgColor="#1a1a1a"
        setBgColor={vi.fn()}
        onReset={onReset}
      />
    );

    expect(screen.getByText('Configuration')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reset Configuration'));
    expect(onReset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Close configuration' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
