import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportExport } from '../../src/components/import-export/import-export';

describe('ImportExport', () => {
  it('renders import and export buttons', () => {
    render(<ImportExport formats={['json', 'png']} onExport={vi.fn()} onImport={vi.fn()} />);

    expect(screen.getByLabelText('Import')).toBeInTheDocument();
    expect(screen.getByLabelText('Export')).toBeInTheDocument();
  });

  it('opens export dropdown on click', () => {
    render(<ImportExport formats={['json', 'png']} onExport={vi.fn()} onImport={vi.fn()} />);

    const exportBtn = screen.getByLabelText('Export');
    fireEvent.click(exportBtn);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('JSON Data')).toBeInTheDocument();
    expect(screen.getByText('PNG Image')).toBeInTheDocument();
  });

  it('calls onExport when format selected', () => {
    const onExport = vi.fn();
    render(<ImportExport formats={['json']} onExport={onExport} onImport={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Export'));
    fireEvent.click(screen.getByText('JSON Data'));

    expect(onExport).toHaveBeenCalledWith('json');
  });

  it('calls onImport when file selected', () => {
    const onImport = vi.fn();
    render(<ImportExport formats={['json']} onExport={vi.fn()} onImport={onImport} />);

    const file = new File(['{"test":true}'], 'data.json', { type: 'application/json' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(onImport).toHaveBeenCalledWith(file);
  });

  it('disables buttons when importing or exporting', () => {
    render(
      <ImportExport
        formats={['json']}
        onExport={vi.fn()}
        onImport={vi.fn()}
        isImporting
        isExporting
      />
    );

    expect(screen.getByLabelText('Import')).toBeDisabled();
    expect(screen.getByLabelText('Export')).toBeDisabled();
  });

  it('closes dropdown on outside click', () => {
    render(<ImportExport formats={['json']} onExport={vi.fn()} onImport={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Export'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
