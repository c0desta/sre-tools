import React, { useState } from 'react';


interface AwsIpRange {
  ip_prefix?: string;
  region: string;
  service: string;
}

const AwsIpLookup: React.FC = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AwsIpRange | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkIpInAwsRanges = async (ip: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, fetch the latest AWS IP ranges
      const response = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
      if (!response.ok) {
        throw new Error('Failed to fetch AWS IP ranges');
      }
      
      const data = await response.json();
      
      // Check if the IP is in any of the prefixes
      for (const prefix of [...data.prefixes, ...data.ipv6_prefixes]) {
        const ipPrefix = prefix.ip_prefix || prefix.ipv6_prefix;
        if (isIpInRange(ip, ipPrefix)) {
          return {
            ip_prefix: ipPrefix,
            region: prefix.region,
            service: prefix.service
          };
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error checking IP:', err);
      throw new Error('Failed to check IP against AWS ranges');
    } finally {
      setIsLoading(false);
    }
  };

  const isIpInRange = (ip: string, cidr: string): boolean => {
    try {
      const [range, bits = '32'] = cidr.split('/');
      const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);
      
      const ipToInt = (ip: string): number => {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
      };
      
      const ipInt = ipToInt(ip);
      const rangeInt = ipToInt(range);
      
      return (ipInt & mask) === (rangeInt & mask);
    } catch (err) {
      console.error('Error in IP range check:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic IP validation
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      setError('Please enter a valid IPv4 address');
      return;
    }
    
    try {
      const match = await checkIpInAwsRanges(ipAddress);
      setResult(match);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResult(null);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">AWS IP Lookup</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed">
          Check if an IP address belongs to the AWS cloud and find its region and service.
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter IP Address (e.g., 52.95.110.1)"
              className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-gray-800 disabled:bg-indigo-400 dark:disabled:bg-indigo-500 disabled:cursor-not-allowed transition" disabled={isLoading}>
              {isLoading ? 'Checking...' : 'Lookup IP'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 dark:bg-red-800/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {result !== null && (
          <div className="mt-8">
            {result ? (
              <div className="bg-green-100 dark:bg-green-800/30 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 px-4 py-5 rounded-lg">
                <h3 className="text-xl font-bold mb-3">IP Found in AWS Ranges</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><strong>IP Prefix:</strong> <span className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">{result.ip_prefix}</span></div>
                  <div><strong>Region:</strong> {result.region}</div>
                  <div><strong>Service:</strong> {result.service}</div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-100 dark:bg-blue-800/30 border border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 px-4 py-5 rounded-lg">
                <h3 className="text-xl font-bold mb-2">IP Not Found in AWS Ranges</h3>
                <p>The IP address is not currently listed in the AWS IP ranges.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AwsIpLookup;
