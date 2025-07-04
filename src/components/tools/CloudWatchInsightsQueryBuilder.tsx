import React, { useState, useEffect, useCallback } from 'react';

const LOG_TEMPLATES = {
  generic: {
    fields: ['@timestamp', '@message'],
  },
  alb: {
    fields: ['@timestamp', 'elb_status_code', 'client_ip', 'request', 'target_group_arn', 'user_agent'],
  },
  cloudfront: {
    fields: ['@timestamp', '`cs-method`', '`cs-uri-stem`', '`sc-status`', '`c-ip`', '`x-edge-location`', '`cs(User-Agent)`', '`x-edge-result-type`'],
  },
  vpcflow: {
    fields: ['@timestamp', 'srcaddr', 'dstaddr', 'action', 'protocol', 'interfaceId', 'logStatus'],
  },
};

type LogType = keyof typeof LOG_TEMPLATES;

const FREQUENT_QUERIES: Record<LogType, { name: string; state: any }[]> = {
  alb: [
    {
      name: 'Top 10 Client IPs',
      state: {
        stats: { func: 'count', field: '*', by: 'client_ip' },
        sort: { field: '@count', dir: 'desc' },
        limit: 10,
        fields: ['client_ip'],
        filters: [],
      },
    },
    {
      name: 'Top 10 User Agents',
      state: {
        stats: { func: 'count', field: '*', by: 'user_agent' },
        sort: { field: '@count', dir: 'desc' },
        limit: 10,
        fields: ['user_agent'],
        filters: [],
      },
    },
    {
      name: 'HTTP Status Code Counts',
      state: {
        stats: { func: 'count', field: '*', by: 'elb_status_code' },
        sort: { field: 'elb_status_code', dir: 'asc' },
        limit: 50,
        fields: ['elb_status_code'],
        filters: [],
      },
    },
    {
      name: '5xx Server Errors',
      state: {
        filters: [{ field: 'elb_status_code', op: '=~', value: '5[0-9]{2}', id: 0 }],
        sort: { field: '@timestamp', dir: 'desc' },
        limit: 50,
      },
    },
  ],
  cloudfront: [
    {
      name: 'Top 10 Client IPs',
      state: {
        stats: { func: 'count', field: '*', by: '`c-ip`' },
        sort: { field: '@count', dir: 'desc' },
        limit: 10,
        fields: ['`c-ip`'],
        filters: [],
      },
    },
    {
      name: 'Top 10 User Agents',
      state: {
        stats: { func: 'count', field: '*', by: '`cs(User-Agent)`' },
        sort: { field: '@count', dir: 'desc' },
        limit: 10,
        fields: ['`cs(User-Agent)`'],
        filters: [],
      },
    },
    {
      name: 'Cache Hit vs Miss',
      state: {
        stats: { func: 'count', field: '*', by: '`x-edge-result-type`' },
        sort: { field: '@count', dir: 'desc' },
        limit: 10,
        fields: ['`x-edge-result-type`'],
        filters: [],
      },
    },
    {
      name: 'Requests by Edge Location',
      state: {
        stats: { func: 'count', field: '*', by: '`x-edge-location`' },
        sort: { field: '@count', dir: 'desc' },
        limit: 20,
        fields: ['`x-edge-location`'],
        filters: [],
      },
    },
  ],
  vpcflow: [
    {
      name: 'Top 10 Source IPs (Talkers)',
      state: {
        stats: { func: 'sum', field: 'bytes', by: 'srcaddr' },
        sort: { field: '@sum_bytes', dir: 'desc' },
        limit: 10,
        fields: ['srcaddr'],
        filters: [],
      },
    },
    {
      name: 'Top 10 Destination IPs (Listeners)',
      state: {
        stats: { func: 'sum', field: 'bytes', by: 'dstaddr' },
        sort: { field: '@sum_bytes', dir: 'desc' },
        limit: 10,
        fields: ['dstaddr'],
        filters: [],
      },
    },
    {
      name: 'Rejected Traffic',
      state: {
        filters: [{ field: 'action', op: '==', value: 'REJECT', id: 0 }],
        sort: { field: '@timestamp', dir: 'desc' },
        limit: 50,
        fields: ['@timestamp', 'srcaddr', 'dstaddr', 'action'],
      },
    },
  ],
  generic: [
    {
      name: "Count 'ERROR' in messages",
      state: {
        filters: [{ field: '@message', op: '=~', value: 'ERROR', id: 0 }],
        stats: { func: 'count', field: '*' },
      },
    },
    {
      name: 'Top 20 Log Streams by Event Count',
      state: {
        stats: { func: 'count', field: '*', by: '@logStream' },
        sort: { field: '@count', dir: 'desc' },
        limit: 20,
        fields: ['@logStream'],
      },
    },
  ],
};

