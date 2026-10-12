import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Viewer from '../src/components/Viewer';

// Mock R3F Canvas and Drei to test Viewer UI & interaction logic in jsdom
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, gl }) => (
    <div data-testid="r3f-canvas" data-preserve-drawing-buffer={gl?.preserveDrawingBuffer}>
      <canvas data-testid="mock-three-canvas" />
      {children}
    </div>
  ),
  useFrame: vi.fn(),
  useLoader: vi.fn(() => ({
    scene: { clone: () => ({}) },
  })),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  Center: ({ children }) => <div data-testid="center">{children}</div>,
  TransformControls: ({ object }) => <div data-testid="transform-controls" data-has-object={Boolean(object)} />,
  Grid: () => <div data-testid="grid" />,
  GizmoHelper: ({ children }) => <div data-testid="gizmo-helper">{children}</div>,
  GizmoViewport: () => <div data-testid="gizmo-viewport" />,
  useProgress: () => ({ active: false, progress: 100 }),
}));

describe('Viewer Component UI & Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders canvas with preserveDrawingBuffer enabled for screenshot capture', () => {
    render(<Viewer modelUrl="blob:mock-model" fileMap={null} />);
    const canvasWrapper = screen.getByTestId('r3f-canvas');
    expect(canvasWrapper).toBeInTheDocument();
    expect(canvasWrapper).toHaveAttribute('data-preserve-drawing-buffer', 'true');
  });

  it('opens and closes the configuration panel when toggled', () => {
    render(<Viewer modelUrl="blob:mock-model" fileMap={null} />);

    // Initially configuration panel is closed
    expect(screen.queryByText('Configuration')).not.toBeInTheDocument();

    // Click toggle button
    const toggleBtn = screen.getByTitle('Toggle Controls');
    fireEvent.click(toggleBtn);

    // Panel should now be open
    expect(screen.getByText('Configuration')).toBeInTheDocument();

    // Click close button
    const closeBtn = screen.getByRole('button', { name: 'Close configuration' });
    fireEvent.click(closeBtn);

    // Panel should be closed
    expect(screen.queryByText('Configuration')).not.toBeInTheDocument();
  });

  it('manages Original Asset Color vs Custom Tint properly', () => {
    render(<Viewer modelUrl="blob:mock-model" fileMap={null} />);

    // Open configuration
    fireEvent.click(screen.getByTitle('Toggle Controls'));

    // By default, it preserves original asset color
    expect(screen.getByText('ASSET COLOR PRESERVED')).toBeInTheDocument();

    // User chooses a custom color
    const colorInput = screen.getByLabelText('Choose custom tint');
    fireEvent.change(colorInput, { target: { value: '#ff5500' } });

    // Mode switches to Custom Tint
    expect(screen.getByText('HEX TINT COLOR')).toBeInTheDocument();
    expect(screen.getByText('#FF5500')).toBeInTheDocument();

    // User clicks Revert to Original Color
    const revertBtn = screen.getByRole('button', { name: 'Revert to Original Color' });
    fireEvent.click(revertBtn);

    // Color mode is restored back to original asset
    expect(screen.getByText('ASSET COLOR PRESERVED')).toBeInTheDocument();
  });

  it('takes screenshot and triggers save download with toast notification', async () => {
    render(<Viewer modelUrl="blob:mock-model" fileMap={null} />);

    const screenshotBtn = screen.getByTitle('Take Screenshot (Save Image)');
    fireEvent.click(screenshotBtn);

    // Toast notification should display to confirm save worked
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Screenshot saved/i);
    });
  });

  it('resets configuration back to defaults when reset button is clicked', () => {
    render(<Viewer modelUrl="blob:mock-model" fileMap={null} />);

    // Open config
    fireEvent.click(screen.getByTitle('Toggle Controls'));

    // Change scale slider
    const scaleSlider = screen.getByRole('slider', { name: 'Scale Slider' });
    fireEvent.change(scaleSlider, { target: { value: '5' } });
    expect(screen.getByText('5.0x')).toBeInTheDocument();

    // Click Reset Configuration
    const resetConfigBtn = screen.getByRole('button', { name: 'Reset Configuration' });
    fireEvent.click(resetConfigBtn);

    // Scale should reset to 1.0x and color mode should be original asset
    expect(screen.getByText('1.0x')).toBeInTheDocument();
    expect(screen.getByText('ASSET COLOR PRESERVED')).toBeInTheDocument();
  });
});
