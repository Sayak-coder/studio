'use client';
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Content, initialFormData } from './types';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { createOrUpdateContent, handleBackgroundUpload } from '@/firebase/firestore/content';
import { FirebaseError } from 'firebase/app';
import { doc } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingContent: Content | null;
  user: User;
}

type UserProfile = {
  roles: string[];
};


type SubmissionState = 'idle' | 'saving' | 'error';

export default function ContentForm({ isOpen, onClose, editingContent, user }: ContentFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [formData, setFormData] = useState(initialFormData);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);


  useEffect(() => {
    if (editingContent) {
      setFormData({
        title: editingContent.title,
        subject: editingContent.subject,
        type: editingContent.type,
        content: editingContent.content,
        fileUrl: editingContent.fileUrl,
        fileType: editingContent.fileType,
        year: editingContent.year,
        category: editingContent.category,
      });
    } else {
      setFormData(initialFormData);
    }
    setFileToUpload(null);
    setSubmissionState('idle');
  }, [editingContent, isOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
         toast({ variant: 'destructive', title: 'File Too Large', description: 'Please select a file smaller than 5MB.' });
         setFileToUpload(null);
         e.target.value = ''; // Reset the input
         return;
      }
      setFileToUpload(file);
      // If editing, clear old fileUrl so the new file takes precedence
      if(editingContent) {
        setFormData(prev => ({...prev, fileUrl: '', fileType: ''}));
      }
    }
  };


  const handleTypeChange = (value: Content['type']) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleYearChange = (value: string) => {
    setFormData((prev) => ({ ...prev, year: parseInt(value) as 1 | 2 | 3 | 4 }));
  };

  const handleStreamChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async () => {
    if (!user || !firestore || !userProfile) return;
    if (!formData.title || !formData.subject || !formData.content || !formData.year || !formData.category) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out Title, Subject, Year, Stream, and Content.' });
      return;
    }
    
    setSubmissionState('saving');
    
    try {
      const contentData = {
        title: formData.title,
        subject: formData.subject,
        type: formData.type,
        content: formData.content,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        roles: userProfile.roles,
        year: formData.year,
        category: formData.category,
      };
      
      const documentId = await createOrUpdateContent(firestore, contentData, editingContent?.id);

      if (fileToUpload) {
        onClose();

        toast({
          title: 'Content Saved!',
          description: `Uploading "${fileToUpload.name}" in the background...`,
        });

        handleBackgroundUpload(
          firestore,
          user.uid,
          documentId,
          fileToUpload,
          (downloadURL) => { 
            toast({
              title: 'Upload Complete',
              description: `Your file has been attached successfully.`,
            });
          },
          (uploadError) => {
            console.error("Background upload failed:", uploadError);
            toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: 'Your file could not be attached. Please try editing the content to upload it again.'
            });
          }
        );
      } else {
        toast({
          title: 'Success!',
          description: `Your content has been ${editingContent?.id ? 'updated' : 'saved'}.`,
        });
        onClose();
      }

    } catch (error) {
      setSubmissionState('error');
      console.error("Content submission error:", error);
      const errorMessage = error instanceof FirebaseError ? error.message : 'Could not save your content. Please try again.';
      toast({ variant: 'destructive', title: 'Something went wrong', description: errorMessage });
    } finally {
        if (!fileToUpload) {
            setSubmissionState('idle');
        }
    }
  };
  
  const isSubmitting = submissionState === 'saving';

  const getButtonText = () => {
    if (isSubmitting) return 'Saving...';
    return editingContent ? 'Update' : 'Save Contribution';
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-card pt-4 z-10">
          <DialogTitle>{editingContent ? 'Edit Content' : 'Create a New Contribution'}</DialogTitle>
          <DialogDescription>
            {editingContent ? 'Update the details below.' : 'Fill in the details below to add new academic content. Your contribution helps countless juniors.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 px-2">
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" placeholder="e.g. Advanced Data Structures" className="col-span-3" value={formData.title} onChange={handleFormChange} disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input id="subject" placeholder="e.g. Computer Science" className="col-span-3" value={formData.subject} onChange={handleFormChange} disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Year
            </Label>
            <Select onValueChange={handleYearChange} value={formData.year?.toString() || ''} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stream" className="text-right">
              Stream
            </Label>
            <Select onValueChange={handleStreamChange} value={formData.category || ''} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="CSE-AIML">CSE-AIML</SelectItem>
                <SelectItem value="ECE">ECE</SelectItem>
                <SelectItem value="EE">EE</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select onValueChange={handleTypeChange} value={formData.type} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class Notes">Class Notes</SelectItem>
                <SelectItem value="PYQ">Previous Year Question (PYQ)</SelectItem>
                <SelectItem value="Important Question">Important Question</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content
            </Label>
            <Textarea id="content" placeholder="Start writing here... You can use Markdown for formatting." className="col-span-3 min-h-[150px]" value={formData.content} onChange={handleFormChange} disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Attachment</Label>
            <div className="col-span-3 space-y-3">
              {/* File Upload Area */}
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  id="file"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  disabled={isSubmitting}
                />
                <div className="text-center space-y-2">
                  <svg className="w-8 h-8 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {fileToUpload ? fileToUpload.name : 'Drop files here or click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF, DOC (up to 5MB)</p>
                  </div>
                </div>
              </div>
              
              {/* File Preview */}
              {fileToUpload && (
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md border border-primary/30">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 16.5a.5.5 0 01-.5-.5v-5H5.707l2.147-2.146a.5.5 0 00-.708-.708l-3 3a.5.5 0 000 .708l3 3a.5.5 0 00.708-.708L5.707 11H7.5v5a.5.5 0 01-.5.5z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileToUpload.name}</p>
                      <p className="text-xs text-muted-foreground">{(fileToUpload.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFileToUpload(null);
                      const fileInput = document.getElementById('file') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Current File Info */}
              {formData.fileUrl && !fileToUpload && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground mb-1">Current file:</p>
                  <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-400 hover:underline break-all">
                    {formData.fileUrl.split('%2F').pop()?.split('?')[0] || 'View File'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-card pb-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <LoadingSpinner />}
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
