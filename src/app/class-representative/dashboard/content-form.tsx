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
import { Progress } from "@/components/ui/progress"
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Content, initialFormData } from './types';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { createOrUpdateContent, handleBackgroundUpload } from '@/firebase/firestore/content';
import { FirebaseError } from 'firebase/app';
import { doc } from 'firebase/firestore';

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingContent: Content | null;
  user: User;
}

type UserProfile = {
  role: string;
};


type SubmissionState = 'idle' | 'saving' | 'uploading' | 'success' | 'error';

export default function ContentForm({ isOpen, onClose, editingContent, user }: ContentFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [formData, setFormData] = useState(initialFormData);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
      });
    } else {
      setFormData(initialFormData);
    }
    setFileToUpload(null);
    setUploadProgress(null);
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

  const handleSubmit = async () => {
    if (!user || !firestore || !userProfile) return;
    if (!formData.title || !formData.subject || !formData.content) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out Title, Subject, and Content.' });
      return;
    }
    
    setSubmissionState('saving');
    
    try {
      // This part now only saves the text data and is very fast.
      const contentData = {
        title: formData.title,
        subject: formData.subject,
        type: formData.type,
        content: formData.content,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        role: userProfile.role,
      };
      
      const documentId = await createOrUpdateContent(firestore, contentData, editingContent?.id);

      toast({
        title: 'Success!',
        description: `Your content has been ${editingContent?.id ? 'updated' : 'saved'}.`,
      });

      // If a file was selected, start the upload in the background.
      if (fileToUpload) {
        setSubmissionState('uploading');
        
        // This function is NOT awaited. It runs in the background.
        handleBackgroundUpload(
          firestore,
          user.uid,
          documentId,
          fileToUpload,
          (progress) => setUploadProgress(progress), // Progress callback
          () => { // Completion callback
            toast({
              title: 'Upload Complete',
              description: `Your file "${fileToUpload.name}" has been attached.`,
            });
            setSubmissionState('success');
            onClose(); // Close the form on successful upload
          },
          (uploadError) => { // Error callback
            console.error("Background upload failed:", uploadError);
            toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: 'Your file could not be attached. Please try editing the content to upload it again.'
            });
            setSubmissionState('error');
          }
        );
        // The UI is not blocked here. If the user wants to close the dialog before upload is done, they can.
        // The dialog is now closed based on the onComplete callback.
      } else {
        // If there's no file, just close the form.
        setSubmissionState('success');
        onClose();
      }

    } catch (error) {
      setSubmissionState('error');
      console.error("Content submission error:", error);
      const errorMessage = error instanceof FirebaseError ? error.message : 'Could not save your content. Please try again.';
      toast({ variant: 'destructive', title: 'Something went wrong', description: errorMessage });
    }
  };
  
  const isSubmitting = submissionState === 'saving' || submissionState === 'uploading';

  const getButtonText = () => {
    if (submissionState === 'uploading') return 'Uploading File...';
    if (submissionState === 'saving') return 'Saving Content...';
    return editingContent ? 'Update' : 'Save Contribution';
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle>{editingContent ? 'Edit Content' : 'Create a New Contribution'}</DialogTitle>
          <DialogDescription>
            {editingContent ? 'Update the details below.' : 'Fill in the details below to add new academic content. Your contribution helps countless juniors.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="file" className="text-right">
              Attachment
            </Label>
            <Input id="file" type="file" className="col-span-3" onChange={handleFileChange} accept="image/*,.pdf" disabled={isSubmitting}/>
          </div>
           {formData.fileUrl && !fileToUpload && (
              <div className="col-start-2 col-span-3 text-sm text-muted-foreground">
                Current file: <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{formData.fileUrl.split('%2F').pop()?.split('?')[0] || 'View File'}</a>
              </div>
            )}
           {uploadProgress !== null && submissionState === 'uploading' && (
             <div className="col-start-2 col-span-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1 text-center">{Math.round(uploadProgress)}% uploaded</p>
             </div>
           )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
