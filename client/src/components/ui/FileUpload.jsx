// src/components/ui/FileUpload.jsx
// Props: accept, multiple, onFiles, label, hint, error, maxSizeMB
import { useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export default function FileUpload({
  accept = '*',
  multiple = false,
  onFiles,
  label = 'Upload files',
  hint,
  error,
  maxSizeMB = 10,
  className,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  const processFiles = (files) => {
    const arr = Array.from(files);
    const oversized = arr.filter(f => f.size > maxSizeMB * 1024 * 1024);
    if (oversized.length) {
      setFileError(`File(s) exceed ${maxSizeMB} MB limit.`);
      return;
    }
    setFileError('');
    onFiles?.(arr);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const displayError = error || fileError;

  return (
    <div className={cn('w-full', className)}>
      {label && <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl px-6 py-10 flex flex-col items-center gap-3 cursor-pointer',
          'transition-all duration-150',
          dragging ? 'border-navy-400 bg-navy-50' : 'border-slate-300 bg-slate-50 hover:border-navy-300 hover:bg-navy-50/50',
          displayError && 'border-red-400 bg-red-50'
        )}
      >
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">
            <span className="text-navy-600">Click to upload</span> or drag and drop
          </p>
          {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
          <p className="text-xs text-slate-400 mt-0.5">Max {maxSizeMB} MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => processFiles(e.target.files)}
          aria-label={label}
        />
      </div>
      {displayError && <p className="mt-1.5 text-xs text-red-600" role="alert">{displayError}</p>}
    </div>
  );
}
