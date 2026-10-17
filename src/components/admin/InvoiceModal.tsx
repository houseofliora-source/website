import React from 'react';
import { X, Printer, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { OrderRecord, StoreSettings } from '../../types';

interface InvoiceModalProps {
  order: OrderRecord;
  settings: StoreSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, settings, onClose }) => {
  // Recalculate totals to ensure integrity
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = order.deliveryFee ?? (order.deliveryArea === 'dhaka' ? settings.deliveryFeeDhaka : settings.deliveryFeeOutside);
  const discount = order.discountAmount ?? 0;
  const computedGrandTotal = Math.max(0, subtotal + deliveryFee - discount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        className="w-full max-w-2xl bg-white border border-[#EAE0D5] rounded-xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header - Hidden during print */}
        <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#EAE0D5] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#24211D] uppercase tracking-wider">Customer Invoice</span>
            <span className="font-mono text-xs px-2 py-0.5 bg-[#8C5E35]/10 text-[#8C5E35] rounded font-medium">#{order.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#7A6F62] hover:text-[#24211D] hover:bg-[#EAE0D5] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="invoice-sheet" className="p-6 sm:p-10 space-y-6 text-[#24211D] bg-white print:p-8">
          {/* Top Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#EAE0D5] pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#24211D] text-white flex items-center justify-center font-serif text-sm font-bold">
                  HL
                </div>
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-medium tracking-wide">House of Líora</h1>
                  <p className="text-[11px] text-[#7A6F62] uppercase tracking-widest font-mono">Artisanal Soy Candles & Home Fragrance</p>
                </div>
              </div>
              <div className="text-[11px] text-[#7A6F62] mt-3 space-y-0.5">
                <p>Dhaka, Bangladesh · houseofliora.company</p>
                {Boolean(settings.supportPhone && settings.supportPhone.trim() && !settings.supportPhone.includes('000000')) && (
                  <p>Support Phone: {settings.supportPhone}</p>
                )}
                {Boolean(settings.supportEmail && settings.supportEmail.trim()) && (
                  <p>Email: {settings.supportEmail}</p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-1 bg-[#FAF8F5] border border-[#EAE0D5] rounded text-xs font-mono font-bold text-[#8C5E35]">
                INVOICE #{order.id}
              </span>
              <p className="text-xs text-[#7A6F62] pt-1">Date: {order.createdAt}</p>
              <p className="text-xs font-medium">
                Status: <span className="text-[#8C5E35] font-semibold">{order.status}</span>
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs bg-[#FAF8F5] p-4 rounded-lg border border-[#EAE0D5]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#8C5E35] tracking-wider block">Billed & Shipped To</span>
              <p className="font-semibold text-sm text-[#24211D]">{order.customerName}</p>
              <p className="text-[#5A5248] font-mono">Phone: {order.customerPhone}</p>
              <p className="text-[#5A5248] leading-relaxed whitespace-pre-wrap">{order.customerAddress}</p>
              <p className="text-[#7A6F62]">
                Region: <span className="font-medium text-[#24211D]">{order.deliveryArea === 'dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}</span>
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-[#EAE0D5] sm:pl-5">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#8C5E35] tracking-wider block">Payment Verification</span>
              <p className="font-medium text-[#24211D]">
                Method: <span className="uppercase font-semibold">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod.toUpperCase()}</span>
              </p>
              {order.transactionId && (
                <p className="font-mono text-[#24211D]">
                  TrxID: <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{order.transactionId}</span>
                </p>
              )}
              {order.senderPhone && (
                <p className="font-mono text-[#5A5248]">
                  Sender Phone: <span className="font-semibold">{order.senderPhone}</span>
                </p>
              )}
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  order.paymentStatus === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {order.paymentStatus === 'verified' ? '✓ Payment Verified' : order.paymentStatus === 'rejected' ? '✕ Payment Rejected' : '⏳ Verification Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#24211D] text-[#24211D]">
                  <th className="py-2.5 font-semibold">Item & Details</th>
                  <th className="py-2.5 font-semibold text-center w-16">Qty</th>
                  <th className="py-2.5 font-semibold text-right w-24">Unit Price</th>
                  <th className="py-2.5 font-semibold text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE0D5]">
                {order.items.map((item, idx) => {
                  const fragrance = item.fragrance || item.scent || '';
                  return (
                    <tr key={idx} className="hover:bg-[#FAF8F5]/50">
                      <td className="py-3 pr-2">
                        <span className="font-semibold text-[#24211D] block">{item.title}</span>
                        {fragrance ? (
                          <span className="text-[11px] text-[#8C5E35] font-medium block">
                            Fragrance: {fragrance}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 text-center font-mono font-medium">{item.quantity}</td>
                      <td className="py-3 text-right font-mono text-[#5A5248]">৳{item.price}</td>
                      <td className="py-3 text-right font-mono font-semibold text-[#24211D]">৳{item.price * item.quantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="border-t border-[#EAE0D5] pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-[#7A6F62] space-y-1 max-w-xs">
              {(order.specialNotes || order.notes) && (
                <p className="bg-[#FAF8F5] p-2 rounded border border-[#EAE0D5]">
                  <strong className="text-[#24211D]">Customer Note:</strong> {order.specialNotes || order.notes}
                </p>
              )}
              {order.courierTracking && (
                <p className="font-mono text-[#24211D]">
                  Courier Tracking: <span className="font-semibold">{order.courierTracking}</span>
                </p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5A5248]">
                <span>Items Subtotal:</span>
                <span className="font-mono font-medium">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#5A5248]">
                <span>Delivery Fee:</span>
                <span className="font-mono font-medium">৳{deliveryFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-৳{discount}</span>
                </div>
              )}
              <div className="border-t-2 border-[#24211D] pt-2 flex justify-between items-baseline font-bold text-sm text-[#24211D]">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-[#8C5E35]">৳{computedGrandTotal}</span>
              </div>
            </div>
          </div>

          {/* Thank You Note & Terms */}
          <div className="pt-6 border-t border-[#EAE0D5] text-center space-y-2">
            <p className="font-serif italic text-sm text-[#8C5E35]">
              "Thank you for welcoming House of Líora into your sanctuary."
            </p>
            <p className="text-[10px] text-[#7A6F62] leading-relaxed max-w-lg mx-auto">
              Each candle is lovingly hand-poured in small batches using 100% natural botanical soy wax and phthalate-free fine fragrance oils. Please trim the wick to 5mm before every burn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
