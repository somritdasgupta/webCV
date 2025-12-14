import React from "react";

export function Table({ data }) {
  return (
    <div className="my-8">
      <div className="max-w-full overflow-x-auto -webkit-overflow-scrolling-touch bg-transparent border border-[var(--callout-border)] rounded-lg">
        <table className="w-full text-sm bg-transparent">
          <thead>
            <tr className="border-b border-[var(--callout-border)] bg-[var(--callout-border)]/5">
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left font-semibold text-[var(--text-color)] bg-transparent"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[var(--callout-border)]/30 hover:bg-[var(--callout-border)]/5 transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-[var(--text-p)] bg-transparent"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
