import react, { useState } from "react";

import { FaHouseUser } from "react-icons/fa";
import { FaPlaceOfWorship } from "react-icons/fa6";
import { IoFastFoodSharp } from "react-icons/io5";

import { motion, AnimatePresence } from "framer-motion";

const BillReportFilterModal = ({ showModal, closeModal, handleFilter }) => {

    //Amount
    // const [amount, setamount] = useState([
    //     { id: 1, name: "50" }, { id: 2, name: "100" }, { id: 3, name: "200" }
    // ]);
    // const [selectedAmount, setSelectedAmount] = useState(null);
    // const handleAmount = (data) => {
    //     setSelectedAmount(data);
    // }

    const [selectedAmount, setSelectedAmount] = useState("");
    const handleAmount = (e) => {
        const numericValue = e.target.value.replace(/[^0-9]/g, "")
        setSelectedAmount(numericValue);
    }

    //Single Date   
    const [selectedSingleDate, setSelectedSingleDate] = useState(0);
    const handleSingleDate = (data) => {
        setSelectedSingleDate(data);
    }

    //Start Date   
    const [selectedStartDate, setSelectedStartDate] = useState(0);
    const handleStartDate = (data) => {
        setSelectedStartDate(data);
    }

    //End Date   
    const [selectedEndDate, setSelectedEndDate] = useState(0);
    const handleEndDate = (data) => {
        setSelectedEndDate(data);
    }

    //filter func
    const handleFilters = () => {
        handleFilter(selectedSingleDate, selectedStartDate, selectedEndDate, selectedAmount);
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

                        <div className="text-sm font-semibold mt-5">Single Date</div>
                        <input onChange={(e) => handleSingleDate(e.target.value)} type="date" className="w-full mt-2 p-2 border rounded " />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-semibold mt-5">Start Date</div>
                                <input onChange={(e) => handleStartDate(e.target.value)} type="date" className="w-full mt-2 p-2 border rounded " />
                            </div>
                            <div>
                                <div className="text-sm font-semibold mt-5">End Date</div>
                                <input onChange={(e) => handleEndDate(e.target.value)} type="date" className="w-full mt-2 p-2 border rounded " />
                            </div>
                        </div>

                        <div >
                            <div className="text-sm font-semibold mt-5">Sale Amount</div>
                            {/* <select onClick={(e) => handleAmount(e.target.value)} className="w-full mt-2 p-2 border rounded">
                                <option disabled={selectedAmount ? true : false} value="">Select a Amount</option>
                                {amount.map(({ id, name }) => (
                                    <option key={id} value={name}>{name}</option>
                                ))}
                            </select> */}
                            <input
                                id="number-input"
                                type="number"
                                value={selectedAmount}
                                onChange={handleAmount}
                                className="w-full mt-2 p-2 border rounded "
                                min={0}
                                max={100}
                                step={1}
                                placeholder="Enter a number"
                            />
                        </div>

                        <div className="mt-4 flex justify-between">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancel}
                                className="px-4 py-2 bg-[#B9E5E6] text-black rounded shadow-md w-[80px] "
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFilters}
                                className="px-4 py-2 bg-[#04C9D1] text-black rounded shadow-md w-[80px] "
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

export default BillReportFilterModal;