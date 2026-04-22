import { generateJsonLd } from '@/lib/seo';
import type { ToolConfig } from '@itsjust/core';

export function JsonLd({ config }: { config: ToolConfig }) {
  const jsonLd = generateJsonLd(config);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}