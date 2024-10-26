import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PowerTopData } from './parser';

export async function exportToPDF(data: PowerTopData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const width = pdf.internal.pageSize.getWidth();
  
  // Add title
  pdf.setFontSize(20);
  pdf.text('PowerTop Report', width/2, 20, { align: 'center' });
  
  // Add timestamp
  pdf.setFontSize(12);
  pdf.text(`Generated: ${new Date(data.timestamp).toLocaleString()}`, width/2, 30, { align: 'center' });

  // System Information
  pdf.setFontSize(16);
  pdf.text('System Information', 20, 45);
  pdf.setFontSize(10);
  pdf.text([
    `OS: ${data.systemInfo.os}`,
    `CPU: ${data.systemInfo.cpu}`,
    `Kernel: ${data.systemInfo.kernel}`,
  ], 20, 55);

  // Summary
  pdf.setFontSize(16);
  pdf.text('Summary', 20, 85);
  pdf.setFontSize(10);
  pdf.text([
    `CPU Usage: ${data.summary.cpuUsage}%`,
    `System Wakeups: ${data.summary.wakeups}/s`,
    `Target: ${data.summary.target}`,
    `GPU: ${data.summary.gpu}`,
  ], 20, 95);

  // Top Processes
  pdf.setFontSize(16);
  pdf.text('Top Processes', 20, 125);
  pdf.setFontSize(10);
  
  const processRows = data.processes.slice(0, 5).map(p => 
    `${p.usage} - ${p.description} (${p.wakeups} wakeups/s)`
  );
  pdf.text(processRows, 20, 135);

  return pdf;
}
