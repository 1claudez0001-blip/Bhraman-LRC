import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

export default function PhotoUpload({ photo, setPhoto }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {photo ? (
        <div className="relative w-full">
          <img src={photo} alt="Student preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
          <button
            type="button"
            onClick={() => setPhoto('')}
            className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg hover:bg-black/80 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-xl text-ub-gray hover:border-ub-red hover:text-ub-red transition cursor-pointer"
        >
          <Upload size={24} />
          <span className="text-sm font-medium">Upload student photo</span>
          <span className="text-xs">Click to select an image</span>
        </button>
      )}
    </div>
  );
}