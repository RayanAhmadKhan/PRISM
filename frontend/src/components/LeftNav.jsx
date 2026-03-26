import React from 'react'
import { Link } from 'react-router-dom'

const LeftNav = (props) => {
    return (
        <div className="left-nav w-[15%] flex items-center justify-start py-6 gap-5 flex-col bg-zinc-900">
            <Link className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>{props.btn1}</Link>
            <Link className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>{props.btn2}</Link>
            <Link className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>{props.btn3}</Link>
            <Link className='bg-blue-700 flex justify-center p-1 w-40 font-bold rounded-sm cursor-pointer hover:bg-blue-900'>{props.btn4}</Link>
        </div>
    )
}

export default LeftNav
