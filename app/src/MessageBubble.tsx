import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { CodeBlock } from './CodeBlock';
import { Message } from './types';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        {isUser ? (
          <p className="user-text">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeStr = String(children).replace(/\n$/, '');

                if (match || codeStr.includes('\n')) {
                  return <CodeBlock language={match?.[1]}>{codeStr}</CodeBlock>;
                }
                return <code className="inline-code">{children}</code>;
              },
              a({ href, children }) {
                return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
