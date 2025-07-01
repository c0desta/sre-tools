import { lazy } from 'react';
import { Tool } from '../types/tool';

// Lazy load tool components for better performance
const AwsIpLookup = lazy(() => import('../components/tools/AwsIpLookup'));
const CidrSubnetCalculator = lazy(() => import('../components/tools/CidrSubnetCalculator'));
const YamlJsonLintFormat = lazy(() => import('../components/tools/YamlJsonLintFormat'));
const CronGenerator = lazy(() => import('../components/tools/CronGenerator'));
const JwtDecoder = lazy(() => import('../components/tools/JwtDecoder'));
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
  {
    id: 'yaml-json-lint-format',
    title: 'YAML & JSON Lint & Format',
    description: 'Validate, format, and lint YAML and JSON code in real-time.',
    path: '/yaml-json-lint-format',
    component: YamlJsonLintFormat,
    category: 'Formatters',
    icon: '📝',
  },
  {
    id: 'cron-generator',
    title: 'Cron Expression Generator',
    description: 'Generate and understand cron expressions with a real-time explainer.',
    path: '/cron-generator',
    component: CronGenerator,
    category: 'Scheduling',
    icon: '⏰',
  },
  {
    id: 'jwt-decoder',
    title: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens in real-time.',
    path: '/jwt-decoder',
    component: JwtDecoder,
    category: 'Security',
    icon: '🔐',
  },
  // Add more tools here following the same pattern
];

export default tools;
