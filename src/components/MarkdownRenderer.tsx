import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple, robust Markdown parser
  const renderFormattedText = (text: string) => {
    // Process bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-slate-800">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-xs border border-blue-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return null;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(1).filter(r => !r.every(c => c.match(/^:?-+:?$/)));

    const tableEl = (
      <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs border-collapse bg-white">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              {headerRow.map((col, idx) => (
                <th key={idx} className="p-2.5 font-semibold border-r last:border-r-0 border-slate-200">
                  {renderFormattedText(col.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 border-r last:border-r-0 border-slate-100 text-slate-700">
                    {renderFormattedText(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
    return tableEl;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is part of a markdown table (e.g. | col1 | col2 |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.trim().split('|').slice(1, -1);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      elements.push(flushTable(i));
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-base font-bold text-slate-800 mt-4 mb-2 flex items-center gap-1.5">
          {renderFormattedText(line.replace('### ', ''))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-blue-900 mt-5 mb-2 pb-1 border-b border-slate-200">
          {renderFormattedText(line.replace('## ', ''))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-xl font-extrabold text-blue-950 mt-6 mb-3">
          {renderFormattedText(line.replace('# ', ''))}
        </h2>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm text-slate-700 my-1 pl-1 leading-relaxed">
          {renderFormattedText(line.trim().slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 text-sm text-slate-700 my-1.5 leading-relaxed">
            <span className="font-semibold text-blue-700 shrink-0">{match[1]}.</span>
            <span>{renderFormattedText(match[2])}</span>
          </div>
        );
      }
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-blue-600 pl-3 py-1 my-2 bg-blue-50/50 rounded-r text-sm text-slate-700 italic">
          {renderFormattedText(line.replace('> ', ''))}
        </blockquote>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-slate-700 my-1 leading-relaxed">
          {renderFormattedText(line)}
        </p>
      );
    }
  }

  if (inTable) {
    elements.push(flushTable(lines.length));
  }

  return <div className="space-y-0.5 leading-normal">{elements}</div>;
};
