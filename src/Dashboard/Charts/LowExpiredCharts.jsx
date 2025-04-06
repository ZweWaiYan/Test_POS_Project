import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";

import { jwtDecode } from "jwt-decode";



const fetchSaleData = async ({ queryKey }) => {    
    const [, selectedStore] = queryKey;

    console.log("queryKey" , selectedStore);
    if (!selectedStore) return [];
    const { data } = await axiosInstance.get(`/api/allitems?store=${selectedStore}`);

    return data;
};

const LowExpiredCharts = () => {

    const [storeData, setStoreData] = useState("");

    // Just StoreData
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setStoreData(decodedToken.branch);
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    const [expiredItems, setExpiredItems] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

    const { data: saleData = [], isLoading, error } = useQuery({
        queryKey: ["saleData", storeData],
        queryFn: fetchSaleData,
    });

    useEffect(() => {
        if (Array.isArray(saleData)) {
            const expired = saleData.filter(item => item.is_expired === 1);
            const lowStock = saleData.filter(item => item.quantity <= 5);

            setExpiredItems((prev) => JSON.stringify(prev) === JSON.stringify(expired) ? prev : expired);
            setLowStockItems((prev) => JSON.stringify(prev) === JSON.stringify(lowStock) ? prev : lowStock);
        }
    }, [saleData]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className='rounded-lg border w-auto h-24 shadow-md'>
                <div className="p-3">
                    <p>Expired</p>
                    <div className="flex justify-center items-center pt-3 p-3 ">
                        <p className='font-bold text-3xl justify-center'>{expiredItems.length}</p>
                    </div>
                </div>
            </div>

            <div className='rounded-lg border w-auto h-24 shadow-md'>
                <div className="p-3">
                    <p>Low Stock</p>
                    <div className="flex justify-center items-center pt-3 p-3 ">
                        <p className='font-bold text-3xl justify-center'>{lowStockItems.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LowExpiredCharts;
