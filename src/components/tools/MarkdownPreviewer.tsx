import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import rehypeRaw from 'rehype-raw';

const MarkdownPreviewer: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('# Hello, Markdown!\n\nThis is a live previewer.\n\n- Type on the left\n- See the result on the right\n\n```javascript\nconsole.log("Syntax highlighting!");\n```');
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [pageBreakLines, setPageBreakLines] = useState<number[]>([]);

  // Debounce utility
  function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): void => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), waitFor);
    };
  }

  useEffect(() => {
    const calculateBreaks = () => {
      if (previewRef.current && previewContainerRef.current) {
        const pageHeightInPx = 970; // A4 height approximation in pixels, adjusted for accuracy
        const contentHeight = previewRef.current.offsetHeight;
        const numPages = Math.ceil(contentHeight / pageHeightInPx);
        const breaks = [];
        for (let i = 1; i < numPages; i++) {
          breaks.push(i * pageHeightInPx);
        }
        setPageBreakLines(breaks);
      }
    };

    const debouncedCalculate = debounce(calculateBreaks, 300);

    debouncedCalculate();

    window.addEventListener('resize', debouncedCalculate);

    const observer = new MutationObserver(debouncedCalculate);
    if (previewRef.current) {
      observer.observe(previewRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      window.removeEventListener('resize', debouncedCalculate);
      observer.disconnect();
    };
  }, [markdown]);

  const handleDownloadPdf = () => {
    const input = previewRef.current;
    if (input) {
      const pdf = new jsPDF('p', 'mm', 'a4');
      // Set background to white for the PDF
      const tempClone = input.cloneNode(true) as HTMLElement;
      tempClone.style.backgroundColor = 'white';

      // Remove page break indicators from the clone
      const pageBreaks = tempClone.querySelectorAll('.page-break-indicator');
      pageBreaks.forEach(pb => pb.remove());

      pdf.html(tempClone, {
        callback: function (pdf) {
          pdf.save('markdown-preview.pdf');
        },
        x: 10,
        y: 10,
        width: 190, // A4 width in mm minus margins
        windowWidth: input.offsetWidth,
        autoPaging: 'text',
      });
    }
  };

  const handlePrint = () => {
    if (previewRef.current) {
      const printWindow = window.open('', '', 'height=800,width=1000');
      if (printWindow) {
        const previewContent = previewRef.current.cloneNode(true) as HTMLDivElement;
        
        // Remove page break indicators from the clone
        const pageBreaks = previewContent.querySelectorAll('.page-break-indicator');
        pageBreaks.forEach(pb => pb.remove());

        const styles = `
          <style>
            body { font-family: sans-serif; }
            pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f6f8fa; padding: 16px; border-radius: 3px; }
            code { font-family: monospace; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            blockquote { color: #666; margin: 0; padding-left: 3em; border-left: 0.5em solid #eee; }
          </style>
        `;
        printWindow.document.write('<html><head><title>Print Preview</title>' + styles + '</head><body>');
        printWindow.document.body.appendChild(previewContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Markdown Editor */}
      <div className="md:w-1/2 h-1/2 md:h-auto flex flex-col print:hidden">
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
        <div className="bg-gray-200 dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 font-semibold flex justify-between items-center print:hidden">
          <span>Preview</span>
          <div>
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 text-xs"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
            >
              Download PDF
            </button>
          </div>
        </div>
        <div ref={previewContainerRef} className="relative flex-grow overflow-auto bg-white dark:bg-gray-900">
          <div ref={previewRef} className="p-4 prose dark:prose-invert max-w-none">
            {pageBreakLines.map((top, i) => (
              <div
                key={i}
                className="page-break-indicator absolute left-0 right-0 border-t-2 border-dashed border-red-500 print:hidden"
                style={{ top: `${top}px`, marginLeft: '1rem', marginRight: '1rem' }}
              >
                <span className="absolute -mt-3 bg-red-500 text-white text-xs p-1 rounded">Page {i + 2}</span>
              </div>
            ))}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
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
    </div>
  );
};

export default MarkdownPreviewer;
