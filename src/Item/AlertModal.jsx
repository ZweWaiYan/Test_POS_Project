const AlertModal = ({ showModal, closeModal, expiredItems = [], lowStockItems = [] }) => {
    return (
      showModal && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Item Alerts</h2>
              <button onClick={closeModal} className="text-red-500 font-bold">
                X
              </button>
            </div>
  
            {/* Expired Items Section */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Expired Items</h3>
              {expiredItems.length > 0 ? (
                <ul>
                  {expiredItems.map((item) => (
                    <li key={item._id} className="mb-2">
                      <div className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="text-red-500">{item.expire_date.split("T")[0]}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No expired items found.</p>
              )}
            </div>
  
            {/* Low Stock Items Section */}
            <div>
              <h3 className="font-semibold text-lg">Low Stock Items</h3>
              {lowStockItems.length > 0 ? (
                <ul>
                  {lowStockItems.map((item) => (
                    <li key={item._id} className="mb-2">
                      <div className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="text-yellow-500">{item.quantity}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No low stock items found.</p>
              )}
            </div>
  
            <button
              onClick={closeModal}
              className="mt-4 w-full py-2 bg-[#4FB1B4] text-white rounded-md hover:bg-[#5cced2]"
            >
              Close
            </button>
          </div>
        </div>
      )
    );
  };
  
  export default AlertModal;
  