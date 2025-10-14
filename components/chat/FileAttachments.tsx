import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, FileText, Image as ImageIcon, Trash2, Download, Eye } from 'lucide-react';

interface FileAttachmentsProps {
  darkMode: boolean;
  userId: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({ darkMode, userId }) => {
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(selectedFiles).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/files/${userId}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        await fetchFiles();
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${userId}/${fileId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative p-8 rounded-2xl border-2 border-dashed transition-all ${
          dragOver
            ? darkMode
              ? 'border-purple-500 bg-purple-900/20'
              : 'border-purple-400 bg-purple-50'
            : darkMode
              ? 'border-slate-700 hover:border-slate-600'
              : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        />
        
        <div className="text-center">
          <Upload size={40} className={`mx-auto mb-3 ${
            darkMode ? 'text-slate-500' : 'text-slate-400'
          }`} />
          <p className={`text-sm font-medium mb-1 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Drop files here or click to upload
          </p>
          <p className={`text-xs ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            PDF, DOC, images up to 10MB
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`mt-4 px-6 py-2.5 rounded-xl font-medium transition-all ${
              darkMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            } disabled:opacity-50`}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 ? (
        <div className="space-y-2">
          <h4 className={`text-sm font-semibold uppercase tracking-wide ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            Your Files ({files.length})
          </h4>
          
          <div className="space-y-2">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className={`p-4 rounded-xl border transition-all ${
                    darkMode 
                      ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileIcon size={20} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {file.name}
                      </p>
                      <p className={`text-xs ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-slate-700 text-slate-400' 
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="View"
                      >
                        <Eye size={16} />
                      </a>
                      <a
                        href={file.url}
                        download
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-slate-700 text-slate-400' 
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-red-900/50 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`text-center py-8 px-4 rounded-xl border ${
          darkMode 
            ? 'bg-slate-800/30 border-slate-700/50' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <File size={32} className={`mx-auto mb-2 ${
            darkMode ? 'text-slate-600' : 'text-slate-400'
          }`} />
          <p className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            No files uploaded yet
          </p>
        </div>
      )}
    </div>
  );
};

export default FileAttachments;