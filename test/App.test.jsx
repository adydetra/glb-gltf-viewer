import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock Viewer component for App tests
vi.mock('../src/components/Viewer', () => ({
  default: ({ modelUrl }) => <div data-testid="mock-viewer" data-model-url={modelUrl} />,
}));

describe('App Component Workflow & Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header, upload buttons, and placeholder on initial mount', () => {
    render(<App />);

    expect(screen.getByText('GLB/GLTF Viewer')).toBeInTheDocument();
    expect(screen.getByText('Upload GLB')).toBeInTheDocument();
    expect(screen.getByText('Upload GLTF Folder')).toBeInTheDocument();
    expect(screen.getByText('Upload GLTF (.zip)')).toBeInTheDocument();
    expect(screen.getByText(/Drop \.glb \/ folder GLTF \/ \.zip here/i)).toBeInTheDocument();
  });

  it('displays the dynamic Jakarta copyright year', () => {
    render(<App />);
    const expectedYear = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    ).getFullYear();

    expect(screen.getByText(new RegExp(expectedYear.toString()))).toBeInTheDocument();
  });

  it('handles drag enter, drag over, and drag leave states on drag container', () => {
    const { container } = render(<App />);
    const appContainer = container.querySelector('.app-container');

    const placeholder = container.querySelector('.placeholder');
    expect(placeholder).not.toHaveClass('drag-active');

    // Drag enter with Files
    fireEvent.dragEnter(appContainer, {
      dataTransfer: { types: ['Files'] },
    });
    expect(container.querySelector('.placeholder')).toHaveClass('drag-active');

    // Drag over
    fireEvent.dragOver(appContainer, {
      dataTransfer: { types: ['Files'], dropEffect: 'none' },
    });

    // Drag leave
    fireEvent.dragLeave(appContainer);
    expect(container.querySelector('.placeholder')).not.toHaveClass('drag-active');
  });

  it('handles GLB upload, displays file badge in header, and reveals Reset button', async () => {
    render(<App />);

    const glbInput = document.getElementById('glb-upload');
    const mockFile = new File(['mock binary content'], 'cyber_car.glb', {
      type: 'model/gltf-binary',
    });

    fireEvent.change(glbInput, {
      target: { files: [mockFile] },
    });

    // Model name badge should show in header
    await waitFor(() => {
      expect(screen.getByText('cyber_car.glb')).toBeInTheDocument();
    });

    // Viewer should be rendered
    expect(screen.getByTestId('mock-viewer')).toBeInTheDocument();

    // Reset button should appear
    const resetBtn = screen.getByRole('button', { name: 'Reset' });
    expect(resetBtn).toBeInTheDocument();

    // Clicking Reset restores the placeholder
    fireEvent.click(resetBtn);
    expect(screen.queryByTestId('mock-viewer')).not.toBeInTheDocument();
    expect(screen.queryByText('cyber_car.glb')).not.toBeInTheDocument();
    expect(screen.getByText(/Drop \.glb \/ folder GLTF \/ \.zip here/i)).toBeInTheDocument();
  });
});
