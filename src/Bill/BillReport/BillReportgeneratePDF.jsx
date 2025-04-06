import jsPDF from "jspdf";
import { autoTable } from 'jspdf-autotable';

const BillReportgeneratePDF = (saleData) => {
        
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString(); 

    doc.text("Bill Report Lists", 10, 10);
    doc.text(`Date: ${currentDate}`, 130, 10);    

    const tableColumn = ["ID", "Date", "Discount", "Cash Back", "Total" , "Amount Paid" , "Remain Balance"];
    const tableRows = [];

    saleData.forEach((saleData) => {        
        const rowData = [
            saleData.saleId,
            saleData.date,
            saleData.discount,
            saleData.cashBack,
            saleData.total,
            saleData.amountPaid,
            saleData.remainingBalance,            
        ];
        tableRows.push(rowData);
    });

    autoTable(doc,{
        head: [tableColumn],
        body: tableRows,
        startY: 40,
    });

    doc.save(`bill-report-lists-${currentDate}.pdf`);
};

export default BillReportgeneratePDF;