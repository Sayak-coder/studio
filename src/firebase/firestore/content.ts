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
  role: string;
  fileUrl?: string;
  fileType?: string;
};

/**
 * Creates or updates a content document in Firestore.
 * File upload is handled separately to make the initial save faster.
 * @param firestore - The Firestore instance.
 * @param data - The data for the content.
 * @param docId - The ID of the document to update (optional).
 * @returns A promise that resolves with the document ID.
 */
export async function createOrUpdateContent(
  firestore: Firestore,
  data: ContentData,
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
    // Re-throw the original error to be caught by the calling function
    throw serverError;
  }
}

/**
 * Handles the file upload process as a separate step after content creation.
 * @param firestore The Firestore instance.
 * @param userId The current user's ID.
 * @param docId The ID of the document to associate the file with.
 * @param file The file to be uploaded.
 * @param onProgress A callback function to track upload progress.
 * @returns A promise that resolves when the upload and document update are complete.
 */
export async function handleBackgroundUpload(
  firestore: Firestore,
  userId: string,
  docId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<void> {
    try {
        const { downloadURL, fileType } = await uploadFile(userId, docId, file, onProgress);
        const contentDocRef = doc(firestore, CONTENT_COLLECTION, docId);
        
        const updatePayload = {
            fileUrl: downloadURL,
            fileType: fileType,
            fileName: file.name,
            fileSize: file.size,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(contentDocRef, updatePayload).catch((serverError) => {
           errorEmitter.emit(
              'permission-error',
              new FirestorePermissionError({
                path: contentDocRef.path,
                operation: 'update',
                requestResourceData: updatePayload,
              })
            );
            throw serverError;
        });

    } catch (error) {
        console.error("Background upload or update failed:", error);
        // Re-throw to be handled by the calling UI component
        throw error;
    }
}


/**
 * Uploads a file to Firebase Storage.
 * @param userId - The ID of the user uploading the file.
 * @param contentId - The ID of the content document.
 * @param file - The file to upload.
 * @param onProgress - Callback to report upload progress.
 * @returns A promise that resolves with the download URL and file type.
 */
export function uploadFile(
  userId: string,
  contentId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<{ downloadURL: string; fileType: string }> {
  return new Promise((resolve, reject) => {
    // New path: content/{userId}/{contentId}/{originalFileName}
    const filePath = `content/${userId}/${contentId}/${file.name}`;
    const storageRef: StorageReference = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error); // Reject the promise on error
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            resolve({ downloadURL, fileType: file.type });
          })
          .catch(reject);
      }
    );
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
    // IMPORTANT: Re-throw the error to fail the promise in the UI
    throw serverError;
  });
}
