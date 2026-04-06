import { openDB } from "idb";

const DB_NAME = "telemed-offline-db";
const DB_VERSION = 4;

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

    if (!db.objectStoreNames.contains("pharmacies")) {
      const pharmacies = db.createObjectStore("pharmacies", {
        keyPath: "id"
      });
      pharmacies.createIndex("ownerEmail", "ownerEmail");
      pharmacies.createIndex("createdAt", "createdAt");
      pharmacies.createIndex("updatedAt", "updatedAt");
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
    syncStatus: user?.syncStatus || existing?.syncStatus || "synced",
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
    syncStatus: patient?.syncStatus || "synced",
    cloudId:
      patient?.cloudId === undefined || patient?.cloudId === null
        ? null
        : patient.cloudId,
    createdAt: nowTs(),
    updatedAt: nowTs()
  });
}

export async function upsertPatientRecord(patient) {
  const db = await dbPromise;
  const existing =
    patient?.id === undefined || patient?.id === null
      ? null
      : await db.get("patients", patient.id);
  const record = {
    ...existing,
    ...patient,
    cloudId:
      patient?.cloudId === undefined || patient?.cloudId === null
        ? existing?.cloudId ?? patient?.id ?? null
        : patient.cloudId,
    syncStatus: patient?.syncStatus || existing?.syncStatus || "synced",
    createdAt: existing?.createdAt || Number(patient?.createdAt || 0) || nowTs(),
    updatedAt: Number(patient?.updatedAt || 0) || nowTs()
  };
  await db.put("patients", record);
  return record;
}

export async function replacePatientRecords(patients) {
  const db = await dbPromise;
  const tx = db.transaction("patients", "readwrite");
  await tx.store.clear();
  for (const patient of patients || []) {
    const existingCreatedAt = Number(patient?.createdAt || 0) || nowTs();
    await tx.store.put({
      ...patient,
      cloudId:
        patient?.cloudId === undefined || patient?.cloudId === null
          ? patient?.id ?? null
          : patient.cloudId,
      syncStatus: patient?.syncStatus || "synced",
      createdAt: existingCreatedAt,
      updatedAt: Number(patient?.updatedAt || 0) || existingCreatedAt
    });
  }
  await tx.done;
  return getAllPatientRecords();
}

export async function getAllPatientRecords() {
  const db = await dbPromise;
  const data = await db.getAll("patients");
  return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function updatePatientRecordLocal(id, updates) {
  const db = await dbPromise;
  const existing = await db.get("patients", id);
  if (!existing) throw new Error("patient-not-found");
  const merged = {
    ...existing,
    ...updates,
    id: existing.id,
    cloudId:
      updates?.cloudId === undefined || updates?.cloudId === null
        ? existing?.cloudId ?? existing.id ?? null
        : updates.cloudId,
    syncStatus: updates?.syncStatus || existing?.syncStatus || "synced",
    updatedAt: nowTs()
  };
  await db.put("patients", merged);
  return merged;
}

export async function replacePatientRecordLocal(oldId, patient) {
  const db = await dbPromise;
  const tx = db.transaction("patients", "readwrite");
  const oldKey =
    oldId === undefined || oldId === null || oldId === ""
      ? null
      : oldId;
  const nextKey =
    patient?.id === undefined || patient?.id === null || patient?.id === ""
      ? null
      : patient.id;

  if (oldKey !== null && nextKey !== null && String(oldKey) !== String(nextKey)) {
    await tx.store.delete(oldKey);
  }

  await tx.store.put({
    ...patient,
    syncStatus: patient?.syncStatus || "synced",
    cloudId:
      patient?.cloudId === undefined || patient?.cloudId === null
        ? patient?.id ?? null
        : patient.cloudId,
    createdAt: Number(patient?.createdAt || 0) || nowTs(),
    updatedAt: Number(patient?.updatedAt || 0) || nowTs()
  });
  await tx.done;
  return patient;
}

export async function deletePatientRecordLocal(id) {
  const db = await dbPromise;
  await db.delete("patients", id);
  return true;
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

export async function getAppointmentById(id) {
  const db = await dbPromise;
  const numericId = Number(id);
  const key = Number.isNaN(numericId) ? id : numericId;
  return db.get("appointments", key);
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

export async function getAllChatMessages() {
  const db = await dbPromise;
  const all = await db.getAll("messages");
  return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function deleteChatMessage(id) {
  const db = await dbPromise;
  const numericId = Number(id);
  const key = Number.isNaN(numericId) ? id : numericId;
  await db.delete("messages", key);
  return true;
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

export async function savePharmacyLocal(pharmacy) {
  const db = await dbPromise;
  const id = String(pharmacy?.id || "").trim();
  if (!id) throw new Error("pharmacy-id-required");
  const existing = await db.get("pharmacies", id);
  const record = {
    ...existing,
    ...pharmacy,
    id,
    ownerEmail: String(pharmacy?.ownerEmail || existing?.ownerEmail || "")
      .trim()
      .toLowerCase(),
    medicines: pharmacy?.medicines || existing?.medicines || {},
    syncStatus: pharmacy?.syncStatus || existing?.syncStatus || "synced",
    createdAt: existing?.createdAt || Number(pharmacy?.createdAt || 0) || nowTs(),
    updatedAt: Number(pharmacy?.updatedAt || 0) || nowTs()
  };
  await db.put("pharmacies", record);
  return record;
}

export async function getAllPharmaciesLocal() {
  const db = await dbPromise;
  const all = await db.getAll("pharmacies");
  return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getPharmacyByIdLocal(id) {
  const db = await dbPromise;
  return db.get("pharmacies", String(id || "").trim());
}

export async function getPharmacyByOwnerEmailLocal(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const all = await getAllPharmaciesLocal();
  return all.find((pharmacy) => String(pharmacy?.ownerEmail || "").trim().toLowerCase() === normalized) || null;
}

export async function deletePharmacyLocal(id) {
  const db = await dbPromise;
  await db.delete("pharmacies", String(id || "").trim());
  return true;
}
