import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuBox, LuUser, LuMessageSquare, LuCalendar, LuSettings } from 'react-icons/lu';
import { FaSuitcase } from 'react-icons/fa';
import { TbUser } from 'react-icons/tb';
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlinePointOfSale } from "react-icons/md";
import { FaListUl } from "react-icons/fa6";

const Sidebar = () => {
  const [activeLink, setActiveLink] = useState(0);
  const navigate = useNavigate();

  const handleLinkClick = (index) => {
    setActiveLink(index);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
  }
};

  const SIDERBAR_LINKS = [
    { id: 1, path: "/Dashboard", name: "Dashboard", icon: LuBox },
    { id: 2, path: "/itemList", name: "ItemList", icon: FaListUl },
    { id: 3, path: "/billList", name: "BillList", icon: MdOutlinePointOfSale },
    { id: 4, path: "/billReport", name: "BillReport", icon: TbReportAnalytics },
  ];

  return (
    <div className='w-16 lg:w-56 fixed left-0 top-0 h-full border-r pt-8 px-4 bg-slate-200'>
      <ul className='mt-6 space-y-4'>
        {
          SIDERBAR_LINKS.map((link, index) => (
            <li
              key={index}
              className={`font-medium rounded-md py-2 px-5 hover:bg-gray-300 hover:text-indigo-500 ${activeLink === index ? "bg-indigo-200 text-indigo-500" : ""}`}
            >
              <Link
                to={link.path}
                className='flex justify-center lg:justify-start items-center lg:space-x-5'
                onClick={() => handleLinkClick(index)}
              >
                <span className=''>{link.icon()}</span>
                <span className='text-1xl text-gray-500 hidden lg:flex'>{link.name}</span>
              </Link>
            </li>
          ))
        }
        <li       
          className={`font-medium rounded-md py-2 px-5 hover:bg-gray-300 hover:text-indigo-500`}
        >
          <Link
            className='flex justify-center lg:justify-start items-center lg:space-x-5'
            onClick={handleLogout}
          >
            <span className=''><LuSettings size={18} /></span>
            <span className='text-1xl text-gray-500 hidden lg:flex'>Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

// onClick={handleLogout}  <LuSettings size={20} />
