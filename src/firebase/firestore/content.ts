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

// Type for new content creation.
type NewContentData = {
  title: string;
  subject: string;
  type: string;
  content: string;
  authorId: string;
  authorName: string;
};

// Type for content updates. Only a subset of fields can be updated.
type UpdateContentData = {
  title?: string;
  subject?: string;
  type?: string;
  content?: string;
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

  addDoc(contentColRef, payload).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentColRef.path,
      operation: 'create',
      requestResourceData: payload,
    }));
    // Do not re-throw the error, allow the UI to handle the failed promise if needed.
    console.error("Error creating content:", serverError.message);
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

  updateDoc(contentDocRef, payload).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentDocRef.path,
      operation: 'update',
      requestResourceData: payload,
    }));
    console.error("Error updating content:", serverError.message);
  });
}

/**
 * Deletes a content document from Firestore.
 * @param firestore - The Firestore instance.
 * @param contentId - The ID of the document to delete.
 */
export function deleteContent(firestore: Firestore, contentId: string) {
  const contentDocRef = doc(firestore, CONTENT_COLLECTION, contentId);

  deleteDoc(contentDocRef).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentDocRef.path,
      operation: 'delete',
    }));
    console.error("Error deleting content:", serverError.message);
  });
}
