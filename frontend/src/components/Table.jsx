import React from 'react'

const Table = ({ columns, rows }) => {
  return (
    <div className="w-full overflow-x-auto border-2 border-gray-600 rounded-md">
      <table className="w-full bg-zinc-900">

        {/* Header */}
        <thead>
          <tr className="border-b border-gray-600">
            {columns.map((col, index) => (
              <th key={index} className="p-3 text-left">{col}</th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows && rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-700">
              {Object.values(row).map((value, j) => (
                <td key={j} className="p-3">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )
}

export default Table