'use client';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
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
  fileUrl?: string;
  fileType?: string;
};

/**
 * Uploads a file to Firebase Storage.
 * @param userId - The ID of the user uploading the file.
 * @param file - The file to upload.
 * @param onProgress - Callback to report upload progress.
 * @returns A promise that resolves with the download URL and file type.
 */
export function uploadFile(
  userId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<{ downloadURL: string; fileType: string }> {
  return new Promise((resolve, reject) => {
    const filePath = `content/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error); // Reject the promise on error
      },
      () => {
        // Upload completed successfully, now get the download URL
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
 * Creates or updates a content document in Firestore.
 * If docId is provided, it updates; otherwise, it creates a new document.
 * @param firestore - The Firestore instance.
 * @param data - The data for the content.
 * @param docId - The ID of the document to update (optional).
 */
export function createOrUpdateContent(
  firestore: Firestore,
  data: ContentData,
  docId?: string
) {
  if (docId) {
    // Update existing document
    const contentDocRef = doc(firestore, CONTENT_COLLECTION, docId);
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    return updateDoc(contentDocRef, payload).catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: contentDocRef.path,
          operation: 'update',
          requestResourceData: payload,
        })
      );
    });
  } else {
    // Create new document
    const contentColRef = collection(firestore, CONTENT_COLLECTION);
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    return addDoc(contentColRef, payload).catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: contentColRef.path,
          operation: 'create',
          requestResourceData: payload,
        })
      );
    });
  }
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
  });
}
