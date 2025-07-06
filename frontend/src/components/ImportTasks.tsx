"use client";

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { normalizeDateForImport } from '@/lib/dateUtils';

export default function ImportTasks() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const requiredFields = ['title'];
          const actualFields = results.meta.fields || [];
          if (!requiredFields.every(field => actualFields.includes(field))) {
            throw new Error("CSV must contain at least a 'title' column.");
          }

          const dataToImport = (results.data as any[]).map(row => ({
            ...row,
            deadline: normalizeDateForImport(row.deadline)
          }));

          const res = await fetch('http://127.0.0.1:8000/api/tasks/import/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToImport),
          });

          if (!res.ok) {
            const errorData = await res.json();
            let errorMessage = 'Failed to import tasks.';
            if (Array.isArray(errorData)) {
              const firstErrorIndex = errorData.findIndex(rowError => Object.keys(rowError).length > 0);
              if (firstErrorIndex !== -1) {
                const errorRow = errorData[firstErrorIndex];
                const errorDetails = Object.entries(errorRow)
                  .map(([field, errors]) => `${field}: ${(Array.isArray(errors) ? errors.join(', ') : errors)}`)
                  .join('; ');
                errorMessage = `Error on CSV row ${firstErrorIndex + 2}: ${errorDetails}`;
              }
            } else if (typeof errorData === 'object' && errorData !== null) {
              errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
            }
            throw new Error(errorMessage);
          }

          alert('Tasks imported successfully! The page will now reload.');
          window.location.reload();
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        setError(err.message);
        setIsImporting(false);
      }
    });
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileSelect}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {isImporting ? 'Importing...' : 'Import from CSV'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2 text-center sm:text-left">{error}</p>}
    </div>
  );
} 