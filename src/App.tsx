import React, { useState, useEffect } from 'react';
import { Upload, Battery, Cpu, BarChart3, Clock, AlertCircle, Terminal, FileDown, Heart } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { PowerTopData, parsePowerTopData } from './utils/parser';

function App() {
  const [powerTopData, setPowerTopData] = useState<PowerTopData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (content: string, fileType: 'html' | 'csv') => {
    try {
      const data = parsePowerTopData(content, fileType);
      setPowerTopData(data);
      setError(null);
    } catch (err) {
      setError(`Failed to parse PowerTop ${fileType.toUpperCase()} file. Please ensure it's a valid export.`);
      setPowerTopData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header role="banner">
        <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center items-center space-x-2">
              <a 
                href="/" 
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                aria-label="PowerTop Visualizer Home"
              >
                <Battery className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" aria-hidden="true" />
                <h1 className="text-xl sm:text-2xl font-bold">PowerTop Visualizer</h1>
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!powerTopData ? (
          <>
            <section aria-labelledby="hero-heading" className="text-center mb-16">
              <h2 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Visualize Your System's Power Consumption
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Analyze system power usage with beautiful visualizations and detailed insights.
              </p>
              
              {/* Terminal Section */}
              <div className="max-w-2xl mx-auto mb-12 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-sm text-gray-400">Terminal</span>
                </div>
                <div className="p-4 text-left font-mono text-sm">
                  <TypewriterTerminal />
                </div>
              </div>
            </section>

            <section aria-labelledby="features-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <h2 id="features-heading" className="sr-only">Features</h2>
              <FeatureCard
                icon={<Cpu className="w-6 h-6 text-blue-400" />}
                title="CPU Usage Analysis"
                description="Detailed breakdown of processor utilization and power states"
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6 text-purple-400" />}
                title="Power Consumption"
                description="Visualize power usage patterns and identify power-hungry processes"
              />
              <FeatureCard
                icon={<Terminal className="w-6 h-6 text-green-400" />}
                title="Process Monitoring"
                description="Track process runtime and system wakeup events"
              />
              <FeatureCard
                icon={<FileDown className="w-6 h-6 text-yellow-400" />}
                title="Multiple Formats"
                description="Support for both HTML and CSV PowerTop export formats"
              />
            </section>

            <section aria-labelledby="upload-heading" className="max-w-2xl mx-auto">
              <h2 id="upload-heading" className="sr-only">Upload PowerTop Report</h2>
              <FileUpload onUpload={handleFileUpload} />
              
              {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-200">{error}</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <Dashboard data={powerTopData} onReset={() => setPowerTopData(null)} />
        )}

        <footer role="contentinfo" className="mt-16 text-center text-sm text-gray-400">
          <a 
            href="https://anuragvishwakarma.webflow.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:text-gray-300 transition-colors"
          >
            Built with <Heart className="w-4 h-4 mx-1 text-red-400" /> by Anurag Vishwakarma
          </a>
          <div className="mt-2">
            © {new Date().getFullYear()} PowerTop Visualizer. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800/70 transition-colors">
      <div className="flex items-center space-x-3 mb-3">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function TypewriterTerminal() {
  const [currentCommand, setCurrentCommand] = useState(0);
  const commands = [
    { prompt: '# Install PowerTop', command: 'sudo apt-get install powertop' },
    { prompt: '# Run PowerTop and export HTML report', command: 'sudo powertop --html=powertop.html' },
    { prompt: '# Run PowerTop and export CSV report', command: 'sudo powertop --csv=powertop.csv' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCommand((prev) => (prev + 1) % commands.length);
    }, 3000); // Reduced from 4000 to 3000ms

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      {commands.map((cmd, index) => (
        <div
          key={index}
          className={`transition-opacity duration-300 ${  // Reduced from 500 to 300ms
            index === currentCommand ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <div>
            <span className="text-green-400">$</span>
            <span className="text-gray-400"> {cmd.prompt}</span>
          </div>
          <div className="text-white typewriter-text">
            {index === currentCommand && (
              <span className="inline-flex">
                {cmd.command}
                <span className="ml-1 animate-pulse">▋</span>
              </span>
            )}
            {index !== currentCommand && cmd.command}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
