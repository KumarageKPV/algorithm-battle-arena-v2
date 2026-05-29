import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, X } from 'lucide-react';
import api from '../services/api';

export default function AdminProblemsPanel() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [modal, setModal] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setResult(null);
    } else {
      setResult({ success: false, message: 'Please select a valid JSON file' });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const response = await api.admin.importProblems(file);
      const count = response.data.importedCount || response.data.inserted || 0;
      setModal({ success: true, message: `Upload successful! ${count} problems imported.` });
      setFile(null);
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.message || 'Import failed';
      setModal({ success: false, message: `Import failed: ${message}` });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          Import Problems
        </h3>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="problem-file"
            />
            <label
              htmlFor="problem-file"
              className="cursor-pointer text-blue-400 hover:text-blue-300"
            >
              Select JSON file to import
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-300">
                Selected: {file.name}
              </p>
            )}
          </div>

          {file && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-2.5 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center gap-2 mx-auto"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : 'Import Problems'}
            </button>
          )}
        </div>
      </div>



      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h4 className="font-semibold mb-3 text-gray-300">Expected JSON Format:</h4>
        <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto text-gray-400">
{`[
  {
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "Easy",
    "isPublic": true,
    "isActive": true,
    "testCases": [
      {
        "input": "[2,7,11,15]\n9",
        "expectedOutput": "[0,1]",
        "isSample": true
      },
      {
        "input": "[3,2,4]\n6", 
        "expectedOutput": "[1,2]",
        "isSample": false
      }
    ]
  }
]`}
        </pre>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {modal.success ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
                <h3 className="text-lg font-semibold text-white">
                  {modal.success ? 'Success' : 'Error'}
                </h3>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 mb-4">{modal.message}</p>
            <button
              onClick={() => setModal(null)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}