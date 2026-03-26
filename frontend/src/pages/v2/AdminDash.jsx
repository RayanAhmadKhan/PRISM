import React from 'react'
import Navbar from '../../components/Navbar'
import LeftNav from '../../components/LeftNav'

const AdminDash = () => {
    return (
        <div className='min-h-dvh w-full'>
            <Navbar title={"Admin"} user={"Ad Ali Liaqat"} />

            <div className="body bg-zinc-900 flex">
                <LeftNav btn1={"Dashboard"} btn2={"User Management"} btn3={"Audit Logs"} btn4={"Settings"} />

                <div className="container h-screen flex flex-col bg-zinc-800">
                    <div className="case-container flex flex-col gap-5 m-5">
                        <h1 className='font-bold text-xl'>User Management</h1>

                        <div className="table01 w-300">
                            <table className='bg-zinc-900 border-2 border-gray-600 flex flex-col gap-3 p-5 rounded-md'>
                                <tr className='flex gap-69'>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                <tr className='flex gap-64'>
                                    <td>Aisha Khan</td>
                                    <td>75%</td>
                                    <td>23L-XXXX</td>
                                    <td className='flex gap-3'>
                                        <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                                        <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                                    </td>
                                </tr >
                                <tr className='flex gap-64'>
                                    <td>Aisha Khan</td>
                                    <td>75%</td>
                                    <td>23L-XXXX</td>
                                    <td className='flex gap-3'>
                                        <button className='bg-blue-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Approve</button>
                                        <button className='bg-red-700 p-1 w-20 h-8 font-bold rounded-sm cursor-pointer hover:bg-red-900'>Reject</button>
                                    </td>
                                </tr >
                                <tr className='flex gap-64'>
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
                    </div>

                    <div className="audit-logs-container border-2 border-gray-600 bg-zinc-900 flex flex-col gap-5 m-5 p-5 w-111 rounded-md">
                        <h1 className='font-bold text-xl'>Audit Logs</h1>

                        <div className="logs">
                            <p>Ad Alex: Add User: Abdullah</p>
                        </div>

                        <div className="logs">
                            <p>Ad Alex: Add User: Abdullah</p>
                        </div>

                        <div className="export-btn">
                            <button className='bg-blue-700 p-1 w-100 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>Export Logs</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDash
