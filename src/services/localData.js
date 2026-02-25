import { openDB } from "idb";

const DB_NAME = "telemed-offline-db";
const DB_VERSION = 1;

function nowTs() {
  return Date.now();
}

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("users")) {
      db.createObjectStore("users", { keyPath: "mobile" });
    }

    if (!db.objectStoreNames.contains("patients")) {
      const patients = db.createObjectStore("patients", {
        keyPath: "id",
        autoIncrement: true
      });
      patients.createIndex("createdAt", "createdAt");
    }

    if (!db.objectStoreNames.contains("appointments")) {
      const appointments = db.createObjectStore("appointments", {
        keyPath: "id",
        autoIncrement: true
      });
      appointments.createIndex("patientMobile", "patientMobile");
      appointments.createIndex("doctorId", "doctorId");
      appointments.createIndex("updatedAt", "updatedAt");
    }

    if (!db.objectStoreNames.contains("messages")) {
      const messages = db.createObjectStore("messages", {
        keyPath: "id",
        autoIncrement: true
      });
      messages.createIndex("appointmentId", "appointmentId");
      messages.createIndex("createdAt", "createdAt");
    }
  }
});

export async function registerPatientUser(user) {
  const db = await dbPromise;
  const mobile = String(user.mobile || "").trim();
  if (!mobile) throw new Error("mobile-required");

  const existing = await db.get("users", mobile);
  if (existing) throw new Error("user-exists");

  const record = {
    ...user,
    mobile,
    role: "patient",
    createdAt: nowTs(),
    updatedAt: nowTs()
  };
  await db.put("users", record);
  return record;
}

export async function getPatientUserByMobile(mobile) {
  const db = await dbPromise;
  return db.get("users", String(mobile || "").trim());
}

export async function savePatientUserLocal(user) {
  const db = await dbPromise;
  const mobile = String(user.mobile || "").trim();
  if (!mobile) throw new Error("mobile-required");
  const existing = await db.get("users", mobile);
  const record = {
    ...existing,
    ...user,
    mobile,
    role: "patient",
    createdAt: existing?.createdAt || nowTs(),
    updatedAt: nowTs()
  };
  await db.put("users", record);
  return record;
}

export async function addPatientRecord(patient) {
  const db = await dbPromise;
  return db.add("patients", {
    ...patient,
    createdAt: nowTs(),
    updatedAt: nowTs()
  });
}

export async function getAllPatientRecords() {
  const db = await dbPromise;
  const data = await db.getAll("patients");
  return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function createAppointment(appointment) {
  const db = await dbPromise;
  return db.add("appointments", {
    ...appointment,
    createdAt: nowTs(),
    updatedAt: nowTs()
  });
}

export async function getAllAppointments() {
  const db = await dbPromise;
  return db.getAll("appointments");
}

export async function getAppointmentsForDoctor(doctorId) {
  const db = await dbPromise;
  const all = await db.getAll("appointments");
  return all.filter((a) => a.doctorId === doctorId);
}

export async function getAppointmentsForPatient(patientMobile, patientName) {
  const db = await dbPromise;
  const mobile = String(patientMobile || "").trim();
  const name = String(patientName || "").trim();
  const all = await db.getAll("appointments");
  return all.filter((a) => {
    if (mobile) return String(a.patientMobile || "").trim() === mobile;
    return name && String(a.patientName || "").trim() === name;
  });
}

export async function updateAppointmentById(id, updates) {
  const db = await dbPromise;
  const existing = await db.get("appointments", id);
  if (!existing) throw new Error("appointment-not-found");
  const merged = {
    ...existing,
    ...updates,
    updatedAt: nowTs()
  };
  await db.put("appointments", merged);
  return merged;
}

export async function addChatMessage(appointmentId, message) {
  const db = await dbPromise;
  return db.add("messages", {
    appointmentId,
    ...message,
    createdAt: nowTs()
  });
}

export async function getChatMessages(appointmentId) {
  const db = await dbPromise;
  const all = await db.getAll("messages");
  return all
    .filter((m) => String(m.appointmentId) === String(appointmentId))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}
