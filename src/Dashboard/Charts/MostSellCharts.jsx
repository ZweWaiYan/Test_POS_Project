import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import ReactApexChart from "react-apexcharts";
import axiosInstance from '../../axiosInstance';

import { jwtDecode } from "jwt-decode";

const MostSellCharts = () => {

  const [chartData, setChartData] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setSelectedStore(decodedToken.role !== 'admin' ? decodedToken.branch : 'storeA');
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  // Fetch sales data when `selectedStore` is updated
  useEffect(() => {
    if (!selectedStore) return;

    const fetchSaleData = async () => {
      try {

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const response = await axiosInstance.get(`api/topsellers?store=${selectedStore}&month=${currentMonth}&year=${currentYear}`);
        console.log("response", response);
        setChartData(response.data.top5BestSellers || []);
      } catch (err) {
        console.error("Error fetching sales data:", err);
      }
    };

    fetchSaleData();
  }, [selectedStore]);

  const chartOptions = {
    series: [{
      name: 'Items',
      data: chartData === undefined ? [0, 0, 0, 0, 0] : chartData.map((item) => {
        return item.totalQuantity
      })
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: chartData === undefined ? ["item 1", "item 2", "item 3", "item 4", "item 5"] : chartData.map((item) => {
          return item.name
        }),
      }
    },
  };

  return (
    <div className='w-full h-fit bg-white rounded-lg p-4 md:mr-3 mb-5 shadow-lg'>
      <h2 className="text-2xl font-bold ml-3 my-1 text-[#444]">Monthly Selled Charts</h2>
      <ReactApexChart
        options={chartOptions.options}
        series={chartOptions.series}
        type="bar"
        height={280}
      />
    </div>
  );
};


export default MostSellCharts;
