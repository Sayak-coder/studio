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
export async function createContent(firestore: Firestore, data: NewContentData) {
  const contentColRef = collection(firestore, CONTENT_COLLECTION);
  
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await addDoc(contentColRef, payload);
  } catch (error) {
    console.error("Error creating content:", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentColRef.path,
      operation: 'create',
      requestResourceData: payload,
    }));
    // Re-throw to be caught by the calling component's try/catch
    throw error;
  }
}

/**
 * Updates an existing content document in Firestore.
 * @param firestore - The Firestore instance.
 * @param contentId - The ID of the document to update.
 * @param data - The data to update.
 */
export async function updateContent(firestore: Firestore, contentId: string, data: UpdateContentData) {
  const contentDocRef = doc(firestore, CONTENT_COLLECTION, contentId);

  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(contentDocRef, payload);
  } catch (error) {
    console.error("Error updating content:", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentDocRef.path,
      operation: 'update',
      requestResourceData: payload,
    }));
    // Re-throw to be caught by the calling component's try/catch
    throw error;
  }
}

/**
 * Deletes a content document from Firestore.
 * @param firestore - The Firestore instance.
 * @param contentId - The ID of the document to delete.
 */
export async function deleteContent(firestore: Firestore, contentId: string) {
  const contentDocRef = doc(firestore, CONTENT_COLLECTION, contentId);

  try {
    await deleteDoc(contentDocRef);
  } catch (error) {
    console.error("Error deleting content:", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: contentDocRef.path,
      operation: 'delete',
    }));
    // Re-throw to be caught by the calling component's try/catch
    throw error;
  }
}

    