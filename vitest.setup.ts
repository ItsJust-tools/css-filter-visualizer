import '@testing-library/jest-dom/vitest';

if (!Blob.prototype.text) {
  Object.defineProperty(Blob.prototype, 'text', {
    value: function text(this: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(this);
      });
    },
    writable: true,
    configurable: true,
  });
}
