import React, { useState } from 'react';
import { FragranceItem } from '../../types';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  saveFragranceToFirestore, 
  deleteFragranceFromFirestore, 
  batchUpdateFragrances 
} from '../../services/firebase';

interface FragranceManagerProps {
  fragrances: FragranceItem[];
  onFragrancesChange: (fragrances: FragranceItem[]) => void;
}

export const FragranceManager: React.FC<FragranceManagerProps> = ({
  fragrances,
  onFragrancesChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFragrance, setEditingFragrance] = useState<FragranceItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeCount = fragrances.filter(f => f.active).length;
  const totalCount = fragrances.length;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const openAddModal = () => {
    setEditingFragrance(null);
    setName('');
    setDescription('');
    setActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (f: FragranceItem) => {
    setEditingFragrance(f);
    setName(f.name);
    setDescription(f.description || '');
    setActive(f.active);
    setError('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (f: FragranceItem) => {
    const updated: FragranceItem = {
      ...f,
      active: !f.active,
      updatedAt: new Date().toISOString(),
    };
    const newList = fragrances.map(item => item.id === f.id ? updated : item);
    onFragrancesChange(newList);
    await saveFragranceToFirestore(updated);
    showFeedback(`"${f.name}" is now ${updated.active ? 'Active' : 'Inactive'}`);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fragrances.length) return;

    const list = [...fragrances];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
      updatedAt: new Date().toISOString(),
    }));

    onFragrancesChange(reordered);
    await batchUpdateFragrances(reordered);
    showFeedback('Fragrance display order updated');
  };

  const handleDelete = async (f: FragranceItem) => {
    if (window.confirm(`Are you sure you want to delete "${f.name}"?\n\nNote: Existing past orders that used this fragrance will keep their stored record and will not be affected.`)) {
      const filtered = fragrances.filter(item => item.id !== f.id);
      onFragrancesChange(filtered);
      await deleteFragranceFromFirestore(f.id);
      showFeedback(`"${f.name}" deleted from library`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Fragrance name is required');
      return;
    }

    // Check duplicate name case-insensitively (excluding currently editing item)
    const isDuplicate = fragrances.some(
      f => f.name.toLowerCase() === cleanName.toLowerCase() && f.id !== editingFragrance?.id
    );

    if (isDuplicate) {
      setError(`A fragrance with the name "${cleanName}" already exists.`);
      return;
    }

    setIsSaving(true);
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0980-\u09FF]+/g, '-')
      .replace(/^-+|-+$/g, '') || `scent-${Date.now()}`;

    if (editingFragrance) {
      const updated: FragranceItem = {
        ...editingFragrance,
        name: cleanName,
        description: description.trim() || undefined,
        active,
        updatedAt: new Date().toISOString(),
      };
      const newList = fragrances.map(f => f.id === editingFragrance.id ? updated : f);
      onFragrancesChange(newList);
      await saveFragranceToFirestore(updated);
      showFeedback(`"${cleanName}" updated successfully`);
    } else {
      const newItem: FragranceItem = {
        id: slug,
        name: cleanName,
        description: description.trim() || undefined,
        active,
        sortOrder: fragrances.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newList = [...fragrances, newItem];
      onFragrancesChange(newList);
      await saveFragranceToFirestore(newItem);
      showFeedback(`"${cleanName}" added to library`);
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl text-[#24211D]">Global Fragrance Library</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#8C5E35]/10 text-[#8C5E35] border border-[#8C5E35]/20">
              {activeCount} Active / {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-[#7A6F62] mt-1">
            ম্যানেজ করুন আপনার পুরো স্টোরের গ্লোবাল পারফিউম বা অ্যারোমা লাইব্রেরি। যেকোনো ক্যান্ডলে কাস্টমার শুধুমাত্র এখান থেকে অ্যাক্টিভ থাকা সুগন্ধি সিলেক্ট করতে পারবেন।
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#8C5E35] hover:bg-[#A36E3F] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all self-stretch sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Fragrance</span>
        </button>
      </div>

      {/* Floating Feedback Notification */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Zero Active Warning */}
      {activeCount === 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-2 text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>সতর্কবার্তা: কোনো Fragrance একটিভ নেই!</span>
          </div>
          <p className="leading-relaxed">
            বর্তমানে স্টোরে কোনো সুগন্ধি একটিভ নেই। অন্তত একটি সুগন্ধি অ্যাক্টিভ না করা পর্যন্ত কাস্টমার প্রোডাক্ট পেজে পার্চেজ সম্পন্ন করতে পারবেন না।
          </p>
        </div>
      )}

      {/* Fragrances List Cards */}
      <div className="space-y-3">
        {fragrances.map((f, index) => (
          <div 
            key={f.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              f.active 
                ? 'bg-white border-[#EAE0D5] shadow-xs' 
                : 'bg-[#F9F7F5] border-[#D8CEBE]/60 opacity-75'
            }`}
          >
            {/* Left: Reorder handles & Info */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              {/* Order Controls */}
              <div className="flex sm:flex-col items-center gap-1 shrink-0 bg-[#F5F1EB] p-1 rounded-lg border border-[#EAE0D5]">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1.5 text-[#5A5248] hover:text-[#24211D] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed rounded hover:bg-white"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === fragrances.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1.5 text-[#5A5248] hover:text-[#24211D] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed rounded hover:bg-white"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Fragrance Details */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-base sm:text-lg font-semibold text-[#24211D]">
                    {f.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    f.active 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {f.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[11px] font-mono text-[#9E9282]">
                    #{f.sortOrder ?? index + 1}
                  </span>
                </div>
                {f.description && (
                  <p className="text-xs text-[#5A5248] leading-relaxed line-clamp-2">
                    {f.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions (Active Toggle, Edit, Delete) */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EAE0D5]">
              {/* Active Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggleActive(f)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  f.active
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
                title={f.active ? 'Click to deactivate' : 'Click to activate'}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${f.active ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                <span>{f.active ? 'ON' : 'OFF'}</span>
              </button>

              {/* Edit button */}
              <button
                type="button"
                onClick={() => openEditModal(f)}
                className="min-h-[44px] px-3 py-1.5 bg-white border border-[#D8CEBE] hover:border-[#8C5E35] text-[#24211D] rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#8C5E35]" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(f)}
                className="min-h-[44px] p-2.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete Fragrance"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {fragrances.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#D8CEBE] space-y-3">
            <Sparkles className="w-8 h-8 text-[#8C5E35] mx-auto opacity-50" />
            <h3 className="font-serif text-lg text-[#24211D]">No Fragrances in Library</h3>
            <p className="text-xs text-[#7A6F62]">Click 'Add New Fragrance' to create your first aroma profile.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div 
            className="bg-[#FAF8F5] text-[#24211D] rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#D8CEBE] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5]">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2 text-[#24211D]">
                <Sparkles className="w-4 h-4 text-[#8C5E35]" />
                <span>{editingFragrance ? 'Edit Fragrance Profile' : 'Add New Fragrance'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#5A5248] hover:text-[#24211D] rounded-full hover:bg-[#EAE0D5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {error}
                </div>
              )}

              {/* Fragrance Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Fragrance Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="e.g. French Vanilla or ফ্রেঞ্চ ভ্যানিলা"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] rounded-xl text-xs font-sans focus:outline-none focus:border-[#8C5E35] min-h-[44px]"
                />
                <p className="text-[11px] text-[#7A6F62]">
                  Bangla and English both supported. Name must be unique.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#24211D] block">
                  Short Description / সুবাস নোটস (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Rich Bourbon vanilla pod with warm, velvety cream undertones."
                  className="w-full px-3.5 py-2 bg-white border border-[#D8CEBE] rounded-xl text-xs leading-relaxed focus:outline-none focus:border-[#8C5E35]"
                />
              </div>

              {/* Active Toggle */}
              <div className="p-3.5 bg-white rounded-xl border border-[#EAE0D5] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#24211D] block">Active & Available on Storefront</span>
                  <p className="text-[11px] text-[#7A6F62]">
                    অন থাকলে সমস্ত প্রোডাক্ট পেজে এই সুবাসটি কাস্টমার বেছে নিতে পারবেন।
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="w-5 h-5 accent-[#8C5E35] cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#D8CEBE] bg-white text-[#5A5248] text-xs font-medium rounded-xl hover:bg-[#F5F1EB] cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#8C5E35] hover:bg-[#A36E3F] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 min-h-[44px]"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingFragrance ? 'Save Changes' : 'Add Fragrance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
