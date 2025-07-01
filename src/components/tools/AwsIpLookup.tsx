import React, { useState } from 'react';
import './AwsIpLookup.css';

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
    <div className="aws-ip-lookup">
      <h2>AWS IP Lookup</h2>
      <p className="tool-description">
        Check if an IP address belongs to AWS and find its region and service.
      </p>
      
      <form onSubmit={handleSubmit} className="ip-form">
        <div className="form-group">
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="Enter IP address (e.g., 52.95.110.1)"
            className="ip-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="lookup-button"
            disabled={isLoading || !ipAddress.trim()}
          >
            {isLoading ? 'Checking...' : 'Lookup'}
          </button>
        </div>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="result-container">
          <h3>Result</h3>
          <div className="result-details">
            <p><strong>IP Range:</strong> {result.ip_prefix || 'N/A'}</p>
            <p><strong>Region:</strong> {result.region}</p>
            <p><strong>Service:</strong> {result.service}</p>
          </div>
        </div>
      )}
      
      {result === null && !error && !isLoading && (
        <div className="result-container">
          <p>The IP address does not appear to be in AWS IP ranges.</p>
        </div>
      )}
    </div>
  );
};

export default AwsIpLookup;
