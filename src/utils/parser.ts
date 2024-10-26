export interface PowerTopData {
  timestamp: string;
  systemInfo: {
    version: string;
    kernel: string;
    system: string;
    cpu: string;
    os: string;
  };
  summary: {
    powerConsumption: number;
    cpuUsage: number;
    runtime: number;
    wakeups: number;
    target: string;
    gpu: string;
    gfx: string;
    vfs: string;
  };
  processes: Array<{
    usage: string;
    wakeups: number;
    category: string;
    description: string;
  }>;
  devices: Array<{
    usage: string;
    name: string;
    type: string;
  }>;
  cpuStates: {
    package: Record<string, number>;
    cores: Array<Record<string, number>>;
    cpus: Array<{
      id: number;
      states: Record<string, { percentage: number; duration?: string }>;
    }>;
  };
}

export function parsePowerTopData(content: string, fileType: 'html' | 'csv'): PowerTopData {
  if (fileType === 'csv') {
    return parsePowerTopCsv(content);
  }
  return parsePowerTopHtml(content);
}

function parsePowerTopCsv(csvContent: string): PowerTopData {
  const cleanContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = cleanContent.split('\n').map(line => 
    line.split(';').map(cell => cell.trim())
  );
  
  const data: PowerTopData = {
    timestamp: '',
    systemInfo: {
      version: '',
      kernel: '',
      system: '',
      cpu: '',
      os: ''
    },
    summary: {
      powerConsumption: 0,
      cpuUsage: 0,
      runtime: 0,
      wakeups: 0,
      target: '1 units/s', // Default value if not found
      gpu: '0 ops/s',      // Default value if not found
      gfx: '0 wakeups/s',  // Default value if not found
      vfs: '0 ops/s'       // Default value if not found
    },
    processes: [],
    devices: [],
    cpuStates: {
      package: {},
      cores: [],
      cpus: []
    }
  };

  let currentSection = '';
  let isHeaderRow = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0 || !line[0]) continue;

    const firstCell = line[0].replace(/^[\s_]*/, '').replace(/[\s_]*$/, '');

    // System Information section
    if (firstCell.includes('System Information')) {
      currentSection = 'system';
      continue;
    }

    // Handle system information
    if (currentSection === 'system') {
      if (line.length >= 2) {
        const key = line[0];
        const value = line[1];

        if (key.includes('PowerTOP Version')) {
          data.systemInfo.version = value;
          data.timestamp = value;
        } else if (key.includes('Kernel Version')) {
          data.systemInfo.kernel = value;
        } else if (key.includes('System Name')) {
          data.systemInfo.system = value;
        } else if (key.includes('CPU Information')) {
          data.systemInfo.cpu = value;
        } else if (key.includes('OS Information')) {
          data.systemInfo.os = value;
        }
      }

      // Parse the summary line that contains Target, System, CPU, GPU, etc.
      if (line[0].includes('Target:')) {
        const summaryLine = line[0];
        const summaryParts = summaryLine.split(';');
        
        summaryParts.forEach(part => {
          const [key, value] = part.split(':').map(s => s.trim());
          
          switch (key) {
            case 'Target':
              data.summary.target = value || '1 units/s';
              break;
            case 'System':
              // Extract numeric value from "771.9 wakeup/s"
              const wakeups = parseFloat(value.replace('wakeup/s', '')) || 0;
              data.summary.wakeups = wakeups;
              break;
            case 'CPU':
              // Extract numeric value from "9.3% usage"
              const cpuUsage = parseFloat(value.replace('usage', '').replace('%', '')) || 0;
              data.summary.cpuUsage = cpuUsage;
              break;
            case 'GPU':
              data.summary.gpu = value || '0 ops/s';
              break;
            case 'GFX':
              data.summary.gfx = value || '0 wakeups/s';
              break;
            case 'VFS':
              data.summary.vfs = value || '0 ops/s';
              break;
          }
        });
      }
    }

    // Top Power Consumers section
    if (firstCell.includes('Top 10 Power Consumers')) {
      currentSection = 'processes';
      isHeaderRow = true;
      continue;
    }

    if (currentSection === 'processes' && line.length >= 4) {
      if (isHeaderRow) {
        isHeaderRow = false;
        continue;
      }
      
      // Skip header row and empty rows
      if (line[0] !== 'Usage' && line[0]) {
        const usage = line[0].trim();
        const wakeups = parseFloat(line[1]) || 0;
        const category = line[2].trim();
        const description = line[3].trim();

        if (description) { // Only add if we have a description
          data.processes.push({
            usage,
            wakeups,
            category,
            description
          });
        }
      }
    }

    // Device Power Report section
    if (firstCell.includes('Device Power Report')) {
      currentSection = 'devices';
      isHeaderRow = true;
      continue;
    }

    if (currentSection === 'devices' && line.length >= 2) {
      if (isHeaderRow) {
        isHeaderRow = false;
        continue;
      }
      
      if (line[0] !== 'Usage' && line[0]) { // Skip header row and empty rows
        const usage = line[0].trim();
        const name = line[1].trim();

        if (name) { // Only add if we have a name
          data.devices.push({
            usage,
            name,
            type: determineDeviceType(name)
          });
        }
      }
    }

    // CPU States section
    if (firstCell.includes('Processor Idle State Report')) {
      currentSection = 'cpuStates';
      continue;
    }

    if (currentSection === 'cpuStates') {
      if (line.length >= 2 && line[0].startsWith('C')) {
        const state = line[0].trim();
        const percentage = parseFloat(line[1].replace('%', '')) || 0;
        if (state && !isNaN(percentage)) {
          data.cpuStates.package[state] = percentage;
        }
      }
    }
  }

  return data;
}

