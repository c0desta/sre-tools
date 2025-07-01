import React, { useState, useMemo } from 'react';
import { FiCopy, FiCheckCircle } from '../icons';

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalHosts: number;
  subnetMask: string;
  isValid: boolean;
  error?: string;
}

const InfoRow: React.FC<{ label: string; value: string | number; isMono?: boolean }> = ({ label, value, isMono = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`${isMono ? 'font-mono' : ''} text-sm text-gray-900 dark:text-gray-100`}>{value}</span>
        {typeof value === 'string' && (
          <button onClick={handleCopy} className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
            {copied ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
          </button>
        )}
      </div>
    </div>
  );
};

const CidrSubnetCalculator: React.FC = () => {
  const [cidrInput, setCidrInput] = useState<string>('192.168.1.0/24');

  // The calculation logic remains the same, as it is robust.
  const calculateSubnet = (cidr: string): SubnetInfo => {
    const cidrRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/;
    const match = cidr.match(cidrRegex);
    if (!match) return { isValid: false, error: 'Invalid CIDR format (e.g., 192.168.1.0/24)' } as SubnetInfo;

    const [, ip, prefixLengthStr] = match;
    const prefixLength = parseInt(prefixLengthStr, 10);
    if (prefixLength < 0 || prefixLength > 32) return { isValid: false, error: 'Prefix must be between 0 and 32' } as SubnetInfo;

    const octets = ip.split('.').map(Number);
    if (octets.some(octet => octet < 0 || octet > 255)) return { isValid: false, error: 'Invalid IP address octet' } as SubnetInfo;

    const ipLong = octets.reduce((acc, octet) => (acc << 8) | octet, 0) >>> 0;
    const mask = (0xffffffff << (32 - prefixLength)) >>> 0;
    
    const networkLong = (ipLong & mask) >>> 0;
    const broadcastLong = (networkLong | ~mask) >>> 0;

    const toIpString = (long: number) => [
      (long >>> 24) & 0xff,
      (long >>> 16) & 0xff,
      (long >>> 8) & 0xff,
      long & 0xff
    ].join('.');

    const totalHosts = Math.pow(2, 32 - prefixLength);
    const firstUsableLong = prefixLength <= 30 ? networkLong + 1 : networkLong;
    const lastUsableLong = prefixLength <= 30 ? broadcastLong - 1 : broadcastLong;

    return {
      networkAddress: toIpString(networkLong),
      broadcastAddress: toIpString(broadcastLong),
      firstUsableHost: prefixLength <= 30 ? toIpString(firstUsableLong) : 'N/A',
      lastUsableHost: prefixLength <= 30 ? toIpString(lastUsableLong) : 'N/A',
      totalHosts: totalHosts,
      subnetMask: toIpString(mask),
      isValid: true
    };
  };

  const subnetInfo = useMemo(() => {
    if (!cidrInput.trim()) return { isValid: false } as SubnetInfo;
    return calculateSubnet(cidrInput);
  }, [cidrInput]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">CIDR Subnet Calculator</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Instantly calculate network details from any CIDR notation.</p>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="e.g., 10.0.16.0/22"
            value={cidrInput}
            onChange={(e) => setCidrInput(e.target.value)}
            className={`w-full px-4 py-3 text-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-200 border dark:border-gray-600 rounded-lg focus:ring-2 transition-colors duration-200 ${
              subnetInfo.isValid && cidrInput
                ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-300'
                : !subnetInfo.isValid && cidrInput
                ? 'border-red-500 focus:ring-2 focus:ring-red-300'
                : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500'
            }`}
          />
          {subnetInfo.isValid && cidrInput && (
            <FiCheckCircle className="absolute top-1/2 right-4 -translate-y-1/2 text-green-500 text-xl" />
          )}
        </div>

        {subnetInfo.isValid && cidrInput ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Network Details</h2>
              <div className="space-y-2">
                <InfoRow label="Network Address" value={subnetInfo.networkAddress} />
                <InfoRow label="Subnet Mask" value={subnetInfo.subnetMask} />
                <InfoRow label="Broadcast Address" value={subnetInfo.broadcastAddress} />
                <InfoRow label="First Usable Host" value={subnetInfo.firstUsableHost} />
                <InfoRow label="Last Usable Host" value={subnetInfo.lastUsableHost} />
                <InfoRow label="Total Hosts" value={subnetInfo.totalHosts.toLocaleString()} isMono={false} />
                <InfoRow label="Usable Hosts" value={subnetInfo.totalHosts > 2 ? (subnetInfo.totalHosts - 2).toLocaleString() : 0} isMono={false} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Waiting for input</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subnetInfo.error ? (
                <span className="text-red-600 dark:text-red-400 font-medium">{subnetInfo.error}</span>
              ) : (
                'Enter a valid CIDR notation above to see the details.'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CidrSubnetCalculator;
