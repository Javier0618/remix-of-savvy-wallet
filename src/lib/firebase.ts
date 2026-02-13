import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQPhRybMgl02hfyy47q6WYviqI9hLo_8k",
  authDomain: "fin3-96594.firebaseapp.com",
  projectId: "fin3-96594",
  storageBucket: "fin3-96594.firebasestorage.app",
  messagingSenderId: "640156387591",
  appId: "1:640156387591:web:0d2b52604f08c57bb9da2",
  measurementId: "G-2S5DBNNS37",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth helpers
export const createUser = async (email: string, password: string, name: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  await setDoc(doc(db, "users", uid, "profile", "info"), { name, email });
  await setDoc(doc(db, "users", uid, "settings", "goal"), { amount: 0 });
  await setDoc(doc(db, "users", uid, "settings", "expenseLimit"), { amount: null, active: false });

  const incomeCats = [
    { name: "Salario", icon: "💼" },
    { name: "Intereses", icon: "💰" },
    { name: "Freelance", icon: "🖥️" },
    { name: "Regalos", icon: "🎁" },
    { name: "Ventas", icon: "📦" },
    { name: "Otros", icon: "🔧" },
  ];
  const expenseCats = [
    { name: "Comida", icon: "🍽️" },
    { name: "Transporte", icon: "🚗" },
    { name: "Entretenimiento", icon: "🎬" },
    { name: "Hogar", icon: "🏠" },
    { name: "Salud", icon: "🩺" },
    { name: "Educación", icon: "🎓" },
    { name: "Servicios", icon: "💡" },
    { name: "Ropa", icon: "👕" },
    { name: "Viajes", icon: "✈️" },
    { name: "Ahorro", icon: "💰" },
    { name: "Otros", icon: "🔧" },
  ];
  for (const cat of incomeCats) {
    await setDoc(doc(db, "users", uid, "categories_income", cat.name), cat);
  }
  for (const cat of expenseCats) {
    await setDoc(doc(db, "users", uid, "categories_expense", cat.name), cat);
  }
  return cred.user;
};

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const loginAnonymously = () => signInAnonymously(auth);

export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// Transaction helpers
export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  desc: string;
  date: string;
  linkedSavingsId?: string;
  created?: string;
}

export const addTransaction = async (uid: string, tx: Omit<Transaction, "id">) => {
  await addDoc(collection(db, "users", uid, "transactions"), {
    ...tx,
    created: new Date().toISOString(),
  });
};

export const updateTransaction = async (uid: string, txId: string, updated: Partial<Transaction>) => {
  await updateDoc(doc(db, "users", uid, "transactions", txId), updated);
};

export const deleteTransaction = async (uid: string, txId: string) => {
  await deleteDoc(doc(db, "users", uid, "transactions", txId));
};

// Goal helpers
export const setGoal = async (uid: string, amount: number) => {
  await setDoc(doc(db, "users", uid, "settings", "goal"), { amount }, { merge: true });
};

export const clearGoal = async (uid: string) => {
  await setDoc(doc(db, "users", uid, "settings", "goal"), { amount: null }, { merge: true });
};

// Expense limit helpers
export const setExpenseLimit = async (uid: string, amount: number, active: boolean) => {
  await setDoc(doc(db, "users", uid, "settings", "expenseLimit"), { amount, active }, { merge: true });
};

export const clearExpenseLimit = async (uid: string) => {
  await setDoc(doc(db, "users", uid, "settings", "expenseLimit"), { amount: null, active: false }, { merge: true });
};

// Savings helpers
export const addSavingsContribution = async (uid: string, contribution: number) => {
  const contribRef = await addDoc(collection(db, "users", uid, "savings_contributions"), {
    amount: contribution,
    date: new Date().toISOString(),
    created: new Date().toISOString(),
  });
  await addDoc(collection(db, "users", uid, "transactions"), {
    type: "expense",
    amount: contribution,
    category: "Ahorro",
    desc: "Aporte a ahorro",
    date: new Date().toISOString(),
    linkedSavingsId: contribRef.id,
  });
  return contribRef.id;
};

export const addSavingsWithdrawal = async (uid: string, amount: number) => {
  const wRef = await addDoc(collection(db, "users", uid, "savings_withdrawals"), {
    amount,
    date: new Date().toISOString(),
    created: new Date().toISOString(),
  });
  await addDoc(collection(db, "users", uid, "transactions"), {
    type: "income",
    amount,
    category: "Retiro de ahorro",
    desc: "Retiro desde ahorros",
    date: new Date().toISOString(),
    linkedSavingsId: wRef.id,
  });
  return wRef.id;
};

