import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, ShoppingBag, Clock, DollarSign, Trash2 } from 'lucide-react';
import { CustomerUser, OrderRecord } from '../../types';

interface CustomerDetailModalProps {
  customer: CustomerUser;
  orders: OrderRecord[];
  onClose: () => void;
  onOpenOrderInvoice?: (order: OrderRecord) => void;
  onDeleteCustomer?: (customer: CustomerUser) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  orders,
  onClose,
  onOpenOrderInvoice,
  onDeleteCustomer
}) => {
  const customerOrders = orders.filter(o => 
    o.customerPhone === customer.phone || 
    (customer.email && o.customerEmail?.toLowerCase() === customer.email.toLowerCase())
  );

  const totalSpent = customerOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white border border-[#EAE0D5] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#EAE0D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8C5E35]/15 text-[#8C5E35] flex items-center justify-center font-serif text-base font-bold">
              {customer.name?.slice(0, 2).toUpperCase() || 'CU'}
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#24211D]">
                {customer.name}
              </h3>
              <p className="text-[11px] text-[#7A6F62] font-mono">
                Patron Member since {customer.joinedAt || 'Recently'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7A6F62] hover:text-[#24211D] hover:bg-[#EAE0D5] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5]">
              <span className="text-[10px] text-[#7A6F62] uppercase font-mono tracking-wider block">Total Orders</span>
              <p className="text-xl font-bold font-serif text-[#24211D] mt-1">{customerOrders.length}</p>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5]">
              <span className="text-[10px] text-[#7A6F62] uppercase font-mono tracking-wider block">Total Spent</span>
              <p className="text-xl font-bold font-serif text-[#8C5E35] mt-1">৳{totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#7A6F62] uppercase font-mono tracking-wider block">Delivery Region</span>
              <p className="text-xs font-semibold text-[#24211D] mt-1 truncate">{customer.city || 'Dhaka'}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 p-4 bg-white rounded-lg border border-[#EAE0D5]">
            <h4 className="text-xs font-semibold text-[#24211D] uppercase tracking-wide">Patron Profile & Address</h4>
            <div className="space-y-1.5 text-[#5A5248]">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span className="font-mono">{customer.phone}</span>
                <a href={`tel:${customer.phone}`} className="text-[#8C5E35] hover:underline text-[11px] ml-1">(Call)</a>
              </p>
              {customer.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8C5E35]" />
                  <span>{customer.email}</span>
                </p>
              )}
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8C5E35] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{customer.address}</span>
              </p>
            </div>
          </div>

          {/* Order History */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#24211D] uppercase tracking-wide flex items-center justify-between">
              <span>Order History ({customerOrders.length})</span>
            </h4>

            {customerOrders.length === 0 ? (
              <p className="text-xs text-[#7A6F62] p-4 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] text-center">
                No orders recorded under this phone/email.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {customerOrders.map(order => (
                  <div key={order.id} className="p-3 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5] flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-[#8C5E35]">#{order.id}</span>
                        <span className="text-[10px] text-[#7A6F62]">{order.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-[#5A5248]">
                        {order.items.length} item(s) · {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs block text-[#24211D]">৳{order.grandTotal}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium capitalize bg-white border border-[#EAE0D5]">
                          {order.status}
                        </span>
                      </div>
                      {onOpenOrderInvoice && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenOrderInvoice(order);
                          }}
                          className="px-2 py-1 bg-white hover:bg-[#EAE0D5] border border-[#D8CEBE] rounded text-[10px] font-medium cursor-pointer"
                        >
                          Invoice ↗
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE0D5] flex items-center justify-between">
          {onDeleteCustomer ? (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove customer "${customer.name}"?`)) {
                  onDeleteCustomer(customer);
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Customer</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
