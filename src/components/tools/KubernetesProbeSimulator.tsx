import React, { useState, useEffect, useCallback } from 'react';

type ProbeStatus = 'Success' | 'Failure' | 'Pending';
type PodStatus = 'Healthy' | 'Unhealthy' | 'Restarting';

interface ProbeEvent {
  time: number;
  status: ProbeStatus;
}

const KubernetesProbeSimulator: React.FC = () => {
  const [settings, setSettings] = useState({
    initialDelaySeconds: 5,
    periodSeconds: 10,
    failureThreshold: 3,
    successThreshold: 1,
    probeType: 'readiness' as 'readiness' | 'liveness',
  });

  const [timeline, setTimeline] = useState<ProbeEvent[]>([]);
  const [podStatus, setPodStatus] = useState<PodStatus>('Healthy');
  const [log, setLog] = useState<string[]>([]);

  const runSimulation = useCallback(() => {
    const newTimeline: ProbeEvent[] = [];
    let currentPodStatus: PodStatus = 'Healthy';
    let consecutiveFailures = 0;
    let consecutiveSuccesses = 0;
    const newLog: string[] = ['Simulation started. Pod is Healthy.'];

    for (let time = 0; time <= 120; time++) { // Simulate for 120 seconds
      if (time < settings.initialDelaySeconds) continue;

      if ((time - settings.initialDelaySeconds) % settings.periodSeconds === 0) {
        const eventIndex = newTimeline.length;
        const originalEvent = timeline[eventIndex];
        const status: ProbeStatus = originalEvent ? originalEvent.status : 'Success';

        newTimeline.push({ time, status });

        if (status === 'Success') {
          consecutiveFailures = 0;
          consecutiveSuccesses++;
          if (currentPodStatus === 'Unhealthy' && consecutiveSuccesses >= settings.successThreshold) {
            currentPodStatus = 'Healthy';
            newLog.push(`[${time}s] Pod is now Healthy after ${consecutiveSuccesses} successful probe(s).`);
          }
        } else { // Failure
          consecutiveSuccesses = 0;
          consecutiveFailures++;
          newLog.push(`[${time}s] Probe failed (${consecutiveFailures}/${settings.failureThreshold}).`);
          if (currentPodStatus === 'Healthy' && consecutiveFailures >= settings.failureThreshold) {
            if (settings.probeType === 'liveness') {
                currentPodStatus = 'Restarting';
                newLog.push(`[${time}s] Liveness probe failed. Pod is being restarted.`);
                // In a real scenario, the timeline would reset here.
            } else {
                currentPodStatus = 'Unhealthy';
                newLog.push(`[${time}s] Readiness probe failed. Pod is now Unhealthy.`);
            }
          }
        }
      }
    }
    setTimeline(newTimeline);
    setPodStatus(currentPodStatus);
    setLog(newLog);
  }, [settings, timeline]);

  useEffect(() => {
    runSimulation();
  }, [settings]); // Rerun simulation if settings change

  const handleProbeClick = (index: number) => {
    const newTimeline = [...timeline];
    const currentStatus = newTimeline[index].status;
    newTimeline[index].status = currentStatus === 'Success' ? 'Failure' : 'Success';
    setTimeline(newTimeline);
    // Manually trigger a re-run of the simulation logic with the updated timeline
    runSimulation();
  };

  const resetSimulation = () => {
    setTimeline([]);
    runSimulation();
  }

  const getStatusColor = (status: PodStatus) => {
    if (status === 'Healthy') return 'bg-green-500';
    if (status === 'Unhealthy') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Kubernetes Probe Simulator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Probe Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Probe Type</label>
              <select value={settings.probeType} onChange={e => setSettings({...settings, probeType: e.target.value as any})} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                <option value="readiness">Readiness</option>
                <option value="liveness">Liveness</option>
              </select>
            </div>

            {Object.entries(settings).filter(([key]) => key !== 'probeType').map(([key, value]) => (
              <div key={key} className="mb-4">
                <label htmlFor={key} className="block text-sm font-medium text-gray-600 dark:text-gray-300">{key}</label>
                <input type="number" id={key} value={value} min={0} onChange={e => setSettings({...settings, [key]: parseInt(e.target.value, 10) || 0})} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
              </div>
            ))}
            <button onClick={resetSimulation} className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">Reset Simulation</button>
          </div>

          {/* Simulation Column */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Simulation</h2>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Pod Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getStatusColor(podStatus)}`}>{podStatus}</span>
              </div>
            </div>

            {/* Timeline */}
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Timeline (0s to 120s)</h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2 overflow-x-auto">
                <div className="flex h-24 items-center space-x-2">
                    {timeline.map((event, index) => (
                        <div key={index} className="flex flex-col items-center flex-shrink-0" style={{ marginLeft: index === 0 ? `${(event.time / 120) * 100}%` : '0' }}>
                            <button onClick={() => handleProbeClick(index)} className={`w-5 h-5 rounded-full cursor-pointer ${event.status === 'Success' ? 'bg-green-500' : 'bg-red-500'} hover:ring-2 ring-blue-400`}></button>
                            <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{event.time}s</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Log */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Event Log</h3>
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-y-auto">
                {log.map((entry, i) => <div key={i}>{entry}</div>)}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default KubernetesProbeSimulator;
