import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import type { ParsedResume } from '../../types';
import { Download } from 'lucide-react';

interface DownloadPDFButtonProps {
  data: ParsedResume;
  keywords?: string[];
  filename?: string;
}

export const DownloadPDFButton = ({ data, keywords = [], filename = 'tailored-resume.pdf' }: DownloadPDFButtonProps) => (
  <PDFDownloadLink document={<ResumePDF data={data} keywords={keywords} />} fileName={filename}>
    {({ loading }) => (
      <button
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {loading ? 'Preparing PDF...' : 'Download PDF'}
      </button>
    )}
  </PDFDownloadLink>
);
