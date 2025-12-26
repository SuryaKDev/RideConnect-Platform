// utils/invoiceGenerator.js
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

// Helper to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// --- PASSENGER INVOICE (Bill for what they paid) ---
export const generatePassengerInvoice = (payment) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80);
  doc.text("RideConnect", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Passenger Invoice", 14, 26);
  doc.text("support@rideconnect.com", 14, 31);

  // Meta Data
  doc.setFontSize(10);
  doc.setTextColor(100);
  const invoiceNo = payment.orderId || `INV-${payment.id}`;
  doc.text(`Invoice No: ${invoiceNo}`, 140, 20);
  doc.text('Transaction ID: ' + (payment.transactionId || 'N/A'), 140, 25);
  doc.text(`Date: ${formatDate(payment.paymentTime)}`, 140, 30);


  // Line
  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);

  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Bill To:", 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Name: ${payment.booking?.passenger?.name || "N/A"}`, 14, 50);
  doc.text(`Email: ${payment.booking?.passenger?.email || "N/A"}`, 14, 55);
  doc.text(`Phone: ${payment.booking?.passenger?.phone || "N/A"}`, 14, 60);
  

  // Ride Details
  const ride = payment.booking?.ride || {};
  const driver = ride.driver || {};

  const rideRows = [
    ["Source", ride.source],
    ["Destination", ride.destination],
    ["Driver", driver.name],
    ["Vehicle", driver.vehicleModel],
    ["Travel Date", ride.travelDate],
    ["Seats", payment.booking?.seatsBooked?.toString()],
  ];

  autoTable(doc, {
    startY: 65,
    head: [["Description", "Details"]],
    body: rideRows,
    theme: "striped",
    headStyles: { fillColor: [44, 62, 80] },
  });

  // Payment Breakdown
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text("Payment Breakdown", 14, finalY);

  const totalAmount = payment.amount || 0;
  const baseFare = totalAmount / 1.07;
  const gst = baseFare * 0.05;
  const platformFee = baseFare * 0.02;

  autoTable(doc, {
    startY: finalY + 5,
    body: [
      ["Base Ride Fare", `Rs. ${baseFare.toFixed(2)}`],
      ["GST (5%)", `Rs. ${gst.toFixed(2)}`],
      ["Platform Fee (2%)", `Rs. ${platformFee.toFixed(2)}`],
      ["Total Paid", `Rs. ${totalAmount.toFixed(2)}`],
    ],
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: "right" },
    },
    didParseCell: function (data) {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [0, 0, 0];
      }
    },
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    "Thank you for riding with RideConnect!",
    105,
    280,
    null,
    null,
    "center"
  );
  doc.save(`Invoice_Passenger_${payment.id}.pdf`);
};

// --- DRIVER INVOICE (Earnings Receipt) ---
export const generateDriverInvoice = (payment) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(39, 174, 96); // Green for Earnings
  doc.text("RideConnect Partner", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Earnings Receipt", 14, 26);

  // Meta Data
  const receiptNo = `ERN-${payment.id}`;
  doc.text(`Receipt No: ${receiptNo}`, 140, 20);
  doc.text(`Date: ${formatDate(payment.paymentTime)}`, 140, 25);

  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);

  // Driver Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Partner Details:", 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100);
  const driver = payment.booking?.ride?.driver || {};
  doc.text(`Name: ${driver.name || "N/A"}`, 14, 50);
  doc.text(`Vehicle: ${driver.licensePlate || "N/A"}`, 14, 55);

  // Trip Summary
  const ride = payment.booking?.ride || {};
  autoTable(doc, {
    startY: 65,
    head: [["Trip Details", "Value"]],
    body: [
      ["Route", `${ride.source} -> ${ride.destination}`],
      ["Date", ride.travelDate],
      ["Passenger", payment.booking?.passenger?.name],
      ["Seats Booked", payment.booking?.seatsBooked?.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [39, 174, 96] }, // Green header
  });

  // Earnings Calculation (Reverse Calc)
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Earnings Breakdown", 14, finalY);

  const totalCollected = payment.amount || 0;
  const baseEarnings = totalCollected / 1.07; // This is what the driver actually earns
  const deductions = totalCollected - baseEarnings; // GST + Fee

  autoTable(doc, {
    startY: finalY + 5,
    body: [
      ["Total Fare Collected", `Rs. ${totalCollected.toFixed(2)}`],
      ["Less: Platform Fee & Tax (7%)", `- Rs. ${deductions.toFixed(2)}`],
      ["NET EARNINGS", `Rs. ${baseEarnings.toFixed(2)}`],
    ],
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 60, halign: "right" },
    },
    didParseCell: function (data) {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 12;
        data.cell.styles.textColor = [39, 174, 96]; // Green text
      }
    },
  });

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Keep driving, keep earning!", 105, 280, null, null, "center");
  doc.save(`Receipt_Driver_${payment.id}.pdf`);
};