const CloudWatchInsightsQueryBuilder: React.FC = () => {
  const [logType, setLogType] = useState<LogType>('generic');
  const [fields, setFields] = useState<string[]>(LOG_TEMPLATES.generic.fields);
  const [filters, setFilters] = useState([{ field: '', op: '==', value: '', id: Date.now() }]);
  const [stats, setStats] = useState({ func: '', field: '', by: '' });
  const [sort, setSort] = useState({ field: '@timestamp', dir: 'desc' });
  const [limit, setLimit] = useState(20);
  const [query, setQuery] = useState('');

  const applyCannedQuery = useCallback((state: any) => {
    setFields(state.fields || LOG_TEMPLATES[logType].fields);
    setFilters(state.filters || [{ field: '', op: '==', value: '', id: Date.now() }]);
    setStats(state.stats || { func: '', field: '', by: '' });
    setSort(state.sort || { field: '@timestamp', dir: 'desc' });
    setLimit(state.limit || 20);
  }, [logType]);

  useEffect(() => {
    setFields(LOG_TEMPLATES[logType].fields);
    // Reset builder when log type changes
    applyCannedQuery({});
  }, [logType, applyCannedQuery]);

  useEffect(() => {
    const queryParts: string[] = [];
    if (fields.length > 0) queryParts.push(`fields ${fields.join(', ')}`);
    const activeFilters = filters.filter(f => f.field && f.value);
    if (activeFilters.length > 0) queryParts.push(`filter ${activeFilters.map(f => `${f.field} ${f.op} "${f.value}"`).join(' and ')}`);
    if (stats.func && stats.field) {
      const byClause = stats.by ? ` by ${stats.by}` : '';
      queryParts.push(`stats ${stats.func}(${stats.field})${byClause}`);
    }
    if (sort.field && sort.dir) queryParts.push(`sort ${sort.field} ${sort.dir}`);
    if (limit > 0) queryParts.push(`limit ${limit}`);
    setQuery(queryParts.join(' | '));
  }, [fields, filters, stats, sort, limit]);

  const handleFilterChange = useCallback((index: number, field: string, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  }, [filters]);

  const addFilter = useCallback(() => setFilters([...filters, { field: '', op: '==', value: '', id: Date.now() }]), [filters]);

  const removeFilter = useCallback((index: number) => setFilters(filters.filter((_, i) => i !== index)), [filters]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">CloudWatch Logs Insights Query Builder</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Query Builder</h2>

          <div>
            <label htmlFor="logType" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Log Template</label>
            <select id="logType" value={logType} onChange={e => setLogType(e.target.value as LogType)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
              <option value="generic">Generic</option>
              <option value="alb">Application Load Balancer</option>
              <option value="cloudfront">CloudFront</option>
              <option value="vpcflow">VPC Flow Logs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Fields</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {LOG_TEMPLATES[logType].fields.map(field => (
                <label key={field} className="flex items-center space-x-2">
                  <input type="checkbox" checked={fields.includes(field)} onChange={() => setFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field])} className="rounded" />
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-mono">{field}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Filter</label>
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-center space-x-2 mt-1">
                <input type="text" placeholder="Field" value={filter.field} onChange={e => handleFilterChange(index, 'field', e.target.value)} className="w-1/3 p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                <select value={filter.op} onChange={e => handleFilterChange(index, 'op', e.target.value)} className="w-1/4 p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                  <option>==</option><option>!=</option><option>=~</option><option>!~</option>
                </select>
                <input type="text" placeholder="Value" value={filter.value} onChange={e => handleFilterChange(index, 'value', e.target.value)} className="w-1/3 p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                <button onClick={() => removeFilter(index)} className="text-red-500 hover:text-red-700">-</button>
              </div>
            ))}
            <button onClick={addFilter} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">+ Add Filter</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Stats Function</label>
              <select value={stats.func} onChange={e => setStats(s => ({...s, func: e.target.value}))} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                <option value="">None</option><option>count</option><option>sum</option><option>avg</option><option>min</option><option>max</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Stats Field</label>
              <input type="text" value={stats.field} onChange={e => setStats(s => ({...s, field: e.target.value}))} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Group By Field</label>
              <input type="text" value={stats.by} onChange={e => setStats(s => ({...s, by: e.target.value}))} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Sort Field</label>
              <input type="text" value={sort.field} onChange={e => setSort(s => ({...s, field: e.target.value}))} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Sort Direction</label>
              <select value={sort.dir} onChange={e => setSort(s => ({...s, dir: e.target.value}))} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                <option>asc</option><option>desc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Limit</label>
              <input type="number" value={limit} onChange={e => setLimit(parseInt(e.target.value, 10))} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </div>
          </div>

        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Frequently Used Queries</h2>
          <div className="flex flex-wrap gap-2">
            {FREQUENT_QUERIES[logType].map(cannedQuery => (
              <button
                key={cannedQuery.name}
                onClick={() => applyCannedQuery(cannedQuery.state)}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
              >
                {cannedQuery.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Generated Query</h2>
          <textarea
            readOnly
            rows={6}
            className="w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-mono"
            value={query}
          />
        </div>

      </div>
    </div>
  );
};

export default CloudWatchInsightsQueryBuilder;
