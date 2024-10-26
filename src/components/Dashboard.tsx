import React from 'react';
import { 
  ArrowLeft, Battery, Cpu, Clock, Zap, Wifi, Disc, 
  Speaker, Usb, Server, Globe, Terminal, HardDrive,
  MonitorSmartphone, Shield
} from 'lucide-react';
import { PowerTopData } from '../utils/parser';
import InfoTooltip from './InfoTooltip';

interface DashboardProps {
  data: PowerTopData;
  onReset: () => void;
}

function Dashboard({ data, onReset }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Upload Another Report</span>
        </button>
        <div className="text-right">
          <p className="text-sm text-gray-400">Report Generated</p>
          <p className="font-medium">{data.timestamp}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          System Information
          <InfoTooltip content="Detailed system specifications and environment information" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SystemInfoRow
              icon={<Terminal className="w-4 h-4 text-purple-400" />}
              label="Version"
              value={data.systemInfo.version}
              tooltip="PowerTop version and generation timestamp"
            />
            <SystemInfoRow
              icon={<Server className="w-4 h-4 text-blue-400" />}
              label="System"
              value={data.systemInfo.system}
              tooltip="System hardware information"
            />
            <SystemInfoRow
              icon={<Shield className="w-4 h-4 text-green-400" />}
              label="OS"
              value={data.systemInfo.os}
              tooltip="Operating system details"
            />
          </div>
          <div className="space-y-2">
            <SystemInfoRow
              icon={<Cpu className="w-4 h-4 text-red-400" />}
              label="CPU"
              value={data.systemInfo.cpu}
              tooltip="Processor specifications"
            />
            <SystemInfoRow
              icon={<Globe className="w-4 h-4 text-yellow-400" />}
              label="Kernel"
              value={data.systemInfo.kernel}
              tooltip="Linux kernel version"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Battery className="w-6 h-6 text-green-400" />}
          title="System Wakeups"
          value={data.summary.wakeups}
          unit="wakeups/s"
          tooltip="Number of times the system wakes up from sleep states per second. Lower is better for power consumption."
        />
        <StatCard
          icon={<Cpu className="w-6 h-6 text-blue-400" />}
          title="CPU Usage"
          value={data.summary.cpuUsage}
          unit="%"
          tooltip="Current processor utilization across all cores"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-purple-400" />}
          title="Power Target"
          value={data.summary.target}
          tooltip="System's power consumption target in watts"
        />
        <StatCard
          icon={<Zap className="w-6 h-6 text-yellow-400" />}
          title="GPU Operations"
          value={data.summary.gpu}
          tooltip="Graphics processing operations per second"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessTable
          title="Top Power Consumers"
          processes={data.processes.slice(0, 10)}
          tooltip="Processes consuming the most power, sorted by usage"
        />
        <DeviceTable
          title="Device Power Management"
          devices={data.devices.filter(d => d.usage !== '0.0%').slice(0, 10)}
          tooltip="Power consumption statistics for various system devices"
        />
      </div>

      {data.cpuStates.package && Object.keys(data.cpuStates.package).length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            CPU Power States
            <InfoTooltip content="Processor power state (C-state) residency showing how much time the CPU spends in different power saving states" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.cpuStates.package).map(([state, value]) => (
              <div key={state} className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
                <span className="text-gray-400">{state}</span>
                <span className="font-medium">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SystemInfoRow({ icon, label, value, tooltip }: { icon: React.ReactNode; label: string; value: string; tooltip: string }) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <span className="text-gray-400">{label}:</span>
      <span className="text-white">{value}</span>
      <InfoTooltip content={tooltip} />
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  unit, 
  tooltip 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: number | string; 
  unit?: string;
  tooltip: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-900/50 p-3 rounded-lg">{icon}</div>
        <div className="flex items-center">
          <span className="text-2xl font-bold">
            {value}
            {unit && <span className="text-gray-400 text-lg ml-1">{unit}</span>}
          </span>
          <InfoTooltip content={tooltip} />
        </div>
      </div>
      <p className="text-gray-400">{title}</p>
    </div>
  );
}

function ProcessTable({ 
  title, 
  processes,
  tooltip 
}: { 
  title: string; 
  processes: PowerTopData['processes'];
  tooltip: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <InfoTooltip content={tooltip} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Usage</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Wakeups/s</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {processes.map((process, idx) => (
              <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-sm">{process.usage}</td>
                <td className="px-6 py-4 text-sm">{process.wakeups}</td>
                <td className="px-6 py-4 text-sm">{process.category}</td>
                <td className="px-6 py-4 text-sm whitespace-normal">{process.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeviceTable({ 
  title, 
  devices,
  tooltip 
}: { 
  title: string; 
  devices: PowerTopData['devices'];
  tooltip: string;
}) {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'gpu': return <MonitorSmartphone className="w-4 h-4 text-purple-400" />;
      case 'network': return <Wifi className="w-4 h-4 text-green-400" />;
      case 'audio': return <Speaker className="w-4 h-4 text-yellow-400" />;
      case 'usb': return <Usb className="w-4 h-4 text-red-400" />;
      case 'pci': return <HardDrive className="w-4 h-4 text-indigo-400" />;
      default: return <Disc className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <InfoTooltip content={tooltip} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Usage</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Device</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {devices.map((device, idx) => (
              <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(device.type)}
                    <span>{device.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{device.usage}</td>
                <td className="px-6 py-4 text-sm whitespace-normal">{device.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;