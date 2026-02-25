import { hasSupabase, supabase } from "../supabaseClient";

function ensureClient() {
  if (!hasSupabase || !supabase) {
    throw new Error("supabase-not-configured");
  }
}

function mapUser(row) {
  if (!row) return null;
  return {
    name: row.name,
    age: row.age,
    mobile: row.mobile,
    role: row.role || "patient",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

function mapPatient(row) {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    condition: row.condition,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

function mapAppointment(row) {
  return {
    id: row.id,
    patientName: row.patient_name,
    patientMobile: row.patient_mobile,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    date: row.date,
    time: row.time,
    symptoms: row.symptoms,
    tokenNo: row.token_no,
    status: row.status,
    consultType: row.consult_type,
    consultCode: row.consult_code,
    codeSharedAt: row.code_shared_at
      ? new Date(row.code_shared_at).getTime()
      : null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

function mapMessage(row) {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    text: row.text,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  };
}

function mapPharmacy(row) {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    phone: row.phone,
    ownerEmail: row.owner_email,
    ownerPassword: row.owner_password,
    medicines: row.medicines || {},
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

export async function getPatientUserCloud(mobile) {
  ensureClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("mobile", String(mobile || "").trim())
    .maybeSingle();

  if (error) throw error;
  return mapUser(data);
}

export async function registerPatientUserCloud(user) {
  ensureClient();
  const payload = {
    name: user.name,
    age: Number(user.age || 0),
    mobile: String(user.mobile || "").trim(),
    role: "patient"
  };

  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
}

export async function addPatientRecordCloud(patient) {
  ensureClient();
  const payload = {
    name: patient.name,
    age: String(patient.age || ""),
    condition: patient.condition || ""
  };
  const { data, error } = await supabase
    .from("patients")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapPatient(data);
}

export async function getAllPatientRecordsCloud() {
  ensureClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPatient);
}

export async function createAppointmentCloud(appointment) {
  ensureClient();
  const payload = {
    patient_name: appointment.patientName,
    patient_mobile: appointment.patientMobile,
    doctor_id: appointment.doctorId,
    doctor_name: appointment.doctorName,
    doctor_specialty: appointment.doctorSpecialty,
    date: appointment.date,
    time: appointment.time,
    symptoms: appointment.symptoms,
    token_no: appointment.tokenNo,
    status: appointment.status,
    consult_type: appointment.consultType,
    consult_code: appointment.consultCode
  };

  const { data, error } = await supabase
    .from("appointments")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function getAppointmentsForDoctorCloud(doctorId) {
  ensureClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function getAppointmentsForPatientCloud(patientMobile, patientName) {
  ensureClient();
  let queryBuilder = supabase.from("appointments").select("*");
  const mobile = String(patientMobile || "").trim();
  const name = String(patientName || "").trim();
  if (mobile) {
    queryBuilder = queryBuilder.eq("patient_mobile", mobile);
  } else if (name) {
    queryBuilder = queryBuilder.eq("patient_name", name);
  }

  const { data, error } = await queryBuilder.order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function getAllAppointmentsCloud() {
  ensureClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function updateAppointmentCloud(id, updates) {
  ensureClient();
  const payload = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.consultType !== undefined) payload.consult_type = updates.consultType;
  if (updates.consultCode !== undefined) payload.consult_code = updates.consultCode;
  if (updates.codeSharedAt !== undefined) {
    payload.code_shared_at = updates.codeSharedAt
      ? new Date(updates.codeSharedAt).toISOString()
      : null;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function addChatMessageCloud(appointmentId, message) {
  ensureClient();
  const payload = {
    appointment_id: String(appointmentId),
    text: message.text,
    sender_role: message.senderRole,
    sender_name: message.senderName
  };
  const { data, error } = await supabase
    .from("messages")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}

export async function getChatMessagesCloud(appointmentId) {
  ensureClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("appointment_id", String(appointmentId))
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapMessage);
}

export async function getPharmaciesCloud() {
  ensureClient();
  const { data, error } = await supabase
    .from("pharmacies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPharmacy);
}

export async function getPharmacyOwnerLoginCloud(email, password) {
  ensureClient();
  const { data, error } = await supabase
    .from("pharmacies")
    .select("*")
    .eq("owner_email", String(email || "").trim().toLowerCase())
    .eq("owner_password", String(password || "").trim())
    .maybeSingle();
  if (error) throw error;
  return data ? mapPharmacy(data) : null;
}

export async function createPharmacyCloud(payload) {
  ensureClient();
  const insertPayload = {
    name: payload.name,
    area: payload.area || "",
    phone: payload.phone || "",
    owner_email: String(payload.ownerEmail || "").trim().toLowerCase(),
    owner_password: String(payload.ownerPassword || "").trim(),
    medicines: payload.medicines || {}
  };
  const { data, error } = await supabase
    .from("pharmacies")
    .insert(insertPayload)
    .select()
    .single();
  if (error) throw error;
  return mapPharmacy(data);
}

export async function updatePharmacyMedicinesCloud(pharmacyId, medicines) {
  ensureClient();
  const { data, error } = await supabase
    .from("pharmacies")
    .update({ medicines: medicines || {} })
    .eq("id", pharmacyId)
    .select()
    .single();
  if (error) throw error;
  return mapPharmacy(data);
}
