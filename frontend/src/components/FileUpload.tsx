import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['.csv', '.xlsx', '.xls'];
const ACCEPTED_MIME = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function FileUpload({ onFileSelect, disabled = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      return 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).';
    }
    if (file.size === 0) {
      return 'The selected file is empty. Please upload a file with data.';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File is too large. Maximum size is 10 MB.';
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setError(err);
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
        id="file-upload"
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload file"
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
          } ${disabled ? 'cursor-not-allowed opacity-60' : 'focus:outline-none focus:ring-2 focus:ring-primary-500'}`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
            <UploadCloud className="h-7 w-7 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-700">
              Drag and drop your file here, or <span className="text-primary-600">browse</span>
            </p>
            <p className="mt-1 text-xs text-navy-400">Supports CSV, XLSX, and XLS files (max 10 MB)</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <FileText className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">{selectedFile.name}</p>
              <p className="text-xs text-navy-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="rounded-lg p-2 text-navy-400 hover:bg-gray-100 hover:text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Remove file"
            disabled={disabled}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-risk-high" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
