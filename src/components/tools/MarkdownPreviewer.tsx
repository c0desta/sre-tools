import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownPreviewer: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('# Hello, Markdown!\n\nThis is a live previewer.\n\n- Type on the left\n- See the result on the right\n\n```javascript\nconsole.log("Syntax highlighting!");\n```');

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Markdown Editor */}
      <div className="md:w-1/2 h-1/2 md:h-auto flex flex-col">
        <div className="bg-gray-200 dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 font-semibold">Editor</div>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="w-full h-full p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 focus:outline-none resize-none font-mono"
          placeholder="Type your markdown here..."
        />
      </div>

      {/* HTML Preview */}
      <div className="md:w-1/2 h-1/2 md:h-auto flex flex-col">
        <div className="bg-gray-200 dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 font-semibold">Preview</div>
                <div className="p-4 overflow-auto bg-white dark:bg-gray-900 prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreviewer;
