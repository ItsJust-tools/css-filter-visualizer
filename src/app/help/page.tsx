import type { Metadata } from 'next';
import Link from 'next/link';
import toolConfig from '@/tool/tool.config';

export const metadata: Metadata = {
  title: `${toolConfig.name} Help`,
  description: `How to use ${toolConfig.name}: editing, import, export, and share.`,
};

export default function HelpPage() {
  return (
    <main id="main-content" className="help-page" aria-labelledby="help-title">
      <nav className="help-top-nav" aria-label="Help navigation">
        <Link href="/" className="error-btn-secondary">
          ← Back to Tool
        </Link>
      </nav>

      <section className="help-hero help-hero-grid">
        <div>
          <p className="help-eyebrow">Usage Guide</p>
          <h1 id="help-title">{toolConfig.name} Help</h1>
          <p>
            Learn the full workflow in one place: editing, shortcuts, import, export, reset, and URL
            sharing. Everything runs locally in your browser.
          </p>
        </div>
        <div className="help-hero-panel" role="img" aria-label="Main workflow overview">
          <svg viewBox="0 0 460 210" className="help-svg" aria-hidden="true">
            <rect
              x="12"
              y="12"
              width="436"
              height="186"
              rx="14"
              fill="var(--background)"
              stroke="var(--border)"
            />
            <rect
              x="28"
              y="32"
              width="120"
              height="42"
              rx="8"
              fill="var(--accent-subtle)"
              stroke="var(--accent)"
            />
            <text x="88" y="58" textAnchor="middle" fontSize="13" fill="currentColor">
              Edit
            </text>
            <path d="M150 53h44" stroke="var(--accent)" strokeWidth="2.2" />
            <path d="M194 53l-8 -6v12z" fill="var(--accent)" />
            <rect
              x="204"
              y="32"
              width="120"
              height="42"
              rx="8"
              fill="var(--background)"
              stroke="var(--border)"
            />
            <text x="264" y="58" textAnchor="middle" fontSize="13" fill="currentColor">
              Export
            </text>
            <path d="M326 53h44" stroke="var(--accent)" strokeWidth="2.2" />
            <path d="M370 53l-8 -6v12z" fill="var(--accent)" />
            <rect
              x="380"
              y="32"
              width="54"
              height="42"
              rx="8"
              fill="var(--background)"
              stroke="var(--border)"
            />
            <text x="407" y="58" textAnchor="middle" fontSize="13" fill="currentColor">
              Share
            </text>
            <rect
              x="28"
              y="100"
              width="406"
              height="74"
              rx="10"
              fill="var(--card)"
              stroke="var(--border)"
            />
            <text x="231" y="128" textAnchor="middle" fontSize="13" fill="currentColor">
              Import / Export / Share URL in top bar
            </text>
            <text x="231" y="150" textAnchor="middle" fontSize="13" fill="currentColor">
              Undo/Redo includes reset recovery
            </text>
          </svg>
        </div>
      </section>

      <section className="help-section" aria-labelledby="quick-start">
        <h2 id="quick-start">Quick Start</h2>
        <ol className="help-list help-numbered">
          <li>Open the tool and click the name in the toolbar to rename your project.</li>
          <li>Use the sidebar to adjust options and build your content.</li>
          <li>Use the top actions for Import, Export, and Share URL.</li>
          <li>Use Undo/Redo anytime, including after a reset.</li>
        </ol>
      </section>

      <section className="help-section" aria-labelledby="toolbar-map">
        <h2 id="toolbar-map">Toolbar Map</h2>
        <div className="help-graphic-card" role="img" aria-label="Toolbar map with action groups">
          <svg viewBox="0 0 860 130" className="help-svg" aria-hidden="true">
            <rect
              x="8"
              y="8"
              width="844"
              height="114"
              rx="12"
              fill="var(--card)"
              stroke="var(--border)"
            />
            <rect
              x="26"
              y="34"
              width="130"
              height="58"
              rx="8"
              fill="var(--accent-subtle)"
              stroke="var(--accent)"
            />
            <text x="91" y="68" textAnchor="middle" fontSize="14" fill="currentColor">
              Tool Name
            </text>
            <rect
              x="180"
              y="34"
              width="190"
              height="58"
              rx="8"
              fill="var(--muted-bg)"
              stroke="var(--border)"
            />
            <text x="275" y="68" textAnchor="middle" fontSize="14" fill="currentColor">
              Undo / Redo / Reset
            </text>
            <rect
              x="392"
              y="34"
              width="240"
              height="58"
              rx="8"
              fill="var(--muted-bg)"
              stroke="var(--border)"
            />
            <text x="512" y="68" textAnchor="middle" fontSize="14" fill="currentColor">
              Import / Export / Share
            </text>
            <rect
              x="654"
              y="34"
              width="178"
              height="58"
              rx="8"
              fill="var(--muted-bg)"
              stroke="var(--border)"
            />
            <text x="743" y="68" textAnchor="middle" fontSize="14" fill="currentColor">
              Theme / Contrast
            </text>
          </svg>
        </div>
      </section>

      <section className="help-section" aria-labelledby="share-flow">
        <h2 id="share-flow">Share URL Flow</h2>
        <div
          className="help-graphic-card"
          role="img"
          aria-label="Share URL process from state to sharable link"
        >
          <svg viewBox="0 0 860 170" className="help-svg" aria-hidden="true">
            <rect
              x="20"
              y="50"
              width="190"
              height="70"
              rx="10"
              fill="var(--card)"
              stroke="var(--border)"
            />
            <text x="115" y="90" textAnchor="middle" fontSize="14" fill="currentColor">
              Current State
            </text>
            <path d="M212 85h80" stroke="var(--accent)" strokeWidth="2.5" />
            <path d="M292 85l-10 -8v16z" fill="var(--accent)" />
            <rect
              x="302"
              y="50"
              width="250"
              height="70"
              rx="10"
              fill="var(--card)"
              stroke="var(--border)"
            />
            <text x="427" y="90" textAnchor="middle" fontSize="14" fill="currentColor">
              Compressed URL Parameter
            </text>
            <path d="M554 85h80" stroke="var(--accent)" strokeWidth="2.5" />
            <path d="M634 85l-10 -8v16z" fill="var(--accent)" />
            <rect
              x="644"
              y="50"
              width="196"
              height="70"
              rx="10"
              fill="var(--card)"
              stroke="var(--border)"
            />
            <text x="742" y="90" textAnchor="middle" fontSize="14" fill="currentColor">
              Shareable Link
            </text>
          </svg>
        </div>
        <ul className="help-list">
          <li>
            Click <strong>Share</strong> to generate a URL that includes your current state.
          </li>
          <li>The URL is copied to your clipboard (or opened via native share dialog).</li>
          <li>Anyone opening the URL loads the same state and can continue editing.</li>
        </ul>
      </section>

      <section className="help-section" aria-labelledby="examples-inline">
        <h2 id="examples-inline">Practical Examples</h2>
        <div className="help-example-grid">
          <article className="help-example-card">
            <h3>Continue Later</h3>
            <p>Edit your state, click Share, save the URL, and continue where you left off.</p>
          </article>
          <article className="help-example-card">
            <h3>Peer Review</h3>
            <p>Share the URL with a teammate so they can load the exact same state instantly.</p>
          </article>
          <article className="help-example-card">
            <h3>Safe Reset</h3>
            <p>Reset confirms first and can still be undone with Undo.</p>
          </article>
        </div>
      </section>

      <section className="help-section" aria-labelledby="examples">
        <h2 id="examples">Keyboard Shortcuts</h2>
        <p>
          Open the full shortcut list with <kbd>?</kbd> or the <strong>?</strong> button in the
          header.
        </p>
      </section>
    </main>
  );
}
