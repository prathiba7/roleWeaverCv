import api from './api';
import type { Resume, TailorResult } from '../types';

export const uploadResume = async (file: File): Promise<Resume> => {
  const form = new FormData();
  form.append('resume', file);
  const { data } = await api.post<Resume>('/resumes/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getResumes = async (): Promise<Resume[]> => {
  const { data } = await api.get<Resume[]>('/resumes');
  return data;
};

export const getResume = async (id: string): Promise<Resume> => {
  const { data } = await api.get<Resume>(`/resumes/${id}`);
  return data;
};

export const deleteResume = async (id: string): Promise<void> => {
  await api.delete(`/resumes/${id}`);
};

export const tailorResume = async (payload: {
  resumeId: string;
  jobDescriptionUrl?: string;
  jobDescriptionText?: string;
  companyType: string;
}): Promise<TailorResult> => {
  const { data } = await api.post<TailorResult>('/tailor', payload);
  return data;
};
