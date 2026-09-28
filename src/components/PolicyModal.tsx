import React from 'react';
import { X, ShieldCheck, FileText, RotateCcw, Check } from 'lucide-react';
import { StorePolicies } from '../types';
import { DEFAULT_STORE_POLICIES } from '../data/products';

export type PolicyType = 'terms' | 'privacy' | 'refund';

interface PolicyModalProps {
  isOpen: boolean;
  type: PolicyType;
  onClose: () => void;
  onSelectType?: (type: PolicyType) => void;
  policies?: StorePolicies;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  type,
  onClose,
  onSelectType,
  policies = DEFAULT_STORE_POLICIES,
}) => {
  if (!isOpen) return null;

  const currentPolicies = policies || DEFAULT_STORE_POLICIES;

  const getPolicyDetails = () => {
    switch (type) {
      case 'terms':
        return {
          title: 'Terms and Conditions',
          subtitle: 'House of Líora · Terms of Service & Atelier Standards',
          icon: <FileText className="w-5 h-5 text-[#8C5E35]" />,
          content: currentPolicies.terms || DEFAULT_STORE_POLICIES.terms,
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'House of Líora · Data Protection & Confidentiality',
          icon: <ShieldCheck className="w-5 h-5 text-[#8C5E35]" />,
          content: currentPolicies.privacy || DEFAULT_STORE_POLICIES.privacy,
        };
      case 'refund':
        return {
          title: 'Refund & Return Policy',
          subtitle: 'House of Líora · Courier Transit & Guarantee Policy',
          icon: <RotateCcw className="w-5 h-5 text-[#8C5E35]" />,
          content: currentPolicies.refund || DEFAULT_STORE_POLICIES.refund,
        };
    }
  };

  const details = getPolicyDetails();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-[#FAF8F5] text-[#24211D] rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#EAE0D5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE0D5] bg-[#F5F1EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs border border-[#EAE0D5]">
              {details.icon}
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-[#24211D]">
                {details.title}
              </h3>
              <p className="text-[11px] text-[#7A6F62]">
                {details.subtitle}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#5A5248] hover:text-[#24211D] transition-colors cursor-pointer"
            title="Close Policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Quick Tabs */}
        <div className="flex border-b border-[#EAE0D5] bg-white px-4 py-2 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'terms' as PolicyType, label: 'Terms & Conditions' },
            { id: 'privacy' as PolicyType, label: 'Privacy Policy' },
            { id: 'refund' as PolicyType, label: 'Refund & Return' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectType?.(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                type === tab.id
                  ? 'bg-[#24211D] text-white shadow-xs'
                  : 'text-[#5A5248] hover:bg-[#FAF8F5] hover:text-[#24211D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body / Text Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm text-[#4A433A] leading-relaxed whitespace-pre-line font-sans">
          {details.content}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F5F1EB] border-t border-[#EAE0D5] flex items-center justify-between">
          <span className="text-[11px] text-[#7A6F62]">
            House of Líora · Handcrafted in Bangladesh
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs font-semibold rounded-full cursor-pointer shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>I Understand</span>
          </button>
        </div>
      </div>
    </div>
  );
};
