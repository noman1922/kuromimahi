import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { LoadingMessage } from '../LoadingMessage';

describe('LoadingMessage', () => {
  it('renders the exact global loading phrase "dhorjo dhoro baba"', () => {
    const html = renderToString(React.createElement(LoadingMessage));
    expect(html.toLowerCase()).toContain('dhorjo dhoro baba');
  });

  it('renders inline mode with the exact phrase', () => {
    const html = renderToString(React.createElement(LoadingMessage, { inline: true }));
    expect(html.toLowerCase()).toContain('dhorjo dhoro baba');
  });

  it('renders with optional subtitle', () => {
    const html = renderToString(
      React.createElement(LoadingMessage, { subtitle: 'Calibrating Midnight Screen...' })
    );
    expect(html.toLowerCase()).toContain('dhorjo dhoro baba');
    expect(html).toContain('Calibrating Midnight Screen...');
  });
});

