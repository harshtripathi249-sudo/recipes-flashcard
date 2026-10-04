/**
 * Savoria Recipe Book - Firestore Recipe Operations
 * 
 * All recipes are strictly scoped under the authenticated user's ID:
 * `users/{userId}/recipes/{recipeId}`
 * 
 * Never uses unauthenticated or public paths.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

/**
 * Fetch all recipes belonging to a specific authenticated user
 */
export async function fetchUserRecipes(userId) {
  if (!isFirebaseConfigured || !db || !userId) {
    return [];
  }

  try {
    const recipesRef = collection(db, 'users', userId, 'recipes');
    const q = query(recipesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id
    }));
  } catch (err) {
    console.error('[Firestore] Error fetching user recipes:', err);
    throw err;
  }
}

/**
 * Save or update a single recipe for an authenticated user
 */
export async function saveUserRecipe(userId, recipe) {
  if (!isFirebaseConfigured || !db || !userId) {
    return;
  }

  try {
    const recipeId = recipe.id || `recipe-${Date.now()}`;
    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
    
    const cleanData = {
      ...recipe,
      id: recipeId,
      updatedAt: Date.now()
    };

    await setDoc(recipeRef, cleanData, { merge: true });
    return cleanData;
  } catch (err) {
    console.error('[Firestore] Error saving user recipe:', err);
    throw err;
  }
}

/**
 * Delete a recipe for an authenticated user
 */
export async function deleteUserRecipe(userId, recipeId) {
  if (!isFirebaseConfigured || !db || !userId) {
    return;
  }

  try {
    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
    await deleteDoc(recipeRef);
  } catch (err) {
    console.error('[Firestore] Error deleting user recipe:', err);
    throw err;
  }
}

/**
 * Sync local recipes up to Firestore when user signs in
 */
export async function syncLocalRecipesToFirestore(userId, localRecipes) {
  if (!isFirebaseConfigured || !db || !userId || !Array.isArray(localRecipes) || localRecipes.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);
    const existing = await fetchUserRecipes(userId);
    const existingIds = new Set(existing.map((r) => r.id));

    let count = 0;
    for (const recipe of localRecipes) {
      if (!existingIds.has(recipe.id)) {
        const recipeRef = doc(db, 'users', userId, 'recipes', recipe.id);
        batch.set(recipeRef, {
          ...recipe,
          syncedAt: Date.now()
        });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`[Firestore] Synced ${count} recipes to cloud for user ${userId}`);
    }
  } catch (err) {
    console.warn('[Firestore] Sync warning:', err);
  }
}
