import { openDB } from "idb";

const DB_NAME = "telemedDB";
const DB_VERSION = 1;
const STORE_NAME = "patients";

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("name", "name", { unique: false });
      }
    },
  });
};

export const addPatient = async (patient) => {
  const db = await initDB();
  await db.add(STORE_NAME, patient);
};

export const getAllPatients = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};
