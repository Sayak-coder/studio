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
import { useFirestore } from '@/firebase';
import { createContent, updateContent, uploadFileAndCreateContent } from '@/firebase/firestore/content';

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingContent: Content | null;
  user: User;
}

export default function ContentForm({ isOpen, onClose, editingContent, user }: ContentFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);


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
      setFileToUpload(null);
    } else {
      setFormData(initialFormData);
      setFileToUpload(null);
    }
    setUploadProgress(null);
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
    }
  };


  const handleTypeChange = (value: Content['type']) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async () => {
    if (!user || !firestore) return;
    if (!formData.title || !formData.subject || !formData.content) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out Title, Subject, and Content.' });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      if (editingContent && !fileToUpload) {
        // Update existing content without changing the file
        const updateData = {
            title: formData.title,
            subject: formData.subject,
            type: formData.type,
            content: formData.content,
        };
        await updateContent(firestore, editingContent.id, updateData);
        toast({ title: 'Success!', description: 'Your content has been updated.' });
      } else {
         const newContentBase = {
          ...formData,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
        };
        await uploadFileAndCreateContent(
            firestore,
            user.uid,
            newContentBase,
            fileToUpload,
            setUploadProgress // Pass the progress setter
        );

        toast({ title: 'Success!', description: 'Your contribution has been added.' });
      }
      onClose();
    } catch (error) {
      console.error("Content submission error:", error);
      toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not save your content. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            <Input id="title" placeholder="e.g. Advanced Data Structures" className="col-span-3" value={formData.title} onChange={handleFormChange} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input id="subject" placeholder="e.g. Computer Science" className="col-span-3" value={formData.subject} onChange={handleFormChange} />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select onValueChange={handleTypeChange} value={formData.type}>
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
            <Textarea id="content" placeholder="Start writing here... You can use Markdown for formatting." className="col-span-3 min-h-[150px]" value={formData.content} onChange={handleFormChange}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="file" className="text-right">
              File
            </Label>
            <Input id="file" type="file" className="col-span-3" onChange={handleFileChange} accept="image/*,.pdf" />
          </div>
           {uploadProgress !== null && (
             <div className="col-span-4 px-1">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1 text-center">{Math.round(uploadProgress)}% uploaded</p>
             </div>
           )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingContent ? 'Update' : 'Save Contribution'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
