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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const CONTENT_COLLECTION = 'content';

// Type for new content creation. `createdAt` and `updatedAt` will be handled by the server.
type NewContentData = {
  title: string;
  subject: string;
  type: string;
  content: string;
  authorId: string;
  authorName: string;
};

// Type for content updates.
type UpdateContentData = {
  title: string;
  subject: string;
  type: string;
  content: string;
};


/**
 * Creates a new content document in Firestore.
 * @param firestore - The Firestore instance.
 * @param data - The data for the new content.
 */
export function createContent(firestore: Firestore, data: NewContentData) {
  const contentColRef = collection(firestore, CONTENT_COLLECTION);
  
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  addDoc(contentColRef, payload)
    .catch((error) => {
      console.error("Error creating content:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: contentColRef.path,
        operation: 'create',
        requestResourceData: payload,
      }));
      // Re-throw to be caught by the calling component's try/catch
      throw error;
    });
}

/**
 * Updates an existing content document in Firestore.
 * @param firestore - The Firestore instance.
 * @param contentId - The ID of the document to update.
 * @param data - The data to update.
 */
export function updateContent(firestore: Firestore, contentId: string, data: Partial<UpdateContentData>) {
  const contentDocRef = doc(firestore, CONTENT_COLLECTION, contentId);

  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  updateDoc(contentDocRef, payload)
    .catch((error) => {
      console.error("Error updating content:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: contentDocRef.path,
        operation: 'update',
        requestResourceData: payload,
      }));
      // Re-throw to be caught by the calling component's try/catch
      throw error;
    });
}

/**
 * Deletes a content document from Firestore.
 * @param firestore - The Firestore instance.
 * @param contentId - The ID of the document to delete.
 */
export function deleteContent(firestore: Firestore, contentId: string) {
  const contentDocRef = doc(firestore, CONTENT_COLLECTION, contentId);

  deleteDoc(contentDocRef)
    .catch((error) => {
      console.error("Error deleting content:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: contentDocRef.path,
        operation: 'delete',
      }));
      // Re-throw to be caught by the calling component's try/catch
      throw error;
    });
}
