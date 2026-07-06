import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{language || 'code'}</span>
        <button className="copy-btn" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre><code>{children}</code></pre>
    </div>
  );
}
