import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
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
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">YAML & JSON Lint & Format</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="relative">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlightCode}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '400px',
              background: '#2d2d2d',
              color: '#f8f8f2',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div>
              <span className="font-semibold">YAML:</span>
              {isValidYaml === true && <span className="text-green-500 ml-2">✔ Valid</span>}
              {isValidYaml === false && <span className="text-red-500 ml-2">✖ Invalid</span>}
            </div>
            <div>
              <span className="font-semibold">JSON:</span>
              {isValidJson === true && <span className="text-green-500 ml-2">✔ Valid</span>}
              {isValidJson === false && <span className="text-red-500 ml-2">✖ Invalid</span>}
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={formatCode} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Format</button>
            <button onClick={copyCode} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Copy</button>
            <button onClick={clearCode} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Clear</button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default YamlJsonLintFormat;
