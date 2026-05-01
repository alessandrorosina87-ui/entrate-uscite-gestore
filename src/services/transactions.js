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
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
};

export const getDailyTransactions = (userId, date, callback, onError) => {
  // Imposta inizio e fine giornata in UTC fisso per evitare drift di fuso orario
  const startStr = `${date}T00:00:00.000Z`;
  const endStr = `${date}T23:59:59.999Z`;

  console.log(`[Query] User: ${userId} | Range: ${startStr} to ${endStr}`);

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", ">=", startStr),
    where("date", "<=", endStr),
    orderBy("date", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
