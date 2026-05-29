const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (booking, stream) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Pipe to the stream (file or response)
  doc.pipe(stream);

  // --- HEADER ---
  doc.fillColor('#0d9488') // Teal-600
     .fontSize(25)
     .text('KAAMWALE', 50, 50, { bold: true });
     
  doc.fillColor('#475569') // Slate-600
     .fontSize(10)
     .text('Your Trusted Local Service Platform', 50, 80)
     .text('Support: support@kaamwale.com', 50, 95);

  doc.fontSize(20)
     .text('INVOICE', 400, 50, { align: 'right' });
     
  doc.fontSize(10)
     .text(`Invoice #: INV-${booking._id.toString().slice(-6).toUpperCase()}`, 400, 75, { align: 'right' })
     .text(`Date: ${new Date().toLocaleDateString()}`, 400, 90, { align: 'right' })
     .text(`Status: PAID`, 400, 105, { align: 'right' });

  doc.moveDown(2);
  doc.strokeColor('#e2e8f0').moveTo(50, 130).lineTo(550, 130).stroke();

  // --- BILLING DETAILS ---
  doc.moveDown(2);
  const top = 160;
  
  doc.fillColor('#1e293b').fontSize(12).text('BILL TO:', 50, top, { bold: true });
  doc.fontSize(10).text(booking.user.name, 50, top + 20);
  doc.text(booking.user.phone, 50, top + 35);
  doc.text(booking.serviceLocation, 50, top + 50, { width: 200 });

  doc.fillColor('#1e293b').fontSize(12).text('SERVICE PROVIDER:', 300, top, { bold: true });
  doc.fontSize(10).text(booking.provider.name, 300, top + 20);
  doc.text(`Category: ${booking.provider.category}`, 300, top + 35);
  doc.text(`Service Date: ${new Date(booking.date).toLocaleDateString()}`, 300, top + 50);

  // --- TABLE HEADER ---
  doc.moveDown(4);
  const tableTop = 260;
  doc.fillColor('#f8fafc').rect(50, tableTop, 500, 25).fill();
  doc.fillColor('#475569').fontSize(10).text('Description', 60, tableTop + 8, { bold: true });
  doc.text('Qty / Hours', 250, tableTop + 8, { bold: true });
  doc.text('Rate', 350, tableTop + 8, { bold: true });
  doc.text('Amount', 450, tableTop + 8, { bold: true, align: 'right' });

  // --- ITEMS ---
  let itemTop = tableTop + 35;
  const baseServicePrice = booking.provider.hourlyRate * booking.estimatedHours * (booking.workerCount || 1);
  
  doc.fillColor('#1e293b')
     .text(`${booking.provider.category} Service (${booking.workerCount || 1} Worker/s)`, 60, itemTop)
     .text(`${booking.estimatedHours} hrs`, 250, itemTop)
     .text(`Rs. ${booking.provider.hourlyRate}/hr`, 350, itemTop)
     .text(`Rs. ${baseServicePrice.toLocaleString()}`, 450, itemTop, { align: 'right' });

  itemTop += 25;
  doc.text('Platform Service Fee', 60, itemTop)
     .text('--', 250, itemTop)
     .text('--', 350, itemTop)
     .text(`Rs. ${(booking.platformFee || 50).toLocaleString()}`, 450, itemTop, { align: 'right' });

  if (booking.isEmergency) {
    itemTop += 25;
    doc.fillColor('#dc2626').text('Emergency Priority Handling', 60, itemTop)
       .text('--', 250, itemTop)
       .text('--', 350, itemTop)
       .text(`Rs. 100`, 450, itemTop, { align: 'right' });
  }

  // --- TOTALS ---
  doc.moveDown(3);
  doc.strokeColor('#f1f5f9').moveTo(350, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  
  const totalY = doc.y;
  doc.fillColor('#64748b').text('Subtotal:', 350, totalY);
  doc.fillColor('#1e293b').text(`Rs. ${booking.totalPrice.toLocaleString()}`, 450, totalY, { align: 'right' });

  doc.moveDown(0.5);
  doc.fillColor('#64748b').text('Tax (GST 0% included):', 350, doc.y);
  doc.fillColor('#1e293b').text(`Rs. 0`, 450, doc.y, { align: 'right' });

  doc.moveDown(1);
  doc.fontSize(15).fillColor('#0d9488').text('TOTAL PAID:', 350, doc.y, { bold: true });
  doc.text(`Rs. ${booking.totalPrice.toLocaleString()}`, 450, doc.y, { align: 'right', bold: true });

  // --- FOOTER ---
  const footerTop = 750;
  doc.strokeColor('#e2e8f0').moveTo(50, footerTop).lineTo(550, footerTop).stroke();
  doc.fontSize(8).fillColor('#94a3b8')
     .text('This is a computer-generated invoice and does not require a physical signature.', 50, footerTop + 15, { align: 'center' })
     .text('Thank you for choosing Kaamwale! Empowering local talent.', 50, footerTop + 30, { align: 'center' });

  doc.end();
};

module.exports = { generateInvoice };