function extractTimestamp(doc: Document): string {
  const sysInfo = doc.querySelector('.sys_info');
  const versionRow = Array.from(sysInfo?.querySelectorAll('tr') || [])
    .find(row => row.textContent?.includes('PowerTOP Version'));
  return versionRow?.querySelector('td')?.textContent?.trim() || new Date().toLocaleString();
}

function extractSystemInfo(doc: Document): PowerTopData['systemInfo'] {
  const sysInfo = doc.querySelector('.sys_info');
  const rows = Array.from(sysInfo?.querySelectorAll('tr') || []);
  
  return {
    version: extractTableCell(rows, 'PowerTOP Version'),
    kernel: extractTableCell(rows, 'Kernel Version'),
    system: extractTableCell(rows, 'System Name'),
    cpu: extractTableCell(rows, 'CPU Information'),
    os: extractTableCell(rows, 'OS Information')
  };
}

function extractTableCell(rows: Element[], label: string): string {
  const row = rows.find(row => row.textContent?.includes(label));
  return row?.querySelector('td')?.textContent?.trim() || '';
}

function extractSummary(doc: Document): PowerTopData['summary'] {
  const summaryItems = Array.from(doc.querySelectorAll('li.summary_list'));
  
  const getValue = (text: string) => {
    const item = summaryItems.find(li => li.textContent?.includes(text));
    if (!item) return '';
    const value = item.textContent?.split(':')[1]?.trim() || '';
    return value;
  };

  // Extract values with proper parsing
  const cpuValue = getValue('CPU');
  const systemValue = getValue('System');
  const targetValue = getValue('Target');
  const gpuValue = getValue('GPU');
  const gfxValue = getValue('GFX');
  const vfsValue = getValue('VFS');

  return {
    powerConsumption: 0,
    cpuUsage: parseFloat(cpuValue.replace('usage', '').replace('%', '')) || 0,
    runtime: 0,
    wakeups: parseFloat(systemValue.replace('wakeup/s', '')) || 0,
    target: targetValue || '1 units/s',
    gpu: gpuValue || '0 ops/s',
    gfx: gfxValue || '0 wakeups/s',
    vfs: vfsValue || '0 ops/s'
  };
}

function extractProcesses(doc: Document): PowerTopData['processes'] {
  const table = doc.querySelector('#software table');
  if (!table) return [];

  return Array.from(table.querySelectorAll('tr.emph1'))
    .map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 4) return null;

      return {
        usage: cells[0]?.textContent?.trim() || '0%',
        wakeups: parseFloat(cells[1]?.textContent?.trim() || '0'),
        category: cells[5]?.textContent?.trim() || 'unknown',
        description: cells[6]?.textContent?.trim() || ''
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

function extractDevices(doc: Document): PowerTopData['devices'] {
  const table = doc.querySelector('#devinfo table');
  if (!table) return [];

  return Array.from(table.querySelectorAll('tr'))
    .slice(1) // Skip header row
    .map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const usage = cells[0]?.textContent?.trim() || '';
      const name = cells[1]?.textContent?.trim() || '';
      
      return {
        usage,
        name,
        type: determineDeviceType(name)
      };
    })
    .filter(device => device.name !== '');
}

function extractCpuStates(doc: Document): PowerTopData['cpuStates'] {
  const packageStates: Record<string, number> = {};
  const coreStates: Array<Record<string, number>> = [];
  const cpuStates: Array<{
    id: number;
    states: Record<string, { percentage: number; duration?: string }>;
  }> = [];

  // Extract package states
  const packageTable = doc.querySelector('#cpuidle table');
  if (packageTable) {
    Array.from(packageTable.querySelectorAll('tr')).forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length === 2) {
        const state = cells[0]?.textContent?.trim() || '';
        const value = parseFloat(cells[1]?.textContent?.replace('%', '').trim() || '0');
        if (state && !isNaN(value)) {
          packageStates[state] = value;
        }
      }
    });
  }

  return {
    package: packageStates,
    cores: coreStates,
    cpus: cpuStates
  };
}

function determineDeviceType(name: string): string {
  if (name.includes('CPU')) return 'cpu';
  if (name.includes('GPU') || name.includes('Graphics')) return 'gpu';
  if (name.includes('USB')) return 'usb';
  if (name.includes('Network') || name.includes('nic:')) return 'network';
  if (name.includes('Audio')) return 'audio';
  if (name.includes('PCI')) return 'pci';
  return 'other';
}

function parsePowerTopHtml(htmlContent: string): PowerTopData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const data: PowerTopData = {
    timestamp: '',
    systemInfo: extractSystemInfo(doc),
    summary: extractSummary(doc),
    processes: extractProcesses(doc),
    devices: extractDevices(doc),
    cpuStates: extractCpuStates(doc)
  };

  // Extract timestamp
  data.timestamp = extractTimestamp(doc);

  // Ensure consistent default values if data is missing
  if (!data.summary.target) data.summary.target = '1 units/s';
  if (!data.summary.gpu) data.summary.gpu = '0 ops/s';
  if (!data.summary.gfx) data.summary.gfx = '0 wakeups/s';
  if (!data.summary.vfs) data.summary.vfs = '0 ops/s';

  return data;
}
