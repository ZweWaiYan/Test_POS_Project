import * as XLSX from 'xlsx';

const BillDetailgenerateExcel = (saleData) => {
    const currentDate = new Date().toLocaleString();
    
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    
    XLSX.utils.sheet_add_aoa(worksheet, [["Bill ID:", saleData.saleId]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, [["Date:", currentDate]], { origin: "B1" });
    XLSX.utils.sheet_add_aoa(worksheet, [["Item Code", "BarCode", "Name", "Qty", "Price (Kyats)", "Total (Kyats)"]], { origin: "A3" });
    
    const itemData = saleData.items.map((item) => [
        item.item_code,
        item.barcode,
        item.name,
        item.quantity,
        `${item.price} Kyats`,
        `${item.price * item.quantity} Kyats`
    ]);
    
    XLSX.utils.sheet_add_aoa(worksheet, itemData, { origin: "A4" });
    
    const summaryStartRow = itemData.length + 6;
    XLSX.utils.sheet_add_aoa(worksheet, [["Summary"]], { origin: `A${summaryStartRow}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Subtotal:", `${saleData.subtotal || 0} Kyats`]], { origin: `A${summaryStartRow + 1}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Discount:", `${saleData.discount || 0} Kyats`]], { origin: `A${summaryStartRow + 2}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Cashback:", `${saleData.cashBack || 0} Kyats`]], { origin: `A${summaryStartRow + 3}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Total:", `${saleData.total || 0} Kyats`]], { origin: `A${summaryStartRow + 4}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Amount Paid:", `${saleData.amountPaid || 0} Kyats`]], { origin: `A${summaryStartRow + 5}` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Remaining Balance:", `${saleData.remainingBalance || 0} Kyats`]], { origin: `A${summaryStartRow + 6}` });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill Detail");
    
    XLSX.writeFile(workbook, `bill-receipt-${saleData.saleId}.xlsx`);
};

export default BillDetailgenerateExcel;
