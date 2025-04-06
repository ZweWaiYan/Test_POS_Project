import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "../../axiosInstance";
import { FaFilter } from "react-icons/fa6";
import detail from "../../assets/detail.png";
import { FaAngleDown } from "react-icons/fa6";

import BillReportFilterModal from "./BillReportFilterModal";
import DetailModal from "./DetailModal";
import BillReportgenerateExcel from "./BillReportgenerateExcel";
import BillReportgeneratePDF from "./BillReportgeneratePDF";
import { jwtDecode } from "jwt-decode";

const fetchSaleData = async ({ queryKey }) => {
  const [, selectedStore] = queryKey;
  if (!selectedStore) return [];
  const { data } = await axiosInstance.get(`/api/viewreport?store=${selectedStore}`);
  return data;
};

const BillReport = () => {

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailModal, setDetailModal] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [storeData, setStoreData] = useState("");

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
  
  const [filterSearchText, setFilterSearchText] = useState("bill_id");
  const [filteredDate, setFilteredDate] = useState({
    selectedSingleDate: null,
    selectedStartDate: null,
    selectedEndDate: null,
    selectedAmount: null,
  });  

  const { data: saleData = [], isLoading, error } = useQuery({
    queryKey: ["saleData", storeData],
    queryFn: fetchSaleData,
  });  

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleDetail = (saleId) => {
    const item = saleData.find((row) => row.saleId === saleId);
    setCurrentDetail(item);
    setDetailModal(true);
  }

  const resetFilter = () => {
    setFilteredDate({
      selectedAmount: null,
      selectedSingleDate: null,
      selectedStartDate: null,
      selectedEndDate: null,
    });

    toast.success("successfully Clear Filtering!");
  }

  const filteredSaleDate = saleData.filter(item => {

    const matchesSearchText = filterSearchText === "bill_id"
      ? item.saleId?.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const d = new Date(item.date);
    const formattedDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

    const matchesFilters =
      (!filteredDate.selectedSingleDate || formattedDate === filteredDate.selectedSingleDate) &&
      (!filteredDate.selectedStartDate && !filteredDate.selectedEndDate || formattedDate >= filteredDate.selectedStartDate && formattedDate <= filteredDate.selectedEndDate) &&
      (!filteredDate.selectedAmount || item.amountPaid <= filteredDate.selectedAmount)

    return matchesSearchText && matchesFilters;
  })
    .sort((a, b) => filteredDate.selectedAmount ? a.amountPaid - b.amountPaid : new Date(b.date) - new Date(a.date))
    .map(({ date, ...rest }) => {
      const d = new Date(date);
      return {
        ...rest,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      };
    });

  const handlePrint = () => {
    BillReportgenerateExcel(filteredSaleDate.slice(0, 10));
  }


  const handleFilterFunc = (selectedSingleDate, selectedStartDate, selectedEndDate, selectedAmount) => {
    setFilteredDate({ selectedSingleDate, selectedStartDate, selectedEndDate, selectedAmount });
    toast.success("Filtered Successfully!");
  };

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col md:flex-row justify-between pb-7">
        <div className="grid grid-cols-1  gap-4 pr-3 w-full">
          <p className="col-span-1 text-3xl font-bold">{storeData}</p>
          <div className="flex md:flex-row flex-col w-full">
            <div className="flex md:flex-row flex-col w-full">
              <div className="w-full mr-3 flex items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-[#4FB1B4] has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                <select
                  value={storeData}
                  onChange={(e) => { setStoreData(e.target.value) }}
                  className="col-start-1 p-3 row-start-1 w-full  border-gray-300 appearance-none py-1.5 pr-7 text-base text-gray-500 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                >
                  <option value="storeA">Store A</option>
                  <option value="storeB">Store B</option>
                </select>
                <FaAngleDown
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 pl-2 mr-3 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
              </div>
              <div className="w-full flex mt-3 md:mt-0 items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-[#4FB1B4] has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                <input
                  type="text"
                  placeholder="Search Bill ID....."
                  onChange={(e) => { setSearchText(e.target.value); }}
                  className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base  text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4 md:mt-0 w-full">
              <FaFilter
                onClick={() => { setShowFilterModal(!showFilterModal) }}
                className="h-6 w-6 text-gray-500 ml-4 my-4 cursor-pointer"
              />
              <div>
                <button
                  onClick={resetFilter}
                  className="px-4 py-2 mr-5 h-[50px] bg-[#B9E5E6] text-black rounded border-[#45ACB1] text-sm"
                >
                  {/* <MdOutlineCreateNewFolder /> */}
                  Clear
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 h-[50px] bg-[#04C9D1] text-black rounded hover:bg-[#04E2EB] text-sm"
                >
                  {/* <MdOutlineCreateNewFolder /> */}
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        showFilterModal && (
          <BillReportFilterModal showModal={showFilterModal} closeModal={() => setShowFilterModal(false)} handleFilter={handleFilterFunc} />
        )
      }

      {
        showDetailModal && (
          <DetailModal showModal={showDetailModal} closeModal={() => setDetailModal(false)} item={currentDetail} storeData={storeData} />
        )
      }

      <div className="overflow-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {["ID", "Date", "Discount", "Cash Back", "Total", "Amount Paid", "Remain Balance", "Action"].map((heading) => (
                <th key={heading} className="px-2 md:px-4 py-2 border text-sm md:text-lg text-center bg-[#DBE8F8]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSaleDate.length > 0 ? (
              filteredSaleDate.map((data) => (
                <tr key={data.saleId}>
                  <td className="px-2 md:px-4 py-2 border text-center text-sm">{data.saleId}</td>
                  <td className="px-2 md:px-4 py-2 border text-center text-sm">
                    {data.date}
                  </td>
                  <td className="px-2 md:px-4 py-2 border text-center text-sm">{data.discount}</td>
                  <td className="px-2 md:px-4 py-2 border text-center text-sm">{data.cashBack}</td>
                  <td className="px-2 md:px-4 py-2 border text-center text-sm">{data.total}</td>
                  <td className="px-2 md:px-4 py-2 border text-center text-sm">{data.amountPaid}</td>
                  <td className="px-2 md:px-4 py-2 border text-center text-sm">{data.remainingBalance}</td>
                  <td className="px-2 md:px-4 py-2 border text-center border-gray-300">
                    <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                      <button
                        className="px-3 py-1 md:px-4 md:py-2 bg-[#6B7B96] text-white hover:bg-[#9db3d8] rounded text-xs md:text-sm"
                        onClick={() => handleDetail(data.saleId)}
                      >
                        <img className="w-5" src={detail} alt="" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="h-12">
                <td colSpan="10" className="px-4 py-2 border text-center text-gray-500 text-sm">
                  No matching sale found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div >
  );
};

export default BillReport;