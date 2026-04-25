import React from 'react'

const Table = ({ columns, rows }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border-2 border-blue-600/50 shadow-2xl bg-zinc-900/30 backdrop-blur">
      <table className="w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">

        {/* Header */}
        <thead>
          <tr className="border-b-2 border-blue-600/50 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-6 py-4 text-left font-bold text-blue-100 text-sm uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows && rows.map((row, i) => (
            <tr 
              key={i} 
              className="border-b border-gray-700/50 hover:bg-zinc-700/50 transition duration-200"
            >
              {Object.values(row).map((value, j) => (
                <td 
                  key={j} 
                  className="px-6 py-4 text-gray-200 text-sm font-medium"
                >
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
