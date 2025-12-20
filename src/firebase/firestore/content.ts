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
 * @param firestore The Firestore instance.
 * @param userId The current user's ID.
 * @param docId The ID of the document to associate the file with.
 * @param file The file to be uploaded.
 * @param onProgress A callback function to track upload progress.
 * @param onComplete A callback function for when the upload succeeds.
 * @param onError A callback function for when the upload fails.
 */
export function handleBackgroundUpload(
  firestore: Firestore,
  userId: string,
  docId: string,
  file: File,
  onProgress: (progress: number) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): void {
  // This function is intentionally not async and does not return a promise
  // to ensure it runs in the background without blocking the UI.
  
  uploadFile(userId, docId, file, onProgress)
    .then(({ downloadURL, fileType }) => {
      const contentDocRef = doc(firestore, CONTENT_COLLECTION, docId);
      const updatePayload = {
        fileUrl: downloadURL,
        fileType: fileType,
        fileName: file.name,
        fileSize: file.size,
        updatedAt: serverTimestamp(),
      };
      
      updateDoc(contentDocRef, updatePayload)
        .then(() => {
          onComplete();
        })
        .catch((updateError) => {
           console.error("Document update failed after upload:", updateError);
           errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: contentDocRef.path,
              operation: 'update',
              requestResourceData: updatePayload,
           }));
           onError(updateError);
        });
    })
    .catch((uploadError) => {
      console.error("Background upload failed:", uploadError);
      onError(uploadError as Error);
    });
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
    const filePath = `content/${userId}/${contentId}/${file.name}`;
    const storageRef: StorageReference = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error);
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
    throw serverError;
  });
}
