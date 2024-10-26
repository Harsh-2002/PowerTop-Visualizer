import React from 'react';
import { PowerTopData } from '../utils/parser';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CompareReportsProps {
  reports: PowerTopData[];
}

export function CompareReports({ reports }: CompareReportsProps) {
  const cpuUsageData = {
    labels: reports.map(r => new Date(r.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'CPU Usage %',
        data: reports.map(r => r.summary.cpuUsage),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const wakeupData = {
    labels: reports.map(r => new Date(r.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'System Wakeups/s',
        data: reports.map(r => r.summary.wakeups),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Report Comparison</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">CPU Usage Over Time</h3>
          <Line data={cpuUsageData} />
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">System Wakeups Over Time</h3>
          <Line data={wakeupData} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="p-2">Timestamp</th>
              <th className="p-2">CPU Usage</th>
              <th className="p-2">Wakeups</th>
              <th className="p-2">Top Process</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="p-2">{new Date(report.timestamp).toLocaleString()}</td>
                <td className="p-2">{report.summary.cpuUsage}%</td>
                <td className="p-2">{report.summary.wakeups}/s</td>
                <td className="p-2">{report.processes[0]?.description || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
