import React, { useState, useMemo } from 'react';

import { FaCopy } from 'react-icons/fa';

const BasicAuthHeaderGenerator: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const base64Credentials = useMemo(() => {
    if (!username && !password) {
      return '';
    }
    try {
      return btoa(`${username}:${password}`);
    } catch (e) {
      // Handle potential errors with characters that btoa can't encode
      return 'Invalid characters for Base64 encoding';
    }
  }, [username, password]);

  const authHeader = useMemo(() => {
    return base64Credentials ? `Authorization: Basic ${base64Credentials}` : '';
  }, [base64Credentials]);

    const handleCopy = async () => {
    if (authHeader) {
      try {
        await navigator.clipboard.writeText(authHeader);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Basic Auth Header Generator</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A simple utility to create the <code>Authorization: Basic &lt;credentials&gt;</code> HTTP header from a username and password.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Enter password"
            />
          </div>
        </div>

        {authHeader && (
          <div className="mt-6">
            <label htmlFor="auth-header" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generated Header</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="auth-header"
                value={authHeader}
                readOnly
                className="block w-full pr-10 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md sm:text-sm text-gray-900 dark:text-white"
              />
                            <button 
                onClick={handleCopy}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                aria-label="Copy to clipboard"
              >
                <FaCopy />
              </button>
            </div>
            {copied && <p className="text-sm text-green-600 dark:text-green-400 mt-2">Copied to clipboard!</p>}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <span className="font-bold">Note:</span> Basic Authentication is not secure. It sends credentials in a way that is easily reversible. Always use it over a secure connection (HTTPS).
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicAuthHeaderGenerator;
