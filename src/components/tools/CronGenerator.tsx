import React, { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';

// Helper to create a range of numbers
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const CronGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('minute');

  // State for each cron part
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');

  const [cronExpression, setCronExpression] = useState('* * * * *');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Update cron expression and explanation when any part changes
  useEffect(() => {
    const newCron = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`.trim();
    setCronExpression(newCron);
    try {
      setExplanation(cronstrue.toString(newCron));
      setError(null);
    } catch (err: any) {
      setExplanation('Invalid cron expression');
      setError(err.message);
    }
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const handleCronInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCron = e.target.value;
    setCronExpression(newCron);

    try {
      // First, validate the expression
      CronExpressionParser.parse(newCron);
      setExplanation(cronstrue.toString(newCron));

      // If valid, update the UI controls from the string parts
      const parts = newCron.split(' ');
      if (parts.length === 5) {
        setMinute(parts[0]);
        setHour(parts[1]);
        setDayOfMonth(parts[2]);
        setMonth(parts[3]);
        setDayOfWeek(parts[4]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Don't update UI controls if cron is invalid
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronExpression);
  };

  const renderNumberGrid = (max: number, selected: string, setter: (val: string) => void, start = 0) => {
    const selectedValues = selected.split(',').filter(v => v !== '*' && v !== '');
    const numbers = range(start, max);

    const handleSelect = (num: number) => {
      let newSelected = [...selectedValues];
      if (newSelected.includes(String(num))) {
        newSelected = newSelected.filter(v => v !== String(num));
      } else {
        newSelected.push(String(num));
      }
      setter(newSelected.length ? newSelected.sort((a, b) => Number(a) - Number(b)).join(',') : '*');
    };

    return (
      <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
        {numbers.map(num => (
          <button
            key={num}
            onClick={() => handleSelect(num)}
            className={`p-2 rounded text-center text-sm ${selectedValues.includes(String(num)) ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
            {num}
          </button>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'minute':
        return (
          <div>
            <div className="mb-2"><input type="radio" name="minute" checked={minute === '*'} onChange={() => setMinute('*')} className="mr-2"/> Every Minute (*)</div>
            <div>{renderNumberGrid(59, minute, setMinute)}</div>
          </div>
        );
      case 'hour':
        return (
            <div>
              <div className="mb-2"><input type="radio" name="hour" checked={hour === '*'} onChange={() => setHour('*')} className="mr-2"/> Every Hour (*)</div>
              <div>{renderNumberGrid(23, hour, setHour)}</div>
            </div>
          );
      case 'dayOfMonth':
        return (
            <div>
              <div className="mb-2"><input type="radio" name="dayOfMonth" checked={dayOfMonth === '*'} onChange={() => setDayOfMonth('*')} className="mr-2"/> Every Day of Month (*)</div>
              <div>{renderNumberGrid(31, dayOfMonth, setDayOfMonth, 1)}</div>
            </div>
          );
      case 'month':
        return (
            <div>
              <div className="mb-2"><input type="radio" name="month" checked={month === '*'} onChange={() => setMonth('*')} className="mr-2"/> Every Month (*)</div>
              <div>{renderNumberGrid(12, month, setMonth, 1)}</div>
            </div>
          );
      case 'dayOfWeek':
        return (
            <div>
              <div className="mb-2"><input type="radio" name="dayOfWeek" checked={dayOfWeek === '*'} onChange={() => setDayOfWeek('*')} className="mr-2"/> Every Day of Week (*)</div>
              <div>{renderNumberGrid(6, dayOfWeek, setDayOfWeek)}</div>
            </div>
          );
      default:
        return null;
    }
  };
  
  const tabs = [
    { id: 'minute', label: 'Minute' },
    { id: 'hour', label: 'Hour' },
    { id: 'dayOfMonth', label: 'Day (Month)' },
    { id: 'month', label: 'Month' },
    { id: 'dayOfWeek', label: 'Day (Week)' },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Cron Expression Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div>{renderTabContent()}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Result</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Cron Expression</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                readOnly
                value={cronExpression}
                className="flex-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md sm:text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Explanation</label>
            <p className="mt-1 text-lg text-gray-900 bg-gray-100 p-3 rounded-md min-h-[40px]">{explanation}</p>
          </div>
          <hr className="my-6" />
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Reverse Cron</h2>
          <div>
            <label htmlFor="cron-input" className="block text-sm font-medium text-gray-700">Paste Cron Expression</label>
            <input
              id="cron-input"
              type="text"
              value={cronExpression}
              onChange={handleCronInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. * * * * *"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CronGenerator;
