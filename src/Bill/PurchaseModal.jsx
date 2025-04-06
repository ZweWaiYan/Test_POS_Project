import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const PurchaseModal = ({ showModal, closeModal, handleDone, doneRef }) => {

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            closeModal();
                            handleDone(e); // Trigger handleDone on Enter
                        }
                    }}
                >
                    <motion.div
                        className="bg-white p-8 rounded-lg w-[400px] shadow-lg"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <h2 className="text-2xl font-bold mb-4">Successfully Purchased</h2>
                        <p>Your item has been successfully purchased</p>
                        <div className="mt-4 flex justify-between">
                            <motion.button
                                ref={doneRef}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                    closeModal(); // Close modal on button click
                                    handleDone(e); // Trigger handleDone on button click
                                }}
                                autoFocus // Automatically focuses on the button
                                className="px-4 py-2 bg-gray-400 text-white rounded"
                            >
                                Ok
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>


    )
}

export default PurchaseModal