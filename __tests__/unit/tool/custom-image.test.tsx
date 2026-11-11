import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readImageAsDataUrl, ToolCanvas } from '@/tool/components/tool-canvas';
import { cssFilterTool, initialState } from '@/tool/tool-definition';
import type { FilterState } from '@/tool/types';
import { render, screen, fireEvent } from '@testing-library/react';

function makeFile(name: string, type: string, size = 1000): File {
  const file = new File(['hello'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('custom image upload (issue #52)', () => {
  const validState: FilterState = {
    ...initialState,
    customImage: 'data:image/png;base64,abc123',
    customImageName: 'design.png',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readImageAsDataUrl', () => {
    it('resolves with a data URL for a supported type', async () => {
      const file = makeFile('photo.webp', 'image/webp');
      const result = await readImageAsDataUrl(file);
      expect(result).toMatch(/^data:image\/webp;base64,/);
    });

    it('rejects unsupported file types', async () => {
      const file = makeFile('doc.pdf', 'application/pdf');
      await expect(readImageAsDataUrl(file)).rejects.toThrow(/Unsupported file type/);
    });

    it('rejects files larger than 5 MB', async () => {
      const file = makeFile('big.png', 'image/png', 6 * 1024 * 1024);
      await expect(readImageAsDataUrl(file)).rejects.toThrow(/too large/i);
    });

    it('rejects files with no MIME type', async () => {
      const file = makeFile('unknown', '');
      await expect(readImageAsDataUrl(file)).rejects.toThrow(/Unsupported file type/);
    });
  });

  describe('state schema', () => {
    it('accepts state with customImage fields', () => {
      const result = cssFilterTool.deserialize(validState);
      expect(result.success).toBe(true);
    });

    it('rejects non-string customImage during deserialize', () => {
      const result = cssFilterTool.deserialize({ ...initialState, customImage: 123 });
      expect(result.success).toBe(false);
    });

    it('rejects non-string customImageName during deserialize', () => {
      const result = cssFilterTool.deserialize({ ...initialState, customImageName: 42 });
      expect(result.success).toBe(false);
    });

    it('round-trips customImage through serialize/deserialize', () => {
      const serialized = JSON.parse(cssFilterTool.serialize(validState));
      const result = cssFilterTool.deserialize(serialized);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customImage).toBe(validState.customImage);
        expect(result.data.customImageName).toBe('design.png');
      }
    });
  });

  describe('ToolCanvas interactions', () => {
    it('renders upload button and hints when no image is set', () => {
      render(<ToolCanvas state={initialState} onCustomImageChange={vi.fn()} />);
      expect(screen.getByLabelText(/upload custom image/i)).toBeTruthy();
      expect(screen.getByText(/drag & drop/i)).toBeTruthy();
      expect(screen.queryByLabelText(/remove custom image/i)).toBeNull();
    });

    it('fires onCustomImageChange with picked file via file input', () => {
      const onCustomImageChange = vi.fn();
      render(<ToolCanvas state={initialState} onCustomImageChange={onCustomImageChange} />);
      const input = screen
        .getByLabelText(/upload custom image/i)
        .parentElement!.querySelector('input[type=file]') as HTMLInputElement;
      const file = makeFile('asset.jpg', 'image/jpeg');
      fireEvent.change(input, { target: { files: [file] } });
      // FileReader is async in jsdom; wait for the callback
      return vi.waitFor(() => {
        expect(onCustomImageChange).toHaveBeenCalledWith(
          expect.stringMatching(/^data:image\/jpeg;base64,/),
          'asset.jpg'
        );
      });
    });

    it('shows remove button and file name when an image is set', () => {
      render(<ToolCanvas state={validState} onCustomImageChange={vi.fn()} />);
      expect(screen.getByLabelText(/remove custom image/i)).toBeTruthy();
      expect(screen.getByLabelText(/design\.png/)).toBeTruthy();
    });

    it('calls onCustomImageChange(null) when remove is clicked', () => {
      const onCustomImageChange = vi.fn();
      render(<ToolCanvas state={validState} onCustomImageChange={onCustomImageChange} />);
      fireEvent.click(screen.getByLabelText(/remove custom image/i));
      expect(onCustomImageChange).toHaveBeenCalledWith(null);
    });

    it('applies filter CSS to the custom image preview', () => {
      const state: FilterState = {
        ...validState,
        steps: [{ id: '1', type: 'blur', value: 5, enabled: true }],
      };
      const { container } = render(<ToolCanvas state={state} />);
      const box = container.querySelector('.filter-preview-box') as HTMLElement;
      expect(box.style.filter).toContain('blur(5px)');
      expect(box.style.backgroundImage).toContain('data:image/png');
    });

    it('handles drag-and-drop of an image file', () => {
      const onCustomImageChange = vi.fn();
      const { container } = render(
        <ToolCanvas state={initialState} onCustomImageChange={onCustomImageChange} />
      );
      const zone = container.querySelector('.filter-image-zone') as HTMLElement;
      const file = makeFile('dropped.webp', 'image/webp');
      fireEvent.drop(zone, { dataTransfer: { files: [file] } });
      return vi.waitFor(() => {
        expect(onCustomImageChange).toHaveBeenCalledWith(
          expect.stringMatching(/^data:image\/webp;base64,/),
          'dropped.webp'
        );
      });
    });
  });
});
