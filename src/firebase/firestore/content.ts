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

// Type for content updates.
type UpdateContentData = Partial<Omit<ContentData, 'authorId' | 'authorName'>>;


/**
 * Uploads a file to Firebase Storage and then creates a new content document in Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user uploading the file.
 * @param data - The base data for the new content.
 * @param file - The file to upload (optional).
 * @param onProgress - Callback to report upload progress (optional).
 */
export function uploadFileAndCreateContent(
  firestore: Firestore,
  userId: string,
  data: ContentData,
  file: File | null,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!file) {
      // If no file, just create the document
      createContent(firestore, data).then(() => resolve()).catch(reject);
      return;
    }

    const filePath = `content/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Upload failed:', error);
        // We can create a specific StoragePermissionError if needed,
        // but for now, we'll use a generic error.
        reject(error);
      },
      () => {
        // Upload completed successfully, now get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const finalData = {
            ...data,
            fileUrl: downloadURL,
            fileType: file.type,
          };
          createContent(firestore, finalData).then(() => resolve()).catch(reject);
        }).catch(reject);
      }
    );
  });
}


/**
 * Creates a new content document in Firestore.
 * @param firestore - The Firestore instance.
 * @param data - The data for the new content.
 */
export function createContent(firestore: Firestore, data: ContentData) {
  const contentColRef = collection(firestore, CONTENT_COLLECTION);
  
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(contentColRef, payload).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentColRef.path,
      operation: 'create',
      requestResourceData: payload,
    }));
  });
}

/**
 * Updates an existing content document in Firestore.
 * @param firestore - The Firestore instance.
 * @param contentId - The ID of the document to update.
 * @param data - The data to update.
 */
export function updateContent(firestore: Firestore, contentId: string, data: UpdateContentData) {
  const contentDocRef = doc(firestore, CONTENT_COLLECTION, contentId);

  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(contentDocRef, payload).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentDocRef.path,
      operation: 'update',
      requestResourceData: payload,
    }));
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
  });
}
