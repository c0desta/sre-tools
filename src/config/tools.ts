import { lazy } from 'react';
import { Tool } from '../types/tool';

// Lazy load tool components for better performance
const AwsIpLookup = lazy(() => import('../components/tools/AwsIpLookup'));
const CidrSubnetCalculator = lazy(() => import('../components/tools/CidrSubnetCalculator'));
const YamlJsonLintFormat = lazy(() => import('../components/tools/YamlJsonLintFormat'));
const CronGenerator = lazy(() => import('../components/tools/CronGenerator'));
const JwtDecoder = lazy(() => import('../components/tools/JwtDecoder'));
const SreErrorBudgetDashboard = lazy(() => import('../components/tools/SreErrorBudgetDashboard'));
const BasicAuthHeaderGenerator = lazy(() => import('../components/tools/BasicAuthHeaderGenerator'));
const Composerize = lazy(() => import('../components/tools/Composerize'));
const MarkdownPreviewer = lazy(() => import('../components/tools/MarkdownPreviewer'));
const MyIpAddress = lazy(() => import('../components/tools/MyIpAddress'));
const TimezoneConverter = lazy(() => import('../components/tools/TimezoneConverter'));
const KubernetesProbeSimulator = lazy(() => import('../components/tools/KubernetesProbeSimulator'));
const PromQLQueryAssistant = lazy(() => import('../components/tools/PromQLQueryAssistant'));
const CloudWatchInsightsQueryBuilder = lazy(() => import('../components/tools/CloudWatchInsightsQueryBuilder'));
// Import other tools here as we create them

// Add new tools to this array
const tools: Tool[] = [
  {
    id: 'timezone-converter',
    title: 'Timezone Converter',
    description: 'Convert dates and times between different timezones.',
    path: '/timezone-converter',
    component: TimezoneConverter,
    category: 'Date & Time',
    icon: '🕒',
  },
  {
    id: 'my-ip-address',
    title: 'What\'s My IP',
    description: 'Displays your public IP address.',
    path: '/my-ip-address',
    component: MyIpAddress,
    category: 'Networking',
    icon: '🌐',
  },
  {
    id: 'live-markdown-previewer',
    title: 'Live Markdown Previewer',
    description: 'A live, side-by-side editor that renders Markdown as you type.',
    path: '/live-markdown-previewer',
    component: MarkdownPreviewer,
    category: 'Formatters',
    icon: '✍️',
  },
  {
    id: 'basic-auth-header-generator',
    title: 'Basic Auth Header Generator',
    description: 'Generate a Basic Auth HTTP header from a username and password.',
    path: '/basic-auth-header-generator',
    component: BasicAuthHeaderGenerator,
    category: 'Web',
    icon: '🔑',
  },
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
  {
    id: 'kubernetes-probe-simulator',
    title: 'Kubernetes Probe Simulator',
    description: 'Visually simulate and understand Kubernetes liveness and readiness probes.',
    path: '/kubernetes-probe-simulator',
    component: KubernetesProbeSimulator,
    category: 'Kubernetes',
    icon: '🚢',
  },
  {
    id: 'promql-query-assistant',
    title: 'PromQL Query Assistant',
    description: 'Build and understand Prometheus queries with a builder and explainer.',
    path: '/promql-query-assistant',
    component: PromQLQueryAssistant,
    category: 'Monitoring',
    icon: '📊',
  },
  {
    id: 'cloudwatch-insights-query-builder',
    title: 'CloudWatch Insights Query Builder',
    description: 'Visually construct queries for AWS CloudWatch Logs Insights.',
    path: '/cloudwatch-insights-query-builder',
    component: CloudWatchInsightsQueryBuilder,
    category: 'AWS',
    icon: '☁️',
  },
  {
    id: 'sre-error-budget-dashboard',
    title: 'SRE Error Budget Dashboard',
    description: 'Define, calculate, and track Service Level Objectives (SLOs) and their associated error budgets.',
    path: '/sre-error-budget-dashboard',
    component: SreErrorBudgetDashboard,
    category: 'SRE',
    icon: '📊',
  },
  {
    id: 'composerize',
    title: 'Composerize: Docker Run to Compose',
    description: 'Convert docker run commands to docker-compose.yml files.',
    path: '/composerize',
    component: Composerize,
    category: 'Docker',
    icon: '🐳',
  },
  // Add more tools here following the same pattern
];

export default tools;
