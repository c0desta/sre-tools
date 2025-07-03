import React, { useState, useEffect } from 'react';

const generateExplanation = (query: string): string[] => {
  if (!query) return [];

  const explanation: string[] = [];
  let remainingQuery = query.trim();
  let step = 1;

  // 1. Parse aggregator and grouping
  const aggRegex = /^(sum|avg|count|min|max)(?:\s*by\s*\(([^)]+)\))?\s*\((.*)\)$/;
  const aggMatch = remainingQuery.match(aggRegex);

  if (aggMatch) {
    const [, aggregator, groupBy, innerQuery] = aggMatch;
    explanation.push(`${step++}. Aggregates the results using the <strong>${aggregator}</strong> operator.`);
    if (groupBy) {
      explanation.push(`${step++}. Groups the aggregated result by the <strong>${groupBy.split(',').map(s => s.trim()).join(', ')}</strong> label(s).`);
    }
    remainingQuery = innerQuery;
  }

  // 2. Parse function and range vector
  const funcRegex = /^(rate|irate|increase|delta|predict_linear)\s*\((.*)\[([^\]]+)\]\)$/;
  const funcMatch = remainingQuery.match(funcRegex);

  if (funcMatch) {
    const [, func, metricPart, duration] = funcMatch;
    explanation.push(`${step++}. Calculates the <strong>${func}</strong> of the time series over the last <strong>${duration}</strong>.`);
    remainingQuery = metricPart;
  }

  // 3. Parse metric and labels
  const metricRegex = /^([a-zA-Z_:][a-zA-Z0-9_:]+)\s*\{([^\}]*)\}$/;
  const metricMatch = remainingQuery.match(metricRegex);

  if (metricMatch) {
    const [, metric, labelsStr] = metricMatch;
    explanation.push(`${step++}. Selects time series with the metric name <strong>${metric}</strong>.`);
    if (labelsStr) {
      const labels = labelsStr.split(',').map(l => `<strong>${l.trim()}</strong>`).join(', ');
      explanation.push(`${step++}. Filters these series by the labels: ${labels}.`);
    }
  } else if (remainingQuery) {
    explanation.push(`${step++}. Selects time series with the metric name <strong>${remainingQuery}</strong>.`);
  }

  return explanation.length > 0 ? explanation : ['Could not generate an explanation. Please check the query syntax.'];
};

const PromQLQueryAssistant: React.FC = () => {
  const [query, setQuery] = useState('sum(rate(http_requests_total{job="api"}[5m])) by (code)');
  const [explanation, setExplanation] = useState<string[]>([]);

  const [builderState, setBuilderState] = useState({
    metric: 'http_requests_total',
    labels: [{ key: 'job', value: 'api', id: 0 }],
    func: 'rate',
    duration: '5m',
    aggregator: 'sum',
    aggregatorLabel: 'code',
  });

  // --- BUILDER LOGIC ---
  useEffect(() => {
    const { metric, labels, func, duration, aggregator, aggregatorLabel } = builderState;
    if (!metric) return;

    const labelsString = labels
      .filter(l => l.key && l.value)
      .map(l => `${l.key}="${l.value}"`)
      .join(', ');

    let builtQuery = labelsString ? `${metric}{${labelsString}}` : metric;

    if (func && duration) {
      builtQuery = `${func}(${builtQuery}[${duration}])`;
    }

    if (aggregator) {
      const byClause = aggregatorLabel ? ` by (${aggregatorLabel})` : '';
      builtQuery = `${aggregator}(${builtQuery})${byClause}`;
    }

    setQuery(builtQuery);
  }, [builderState]);

  // --- EXPLAINER LOGIC ---
  useEffect(() => {
    setExplanation(generateExplanation(query));
  }, [query]);

  const handleBuilderChange = (field: string, value: any) => {
    setBuilderState(prev => ({ ...prev, [field]: value }));
  };

  const handleLabelChange = (index: number, field: 'key' | 'value', value: string) => {
    const newLabels = [...builderState.labels];
    newLabels[index][field] = value;
    handleBuilderChange('labels', newLabels);
  };

  const addLabel = () => {
    const newLabels = [...builderState.labels, { key: '', value: '', id: Date.now() }];
    handleBuilderChange('labels', newLabels);
  };

  const removeLabel = (index: number) => {
    const newLabels = builderState.labels.filter((_, i) => i !== index);
    handleBuilderChange('labels', newLabels);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">PromQL Query Assistant</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Builder Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Query Builder</h2>
            
            <div>
              <label htmlFor="metricName" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Metric Name</label>
              <input id="metricName" type="text" value={builderState.metric} onChange={e => handleBuilderChange('metric', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </div>

            <div>
              <label id="labels-group" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Labels</label>
              {builderState.labels.map((label, index) => (
                <div key={label.id} className="flex items-center space-x-2 mt-1" aria-labelledby="labels-group">
                  <input type="text" placeholder="key" aria-label={`Label key ${index + 1}`} value={label.key} onChange={e => handleLabelChange(index, 'key', e.target.value)} className="w-1/2 p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                  <input type="text" placeholder="value" aria-label={`Label value ${index + 1}`} value={label.value} onChange={e => handleLabelChange(index, 'value', e.target.value)} className="w-1/2 p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                  <button onClick={() => removeLabel(index)} className="text-red-500 hover:text-red-700" aria-label={`Remove label ${index + 1}`}>-</button>
                </div>
              ))}
              <button onClick={addLabel} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">+ Add Label</button>
            </div>

            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="function" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Function</label>
                <select id="function" value={builderState.func} onChange={e => handleBuilderChange('func', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                  <option value="">None</option>
                  <option value="rate">rate</option>
                  <option value="irate">irate</option>
                  <option value="increase">increase</option>
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Duration</label>
                <input id="duration" type="text" value={builderState.duration} onChange={e => handleBuilderChange('duration', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="aggregator" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Aggregator</label>
                <select id="aggregator" value={builderState.aggregator} onChange={e => handleBuilderChange('aggregator', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                  <option value="">None</option>
                  <option value="sum">sum</option>
                  <option value="avg">avg</option>
                  <option value="count">count</option>
                  <option value="min">min</option>
                  <option value="max">max</option>
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="groupBy" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Group by Label</label>
                <input id="groupBy" type="text" value={builderState.aggregatorLabel} onChange={e => handleBuilderChange('aggregatorLabel', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
              </div>
            </div>
          </div>

          {/* Explainer Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Query Explainer</h2>
            <div className="mb-4">
              <label htmlFor="promql-query" className="block text-sm font-medium text-gray-600 dark:text-gray-300">PromQL Query</label>
              <textarea
                id="promql-query"
                rows={4}
                className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-mono"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter or build a PromQL query..."
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Explanation</h3>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200 space-y-2 min-h-[100px]" dangerouslySetInnerHTML={{ __html: explanation.join('<br />') }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PromQLQueryAssistant;
