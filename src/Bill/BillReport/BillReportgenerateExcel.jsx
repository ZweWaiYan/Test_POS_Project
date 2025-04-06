import * as XLSX from 'xlsx';

const BillReportgenerateExcel = (saleData) => {
    const currentDate = new Date().toLocaleString();
    
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    
    XLSX.utils.sheet_add_aoa(worksheet, [["Bill Report Lists"]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, [["Date:", currentDate]], { origin: "B1" });
    XLSX.utils.sheet_add_aoa(worksheet, [["ID", "Date", "Discount (Kyats)", "Cash Back (Kyats)", "Total (Kyats)", "Amount Paid (Kyats)", "Remain Balance (Kyats)"]], { origin: "A3" });
    
    const saleDataRows = saleData.map((sale) => [
        sale.saleId,
        sale.date,
        `${sale.discount} Kyats`,
        `${sale.cashBack} Kyats`,
        `${sale.total} Kyats`,
        `${sale.amountPaid} Kyats`,
        `${sale.remainingBalance} Kyats`
    ]);
    
    XLSX.utils.sheet_add_aoa(worksheet, saleDataRows, { origin: "A4" });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill Report");
    
    XLSX.writeFile(workbook, `bill-report-lists-${currentDate}.xlsx`);
};

export default BillReportgenerateExcel;
