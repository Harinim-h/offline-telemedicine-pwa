import { openDB } from "idb";

const DB_NAME = "telemed-offline-db";
const DB_VERSION = 3;

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

    if (!db.objectStoreNames.contains("authCache")) {
      const authCache = db.createObjectStore("authCache", {
        keyPath: "key"
      });
      authCache.createIndex("role", "role");
      authCache.createIndex("identifier", "identifier");
      authCache.createIndex("updatedAt", "updatedAt");
    }

    if (!db.objectStoreNames.contains("doctors")) {
      const doctors = db.createObjectStore("doctors", {
        keyPath: "email"
      });
      doctors.createIndex("id", "id");
      doctors.createIndex("createdAt", "createdAt");
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
  const createdAt = Number(appointment?.createdAt || 0) || nowTs();
  const updatedAt = Number(appointment?.updatedAt || 0) || nowTs();
  return db.add("appointments", {
    ...appointment,
    cloudId:
      appointment?.cloudId === undefined || appointment?.cloudId === null
        ? null
        : appointment.cloudId,
    syncStatus: appointment?.syncStatus || "synced",
    createdAt,
    updatedAt
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
    // Keep local primary key stable. Do not overwrite with cloud row id.
    id: existing.id,
    updatedAt: nowTs()
  };
  await db.put("appointments", merged);
  return merged;
}

export async function deleteAppointmentById(id) {
  const db = await dbPromise;
  await db.delete("appointments", id);
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

function authKey(role, identifier) {
  return `${String(role || "").trim().toLowerCase()}:${String(identifier || "")
    .trim()
    .toLowerCase()}`;
}

export async function saveOfflineCredential(role, identifier, password, userData) {
  const db = await dbPromise;
  const normalizedRole = String(role || "").trim().toLowerCase();
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
  const key = authKey(normalizedRole, normalizedIdentifier);
  if (!normalizedRole || !normalizedIdentifier || !password) {
    throw new Error("offline-auth-data-required");
  }

  await db.put("authCache", {
    key,
    role: normalizedRole,
    identifier: normalizedIdentifier,
    password: String(password).trim(),
    userData: userData || null,
    updatedAt: nowTs()
  });
}

export async function getOfflineCredential(role, identifier) {
  const db = await dbPromise;
  return db.get("authCache", authKey(role, identifier));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function slugId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function addDoctorCredential(doctor) {
  const db = await dbPromise;
  const email = normalizeEmail(doctor.email);
  if (!email) throw new Error("doctor-email-required");
  const existing = await db.get("doctors", email);
  if (existing) throw new Error("doctor-already-exists");

  const idBase = slugId(doctor.id || doctor.name || email);
  const record = {
    id: idBase ? `doc_${idBase}` : `doc_${Date.now()}`,
    name: String(doctor.name || "").trim() || "Doctor",
    email,
    password: String(doctor.password || "").trim(),
    specialty: String(doctor.specialty || "General Medicine").trim(),
    createdAt: nowTs(),
    updatedAt: nowTs()
  };
  await db.put("doctors", record);
  return record;
}

export async function getDoctorByEmail(email) {
  const db = await dbPromise;
  return db.get("doctors", normalizeEmail(email));
}

export async function getAllDoctors() {
  const db = await dbPromise;
  const all = await db.getAll("doctors");
  return all.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}
