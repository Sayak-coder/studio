'use client';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type StorageReference,
} from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { firebaseApp } from '../config';

const CONTENT_COLLECTION = 'content';
const storage = getStorage(firebaseApp);

// Base type for content data.
type ContentData = {
  title: string;
  subject: string;
  type: string;
  content: string;
  authorId: string;
  authorName: string;
  roles: string[];
  year?: number;
};

/**
 * Creates or updates a content document in Firestore, WITHOUT file data.
 * File upload is handled separately to make the initial save faster.
 * @param firestore - The Firestore instance.
 * @param data - The data for the content.
 * @param docId - The ID of the document to update (optional).
 * @returns A promise that resolves with the document ID.
 */
export async function createOrUpdateContent(
  firestore: Firestore,
  data: Omit<ContentData, 'fileUrl' | 'fileType'>, // Exclude file fields
  docId?: string
): Promise<string> {
  try {
    if (docId) {
      // Update existing document
      const contentDocRef = doc(firestore, CONTENT_COLLECTION, docId);
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(contentDocRef, payload);
      return docId;
    } else {
      // Create new document
      const contentColRef = collection(firestore, CONTENT_COLLECTION);
      const payload = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        fileUrl: '',
        fileType: '',
        fileName: '',
        fileSize: 0,
      };
      const newDocRef = await addDoc(contentColRef, payload);
      return newDocRef.id;
    }
  } catch (serverError) {
     const path = docId ? doc(firestore, CONTENT_COLLECTION, docId).path : collection(firestore, CONTENT_COLLECTION).path;
     const operation = docId ? 'update' : 'create';

     errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: path,
        operation: operation,
        requestResourceData: data,
      })
    );
    throw serverError; // Re-throw to be caught by the handleSubmit's try-catch block
  }
}

/**
 * Handles the file upload process as a separate step after content creation.
 * It uploads the file and then updates the corresponding document with the file's metadata.
 * This function is designed to be called without being awaited, allowing the UI to proceed.
 * @param firestore The Firestore instance.
 * @param userId The current user's ID.
 * @param docId The ID of the document to associate the file with.
 * @param file The file to be uploaded.
 * @param onComplete A callback function for when the upload succeeds.
 * @param onError A callback function for when the upload fails.
 */
export function handleBackgroundUpload(
  firestore: Firestore,
  userId: string,
  docId: string,
  file: File,
  onComplete: (downloadURL: string) => void,
  onError: (error: Error) => void
): void {
  const uploadAndLinkFile = async () => {
    try {
      console.log(`Starting background upload for file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      console.log(`Upload path: content/${userId}/${docId}/${file.name}`);
      
      const { downloadURL, fileType } = await uploadFile(userId, docId, file);
      console.log(`File uploaded successfully. URL: ${downloadURL}`);

      const contentDocRef = doc(firestore, CONTENT_COLLECTION, docId);
      const updatePayload = {
        fileUrl: downloadURL,
        fileType: fileType,
        fileName: file.name,
        fileSize: file.size,
        updatedAt: serverTimestamp(),
      };
      
      console.log('Updating Firestore document with file metadata...');
      await updateDoc(contentDocRef, updatePayload);
      console.log('Firestore document updated successfully');

      onComplete(downloadURL);

    } catch (error: any) {
      console.error("Background upload and linking failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      if (error.code && (error.code.includes('permission-denied') || error.code.includes('storage/unauthorized'))) {
        console.error('Permission denied. Check Firebase Storage rules.');
        const path = doc(firestore, CONTENT_COLLECTION, docId).path;
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: path,
          operation: 'update',
          requestResourceData: { fileUrl: '...' },
        }));
      }
      onError(error);
    }
  };

  uploadAndLinkFile();
}


/**
 * Uploads a file to Firebase Storage.
 * @param userId - The ID of the user uploading the file.
 * @param contentId - The ID of the content document.
 * @param file - The file to upload.
 * @returns A promise that resolves with the download URL and file type.
 */
export function uploadFile(
  userId: string,
  contentId: string,
  file: File
): Promise<{ downloadURL: string; fileType: string }> {
  return new Promise((resolve, reject) => {
    try {
      const contentType = file.type || 'application/octet-stream';
      const filePath = `content/${userId}/${contentId}/${file.name}`;
      
      console.log(`Creating storage reference: ${filePath}`);
      console.log(`File type: ${contentType}`);
      
      const storageRef: StorageReference = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress monitoring
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress.toFixed(2)}% done (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
          console.log(`Upload state: ${snapshot.state}`);
        },
        (error) => {
          console.error('Upload failed with error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          reject(error);
        },
        () => {
          console.log('Upload completed, getting download URL...');
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log('Download URL obtained:', downloadURL);
              resolve({ downloadURL, fileType: contentType });
            })
            .catch((error) => {
              console.error('Failed to get download URL:', error);
              reject(error);
            });
        }
      );
    } catch (error) {
      console.error('Error initializing upload:', error);
      reject(error);
    }
  });
}


/**
 * Deletes a content document from Firestore.
 * @param firestore - The Firestore instance.
 * @param contentId - The ID of the document to delete.
 */
export function deleteContent(firestore: Firestore, contentId: string) {
  const contentDocRef = doc(firestore, CONTENT_COLLECTION, contentId);

  return deleteDoc(contentDocRef).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentDocRef.path,
      operation: 'delete',
    }));
    throw serverError;
  });
}
