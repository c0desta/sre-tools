import React, { useState, useEffect, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { format, fromZonedTime } from 'date-fns-tz';

const TimezoneConverter: React.FC = () => {
  const [timezones, setTimezones] = useState<string[]>([]);
  const [fromTimezone, setFromTimezone] = useState<string>('');
  const [toTimezone, setToTimezone] = useState<string>('');
  const [inputDateTime, setInputDateTime] = useState<string>('');

  useEffect(() => {
    // A list of common IANA timezones
    const commonTimezones = [
      'UTC',
      'GMT',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Moscow',
      'Asia/Tokyo',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Shanghai',
      'Asia/Hong_Kong',
      'Asia/Singapore',
      'Asia/Taipei',
      'Australia/Sydney',
    ];
    setTimezones(commonTimezones);

    // Try to get user's timezone, fallback to UTC
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (commonTimezones.includes(userTimezone)) {
        setFromTimezone(userTimezone);
      } else {
        setFromTimezone('UTC');
      }
    } catch (e) {
      setFromTimezone('UTC');
    }

    setToTimezone('UTC');
    setInputDateTime(new Date().toISOString().substring(0, 16));
  }, []);

  const convertedDateTime = useMemo(() => {
    if (!inputDateTime || !fromTimezone || !toTimezone) {
      return null;
    }
    try {
      const dateInFromTz = fromZonedTime(inputDateTime, fromTimezone);
      return format(dateInFromTz, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone: toTimezone });
    } catch (error) {
      console.error('Error in date conversion:', error);
      return 'Invalid Date';
    }
  }, [inputDateTime, fromTimezone, toTimezone]);

  const renderSelect = (value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void) => (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
    >
      {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
    </select>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Timezone Converter</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          
          {/* From Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">From</h2>
            {renderSelect(fromTimezone, (e) => setFromTimezone(e.target.value))}
            <input
              type="datetime-local"
              value={inputDateTime}
              onChange={(e) => setInputDateTime(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* To Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">To</h2>
            {renderSelect(toTimezone, (e) => setToTimezone(e.target.value))}
            <div className="w-full p-2 h-10 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center">
              <p className="text-gray-900 dark:text-gray-200">
                {convertedDateTime ? format(parseISO(convertedDateTime), 'MMM dd, yyyy, hh:mm:ss a') : ''}
              </p>
            </div>
          </div>

          {/* Result Display */}
          <div className="md:col-span-1 flex items-end justify-center">
            {/* This space can be used for a summary or other info if needed */}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimezoneConverter;
