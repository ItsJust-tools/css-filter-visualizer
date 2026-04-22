import { Suspense } from 'react';
import { JsonLd } from './json-ld';
import toolConfig from '@/tool/tool.config';
import ToolClient from './tool-client';

function LoadingFallback() {
  return (
    <div className="tool-shell" aria-busy="true" aria-label="Loading">
      <div className="toolbar-skeleton" />
      <div className="canvas-skeleton">
        <div className="skeleton-pulse" />
      </div>
      <div className="statusbar-skeleton" />
    </div>
  );
}

export default function ToolPage() {
  return (
    <>
      <JsonLd config={toolConfig} />
      <Suspense fallback={<LoadingFallback />}>
        <ToolClient />
      </Suspense>
    </>
  );
}