import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/Modal';
import { useApp } from '@/context/AppContext';
import { COLLEGE_KEYS, COLLEGE_LABELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { Upload, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export default function BookFormModal({ open, onClose, book }) {
  const { addBook, updateBook } = useApp();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [college, setCollege] = useState(COLLEGE_KEYS[0]);
  const [totalCopies, setTotalCopies] = useState(1);
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      setTitle(book?.title || '');
      setAuthor(book?.author || '');
      setCollege(book?.college || COLLEGE_KEYS[0]);
      setTotalCopies(book?.total_copies || 1);
      setDescription(book?.description || '');
      setCoverFile(null);
      setCoverPreview(book?.cover_url || '');
      setError('');
    }
  }, [open, book]);

  const isEdit = !!book;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError('Image must be under 2MB. Please compress it first.');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('');
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const uploadCover = async (bookId) => {
    if (!coverFile) return book?.cover_url || null;
    const ext = coverFile.name.split('.').pop();
    const path = `${bookId}.${ext}`;
    const { error } = await supabase.storage
      .from('book-covers')
      .upload(path, coverFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim() || !college) {
      setError('Title, author and college are required.');
      return;
    }
    if (totalCopies < 1) {
      setError('Must have at least 1 copy.');
      return;
    }

    setUploading(true);
    try {
      if (isEdit) {
        const coverUrl = await uploadCover(book.id);
        const diff = totalCopies - book.total_copies;
        const newAvailable = Math.max(0, book.available_copies + diff);
        await updateBook(book.id, {
          title: title.trim(),
          author: author.trim(),
          college,
          total_copies: totalCopies,
          available_copies: newAvailable,
          description: description.trim(),
          cover_url: coverPreview === '' ? null : coverUrl,
        });
        toast.success('Book updated.');
      } else {
        // Insert first to get ID, then upload cover
        const { data: newBook } = await addBook({
          title: title.trim(),
          author: author.trim(),
          college,
          total_copies: totalCopies,
          available_copies: totalCopies,
          description: description.trim(),
          cover_url: null,
        });
        if (newBook && coverFile) {
          const coverUrl = await uploadCover(newBook.id);
          await updateBook(newBook.id, { cover_url: coverUrl });
        }
        toast.success('Book added.');
      }
      onClose();
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Book' : 'Add Book'}>
      <div className="space-y-4">

        {/* Cover image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Book Cover</label>
          {coverPreview ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <button
                onClick={removeCover}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-ub-red hover:bg-red-50/30 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <ImageIcon size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-ub-gray">Click to upload cover image</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 2MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={e => { setError(''); setTitle(e.target.value); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
            placeholder="Book title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            value={author}
            onChange={e => { setError(''); setAuthor(e.target.value); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
            placeholder="Author name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <select
              value={college}
              onChange={e => { setError(''); setCollege(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red outline-none cursor-pointer"
            >
              {COLLEGE_KEYS.map(k => <option key={k} value={k}>{COLLEGE_LABELS[k]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copies
              {isEdit && <span className="text-xs text-ub-gray ml-1">({book.available_copies}/{book.total_copies} available)</span>}
            </label>
            <input
              type="number"
              min={1}
              value={totalCopies}
              onChange={e => { setError(''); setTotalCopies(parseInt(e.target.value) || 1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of the book..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
            ) : (
              isEdit ? 'Save Changes' : 'Add Book'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
