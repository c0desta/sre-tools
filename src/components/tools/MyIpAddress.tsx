import React, { useState, useEffect } from 'react';
import { FiCopy } from '../icons';


const MyIpAddress: React.FC = () => {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
          throw new Error('Failed to fetch IP address');
        }
        const data = await response.json();
        setIp(data.ip);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIp();
  }, []);

  const handleCopy = () => {
    if (ip) {
      navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Your Public IP Address</h1>
        {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {ip && (
          <div className="flex items-center justify-center space-x-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-2xl font-mono text-gray-900 dark:text-gray-200">{ip}</p>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {copied ? 'Copied!' : <FiCopy />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIpAddress;