export const deleteSavingsContribution = async (uid: string, contribId: string) => {
  await deleteDoc(doc(db, "users", uid, "savings_contributions", contribId));
  const q2 = query(collection(db, "users", uid, "transactions"), where("linkedSavingsId", "==", contribId));
  const snap = await getDocs(q2);
  for (const d of snap.docs) await deleteDoc(d.ref);
};

export const deleteSavingsWithdrawal = async (uid: string, withdrawalId: string) => {
  await deleteDoc(doc(db, "users", uid, "savings_withdrawals", withdrawalId));
  const q2 = query(collection(db, "users", uid, "transactions"), where("linkedSavingsId", "==", withdrawalId));
  const snap = await getDocs(q2);
  for (const d of snap.docs) await deleteDoc(d.ref);
};

// Report helpers
export const generateMonthlyReport = async (uid: string, data: Record<string, unknown>) => {
  await addDoc(collection(db, "users", uid, "monthly_reports"), {
    ...data,
    created: new Date().toISOString(),
  });
};

export const deleteMonthlyReport = async (uid: string, reportId: string) => {
  await deleteDoc(doc(db, "users", uid, "monthly_reports", reportId));
};

// Category helpers
export const addCategory = async (uid: string, type: "income" | "expense", name: string, icon: string) => {
  const col = type === "income" ? "categories_income" : "categories_expense";
  await setDoc(doc(db, "users", uid, col, name), { name, icon });
};

// Subscriptions
export const subscribeToTransactions = (uid: string, cb: (txs: Transaction[]) => void) => {
  const q = query(collection(db, "users", uid, "transactions"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
  });
};

export interface CategoryMeta {
  name: string;
  icon: string;
}

export const subscribeToCategories = (
  uid: string,
  type: "income" | "expense",
  cb: (cats: CategoryMeta[]) => void
) => {
  const col = type === "income" ? "categories_income" : "categories_expense";
  return onSnapshot(collection(db, "users", uid, col), (snap) => {
    cb(snap.docs.map((d) => d.data() as CategoryMeta));
  });
};

export const subscribeToGoal = (uid: string, cb: (goal: number | null) => void) => {
  return onSnapshot(doc(db, "users", uid, "settings", "goal"), (snap) => {
    const data = snap.data();
    cb(data?.amount ?? null);
  });
};

export const subscribeToExpenseLimit = (
  uid: string,
  cb: (limit: { amount: number | null; active: boolean }) => void
) => {
  return onSnapshot(doc(db, "users", uid, "settings", "expenseLimit"), (snap) => {
    const data = snap.data();
    cb({ amount: data?.amount ?? null, active: data?.active ?? false });
  });
};

export interface SavingsEntry {
  id: string;
  amount: number;
  date: string;
}

export const subscribeToContributions = (uid: string, cb: (entries: SavingsEntry[]) => void) => {
  const q = query(collection(db, "users", uid, "savings_contributions"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavingsEntry)));
  });
};

export const subscribeToWithdrawals = (uid: string, cb: (entries: SavingsEntry[]) => void) => {
  const q = query(collection(db, "users", uid, "savings_withdrawals"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavingsEntry)));
  });
};

export const subscribeToProfile = (uid: string, cb: (profile: { name: string; email: string }) => void) => {
  return onSnapshot(doc(db, "users", uid, "profile", "info"), (snap) => {
    const data = snap.data();
    cb({ name: data?.name ?? "Usuario", email: data?.email ?? "" });
  });
};

export interface MonthlyReport {
  id: string;
  month: string;
  incomes: number;
  expenses: number;
  contributions: number;
  goal: number | null;
  expenseByCategory: Record<string, number>;
  created: string;
}

export const subscribeToMonthlyReports = (uid: string, cb: (reports: MonthlyReport[]) => void) => {
  const q = query(collection(db, "users", uid, "monthly_reports"), orderBy("created", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MonthlyReport)));
  });
};

// Reset
export const resetUserData = async (uid: string) => {
  const cols = ["transactions", "savings_contributions", "savings_withdrawals", "monthly_reports"];
  for (const colName of cols) {
    const snap = await getDocs(query(collection(db, "users", uid, colName)));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await setDoc(doc(db, "users", uid, "settings", "goal"), { amount: 0 });
  await setDoc(doc(db, "users", uid, "settings", "expenseLimit"), { amount: null, active: false });
};
