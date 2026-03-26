import React from 'react'

const Table = (props) => {
  return (
    <div className="table w-300">
              <table className='bg-zinc-900 border-2 border-gray-600 flex flex-col gap-3 p-5 rounded-md w-277'>
                <tr className='flex gap-57  '>
                  <th>{props.col1}</th>
                  <th>{props.col2}</th>
                  <th>{props.col3}</th>
                  <th>{props.col4}</th>
                </tr>
                <tr className='flex gap-55'>
                  <td>Aisha Khan</td>
                  <td>75%</td>
                  <td>23L-XXXX</td>
                  <td className='flex gap-3'>
                    <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                    <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                  </td>
                </tr >
                <tr className='flex gap-55'>
                  <td>Aisha Khan</td>
                  <td>75%</td>
                  <td>23L-XXXX</td>
                  <td className='flex gap-3'>
                    <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                    <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                  </td>
                </tr >
                <tr className='flex gap-55'>
                  <td>Aisha Khan</td>
                  <td>75%</td>
                  <td>23L-XXXX</td>
                  <td className='flex gap-3'>
                    <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                    <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                  </td>
                </tr >
              </table>

            </div>
  )
}

export default Table
