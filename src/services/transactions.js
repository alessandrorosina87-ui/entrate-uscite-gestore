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

export const getDailyTransactions = (userId, date, callback) => {
  // Imposta inizio e fine giornata
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", ">=", start.toISOString()),
    where("date", "<=", end.toISOString()),
    orderBy("date", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(transactions);
  });
};

export const deleteTransaction = async (id) => {
  return await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const updateTransaction = async (id, data) => {
  return await updateDoc(doc(db, COLLECTION_NAME, id), data);
};
