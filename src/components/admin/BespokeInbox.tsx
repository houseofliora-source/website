import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Search, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Calendar, 
  Mail, 
  User, 
  FileText,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CustomInquiry } from '../../types';
import { updateInquiryStatusInFirestore } from '../../services/firebase';

interface BespokeInboxProps {
  inquiries: CustomInquiry[];
  onRefresh?: () => void;
  onFlash: (message: string, type?: 'success' | 'error') => void;
}

export const BespokeInbox: React.FC<BespokeInboxProps> = ({ inquiries, onRefresh, onFlash }) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<CustomInquiry | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      const itemStatus = (item.status || '').toLowerCase();
      const matchesFilter = filter === 'all' || itemStatus === filter;
      const term = search.toLowerCase().trim();
      const matchesSearch = !term || 
        item.name.toLowerCase().includes(term) ||
        item.phone.includes(term) ||
        (item.email && item.email.toLowerCase().includes(term)) ||
        (item.message && item.message.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [inquiries, filter, search]);

  const newCount = useMemo(() => {
    return inquiries.filter(i => (i.status || '').toLowerCase() === 'new').length;
  }, [inquiries]);

  const handleSelectInquiry = (inquiry: CustomInquiry) => {
    setSelectedInquiry(inquiry);
    setInternalNote(inquiry.internalNotes || '');
  };

  const handleUpdateStatus = async (inquiryId: string, newStatus: CustomInquiry['status']) => {
    const success = await updateInquiryStatusInFirestore(inquiryId, newStatus);
    if (success) {
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
      onFlash(`Inquiry marked as "${newStatus}"`, 'success');
      if (onRefresh) onRefresh();
    } else {
      onFlash('Failed to update inquiry status', 'error');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedInquiry) return;
    setSavingNote(true);
    const success = await updateInquiryStatusInFirestore(selectedInquiry.id, selectedInquiry.status, internalNote);
    setSavingNote(false);
    if (success) {
      setSelectedInquiry(prev => prev ? { ...prev, internalNotes: internalNote } : null);
      onFlash('Internal note saved successfully', 'success');
      if (onRefresh) onRefresh();
    } else {
      onFlash('Failed to save note', 'error');
    }
  };

  const getWhatsAppLink = (inquiry: CustomInquiry) => {
    const digits = inquiry.phone.replace(/\D/g, '');
    let cleanPhone = digits;
    if (digits.startsWith('880')) {
      cleanPhone = digits;
    } else if (digits.startsWith('01')) {
      cleanPhone = '88' + digits;
    } else if (digits.length === 10) {
      cleanPhone = '880' + digits;
    }
    const greeting = encodeURIComponent(
      `Assalamu Alaikum ${inquiry.name}, thank you for reaching out to House of Líora regarding your custom candle inquiry. How may we assist with your special celebration?`
    );
    return `https://wa.me/${cleanPhone}?text=${greeting}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EAE0D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#8C5E35]" />
            <h3 className="font-serif text-base font-semibold text-[#24211D]">
              Bespoke & Custom Orders Inbox
            </h3>
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                {newCount} NEW
              </span>
            )}
          </div>
          <p className="text-xs text-[#7A6F62] mt-0.5">
            হোমপেজের "Bespoke / Custom Inquiries" ফর্ম থেকে পাঠানো সকল ওয়েডিং, গিফটিং ও ইভেন্ট রিকোয়েস্ট।
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'new', 'replied', 'done'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer shrink-0 ${
                filter === tab
                  ? 'bg-[#24211D] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#EAE0D5]'
              }`}
            >
              {tab === 'all' ? `All (${inquiries.length})` : 
               tab === 'new' ? `New (${inquiries.filter(i => (i.status || '').toLowerCase() === 'new').length})` :
               tab === 'replied' ? `Replied (${inquiries.filter(i => (i.status || '').toLowerCase() === 'replied').length})` :
               `Done (${inquiries.filter(i => (i.status || '').toLowerCase() === 'done').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#7A6F62] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search inquiries by name, phone, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE0D5] rounded-lg text-xs text-[#24211D] focus:outline-none focus:border-[#8C5E35]"
        />
      </div>

      {/* Main Container - Split View on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Inquiry List */}
        <div className={`${selectedInquiry ? 'hidden lg:block lg:col-span-5' : 'col-span-12'} space-y-2.5`}>
          {filteredInquiries.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-xl border border-[#EAE0D5] space-y-2">
              <Inbox className="w-8 h-8 text-[#8C5E35] mx-auto opacity-30" />
              <p className="text-xs text-[#7A6F62]">No bespoke inquiries found.</p>
            </div>
          ) : (
            filteredInquiries.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectInquiry(item)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                  selectedInquiry?.id === item.id 
                    ? 'border-[#8C5E35] ring-1 ring-[#8C5E35] shadow-xs' 
                    : 'border-[#EAE0D5] hover:border-[#D8CEBE]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#24211D]">{item.name}</span>
                    {(item.status || '').toLowerCase() === 'new' && (
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-mono font-bold uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#7A6F62] font-mono shrink-0">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs text-[#5A5248] font-mono flex items-center gap-1.5 mb-1">
                  <Phone className="w-3 h-3 text-[#8C5E35]" />
                  <span>{item.phone}</span>
                </p>

                <p className="text-xs text-[#7A6F62] line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-2.5 pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                    (item.status || '').toLowerCase() === 'new' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                    (item.status || '').toLowerCase() === 'replied' ? 'bg-blue-50 text-blue-900 border border-blue-200' :
                    'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[#8C5E35] flex items-center gap-0.5 text-[11px] font-medium">
                    <span>View Detail</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inquiry Detail Panel */}
        {selectedInquiry ? (
          <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-[#EAE0D5] p-5 space-y-5 shadow-xs">
            {/* Header with back button on mobile */}
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="lg:hidden p-1.5 text-[#7A6F62] hover:text-[#24211D] bg-[#FAF8F5] rounded-md text-xs cursor-pointer"
                >
                  ← Back to List
                </button>
                <h4 className="font-serif text-sm sm:text-base font-semibold text-[#24211D]">
                  Inquiry from {selectedInquiry.name}
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize ${
                  (selectedInquiry.status || '').toLowerCase() === 'new' ? 'bg-amber-100 text-amber-900' :
                  (selectedInquiry.status || '').toLowerCase() === 'replied' ? 'bg-blue-100 text-blue-900' :
                  'bg-emerald-100 text-emerald-900'
                }`}>
                  {selectedInquiry.status}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons: Call & WhatsApp Reply */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="flex-1 min-w-[140px] px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#EAE0D5] text-[#24211D] border border-[#D8CEBE] rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span>Call {selectedInquiry.phone}</span>
              </a>

              <a
                href={getWhatsAppLink(selectedInquiry)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if ((selectedInquiry.status || '').toLowerCase() === 'new') {
                    handleUpdateStatus(selectedInquiry.id, 'Replied');
                  }
                }}
                className="flex-1 min-w-[140px] px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span>Reply on WhatsApp</span>
              </a>
            </div>

            {/* Inquiry Details Grid */}
            <div className="space-y-3 text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE0D5]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#8C5E35]">Full Name</span>
                  <p className="font-semibold text-[#24211D] text-sm mt-0.5">{selectedInquiry.name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#8C5E35]">Phone Number</span>
                  <p className="font-mono text-[#24211D] text-sm mt-0.5">{selectedInquiry.phone}</p>
                </div>
                {selectedInquiry.email && (
                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-[#8C5E35]">Email Address</span>
                    <p className="text-[#24211D] mt-0.5">{selectedInquiry.email}</p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#8C5E35]">Received At</span>
                  <p className="text-[#5A5248] mt-0.5 font-mono">
                    {new Date(selectedInquiry.createdAt).toLocaleString('en-US')}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAE0D5]">
                <span className="text-[10px] uppercase font-mono font-semibold text-[#8C5E35] block mb-1">
                  Customer Message / Event Specifications
                </span>
                <p className="text-[#24211D] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#EAE0D5]">
                  {selectedInquiry.message}
                </p>
              </div>
            </div>

            {/* Status Change Bar */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#24211D] block">Update Inquiry Status:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'New')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    (selectedInquiry.status || '').toLowerCase() === 'new' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#EAE0D5]'
                  }`}
                >
                  Mark as New
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'Replied')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    (selectedInquiry.status || '').toLowerCase() === 'replied' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#EAE0D5]'
                  }`}
                >
                  Mark as Replied
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'Done')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    (selectedInquiry.status || '').toLowerCase() === 'done' 
                      ? 'bg-emerald-700 text-white' 
                      : 'bg-[#FAF8F5] text-[#5A5248] hover:bg-[#EAE0D5]'
                  }`}
                >
                  ✓ Mark as Done (Archived)
                </button>
              </div>
            </div>

            {/* Internal Studio Notes */}
            <div className="space-y-2 pt-2 border-t border-[#EAE0D5]">
              <span className="text-xs font-semibold text-[#24211D] block">
                Internal Studio Notes (Private to Owner):
              </span>
              <textarea
                rows={3}
                placeholder="Write internal notes about custom pricing, quantity discussed, color preferences, etc..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full p-3 text-xs bg-[#FAF8F5] border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#8C5E35]"
              />
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-4 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white rounded-md text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                {savingNote ? 'Saving Note...' : 'Save Internal Note'}
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-7 bg-[#FAF8F5] rounded-xl border border-dashed border-[#D8CEBE] p-10 flex-col items-center justify-center text-center space-y-2 text-[#7A6F62]">
            <Inbox className="w-10 h-10 text-[#8C5E35] opacity-40" />
            <p className="text-xs font-medium">Select an inquiry from the left to view details and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
};
