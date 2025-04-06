import React, { useEffect, useState } from 'react'
import SaleCharts from './Charts/SaleCharts'
import MostSellCharts from './Charts/MostSellCharts'
import LowExpiredCharts from './Charts/LowExpiredCharts';

import { jwtDecode } from "jwt-decode";

const Dashboard = () => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className='col-span-2'>
        <SaleCharts/>
      </div>
      <div className='grid grid-cols-1 gap-4 mx-3 lg:mr-3'>
        <LowExpiredCharts />
        <MostSellCharts />
      </div>
    </div>
  );

}

export default Dashboard