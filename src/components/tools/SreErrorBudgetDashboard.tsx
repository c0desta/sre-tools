import React, { useState, useMemo } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const InfoIcon = () => (
  <span className="ml-2 text-gray-500 cursor-pointer">[?]</span>
);

const SreErrorBudgetDashboard: React.FC = () => {
  const [slo, setSlo] = useState(99.9);
  const [timeWindow, setTimeWindow] = useState(28); // in days
  const [downtime, setDowntime] = useState(0); // in minutes
  const [timeElapsed, setTimeElapsed] = useState(0); // in days

  const totalMinutesInWindow = timeWindow * 24 * 60;
  const availability = slo / 100;

  const { totalErrorMinutes, errorBudget } = useMemo(() => {
    const minutes = totalMinutesInWindow * (1 - availability);
    return {
      totalErrorMinutes: minutes,
      errorBudget: {
        minutes: minutes,
        hours: minutes / 60,
        days: minutes / (60 * 24),
      },
    };
  }, [totalMinutesInWindow, availability]);

  const budgetConsumed = useMemo(() => {
    const consumedPercentage = totalErrorMinutes > 0 ? (downtime / totalErrorMinutes) * 100 : 0;
    const remainingPercentage = 100 - consumedPercentage;
    const remainingMinutes = totalErrorMinutes - downtime;

    let progressBarColor = 'bg-green-500';
    if (remainingPercentage <= 50 && remainingPercentage > 25) {
      progressBarColor = 'bg-yellow-500';
    } else if (remainingPercentage <= 25) {
      progressBarColor = 'bg-red-500';
    }

    return { consumedPercentage, remainingPercentage, remainingMinutes, progressBarColor };
  }, [downtime, totalErrorMinutes]);

  const burnRate = useMemo(() => {
    if (timeElapsed <= 0 || totalErrorMinutes <= 0 || downtime <= 0) return 0;
    const idealBurn = totalErrorMinutes / timeWindow;
    const actualBurn = downtime / timeElapsed;
    return actualBurn / idealBurn;
  }, [downtime, timeElapsed, totalErrorMinutes, timeWindow]);

  const timeToExhaustion = useMemo(() => {
    const actualBurnPerDay = downtime > 0 && timeElapsed > 0 ? downtime / timeElapsed : 0;
    if (actualBurnPerDay <= 0) {
      return 'N/A (No consumption)';
    }
    const remainingDays = budgetConsumed.remainingMinutes / actualBurnPerDay;
    if (remainingDays < 0 || !isFinite(remainingDays)) {
      return 'Not exhausting at this rate';
    }
    const daysPart = Math.floor(remainingDays);
    const hoursPart = Math.floor((remainingDays - daysPart) * 24);
    return `~${daysPart}d ${hoursPart}h`;
  }, [budgetConsumed.remainingMinutes, downtime, timeElapsed]);

  const alertingThresholds = useMemo(() => {
    const windows = [
      { label: '1 hour', hours: 1 },
      { label: '6 hours', hours: 6 },
      { label: '24 hours', hours: 24 },
      { label: '72 hours', hours: 72 },
    ];
    return windows.map(w => ({
      window: w.label,
      downtime: totalErrorMinutes > 0 ? `${(totalErrorMinutes / w.hours).toFixed(2)} min/hr` : 'N/A',
    }));
  }, [totalErrorMinutes]);

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">SRE Error Budget Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 1: SLO Definition & Error Budget */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">1. SLO Definition & Budget</h2>
          
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              SLO Target (%)
              <button type="button" data-tooltip-id="slo-tooltip" data-tooltip-content="A Service Level Objective (SLO) is a target value for the reliability of your service.">
                <InfoIcon />
              </button>
            </label>
            <input
              type="number"
              value={slo}
              onChange={(e) => setSlo(parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition"
              step="0.001"
              min="0"
              max="100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Time Window</label>
            <div className="flex space-x-2">
              {[28, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeWindow(days)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${timeWindow === days ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                  {days} days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Total Error Budget
              <button type="button" data-tooltip-id="budget-tooltip" data-tooltip-content="The amount of time your service can be unavailable without breaching the SLO.">
                <InfoIcon />
              </button>
            </label>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-indigo-800">{errorBudget.days.toFixed(2)}</p>
                <p className="text-sm text-indigo-600">Days</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-800">{errorBudget.hours.toFixed(2)}</p>
                <p className="text-sm text-purple-600">Hours</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-pink-800">{errorBudget.minutes.toFixed(2)}</p>
                <p className="text-sm text-pink-600">Minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Budget Consumption & Burn Rate */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">2. Consumption & Burn Rate</h2>

          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Downtime Incurred (minutes)</label>
            <input
              type="number"
              value={downtime}
              onChange={(e) => setDowntime(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Time Elapsed in Window (days)</label>
            <input
              type="number"
              value={timeElapsed}
              onChange={(e) => setTimeElapsed(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition"
              max={timeWindow}
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Remaining Budget</label>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetConsumed.progressBarColor}`}
                style={{ width: `${Math.max(0, budgetConsumed.remainingPercentage)}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-gray-600">{budgetConsumed.remainingPercentage.toFixed(2)}% remaining ({budgetConsumed.remainingMinutes.toFixed(2)} minutes)</p>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Alert Burn Rate
              <button type="button" data-tooltip-id="burnrate-tooltip" data-tooltip-content="A burn rate > 1 means you are consuming budget faster than planned.">
                <InfoIcon />
              </button>
            </label>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-gray-800">{burnRate.toFixed(2)}x</p>
              <p className="text-sm text-gray-600">Normal Rate</p>
            </div>
          </div>
        </div>

        {/* Section 3: Projections & Alerts */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">3. Projections & Alerts</h2>

          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Time to Exhaustion
              <button type="button" data-tooltip-id="exhaustion-tooltip" data-tooltip-content="Estimated time until the budget is fully consumed at the current burn rate.">
                <InfoIcon />
              </button>
            </label>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-800">{timeToExhaustion}</p>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Alerting Thresholds
              <button type="button" data-tooltip-id="threshold-tooltip" data-tooltip-content="Downtime per hour required to burn the entire budget within the specified alert window.">
                <InfoIcon />
              </button>
            </label>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Alert Window</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Downtime Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {alertingThresholds.map(t => (
                    <tr key={t.window} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-sm text-gray-800">{t.window}</td>
                      <td className="py-2 px-4 border-b text-sm text-gray-800 font-mono">{t.downtime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Tooltip id="slo-tooltip" place="top" />
      <Tooltip id="budget-tooltip" place="top" />
      <Tooltip id="burnrate-tooltip" place="top" />
      <Tooltip id="exhaustion-tooltip" place="top" />
      <Tooltip id="threshold-tooltip" place="top" />
    </div>
  );
};

export default SreErrorBudgetDashboard;
