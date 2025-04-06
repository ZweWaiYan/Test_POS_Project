import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { FaCheck } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import axiosInstance from "../axiosInstance";

const addCategory = async ({ name, selectedStore }) => {
  const response = await axiosInstance.post(`/api/addcategory?store=${selectedStore}`, { name });
  return response.data;
};

const fetchCategories = async (selectedStore) => {  
  const { data } = await axiosInstance.get(`/api/fetchcategory?store=${selectedStore}`);  
  return data;
};

const Modal = ({ showModal, closeModal, item, onSave, tableData, selectedStore }) => {
  const [fields, setFields] = useState({});
  const [errors, setErrors] = useState({});

  const [newCategory, setNewCategory] = useState("");
  const [isAddCategory, setIsAddCategory] = useState(false);

  const { data: category, isLoading, isError, refetch } = useQuery({
    queryKey: ["category", selectedStore],
    queryFn: () => fetchCategories(selectedStore),
    enabled: !!selectedStore,
  });

  const addMutation = useMutation({
    mutationFn: ({ name, selectedStore }) => addCategory({ name, selectedStore }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["category"]);
      toast.success(data.message);
    },
    onError: (error) => {
      console.error("Error updating category:", error);
      toast.error("Failed to update category.");
    }
  });

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addMutation.mutate(newCategory, {
        onSuccess: () => {
          setNewCategory("");
          setIsAddCategory(false);
          handleChange("category", "");
        },
      });
    }
  };

  // Update fields when item prop changes
  useEffect(() => {
    if (item) {
      setFields({
        image: item.image_path || '',
        item_code: item.item_code,
        barcode: item.barcode,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        expire_date: item.expire_date
          ? new Date(item.expire_date).toISOString().split('T')[0]
          : '',
        alert_date: item.alert_date
          ? new Date(item.alert_date).toISOString().split('T')[0]
          : '',
        remark: item.remark || ""
      });
    } else {
      setFields({
        image: "",
        item_code: "",
        barcode: "",
        name: "",
        category: "",
        quantity: 0,
        price: 0,
        expire_date: "",
        alert_date: "",
        remark: ""
      });
    }
  }, [item]);

  // Validate form - all fields are now required
  const validate = () => {
    const newErrors = {};

    // Expiration fields are always required now.
    const requiredFields = [
      "item_code",
      "barcode",
      "name",
      "category",
      "quantity",
      "price",
      "expire_date",
      "alert_date"
    ];

    requiredFields.forEach((field) => {
      if (!fields[field]) {
        newErrors[field] = `${field.replace("_", " ")} is required!`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    if (field === "category" && value === "Add") {
      setIsAddCategory(true);
    }

    setFields((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updatedItem) => {
      const url = item
        ? `/api/update/${item._id}?store=${selectedStore}`
        : `http://localhost:3000/api/upload?store=${selectedStore}`;
      const method = item ? "put" : "post";

      const formData = new FormData();
      Object.keys(updatedItem).forEach((key) => {
        formData.append(key, updatedItem[key]);
      });

      const response = await axiosInstance({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },
    onSuccess: (data) => {
      onSave(data);
      queryClient.invalidateQueries("tableData");
      resetInput();
      closeModal();
      toast.success(`${item ? "Item updated" : "Item added"} successfully!`);
    },
    onError: (error) => {
      if (error.response && error.response.data) {
        const errMsg = error.response.data.errors || error.response.data.message || 'Error occured';
        toast.error(`${errMsg}`);
      } else {
        toast.error(`An error occurred: ${error.message}`);
      }
    }
  });

  const handleSubmit = () => {
    if (validate()) {
      const updatedItem = {
        item_code: fields.item_code,
        barcode: fields.barcode,
        name: fields.name,
        category: fields.category,
        quantity: fields.quantity,
        price: fields.price,
        expire_date: fields.expire_date,
        alert_date: fields.alert_date,
        remark: fields.remark,
        store: selectedStore
      };

      if (fields.image) {
        updatedItem.image = fields.image;
      }

      mutation.mutate(updatedItem);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFields({ ...fields, image: file });
    }
  };

  const handleCancel = () => {
    resetInput();
    closeModal();
  };

  const resetInput = () => {
    setFields(
      item
        ? {
          image: item.image_path,
          item_code: item.item_code,
          barcode: item.barcode,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
          expire_date: item.expire_date,
          alert_date: item.alert_date,
          remark: item.remark || ""
        }
        : {
          image: "",
          item_code: "",
          barcode: "",
          name: "",
          category: "",
          quantity: 0,
          price: 0,
          expire_date: "",
          alert_date: "",
          remark: ""
        }
    );
    setErrors({});
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
            className="bg-white p-8 rounded-lg w-[400px] shadow-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold mb-4">
              {item ? "Edit" : "Add"} item
            </h2>
            <div>
              {[
                "image",
                "item_code",
                "barcode",
                "name",
                "category",
                "quantity",
                "price",
                "expire_date",
                "alert_date",
                "remark",
              ].map((field) => (
                <div key={field} className="mb-4">
                  {(() => {
                    switch (field) {
                      case "image":
                        return (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full p-2 border rounded-sm"
                            />
                            {fields.image && (
                              <div className="mt-2">
                                {fields.image instanceof File ? (
                                  <img
                                    src={URL.createObjectURL(fields.image)}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover border rounded"
                                  />
                                ) : (
                                  <img
                                    src={fields.image}
                                    alt="Existing"
                                    className="w-32 h-32 object-cover border rounded"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      case "category":
                        return (
                          <div>
                            <select
                              value={fields[field] || ""}
                              onChange={(e) =>
                                handleChange(field, e.target.value)
                              }
                              className={`w-full p-2 border rounded-sm ${isAddCategory ? "text-gray-300" : ""
                                } ${errors[field] ? "border-red-500" : ""}`}
                              disabled={isAddCategory}
                            >
                              <option value="">Select a category</option>                              
                              {Array.isArray(category) &&
                                category.map((cat) => (
                                  <option key={cat._id} value={cat.name}>                                    
                                    {cat.name}
                                  </option>
                                ))}
                              {/* <option value="Add">+ Add Category</option> */}
                            </select>
                            {/* {isAddCategory && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={newCategory}
                                  onChange={(e) =>
                                    setNewCategory(e.target.value)
                                  }
                                  className="p-2 border rounded-sm w-full"
                                  placeholder="Enter new category"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddCategory}
                                  className="p-2 bg-blue-500 text-white rounded"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddCategory(false);
                                    setNewCategory("");
                                    handleChange("category", "");
                                  }}
                                  className="p-2 bg-red-500 text-white rounded"
                                >
                                  <RxCross1 />
                                </button>
                              </div>
                            )} */}
                          </div>
                        );
                      case "expire_date":
                      case "alert_date":
                        return (
                          <div className="mb-4">
                            <label
                              htmlFor={field}
                              className="block mb-1"
                            >
                              {field.charAt(0).toUpperCase() +
                                field.slice(1).replace("_", " ")}
                            </label>
                            <input
                              id={field}
                              value={fields[field] || ""}
                              onChange={(e) =>
                                handleChange(field, e.target.value)
                              }
                              type="date"
                              className="w-full p-2 border rounded-sm"
                            />
                          </div>
                        );
                      case "remark":
                        return (
                          <div className="mb-4">
                            <label htmlFor={field} className="block mb-1">
                              {field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
                            </label>
                            <textarea
                              id={field}
                              value={fields[field] || ""}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSubmit();
                                }
                              }}
                              onChange={(e) =>
                                handleChange(field, e.target.value)
                              }
                              type="text"
                              className="w-full p-2 border rounded-sm"
                            />
                          </div>
                        );
                      default:
                        return (
                          <input
                            value={fields[field] || ""}
                            onChange={(e) =>
                              handleChange(field, e.target.value)
                            }
                            className={`w-full p-2 border rounded-sm ${errors[field] ? "border-red-500" : ""
                              }`}
                            placeholder={
                              field.charAt(0).toUpperCase() + field.slice(1)
                            }
                          />
                        );
                    }
                  })()}
                  {errors[field] && (
                    <p className="text-red-500 text-sm">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded shadow-md"
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
