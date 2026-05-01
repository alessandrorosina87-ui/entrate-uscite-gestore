import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "transactions";

export const addTransaction = async (userId, data) => {
  // data should contain: type, category, amount, description, fattura, date
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
};

export const getDailyTransactions = (userId, date, callback, onError) => {
  // date is expected in YYYY-MM-DD format
  console.log(`[Realtime Listener] Subscribing to: ${userId} | Date: ${date}`);

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", date)
    // Removed orderBy("createdAt") to avoid mandatory composite index errors in production
  );

  return onSnapshot(q, (snapshot) => {
    console.log(`[Realtime Listener] Data received for ${date}. Count: ${snapshot.size}`);
    const transactions = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort in memory to avoid index requirements
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
    
    callback(transactions);
  }, (error) => {
    console.error("Error in getDailyTransactions:", error);
    if (onError) onError(error);
  });
};


export const deleteTransaction = async (id) => {
  return await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const updateTransaction = async (id, data) => {
  return await updateDoc(doc(db, COLLECTION_NAME, id), data);
};

