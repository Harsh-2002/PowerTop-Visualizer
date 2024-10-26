import React from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
}

function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <div className="group relative inline-block">
      <Info className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help ml-2" />
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute z-10 w-64 p-2 mt-2 text-sm text-gray-100 bg-gray-800 border border-gray-700 rounded-lg shadow-xl -translate-x-1/2 left-1/2">
        {content}
      </div>
    </div>
  );
}

export default InfoTooltip;