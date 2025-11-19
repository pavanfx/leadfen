import React, { useCallback, useState } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LeadData, Lead } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: LeadData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const processFile = (file: File) => {
    setError(null);
    setLoading(true);

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please upload a valid JSON file.');
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        let leadsRaw: any[] = [];
        
        // Support both { leads: [...] } and [...] formats
        if (Array.isArray(parsed)) {
          leadsRaw = parsed;
        } else if (parsed.leads && Array.isArray(parsed.leads)) {
          leadsRaw = parsed.leads;
        } else {
          throw new Error("Invalid JSON structure. Expected an array of leads or an object with a 'leads' array.");
        }

        if (leadsRaw.length === 0) {
          throw new Error("No leads found in the file.");
        }

        // Normalize and validate leads
        const leads: Lead[] = leadsRaw.map((item: any) => ({
          id: item.id || generateId(),
          business_name: item.business_name || "Unknown Business",
          website: item.website || "",
          business_email: item.business_email || "",
          business_phone: item.business_phone || "",
          facebook: item.facebook || "",
          instagram: item.instagram || "",
          tiktok: item.tiktok || "",
          industry: item.industry || "General",
          city: item.city || "",
          country: item.country || ""
        }));

        // Simulate a small delay for UX
        setTimeout(() => {
          onDataLoaded({ leads });
          setLoading(false);
        }, 600);
      } catch (err) {
        console.error(err);
        setError('Failed to parse JSON. Please ensure the file contains a valid list of leads.');
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 transition-all duration-300 ease-in-out text-center cursor-pointer active:scale-[0.99] touch-manipulation
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-slate-50 shadow-sm'
          }
          ${loading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".json"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full bg-indigo-100 text-indigo-600 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
             {loading ? <CheckCircle2 className="w-8 h-8 animate-pulse" /> : <Upload className="w-8 h-8" />}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {loading ? 'Processing Leads...' : 'Upload Lead List'}
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Select your JSON file to start generating messages
            </p>
          </div>
          
          {!loading && (
            <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <FileJson className="w-3 h-3" />
              <span>.json files supported</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-3 animate-fade-in border border-red-100 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;