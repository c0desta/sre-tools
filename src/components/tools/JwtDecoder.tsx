import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import '../../styles/prism-themes.css';

const JwtDecoder: React.FC = () => {
  const [encodedToken, setEncodedToken] = useState('');
  const [header, setHeader] = useState<object | null>(null);
  const [payload, setPayload] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (encodedToken.trim() === '') {
      setHeader(null);
      setPayload(null);
      setError(null);
      return;
    }

    try {
      const decodedHeader = jwtDecode(encodedToken, { header: true });
      const decodedPayload = jwtDecode(encodedToken);
      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setError(null);
    } catch (e: any) {
      setHeader(null);
      setPayload(null);
      setError('Invalid JWT: ' + e.message);
    }
  }, [encodedToken]);

  const highlightJson = (jsonString: string) => {
    if (!jsonString) return '';
    return Prism.highlight(jsonString, Prism.languages.json, 'json');
  };

  const renderDecodedCard = (title: string, data: object | null) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{title}</h2>
      <div className="rounded-md overflow-hidden">
        <Editor
          value={data ? JSON.stringify(data, null, 2) : ''}
          onValueChange={() => {}}
          highlight={highlightJson}
          padding={10}
          readOnly
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
          }}
          className="min-h-[150px]"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">JWT Decoder</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Encoded Token</h2>
          <textarea
            value={encodedToken}
            onChange={(e) => setEncodedToken(e.target.value)}
            placeholder="Paste your JWT here"
            className="w-full h-full min-h-[300px] p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            style={{ resize: 'none' }}
          />
        </div>
        <div className="space-y-8">
          {renderDecodedCard('Header', header)}
          {renderDecodedCard('Payload', payload)}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-lg shadow-lg" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JwtDecoder;
