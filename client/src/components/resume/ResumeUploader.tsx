import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';

interface ResumeUploaderProps {
  onFile: (file: File) => void;
  file: File | null;
  onClear: () => void;
  loading?: boolean;
}

export const ResumeUploader = ({ onFile, file, onClear, loading }: ResumeUploaderProps) => {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) onFile(accepted[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <AnimatePresence mode="wait">
      {file ? (
        <motion.div
          key="file"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-3 p-4 rounded-xl border border-brand-500/40 bg-brand-500/5"
        >
          <FileText className="w-8 h-8 text-brand-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#e6edf3] truncate">{file.name}</p>
            <p className="text-xs text-[#8b949e]">{(file.size / 1024).toFixed(1)} KB · PDF</p>
          </div>
          {!loading && (
            <button onClick={onClear} className="text-[#8b949e] hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-[#2a3347] hover:border-brand-500/50 hover:bg-brand-500/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? 'text-brand-400' : 'text-[#4a5568]'}`} />
            <p className="text-sm text-[#8b949e]">
              {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume PDF'}
            </p>
            <p className="text-xs text-[#4a5568] mt-1">or click to browse · Max 5MB</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
