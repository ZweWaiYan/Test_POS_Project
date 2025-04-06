import { FaAngleDown } from "react-icons/fa6";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

import img1 from "../assets/sale/img1.jpg";
import img2 from "../assets/sale/img2.jpg";
import img3 from "../assets/sale/img3.jpg";
import img4 from "../assets/sale/img4.jpg";
import img5 from "../assets/sale/img5.jpg";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";

import { FaMinus } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";
import { MdLocalPrintshop } from "react-icons/md";
import generateExcel from "./genreateExcel"
import PurchaseModal from "./PurchaseModal";
import generatePDF from "./generatePDF";
import axiosInstance from "../axiosInstance";
import { jwtDecode } from "jwt-decode";

const fetchSaleData = async ({ queryKey }) => {
    const [, selectedStore] = queryKey;
    if (!selectedStore) return [];
    const { data } = await axiosInstance.get(`/api/allitems?store=${selectedStore}`);    
    return data;
};


const generateSaleId = () => {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0].replace(/-/g, "");

    const randomFourDigits = Math.floor(1000 + Math.random() * 9000);

    return `${formattedDate}${randomFourDigits}`;
};


const BillList = () => {
    const [selectedStore, setSelectedStore] = useState("");
    const [itemQuantity, setItemQuantity] = useState({});

    const inputRefs = useRef({
        discount: null,
        cashback: null,
        Debit: null,
    })

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setSelectedStore((prev) => prev !== decodedToken.branch ? decodedToken.branch : prev);
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    useEffect(() => {
        printButtonRef.current?.focus();
    });

    const { data: saleData, isLoading, error } = useQuery({
        queryKey: ["saleData", selectedStore],
        queryFn: fetchSaleData,
    });
    let stockQuantities = {};

    if (saleData && Array.isArray(saleData)) {
        stockQuantities = saleData.reduce((acc, item) => {
            acc[item.item_code] = item.quantity;
            return acc;
        }, {});
    
        // console.log("Stock Quantities:", stockQuantities);
    }    

    const searchInputRef = useRef(null);
    const printButtonRef = useRef(null);
    const doneButtonRef = useRef(null);

    const [isPrint, setIsPrint] = useState(true);

    const [filterSearchText, setFilterSearchText] = useState("barcode");
    const [searchText, setSearchText] = useState("");
    const [foundedquantity, setFoundedquantity] = useState(1);
    const [foundedItem, setFoundedItem] = useState("");
    const [cart, setCart] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const handleCheckout = (inputValue) => {
        // Find item by barcode or item_code
        const item = saleData.find(item => item.barcode === inputValue || item.item_code === inputValue);
    
        if (!item) {
            toast.error("Item not found!");
            return;
        }
    
        const availableStock = item.quantity;
        const inputQuantity = foundedquantity;
    
        if (inputQuantity > availableStock) {
            toast.error(`Out of stock. Available stock: ${availableStock}`);
            return;
        }
    
        const existingItemIndex = cart.findIndex(cartItem => cartItem.barcode === item.barcode || cartItem.item_code === item.item_code);        

        setCart(prevCart => {

            if (existingItemIndex !== -1) {
                const existingItem = prevCart[existingItemIndex];
                if (existingItem.quantity + foundedquantity > item.quantity) {
                    toast.error("Cannot add more items than available stock!");
                    return prevCart; 
                }
        
                return prevCart.map((cartItem, index) =>
                    index === existingItemIndex
                        ? { ...cartItem, quantity: cartItem.quantity + foundedquantity }
                        : cartItem
                );
            } else {
                if (foundedquantity > item.quantity) {
                    toast.error("Cannot add more items than available stock!");
                    return prevCart;
                }
        
                return [...prevCart, { ...item, quantity: foundedquantity }];
            }
        });
    
        setSearchText("");
        setFoundedItem(null);
        setSuggestions([]);
        setFoundedquantity(1);
        searchInputRef.current?.focus();
    };
    
    

    const handleSearchChange = (e) => {
        const query = e.target.value.trim().toLowerCase();
        setSearchText(query);

        const matchedItem = saleData.find(item =>
            item[filterSearchText]?.toLowerCase() === query
        );

        setFoundedItem(matchedItem);

        if (matchedItem && (filterSearchText === 'barcode' || filterSearchText === 'item_code')) {
            handleCheckout(query);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (filterSearchText === 'item_code' && e.key === 'Enter') {
            const query = e.target.value;
            const matchedItem = saleData.find(item =>
                item[filterSearchText]?.toLowerCase() === query.toLowerCase().trim()
            );

            if (matchedItem) {
                handleCheckout(query);
            } else {          
                toast.error("Item not found!");
            }
        }
    };


    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };


    const handleKeyDown = (event, nextRef) => {        

        if (event.key === "Tab") {
            event.preventDefault();
            nextRef?.current?.focus();                  
        } else if (event.key === "Enter") {
            event.preventDefault();            
            handleDone(nextRef.current.id);


        } 
    };

    const handleDone = async (isPrint) => {
        searchInputRef.current?.focus();
    
        if (cart.length === 0) {
            toast.error("Cart is empty!");
            return;
        }        
    
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const discount = inputRefs.current.discount.value;
        const cashBack = inputRefs.current.cashback.value;        
        const total = subtotal - discount - cashBack;
        const debit = inputRefs.current.Debit.value;
        const amountPaid = total;        
    
        const saleData = {
            saleId: generateSaleId(),
            date: new Date().toISOString().slice(0, 19).replace("T", " "),
            subtotal,
            discount,
            cashBack,
            total,
            amountPaid,
            remainingBalance: total - amountPaid,
            items: cart.map(item => ({
                item_code: item.item_code,
                barcode: item.barcode,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            }))
        };
    
        try {
            await axiosInstance.post(`/api/addsale?store=${selectedStore}`, saleData);        
            toast.success("Sale recorded successfully!");
            const soldqty = saleData.items.map(item => item.quantity)[0];            
    
            for (const cartItem of cart) {
                const saleItem = saleData.items.find(item => item.item_code === cartItem.item_code);
            
                if (saleItem) {
                    const availableStock = stockQuantities[cartItem.item_code]
                    const soldQuantity = cartItem.quantity;
            
                    const remainingStock = availableStock - soldQuantity;                    
            
                    if (remainingStock < 0) {
                        toast.error(`Stock for ${saleItem.name} is insufficient!`);
                        return;
                    }
            
                    // console.log('Remaining Stock:', remainingStock, 'Available Stock:', availableStock, 'Sold Quantity:', soldQuantity);
            
                    if (cartItem._id) {
                        try {

                            await axiosInstance.put(`/api/update/${cartItem._id}?store=${selectedStore}`, {
                                quantity: remainingStock ?? 0
                            });
            
                            // console.log(`Stock updated for ${saleItem.name}, remaining: ${remainingStock}`);
                        } catch (error) {
                            console.error('Error updating stock:', error);
                            toast.error(`Failed to update stock for ${saleItem.name}.`);
                        }
                    }
                } else {
                    toast.error(`Item ${cartItem.item_code} not found in sale data.`);
                }
            }
    
            if (isPrint === "done") {
                generateExcel(cart, saleData);
            }
            
            setCart([]);
            clearInput();
            toast.success("Transaction completed!");
        } catch (error) {
            console.error("Error in handleDone:", error);
            toast.error("Transaction failed. Please try again.");
        }
    };

    const clearInput = () => {
        inputRefs.current.discount.value = 0;
        inputRefs.current.cashback.value = 0;
        inputRefs.current.Debit.value = 0;
    }
    


    const handleRemove = (itemId) => {
        setCart(cart.filter(item => item._id !== itemId));
    };

    return (
        <div className="p-4 w-full flex-col justify-between">
            <div className="flex flex-col md:flex-row justify-between pb-7">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="col-span-2">
                        <div className="relative">
                            <div className="flex  items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-[#4FB1B4] has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                                <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                                    <select
                                        value={filterSearchText}
                                        onChange={(e) => { setFilterSearchText(e.target.value) }}
                                        className="col-start-1 p-3 row-start-1 w-full border-r-2 border-gray-300 appearance-none py-1.5 pr-7 text-base text-gray-500 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    >
                                        <option value="barcode">BarCode</option>
                                        <option value="item_code">item_code</option>
                                    </select>
                                    <FaAngleDown
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 pl-2 mr-3 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search....."
                                    ref={searchInputRef}
                                    value={searchText}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchKeyDown}
                                    className="block min-w-0 grow h-[60px] py-1.5 pr-3 pl-3 text-base  text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-start md:justify-end">
                        <div className="flex justify-between max-w-[150px] md:mt-0 mr-3">
                            <div>
                                <button
                                    id="print"
                                    ref={printButtonRef}
                                    tabIndex={1}
                                    onKeyDown={(e) => handleKeyDown(e, doneButtonRef)}
                                    className="flex justify-around px-4 py-3.5  bg-[#B9E5E6]  border-2 border-[#45ACB1] text-white rounded hover:bg-[#ACD6D0] text-sm"
                                >
                                    <MdLocalPrintshop className="m-auto text-black" />
                                    <div className="hidden md:block ml-4 text-black">Print</div>
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between max-w-[150px] md:mt-0 mr-3">
                            <div>
                                <button
                                    id="done"
                                    ref={doneButtonRef}
                                    tabIndex={2}
                                    onKeyDown={(e) => handleKeyDown(e, printButtonRef)}
                                    className="flex justify-around px-4 py-4 bg-[#04C9D1] text-white rounded hover:bg-[#04E2EB] text-sm"
                                >
                                    <FaCheck className="m-auto text-black" />
                                    <div className="hidden md:block ml-4 text-black">Done</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
                <div className="col-span-0 lg:col-span-2 overflow-auto h-[calc(100vh-300px)] md:h-[calc(100vh-200px)]">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                {["ItemCode", "Name", "Quantity", "Price", "Actions"].map((heading) => (
                                    <th key={heading} className="px-2 md:px-4 py-2 text-sm md:text-lg text-center  bg-[#DBE8F8]">
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {saleData.length > 0 ? (
                                cart.map((data) => (
                                    <tr className="border-b-2" key={data._id}>
                                        <td className="px-2 md:px-4 py-2  text-center text-sm">{data.item_code}</td>
                                        <td className="px-2 md:px-4 py-2  text-center text-sm">{data.name}</td>
                                        <td className="px-2 md:px-4 py-2  text-center text-sm">{data.quantity}</td>
                                        <td className="px-2 md:px-4 py-2  text-center text-sm">{data.price * data.quantity} Kyats</td>
                                        <td className="px-2 md:px-4 py-2  text-center border-gray-300">
                                            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                                                <button
                                                    className="px-3 py-1 md:px-4 md:py-2 bg-red-500 text-white hover:bg-red-400 rounded text-xs md:text-sm"
                                                    onClick={() => handleRemove(data._id)}
                                                >
                                                    <FaMinus />
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
                <div className="border ml-0 md:ml-5 h-[450px] flex flex-col justify-evenly px-5  shadow-lg rounded-lg">
                    <div className="flex flex-col  items-center">
                        <p className="font-bold text-3xl">Shop Name</p>
                        <p className="text-1xl">09-XXXXXXXXX</p>
                    </div>
                    <div className="grid grid-cols-2 font-bold text-2xl text-[#04C9D1]">
                        <div>
                            Total:
                        </div>
                        <div>
                            {calculateTotal()} Ks
                        </div>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                        <div>
                            Discount :
                        </div>
                        <div className="items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-gray-300 has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                            <input
                                ref={(e) => (inputRefs.current.discount = e)}
                                name="discount"
                                type="text"
                                placeholder="Enter Discount"
                                className="block w-full h-[50px] py-1.5 pr-3 pl-1 text-base  text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                        <div>
                            Cashback
                        </div>
                        <div>
                            <div className="items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-gray-300 has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                                <input
                                    ref={(e) => (inputRefs.current.cashback = e)}
                                    name="Cashback"
                                    type="text"
                                    placeholder="Enter Cashback"
                                    className="block w-full w h-[50px] py-1.5 pr-3 pl-1 text-base  text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                        <div>
                            Debit
                        </div>
                        <div>
                            <div>
                                <div className="items-center rounded-md bg-white pl-3 outline -outline-offset-1 outline-gray-300 has-[*:focus-within]:outline-2 has-[*:focus-within]:-outline-offset-2 has-[*:focus-within]:outline-indigo-600">
                                    <input
                                        ref={(e) => (inputRefs.current.Debit = e)}
                                        name="Debit"
                                        type="text"
                                        placeholder="Enter Debit"
                                        onKeyDown={(e) => handleKeyDown(e, printButtonRef)}
                                        className="block w-full h-[50px] py-1.5 pr-3 pl-1 text-base  text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 
            <div className="flex justify-between p-3 mt-3">
                <div className="mt-2.5 text-2xl md:text-3xl font-bold text-orange-500">
                    Total: {calculateTotal()} Kyats
                </div>
                <div>
                    <button
                        ref={doneButtonRef}
                        onClick={() => setShowPurchaseModal(true)}
                        className="flex justify-around px-4 py-3 mt-1 bg-green-500 text-white rounded hover:bg-green-400 text-sm"
                    >
                        <FaCheck className="m-auto" />
                        <div className="hidden md:block ml-4">Done</div>
                    </button>
                </div>
            </div> */}

            {
                showPurchaseModal && (
                    <PurchaseModal showModal={showPurchaseModal} closeModal={() => setShowPurchaseModal(false)} handleDone={handleDone} generatePDF={generatePDF} doneRef={okButtonRef} />
                )
            }

            <ToastContainer />
        </div >
    )
}

export default BillList;