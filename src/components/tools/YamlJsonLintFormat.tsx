import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import '../../styles/prism-themes.css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import jsyaml from 'js-yaml';

const YamlJsonLintFormat: React.FC = () => {
  const [code, setCode] = useState('');
  const [isValidYaml, setIsValidYaml] = useState<boolean | null>(null);
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code.trim() === '') {
      setIsValidYaml(null);
      setIsValidJson(null);
      setError(null);
      return;
    }

    // Reset states
    let yamlError: string | null = null;
    let jsonError: string | null = null;
    let isYaml = false;
    let isJson = false;

    // YAML Validation
    try {
      jsyaml.load(code);
      isYaml = true;
    } catch (e: any) {
      yamlError = e.message;
    }

    // JSON Validation
    try {
      JSON.parse(code);
      isJson = true;
    } catch (e: any) {
      jsonError = e.message;
    }

    setIsValidYaml(isYaml);
    setIsValidJson(isJson);

    if (isJson) {
      setError(null);
    } else if (isYaml) {
      setError(null);
    } else if (yamlError && jsonError) {
      setError(`YAML Error: ${yamlError}\nJSON Error: ${jsonError}`);
    } else {
      setError(null);
    }

  }, [code]);

  const formatCode = () => {
    try {
      if (isValidJson) {
        const parsed = JSON.parse(code);
        setCode(JSON.stringify(parsed, null, 2));
      } else if (isValidYaml) {
        const parsed = jsyaml.load(code);
        setCode(jsyaml.dump(parsed, { indent: 2 }));
      }
    } catch (e: any) {
      setError(`Formatting Error: ${e.message}`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code).catch(err => setError(`Copy failed: ${err.message}`));
  };

  const clearCode = () => {
    setCode('');
  };

  const highlightCode = (code: string) => {
    let grammar = null;
    if (isValidJson) {
      grammar = Prism.languages.json;
    } else if (isValidYaml) {
      grammar = Prism.languages.yaml;
    }

    if (code && grammar) {
      return Prism.highlight(code, grammar, isValidJson ? 'json' : 'yaml');
    }
    return code;
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">YAML & JSON Lint & Format</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="relative">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlightCode}
            padding={10}
            className="font-mono text-sm rounded-md min-h-[400px] focus-within:ring-2 focus-within:ring-indigo-500 editor-styles"
            style={{ outline: 'none' }}
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4 order-last sm:order-first">
            <div className="flex items-center space-x-2">
              <span className="font-semibold dark:text-gray-300">YAML:</span>
              {isValidYaml === null ? <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">...</span> :
               isValidYaml ? <span className="px-3 py-1 text-sm rounded-full bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200">✔ Valid</span> :
                             <span className="px-3 py-1 text-sm rounded-full bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-200">✖ Invalid</span>}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold dark:text-gray-300">JSON:</span>
              {isValidJson === null ? <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">...</span> :
               isValidJson ? <span className="px-3 py-1 text-sm rounded-full bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200">✔ Valid</span> :
                             <span className="px-3 py-1 text-sm rounded-full bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-200">✖ Invalid</span>}
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={formatCode} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-gray-800">Format</button>
            <button onClick={copyCode} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:ring-offset-gray-800">Copy</button>
            <button onClick={clearCode} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:ring-offset-gray-800">Clear</button>
          </div>
        </div>
        {error && (
          <pre className="mt-2 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{error}</pre>
        )}
      </div>
    </div>
  );
};

export default YamlJsonLintFormat;
