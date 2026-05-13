'use client';
import { forwardRef } from 'react';

const InvoicePDF = forwardRef(({ booking }, ref) => {
  if (!booking) return null;

  const baseAmount = booking.amount + booking.discountAmount + booking.walletUsed;

  return (
    <div className="hidden">
      <div 
        ref={ref} 
        className="bg-white text-slate-900 p-10 w-[800px] h-[1131px]" // Standard A4 ratio
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">MintWork</h1>
            <p className="text-slate-500">Service Invoice</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-800">INVOICE</h2>
            <p className="text-sm text-slate-500 mt-1">
              Receipt #: {booking._id?.slice(-8).toUpperCase()}<br/>
              Date: {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex justify-between mb-12 border-b border-t border-slate-200 py-6">
          <div className="w-1/2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-slate-800">{booking.customerId?.name}</p>
            <p className="text-slate-600 text-sm mt-1">{booking.customerId?.email}</p>
          </div>
          <div className="w-1/2 text-right">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Provided By</h3>
            <p className="font-bold text-slate-800">{booking.workerId?.name}</p>
            <p className="text-slate-600 text-sm mt-1">{booking.category} Professional</p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="py-3 text-left font-bold text-sm text-slate-800 uppercase">Description</th>
              <th className="py-3 text-right font-bold text-sm text-slate-800 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-4 text-slate-700">
                <p className="font-medium">{booking.category} Service</p>
                <p className="text-sm text-slate-500 mt-1">{booking.description}</p>
              </td>
              <td className="py-4 text-right text-slate-800">${baseAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${baseAmount.toFixed(2)}</span>
            </div>
            
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Promo Discount ({booking.couponCode})</span>
                <span>-${booking.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            {booking.walletUsed > 0 && (
              <div className="flex justify-between text-indigo-600">
                <span>Wallet Applied</span>
                <span>-${booking.walletUsed.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3 mt-3">
              <span className="text-lg font-bold text-slate-800">Total Paid ({booking.paymentType === 'online' ? 'Online' : 'Cash'})</span>
              <span className="text-2xl font-bold text-indigo-600">${booking.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-10 left-10 right-10 text-center border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p className="font-bold text-slate-800 mb-1">Thank you for trusting MintWork!</p>
          <p>This is a computer-generated document. No signature is required.</p>
        </div>
      </div>
    </div>
  );
});

InvoicePDF.displayName = 'InvoicePDF';
export default InvoicePDF;
