"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { FileText, Upload, Download, Trash2, Loader2 } from 'lucide-react';

function YourResume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentResume, setCurrentResume] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error('Please log in to manage your resume.');
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Check if bucket exists
        const { error: bucketError } = await supabase.storage.getBucket('resumes');
        if (bucketError) {
          console.warn('Resumes bucket not found:', bucketError.message);
          toast.error('Storage not configured. Please run the setup instructions in SUPABASE_SETUP.md');
          setLoading(false);
          return;
        }

        // Fetch current resume URL from Users table
        const { data: userData, error: fetchError } = await supabase
          .from('Users')
          .select('resume')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching user data:', fetchError.message);
        } else if (userData?.resume) {
          setCurrentResume(userData.resume);
        }
      } catch (error) {
        console.error('Initialization error:', error.message);
        toast.error('Failed to initialize page.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF or DOCX file.');
        event.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 5MB.');
        event.target.value = '';
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (!userId) {
      toast.error('You must be logged in to upload a resume.');
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/resume_${timestamp}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Update Users table with resume URL
      const { error: updateError } = await supabase
        .from('Users')
        .update({ resume: publicURL.publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      setCurrentResume(publicURL.publicUrl);
      setFile(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error.message);
      toast.error(`Failed to upload resume: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentResume || !userId) return;

    if (!confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      // Extract file path from URL
      const url = new URL(currentResume);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('resumes') + 1).join('/');

      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove([filePath]);

      if (deleteError) {
        console.warn('Error deleting file from storage:', deleteError.message);
      }

      // Update Users table to remove resume URL
      const { error: updateError } = await supabase
        .from('Users')
        .update({ resume: null })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      setCurrentResume(null);
      toast.success('Resume deleted successfully!');
    } catch (error) {
      console.error('Error deleting resume:', error.message);
      toast.error('Failed to delete resume.');
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="font-bold text-3xl mb-2">Your Resume</h2>
        <p className="text-gray-600">Upload and manage your resume for job applications</p>
      </div>

      {/* Current Resume Section */}
      {currentResume && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FileText className="h-10 w-10 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Current Resume</h3>
                <p className="text-sm text-gray-600 mb-3">Your resume is uploaded and ready</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentResume, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View/Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">
          {currentResume ? 'Upload New Resume' : 'Upload Resume'}
        </h3>

        <div className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: PDF, DOCX (Max size: 5MB)
            </p>
          </div>

          {file && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> If you encounter any upload errors, please ensure the Supabase storage bucket is properly configured.
          See SUPABASE_SETUP.md for setup instructions.
        </p>
      </div>
    </div>
  );
}

export default YourResume;
