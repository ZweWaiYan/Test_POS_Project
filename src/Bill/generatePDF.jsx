import jsPDF from "jspdf";
import { autoTable } from 'jspdf-autotable';

const generatePDF = (cart,saleData) => {
        
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString(); 

    doc.text("Billing Receipt", 10, 10);
    doc.text(`Date: ${currentDate}`, 130, 10);
    doc.text(`Sale ID: ${saleData.saleId}`, 10, 20);

    const tableColumn = ["Name", "Price", "Quantity", "Total"];
    const tableRows = [];

    cart.forEach((item) => {
        const rowData = [
            item.name,
            `${item.price} Kyats`,
            item.quantity,
            `${item.price * item.quantity} Kyats`,
        ];
        tableRows.push(rowData);
    });

    autoTable(doc,{
        head: [tableColumn],
        body: tableRows,
        startY: 40,
    });

    const finalY = (autoTable.previous ? autoTable.previous.finalY : 40) + 30;

    const formatAmount = (amount) => `${parseFloat(amount).toFixed(2)} Kyats`;
    
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 10, finalY);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Subtotal: ` + formatAmount(saleData.subtotal || 0), 10, finalY + 10);
    doc.text(`Discount: ` + formatAmount(saleData.discount || 0), 10, finalY + 20);
    doc.text(`Cashback: ` + formatAmount(saleData.cashBack || 0), 10, finalY + 30);
    doc.text(`Total: ` + formatAmount(saleData.total || 0), 10, finalY + 40);
    doc.text(`Amount Paid: ` + formatAmount(saleData.amountPaid || 0), 10, finalY + 50);
    doc.text(`Remaining Balance: ` + formatAmount(saleData.remainingBalance || 0), 10, finalY + 60);
    

    doc.save(`bill-receipt-${saleData.saleId}.pdf`);
};

export default generatePDF;