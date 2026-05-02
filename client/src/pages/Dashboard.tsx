import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getResumes, deleteResume, uploadResume } from '../services/resumeService';
import api from '../services/api';
import type { Resume } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FileText, Plus, Trash2, Wand2, Clock, Camera } from 'lucide-react';
import { ResumeUploader } from '../components/resume/ResumeUploader';

export const Dashboard = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  useEffect(() => {
    getResumes().then(setResumes).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const resume = await uploadResume(file);
      setResumes((prev) => [resume, ...prev]);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteResume(id);
    setResumes((prev) => prev.filter((r) => r._id !== id));
  };

  const handlePhotoClick = (resumeId: string) => {
    setActivePhotoId(resumeId);
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photoFile = e.target.files?.[0];
    if (!photoFile || !activePhotoId) return;
    setPhotoUploading(activePhotoId);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const { data } = await api.patch(`/resumes/${activePhotoId}/photo`, { photo: base64 });
        setResumes((prev) => prev.map((r) => r._id === activePhotoId ? { ...r, parsed: { ...r.parsed, photo: data.photo } } : r));
      };
      reader.readAsDataURL(photoFile);
    } finally {
      setPhotoUploading(null);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Dashboard</h1>
          <p className="text-sm text-[#8b949e] mt-1">Manage your resumes and tailored versions</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <p className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" /> Upload New Resume
        </p>
        <ResumeUploader file={file} onFile={setFile} onClear={() => setFile(null)} loading={uploading} />
        {file && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleUpload} loading={uploading}>
              Parse & Save Resume
            </Button>
          </div>
        )}
      </Card>

      {/* Resume List */}
      {loading ? (
        <div className="text-center py-16 text-[#4a5568]">Loading resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-16 text-[#4a5568]">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No resumes yet. Upload your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume, i) => (
            <motion.div
              key={resume._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Photo avatar */}
                <div className="relative shrink-0">
                  {resume.parsed?.photo ? (
                    <img src={resume.parsed.photo} className="w-10 h-10 rounded-full object-cover border border-[#2a3347]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
                      {resume.parsed?.name?.[0] || '?'}
                    </div>
                  )}
                  <button
                    onClick={() => handlePhotoClick(resume._id)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1e2535] border border-[#2a3347] flex items-center justify-center hover:border-brand-500 transition-colors"
                    title="Upload photo"
                  >
                    {photoUploading === resume._id
                      ? <span className="w-2.5 h-2.5 border border-brand-400 border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-2.5 h-2.5 text-[#8b949e]" />
                    }
                  </button>
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-[#e6edf3] truncate">{resume.fileName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-[#4a5568] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                    {resume.tailoredVersions?.length > 0 && (
                      <span className="text-xs text-brand-400">
                        {resume.tailoredVersions.length} tailored version{resume.tailoredVersions.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/tailor/${resume._id}`}>
                  <Button className="text-xs px-3 py-1.5">
                    <Wand2 className="w-3.5 h-3.5" /> Tailor
                  </Button>
                </Link>
                <Button variant="danger" className="text-xs px-3 py-1.5" onClick={() => handleDelete(resume._id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
