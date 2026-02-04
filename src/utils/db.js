import { openDB } from "idb";

export const dbPromise = openDB("telemedicine-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("appointments")) {
      db.createObjectStore("appointments", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});
