import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import ReactApexChart from "react-apexcharts";
import axiosInstance from '../../axiosInstance';

import { jwtDecode } from "jwt-decode";

const SaleCharts = () => {

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
                const currentYear = now.getFullYear();

                const response = await axiosInstance.get(`api/yearlyreport?store=${selectedStore}&year=${currentYear}`);
                setChartData(response.data.monthlyReport || []);
            } catch (err) {
                console.error("Error fetching sales data:", err);
            }
        };

        fetchSaleData();
    }, [selectedStore]);

    const chartOptions = {
        series: [{
            name: 'Sale',
            data: chartData === undefined ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : chartData.map((item) => {
                return item.totalAmountPaid
            })
        }],
        options: {
            chart: {
                height: 350,
                type: 'bar',
            },
            plotOptions: {
                bar: {
                    borderRadius: 10,
                    dataLabels: {
                        position: 'top', // top, center, bottom
                    },
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val + " Ks";
                },
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ["#304758"]
                }
            },

            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                position: 'top',
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    fill: {
                        type: 'gradient',
                        gradient: {
                            colorFrom: '#D8E3F0',
                            colorTo: '#BED1E6',
                            stops: [0, 100],
                            opacityFrom: 0.4,
                            opacityTo: 0.5,
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                }
            },
            yaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    show: false,
                    formatter: function (val) {
                        return val + "Ks";
                    }
                }

            },
            // title: {
            //     text: 'Monthly Inflation in Argentina, 2002',
            //     floating: true,
            //     offsetY: 330,
            //     align: 'center',
            //     style: {
            //         color: '#444'
            //     }
            // }
        },
    };

    return (
        <div className='w-auto h-fit bg-white rounded-lg p-7 my-6 mx-3 shadow-lg'>
            <h2 className="text-2xl font-bold  ml-3 my-3 text-[#444]">Monthly Sale Charts</h2>
            <ReactApexChart
                options={chartOptions.options}
                series={chartOptions.series}
                type="bar"
                height={350}
            />
        </div>
    );
};


export default SaleCharts;
