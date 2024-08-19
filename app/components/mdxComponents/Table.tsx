import React from "react";

export function Table({ data }) {
  return (
    <div className="max-w-full overflow-x-auto -webkit-overflow-scrolling-touch">
      <table className="w-full border text-xs lg:text-sm rounded-md overflow-hidden">
        <thead>
          <tr className="bg-[var(--callout-bg)] dark:bg-[var(--card-bg)]">
            {data.headers.map((header, index) => (
              <th
                key={index}
                className={`border border-[var(--code-border)] dark:border-[var(--code-border)] px-4 py-2 text-left font-semibold text-[var(--text-color)] dark:text-[var(--text-color)] ${
                  index === 0
                    ? "rounded-tl-lg"
                    : index === data.headers.length - 1
                    ? "rounded-tr-lg"
                    : ""
                }`}
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
              className={
                index % 2 === 0
                  ? "bg-[var(--row-odd-bg-color)] dark:bg-[var(--row-even-bg-color)]"
                  : "bg-[var(--row-even-bg-color)] dark:bg-[var(--row-odd-bg-color)]"
              }
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`border border-[var(--code-border)] dark:border-[var(--code-border)] px-4 py-2 text-[var(--text-color)] dark:text-[var(--text-color)] ${
                    index === data.rows.length - 1 && cellIndex === 0
                      ? "rounded-bl-lg"
                      : ""
                  } ${
                    index === data.rows.length - 1 &&
                    cellIndex === row.length - 1
                      ? "rounded-br-lg"
                      : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
