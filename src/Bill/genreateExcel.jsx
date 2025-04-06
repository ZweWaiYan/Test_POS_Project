import * as XLSX from 'xlsx';

const generateExcel = (cart, saleData) => {
    
    const currentDate = new Date().toLocaleString();
    
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    
    XLSX.utils.sheet_add_aoa(worksheet, [["Billing Receipt"]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, [["Date:", currentDate]], { origin: "B1" });
    XLSX.utils.sheet_add_aoa(worksheet, [["Sale ID:", saleData.saleId]], { origin: "A2" });
    XLSX.utils.sheet_add_aoa(worksheet, [["Name", "Price (Kyats)", "Quantity", "Total (Kyats)"]], { origin: "A4" });
    
    const cartData = cart.map((item) => [
        item.name,
        `${item.price} Kyats`,
        item.quantity,
        `${item.price * item.quantity} Kyats`
    ]);
    
    XLSX.utils.sheet_add_aoa(worksheet, cartData, { origin: "A5" });
    
    const summaryStartRow = cartData.length + 7;
    XLSX.utils.sheet_add_aoa(worksheet, [["Summary"]], { origin: `A${summaryStartRow}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Subtotal:", `${saleData.subtotal || 0} Kyats`]], { origin: `A${summaryStartRow + 1}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Discount:", `${saleData.discount || 0} Kyats`]], { origin: `A${summaryStartRow + 2}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Cashback:", `${saleData.cashBack || 0} Kyats`]], { origin: `A${summaryStartRow + 3}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Total:", `${saleData.total || 0} Kyats`]], { origin: `A${summaryStartRow + 4}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Amount Paid:", `${saleData.amountPaid || 0} Kyats`]], { origin: `A${summaryStartRow + 5}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Remaining Balance:", `${saleData.remainingBalance || 0} Kyats`]], { origin: `A${summaryStartRow + 6}` });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receipt");
    
    XLSX.writeFile(workbook, `bill-receipt-${saleData.saleId}.xlsx`);
};

export default generateExcel;
