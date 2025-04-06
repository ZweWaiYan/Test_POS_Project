import React, {useState, useEffect} from 'react'
import { GoBell } from 'react-icons/go'
import boy from './assets/boy.png'

const Header = () => {
  return (
    <div className='flex justify-end items-center p-4'>      
      <div>
        <div className='flex items-center space-x-5'>         
          <div className='flex items-center space-x-5'>
            <button className='relative text-2xl text-gray-600'>
              <GoBell size={32} />
              <span className='absolute top-0 right-0 -mt-1 -mr-1 flex justify-center items-center bg-indigo-600 text-white font-semibold text-[10px] w-5 h-4 rounded-full border-2 border-white'>9</span>
            </button>
            <img className='w-8 g-8 rounded-full border-2' src={boy} alt='' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header