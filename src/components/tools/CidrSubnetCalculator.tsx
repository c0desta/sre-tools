import React, { useState, useMemo } from 'react';

// UI Components
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>
    {children}
  </div>
);

const Input = ({ 
  id, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  className = '' 
}: { 
  id?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Label = ({ 
  htmlFor, 
  children, 
  className = '' 
}: { 
  htmlFor?: string; 
  children: React.ReactNode; 
  className?: string;
}) => (
  <label 
    htmlFor={htmlFor} 
    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}
  >
    {children}
  </label>
);

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

const CidrSubnetCalculator: React.FC = () => {
  const [cidrInput, setCidrInput] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const calculateSubnet = (cidr: string): SubnetInfo => {
    const cidrRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/;
    const match = cidr.match(cidrRegex);
    
    if (!match) {
      return {
        networkAddress: '',
        broadcastAddress: '',
        firstUsableHost: '',
        lastUsableHost: '',
        totalHosts: 0,
        subnetMask: '',
        isValid: false,
        error: 'Invalid CIDR format. Use format: 192.168.1.0/24'
      };
    }

    const [, ip, prefixLengthStr] = match;
    const prefixLength = parseInt(prefixLengthStr, 10);
    
    if (prefixLength < 0 || prefixLength > 32) {
      return {
        networkAddress: '',
        broadcastAddress: '',
        firstUsableHost: '',
        lastUsableHost: '',
        totalHosts: 0,
        subnetMask: '',
        isValid: false,
        error: 'Prefix length must be between 0 and 32'
      };
    }

    // Validate IP address octets
    const octets = ip.split('.').map(Number);
    if (octets.some(octet => octet < 0 || octet > 255)) {
      return {
        networkAddress: '',
        broadcastAddress: '',
        firstUsableHost: '',
        lastUsableHost: '',
        totalHosts: 0,
        subnetMask: '',
        isValid: false,
        error: 'Each octet must be between 0 and 255'
      };
    }

    // Calculate subnet mask
    const mask = 0xffffffff << (32 - prefixLength);
    const maskOctets = [
      (mask >>> 24) & 0xff,
      (mask >>> 16) & 0xff,
      (mask >>> 8) & 0xff,
      mask & 0xff
    ];
    
    const subnetMask = maskOctets.join('.');
    
    // Calculate network and broadcast addresses
    const networkOctets = octets.map((octet, i) => octet & maskOctets[i]);
    const broadcastOctets = networkOctets.map((octet, i) => 
      octet | (~maskOctets[i] & 0xff)
    );
    
    const networkAddress = networkOctets.join('.');
    const broadcastAddress = broadcastOctets.join('.');
    
    // Calculate first and last usable hosts
    const firstUsable = [...networkOctets];
    firstUsable[3] += 1; // Increment last octet for first usable host
    
    const lastUsable = [...broadcastOctets];
    lastUsable[3] -= 1; // Decrement last octet for last usable host
    
    // Calculate total number of hosts
    const totalHosts = Math.pow(2, 32 - prefixLength) - 2;
    
    return {
      networkAddress: networkAddress,
      broadcastAddress: broadcastAddress,
      firstUsableHost: firstUsable.join('.'),
      lastUsableHost: lastUsable.join('.'),
      totalHosts: totalHosts,
      subnetMask: subnetMask,
      isValid: true
    };
  };

  const subnetInfo = useMemo<SubnetInfo>(() => {
    if (!cidrInput.trim()) {
      return {
        networkAddress: '',
        broadcastAddress: '',
        firstUsableHost: '',
        lastUsableHost: '',
        totalHosts: 0,
        subnetMask: '',
        isValid: false
      };
    }
    return calculateSubnet(cidrInput);
  }, [cidrInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCidrInput(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cidr-input">CIDR Notation</Label>
        <Input
          id="cidr-input"
          type="text"
          placeholder="e.g., 10.0.16.0/22"
          value={cidrInput}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full max-w-md ${!subnetInfo.isValid && cidrInput ? 'border-red-500' : ''}`}
        />
        {!subnetInfo.isValid && cidrInput && (
          <p className="text-sm text-red-500">{subnetInfo.error || 'Invalid CIDR notation'}</p>
        )}
        {isFocused && !cidrInput && (
          <p className="text-sm text-muted-foreground">
            Enter an IP address in CIDR notation (e.g., 192.168.1.0/24)
          </p>
        )}
      </div>

      {subnetInfo.isValid && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Network Address:</div>
                <div className="font-mono text-sm">{subnetInfo.networkAddress}</div>
                
                <div className="text-sm font-medium">Broadcast Address:</div>
                <div className="font-mono text-sm">{subnetInfo.broadcastAddress}</div>
                
                <div className="text-sm font-medium">First Usable Host:</div>
                <div className="font-mono text-sm">{subnetInfo.firstUsableHost}</div>
                
                <div className="text-sm font-medium">Last Usable Host:</div>
                <div className="font-mono text-sm">{subnetInfo.lastUsableHost}</div>
                
                <div className="text-sm font-medium">Total Usable Hosts:</div>
                <div className="font-mono text-sm">
                  {subnetInfo.totalHosts.toLocaleString()}
                </div>
                
                <div className="text-sm font-medium">Subnet Mask:</div>
                <div className="font-mono text-sm">{subnetInfo.subnetMask}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">CIDR Notation:</span> An IP address followed by a slash and a number (e.g., 192.168.1.0/24).
                </p>
                <p>
                  <span className="font-medium">Network Address:</span> The first address in the subnet range.
                </p>
                <p>
                  <span className="font-medium">Broadcast Address:</span> The last address in the subnet range.
                </p>
                <p>
                  <span className="font-medium">Usable Hosts:</span> All addresses between the first and last usable host addresses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CidrSubnetCalculator;
