import react, { useState } from "react";

import { FaHouseUser } from "react-icons/fa";
import { FaPlaceOfWorship } from "react-icons/fa6";
import { IoFastFoodSharp } from "react-icons/io5";

import { motion, AnimatePresence } from "framer-motion";

const FilterModal = ({ showModal, closeModal, handleFilter }) => {

    //last Date
    const [selectedExpireDate, setSelectedExpireDate] = useState(null);
    const handleExpireDate = (date) => {
        setSelectedExpireDate(date);
    }

    //Price
    const [price, setprice] = useState([
        { id: 1, name: "most" }, { id: 2, name: "less" },
    ]);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const handlePrice = (id) => {
        setSelectedPrice(id);
    }

    //quantity
    const [quantity, setquantity] = useState([
        { id: 1, name: "most" }, { id: 2, name: "less" },
    ]);
    const [selectedquantity, setSelectedquantity] = useState(null);
    const handlequantity = (id) => {
        setSelectedquantity(id);
    }

    //expire   
    const [selectedExpired, setSelectedExpired] = useState(0);
    const handleExpired = (id) => {
        setSelectedExpired(id);
    }

    //alert
    const [selectedAlerted, setSelectedAlerted] = useState(0);
    const handleAlerted = (id) => {
        setSelectedAlerted(id);
    }

    //Category
    const [category, setCategory] = useState([
        { id: 1, name: "Capsule" }, { id: 2, name: "Cream" }, { id: 3, name: "Liquid" },
    ]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const handleCategory = (id) => {
        setSelectedCategory(id);
    }

    //filter func
    const handleFilters = () => {
        handleFilter(selectedExpireDate, selectedPrice, selectedquantity, selectedExpired, selectedAlerted, selectedCategory);
        closeModal();
    }


    const handleCancel = () => {
        closeModal();
    };

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white p-8 rounded-lg w-[400px] shadow-lg border-2 border-black"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >

                        <h2 className="text-2xl font-bold mb-4">Filter</h2>

                        <div className="text-sm font-semibold mt-5">Expire Date</div>
                        <input onChange={(e) => handleExpireDate(e.target.value)} type="date" className="w-full mt-2 p-2 border rounded " />

                        <div >
                            <div className="text-sm font-semibold mt-5">Most/Less Qty</div>
                            <select onClick={(e) => handlequantity(e.target.value)} className="w-full mt-2 p-2 border rounded">
                                <option disabled={selectedquantity ? true : false} value="">Select a Qty</option>
                                {quantity.map(({ id, name }) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7 mb-3">
                            <div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        onChange={(e) => handleExpired(e.target.checked)}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 
        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border 
        after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 
        dark:peer-checked:bg-blue-600"
                                    ></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-800">Expired?</span>
                                </label>
                            </div>

                            <div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        onChange={(e) => handleAlerted(e.target.checked)}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 
        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border 
        after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 
        dark:peer-checked:bg-blue-600"
                                    ></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-800">Alerted?</span>
                                </label>
                            </div>
                            </div>

                       {/* <div>
                            <label className="inline-flex items-center cursor-pointer mt-7 mb-3">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    onChange={(e) => handleExpired(e.target.checked)}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 
        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border 
        after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 
        dark:peer-checked:bg-blue-600"
                                ></div>
                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-800">Expired?</span>
                            </label>
                        </div>*/}


                        <div className="text-sm font-semibold mt-5">Category</div>
                        <select onClick={(e) => handleCategory(e.target.value)} className="w-full mt-2 p-2 border rounded">
                            <option disabled={selectedCategory ? true : false} value="">Select a Category</option>
                            {category.map(({ id, name }) => (
                                <option key={id} value={name}>{name}</option>
                            ))}
                        </select>


                        <div className="mt-4 flex justify-between">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancel}
                                className="px-4 py-2 bg-[#B9E5E6] text-black rounded w-[80px] shadow-md"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFilters}
                                className="px-4 py-2 bg-[#04C9D1] text-black rounded shadow-md w-[80px]"
                            >
                                Filter
                            </motion.button>
                        </div>
                    </motion.div >
                </motion.div >
            )}
        </AnimatePresence >
    )
}

export default FilterModal;