import { lazy } from 'react';
import { Tool } from '../types/tool';

// Lazy load tool components for better performance
const AwsIpLookup = lazy(() => import('../components/tools/AwsIpLookup'));
const CidrSubnetCalculator = lazy(() => import('../components/tools/CidrSubnetCalculator'));
// Import other tools here as we create them

// Add new tools to this array
const tools: Tool[] = [
  {
    id: 'aws-ip-lookup',
    title: 'AWS IP Lookup',
    description: 'Check if an IP address belongs to AWS and find its region and service.',
    path: '/aws-ip-lookup',
    component: AwsIpLookup,
    category: 'Networking',
    icon: '🌐',
  },
  {
    id: 'cidr-subnet-calculator',
    title: 'CIDR Subnet Calculator',
    description: 'Calculate network details from CIDR notation including network, broadcast, and usable IPs.',
    path: '/cidr-subnet-calculator',
    component: CidrSubnetCalculator,
    category: 'Networking',
    icon: '🔢',
  },
  // Add more tools here following the same pattern
];

export default tools;
