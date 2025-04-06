import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import DeleteModal from "./DeleteModal";
import Modal from "./Modal";
import CategoryModal from "./CategoryModal";

import { FaFilter } from "react-icons/fa6";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa6";
import { TbEdit } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineCreateNewFolder } from "react-icons/md";

import FilterModal from "./FilterModal";
import { filter } from "framer-motion/client";
import axiosInstance from "../axiosInstance";
import { jwtDecode } from "jwt-decode";
import AlertModal from "./AlertModal";

const fetchSaleData = async (store) => {
  const { data } = await axiosInstance.get(`/api/allitems?store=${store}`);
  return data;
};

const ItemList = () => {
  const [selectedStore, setSelectedStore] = useState("");
  const [expiredItems, setExpiredItems] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role !== 'admin') {
          setSelectedStore(decodedToken.branch);
        } else {
          setSelectedStore('storeA')
        }

      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const { data: saleData, isLoading, error } = useQuery({
    queryKey: ["saleData", selectedStore],
    queryFn: () => fetchSaleData(selectedStore),
    enabled: selectedStore !== "",
  });  
  
  useEffect(() => {
    if (saleData) {
      const expired = saleData.filter(item => item.is_expired === 1);
      setExpiredItems(expired);

      const lowStock = saleData.filter(item => item.quantity <= 5);
      setLowStockItems(lowStock);

      if (expired.length > 0 || lowStock.length > 0) {
        setShowAlertModal(true);
      }
    }
  }, [saleData]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [currentItem, setCurrentItem] = useState(null);
  const [deleteCurrentItem, setDeleteCurrentItem] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterSearchText, setFilterSearchText] = useState("item_code");
  const [filteredDate, setFilteredDate] = useState({
    selectedExpireDate: null,
    selectedPrice: null,
    selectedQty: null,
    selectedExpired: null,
    selectedAlerted: null,
    selectedCategory: null
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleCreate = () => {
    setCurrentItem(null);
    setShowModal(true);
  };

  const handleEdit = (_id) => {
    const item = saleData.find((row) => row._id === _id);
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleDelete = (_id) => {
    const item = saleData.find((row) => row._id === _id);
    setDeleteCurrentItem(item);
    setShowDeleteModal(true);
    setSelectedStore(selectedStore);
  };

  const handleCategory = () => {
    setShowCategoryModal(true);
  }

  const doCreate = () => {
    console.log("do save");
  };

  const doDelete = () => {
    console.log("do delete")
  };

  const resetFilter = () => {
    setFilteredDate({
      selectedExpireDate: null,
      selectedPrice: null,
      selectedQty: null,
      selectedExpired: null,
      selectedAlerted: null,
      selectedCategory: null
    });
  }

  // Filtered data based on search 
  const filteredSaleData = saleData ? saleData.filter((item) => {

    const matchesSearchText = (() => {
      switch (filterSearchText) {
        case "ItemCode":
          return item.item_code && item.item_code.toLowerCase().includes(searchText.toLowerCase());
        case "Barcode":
          return item.barcode && item.barcode.toLowerCase().includes(searchText.toLowerCase());
        case "Name":
          return item.name && item.name.toLowerCase().includes(searchText.toLowerCase());
        case "Remark":
          return item.remark && item.remark.toLowerCase().includes(searchText.toLowerCase());
        default:
          return item.item_code && item.item_code.toLowerCase().includes(searchText.toLowerCase());
      }
    })();

    const matchesFilters =
      (!filteredDate.selectedExpireDate || new Date(item.expire_date).toISOString().split("T")[0] === filteredDate.selectedExpireDate) &&
      (!filteredDate.selectedExpired || Boolean(item.is_expired) === filteredDate.selectedExpired) &&
      (!filteredDate.selectedAlerted || Boolean(item.is_alerted) === filteredDate.selectedAlerted) &&
      (!filteredDate.selectedCategory || item.category.toLowerCase() === filteredDate.selectedCategory.toLowerCase());

    return matchesSearchText && matchesFilters;
  }).sort((a, b) => {
    return Number(filteredDate.selectedQty) === 1 ? b.quantity - a.quantity : a.quantity - b.quantity;
  }) : [];

  const handleFilterFunc = (selectedExpireDate, selectedPrice, selectedQty, selectedExpired, selectedAlerted, selectedCategory) => {
    setFilteredDate({ selectedExpireDate, selectedPrice, selectedQty, selectedExpired, selectedAlerted, selectedCategory });
  };

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col md:flex-row justify-between pb-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-3 w-full">
          <div>
            <div className="flex md:flex-row flex-col w-full">            
              <div className="w-full mr-3 flex items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-[#4FB1B4] has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
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
              <div className="w-full mt-3 md:mt-0 ml-0 md:ml-3 flex h-[60px] items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-[#4FB1B4] has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                <input
                  type="text"
                  placeholder="Search....."
                  onChange={(e) => { setSearchText(e.target.value); }}
                  className="block min-w-0 grow py-1.5 pr-1 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                />
                <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                  <select
                    value={filterSearchText}
                    onChange={(e) => { setFilterSearchText(e.target.value) }}
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md py-1.5 pr-1 mr-5 pl-1 text-base text-gray-500 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                  >
                    <option value="item_code">Item Code</option>
                    <option value="Barcode">Barcode</option>
                    <option value="Name">Name</option>
                    <option value="Remark">Remark</option>
                  </select>
                  <FaAngleDown
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-2 self-center justify-self-end text-gray-500 "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4 md:mt-0 w-full">
            <FaFilter
              onClick={() => { setShowFilterModal(!showFilterModal); resetFilter(); }}
              className="h-6 w-6 text-gray-500 ml-4 cursor-pointer my-auto"
            />
            <div className="my-auto">
              <button
                onClick={handleCategory}
                className="px-4 py-2 mr-5 h-[50px] bg-[#B9E5E6] border-2 border-[#45ACB1] text-black rounded hover:bg-[#ACD6D0] text-sm"
              >
                Category
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 h-[50px] bg-[#04C9D1] text-black rounded hover:bg-[#04E2EB] text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFilterModal && (
        <FilterModal showModal={showFilterModal} closeModal={() => setShowFilterModal(false)} handleFilter={handleFilterFunc} />
      )}
      {showCategoryModal && (
        <CategoryModal showModal={showCategoryModal} selectedStore={selectedStore} closeModal={() => setShowCategoryModal(false)} />
      )}
      <AlertModal
        showModal={showAlertModal}
        closeModal={() => setShowAlertModal(false)}
        expiredItems={expiredItems}
        lowStockItems={lowStockItems}
      />
      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {["Image", "Item Code", "Barcode", "Name", "Category", "Quantity", "Price", "Expire Date", "Remark", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="w-1/10 px-2 md:px-4 py-2 border text-sm md:text-lg text-center bg-[#DBE8F8]"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredSaleData.length > 0 ? (
              filteredSaleData.map((data) => (
                <tr
                  key={data._id}
                  className={`border-2 ${data.expire_date && data.is_expired
                    ? "bg-[#E4EEF8]"
                    : data.alert_date && data.is_alerted
                      ? "bg-[#E4EEF8]"
                      : ""
                    }`}
                >
                  <td className="w-1/10 px-2 md:px-4 py-2 border">
                    <img
                      src={data.image_path}
                      alt=""
                      className="w-12 h-12 md:w-16 md:h-16 m-auto"
                    />
                  </td>
                  <td className="w-1/10 px-2 md:px-4 py-2 border text-center text-sm">
                    {data.item_code}
                  </td>
                  <td className="w-1/10 px-2 md:px-4 py-2 border text-center text-sm">
                    {data.barcode}
                  </td>
                  <td className="w-32 px-2 md:px-4 py-2 border text-center text-sm">
                    {data.name}
                  </td>
                  <td className="w-1/10 px-2 md:px-4 py-2 border text-center text-sm">
                    {data.category}
                  </td>
                  <td className={`w-1/10 px-2 md:px-4 py-2 border text-center text-sm ${data.quantity === 0
                    ? "bg-[#86909C] text-black"
                    : data.quantity <= 5
                      ? "bg-[#ADCBEF] text-black"
                      : ""
                    }`}>
                    {data.quantity}
                  </td>
                  <td className="w-1/10 px-2 md:px-4 py-2 border text-center text-sm">
                    {data.price}
                  </td>
                  <td
                    className={`w-32 px-2 md:px-4 py-2 border text-center text-sm ${data.expire_date && data.is_expired
                      ? "bg-[#86909C] text-black"
                      : data.alert_date && data.is_alerted
                        ? "bg-[#ADCBEF] text-black"
                        : ""
                      }`}
                  >
                    {data.expire_date ? data.expire_date.split("T")[0] : "Doesn't Expire"}
                  </td>
                  <td className="w-1/10 px-2 md:px-4 py-2 border text-center text-sm">
                    {data.remark}
                  </td>
                  <td className="w-10 px-2 md:px-4 py-2 border text-center border-gray-300">
                    <div>
                      <button
                        className="px-3 py-1 mb-2 md:px-4 md:py-2 bg-[#80CED0] text-white hover:bg-[#05EBE5] rounded text-xs md:text-sm"
                        onClick={() => handleEdit(data._id)}
                      >
                        <TbEdit className="text-black" />
                      </button>
                      <button
                        className="px-3 py-1 md:px-4 md:py-2 bg-[#1E7998] text-white hover:bg-[#279CC4] rounded text-xs md:text-sm"
                        onClick={() => handleDelete(data._id)}
                      >
                        <AiOutlineDelete className="text-black" />
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

      <Modal showModal={showModal} closeModal={() => setShowModal(false)} item={currentItem} onSave={doCreate} tableData={saleData} selectedStore={selectedStore} />

      {
        deleteCurrentItem && (
          <DeleteModal
            showModal={showDeleteModal}
            closeModal={() => setShowDeleteModal(false)}
            item={deleteCurrentItem}
            onDelete={doDelete}
            selectedStore={selectedStore}
          />
        )
      }

      <ToastContainer />
    </div>
  );
};

export default ItemList;