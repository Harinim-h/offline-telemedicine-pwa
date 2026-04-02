import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  deleteChatMessageCloud,
  createPharmacyCloud,
  getPrescriptionMessagesCloud,
  getPharmaciesCloud,
  updatePharmacyMedicinesCloud
} from "../services/cloudData";
import { deleteChatMessage, getAllChatMessages } from "../services/localData";
import { hasSupabase } from "../supabaseClient";
import SpeakableText from "../components/SpeakableText";

const PRESCRIPTION_PREFIX = "[PRESCRIPTION]";

function parsePrescriptionMessage(rawText) {
  const text = String(rawText || "").trim();
  if (!text.startsWith(PRESCRIPTION_PREFIX)) return null;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const pickup = (label) => {
    const row = lines.find((line) => line.startsWith(`${label}:`));
    return row ? row.slice(label.length + 1).trim() : "";
  };

  const medsStart = lines.findIndex((line) => line === "Medicines:");
  const notesStart = lines.findIndex((line) => line.startsWith("Notes:"));
  const medicines =
    medsStart >= 0
      ? lines
          .slice(medsStart + 1, notesStart >= 0 ? notesStart : undefined)
          .filter((line) => line.startsWith("- "))
          .map((line) => line.slice(2).trim())
      : [];

  return {
    patientName: pickup("Patient Name"),
    patientMobile: pickup("Patient Mobile"),
    doctorName: pickup("Doctor Name"),
    issuedAt: pickup("Issued At"),
    appointmentId: pickup("Appointment Id"),
    pharmacyOwnerEmail: pickup("Pharmacy Owner Email"),
    medicines,
    notes: pickup("Notes")
  };
}

export default function PharmacyAvailability() {
  const { t } = useTranslation();
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const [pharmacies, setPharmacies] = useState([]);
  const [searchMedicine, setSearchMedicine] = useState("");
  const [loading, setLoading] = useState(true);
  const [medicineName, setMedicineName] = useState("");
  const [medicineUnits, setMedicineUnits] = useState("");
  const [ownerPharmacy, setOwnerPharmacy] = useState(null);
  const [incomingPrescriptions, setIncomingPrescriptions] = useState([]);

  const [newPharmacy, setNewPharmacy] = useState({
    name: "",
    area: "",
    phone: "",
    ownerEmail: "",
    ownerPassword: ""
  });

  const loadPharmacies = useCallback(async () => {
    if (!hasSupabase || !navigator.onLine) {
      setPharmacies([]);
      setOwnerPharmacy(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getPharmaciesCloud();
      setPharmacies(data);
      if (role === "pharmacy") {
        const own = data.find(
          (p) => p.ownerEmail === String(user?.email || "").toLowerCase()
        );
        setOwnerPharmacy(own || null);
      }
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  const loadIncomingPrescriptions = useCallback(async () => {
    if (role !== "pharmacy") return;
    try {
      const currentOwnerEmail = String(user?.email || "").trim().toLowerCase();
      if (hasSupabase && navigator.onLine) {
        const cloudMessages = await getPrescriptionMessagesCloud();
        const parsed = cloudMessages
          .map((m) => {
            const parsedRx = parsePrescriptionMessage(m.text);
            return parsedRx ? { ...parsedRx, id: m.id } : null;
          })
          .filter(Boolean)
          .filter((rx) => {
            const target = String(rx?.pharmacyOwnerEmail || "ALL").trim().toLowerCase();
            return !target || target === "all" || target === currentOwnerEmail;
          });
        setIncomingPrescriptions(parsed);
        return;
      }

      const localMessages = await getAllChatMessages();
      const parsed = localMessages
        .map((m) => {
          const parsedRx = parsePrescriptionMessage(m.text);
          return parsedRx ? { ...parsedRx, id: m.id } : null;
        })
        .filter(Boolean)
        .filter((rx) => {
          const target = String(rx?.pharmacyOwnerEmail || "ALL").trim().toLowerCase();
          return !target || target === "all" || target === currentOwnerEmail;
        });
      setIncomingPrescriptions(parsed);
    } catch {
      setIncomingPrescriptions([]);
    }
  }, [role, user]);

  async function markPrescriptionDelivered(rxId) {
    try {
      if (hasSupabase && navigator.onLine) {
        await deleteChatMessageCloud(rxId);
      } else {
        await deleteChatMessage(rxId);
      }
      await loadIncomingPrescriptions();
    } catch {
      alert(t("pharmacy_unable_mark_prescription_delivered", "Unable to mark prescription as delivered."));
    }
  }

  useEffect(() => {
    loadPharmacies();
    loadIncomingPrescriptions();
    const timer = setInterval(loadPharmacies, 3000);
    const rxTimer = setInterval(loadIncomingPrescriptions, 3000);
    return () => {
      clearInterval(timer);
      clearInterval(rxTimer);
    };
  }, [loadPharmacies, loadIncomingPrescriptions]);

  async function saveMedicine() {
    if (!ownerPharmacy) {
      alert(t("pharmacy_owner_not_found"));
      return;
    }
    const key = medicineName.trim();
    const units = Number(medicineUnits);
    if (!key || Number.isNaN(units) || units < 0) {
      alert(t("pharmacy_enter_valid_medicine_units"));
      return;
    }

    const next = { ...(ownerPharmacy.medicines || {}), [key]: units };
    const updated = await updatePharmacyMedicinesCloud(ownerPharmacy.id, next);
    setOwnerPharmacy(updated);
    setMedicineName("");
    setMedicineUnits("");
    await loadPharmacies();
  }

  function selectMedicineForEdit(name, units) {
    setMedicineName(String(name || ""));
    setMedicineUnits(String(Number(units) || 0));
  }

  async function addPharmacyOwner(e) {
    e.preventDefault();
    if (!newPharmacy.name || !newPharmacy.ownerEmail || !newPharmacy.ownerPassword) {
      alert(t("pharmacy_owner_fields_required"));
      return;
    }

    await createPharmacyCloud({
      ...newPharmacy,
      medicines: {
        Paracetamol: 0,
        Ibuprofen: 0
      }
    });

    setNewPharmacy({
      name: "",
      area: "",
      phone: "",
      ownerEmail: "",
      ownerPassword: ""
    });
    await loadPharmacies();
    alert(t("pharmacy_owner_created"));
  }

  const searchKey = searchMedicine.trim().toLowerCase();

  function localizePharmacyName(name) {
    const key = String(name || "").trim().toLowerCase();
    if (key.includes("apollo")) return t("pharmacy_apollo_name");
    if (key.includes("pharmeasy")) return t("pharmacy_pharmeasy_name");
    return name || "-";
  }

  function localizeArea(area) {
    const value = String(area || "").trim().toLowerCase();
    if (value === "chennai") return t("city_chennai");
    if (value === "bangalore" || value === "bengaluru") return t("city_bangalore");
    return area || "-";
  }

  return (
    <div style={page}>
      <SpeakableText
        as="h2"
        text={t("pharmacy_title")}
        style={title}
        wrapperStyle={{ display: "flex", marginBottom: 16 }}
      />

      {!hasSupabase && (
        <SpeakableText
          as="p"
          text={t("pharmacy_not_configured")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}
      {hasSupabase && !navigator.onLine && (
        <SpeakableText
          as="p"
          text={t("pharmacy_internet_required")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}

      {role === "admin" && (
        <div style={card}>
          <h3 style={pharmacyName}>{t("pharmacy_create_owner_admin")}</h3>
          <form onSubmit={addPharmacyOwner} style={adminGrid}>
            <input
              style={searchBox}
              placeholder={t("pharmacy_name")}
              value={newPharmacy.name}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_area")}
              value={newPharmacy.area}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, area: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("phone")}
              value={newPharmacy.phone}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, phone: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_owner_email")}
              value={newPharmacy.ownerEmail}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, ownerEmail: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_owner_password")}
              value={newPharmacy.ownerPassword}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, ownerPassword: e.target.value }))}
            />
            <button style={btn} type="submit">{t("pharmacy_create_owner")}</button>
          </form>
        </div>
      )}

      {role === "pharmacy" && (
        <div style={card}>
          <h3 style={pharmacyName}>{t("pharmacy_update_stock")}</h3>
          <p style={helperText2}>
            {t("pharmacy_logged_in_as")}: {user?.email || "-"} {ownerPharmacy ? `| ${localizePharmacyName(ownerPharmacy.name)}` : ""}
          </p>
          <div style={adminGrid}>
            <input
              style={searchBox}
              placeholder={t("pharmacy_medicine_name")}
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_units")}
              type="number"
              min="0"
              value={medicineUnits}
              onChange={(e) => setMedicineUnits(e.target.value)}
            />
            <button style={btn} onClick={saveMedicine} type="button">
              {t("pharmacy_update_units")}
            </button>
          </div>
          {ownerPharmacy && (
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={stockTable}>
                <thead>
                  <tr>
                    <th style={stockHeadCell}>{t("pharmacy_medicine_name")}</th>
                    <th style={stockHeadCell}>{t("pharmacy_units")}</th>
                    <th style={stockHeadCell}>{t("common_action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ownerPharmacy.medicines || {}).map(([m, qty]) => (
                    <tr key={m}>
                      <td style={stockCell}>
                        <button
                          type="button"
                          style={medicineLinkBtn}
                          onClick={() => selectMedicineForEdit(m, qty)}
                          title={t("pharmacy_update_units")}
                        >
                          {m}
                        </button>
                      </td>
                      <td style={stockCell}>
                        {qty} {t("units")}
                      </td>
                      <td style={stockCell}>
                        <button
                          type="button"
                          style={smallActionBtn}
                          onClick={() => selectMedicineForEdit(m, qty)}
                        >
                          {t("common_edit")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={tableHint}>{t("pharmacy_click_medicine_to_edit")}</p>
            </div>
          )}
        </div>
      )}

      {role === "pharmacy" && (
        <div style={card}>
          <h3 style={pharmacyName}>
            {t("pharmacy_incoming_prescriptions", "Incoming Prescriptions")}
          </h3>
          {incomingPrescriptions.length === 0 ? (
            <p style={helperText2}>
              {t("pharmacy_no_incoming_prescriptions", "No prescriptions received yet.")}
            </p>
          ) : (
            incomingPrescriptions.map((rx) => (
              <div key={rx.id} style={rxCard}>
                <p style={rxMeta}>
                  <strong>{t("chat_prescription_patient_label", "Patient")}:</strong> {rx.patientName || "-"}
                  {" | "}
                  <strong>{t("mobile", "Mobile")}:</strong> {rx.patientMobile || "-"}
                </p>
                <p style={rxMeta}>
                  <strong>{t("doctor", "Doctor")}:</strong> {rx.doctorName || "-"}
                  {" | "}
                  <strong>{t("date", "Date")}:</strong> {rx.issuedAt || "-"}
                </p>
                <p style={rxMeta}>
                  <strong>{t("chat_prescription_pharmacy_owner", "Pharmacy Owner")}:</strong> {rx.pharmacyOwnerEmail || "ALL"}
                </p>
                <p style={rxTitle}>{t("chat_prescription_medicines", "Medicines")}:</p>
                {rx.medicines.length === 0 ? (
                  <p style={rxItem}>-</p>
                ) : (
                  rx.medicines.map((item, idx) => (
                    <p key={`${rx.id}_item_${idx}`} style={rxItem}>
                      {idx + 1}. {item}
                    </p>
                  ))
                )}
                {rx.notes && (
                  <p style={rxNote}>
                    <strong>{t("chat_prescription_notes", "Notes")}:</strong> {rx.notes}
                  </p>
                )}
                <button
                  type="button"
                  style={smallActionBtn}
                  onClick={() => markPrescriptionDelivered(rx.id)}
                >
                  {t("pharmacy_mark_given_delete", "Given to patient (Delete)")}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <input
        type="text"
        placeholder={t("pharmacy_search_placeholder")}
        value={searchMedicine}
        onChange={(e) => setSearchMedicine(e.target.value)}
        style={searchBox}
      />

      {!searchMedicine && (
        <SpeakableText
          as="p"
          text={t("pharmacy_helper")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}
      {loading && (
        <SpeakableText
          as="p"
          text={t("loading")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}

      {pharmacies.map((pharmacy) => {
        let found = false;
        let stock = 0;

        if (searchKey && pharmacy.medicines) {
          Object.entries(pharmacy.medicines).forEach(([medicine, qty]) => {
            if (medicine.toLowerCase() === searchKey) {
              found = true;
              stock = Number(qty);
            }
          });
        }

        return (
          <div key={pharmacy.id} style={card}>
            <h3 style={pharmacyName}>{localizePharmacyName(pharmacy.name)}</h3>
            <SpeakableText as="p" text={`${t("pharmacy_area")}: ${localizeArea(pharmacy.area)}`} wrapperStyle={{ display: "flex" }} />
            <SpeakableText as="p" text={`${t("phone")}: ${pharmacy.phone || "-"}`} wrapperStyle={{ display: "flex" }} />

            {searchKey && (
              <>
                {found ? (
                  stock > 0 ? (
                    <p style={available}>
                      {t("available")} - {stock} {t("units")}
                    </p>
                  ) : (
                    <p style={outOfStock}>{t("out_of_stock")}</p>
                  )
                ) : (
                  <p style={notFound}>{t("not_available")}</p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  color: "#0f2027",
  marginBottom: 16
};

const searchBox = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #b0bec5",
  marginBottom: 10
};

const helperText = {
  color: "#546e7a",
  marginBottom: 20
};

const helperText2 = {
  color: "#37545f",
  marginBottom: 10
};

const card = {
  background: "#ffffff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 14,
  boxShadow: "0 6px 14px rgba(0,0,0,0.12)"
};

const pharmacyName = {
  marginBottom: 6,
  color: "#203a43"
};

const available = {
  color: "green",
  fontWeight: 600,
  marginTop: 8
};

const outOfStock = {
  color: "red",
  fontWeight: 600,
  marginTop: 8
};

const notFound = {
  color: "#ff6f00",
  fontWeight: 500,
  marginTop: 8
};

const adminGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 8,
  alignItems: "start"
};

const btn = {
  border: "none",
  borderRadius: 8,
  background: "#2c5364",
  color: "#fff",
  padding: "10px 12px",
  cursor: "pointer"
};

const stockTable = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 420
};

const stockHeadCell = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #d6e2e8",
  background: "#eef5f8",
  color: "#1e3f4d",
  fontWeight: 700,
  fontSize: 14
};

const stockCell = {
  padding: "10px 12px",
  borderBottom: "1px solid #edf3f6",
  color: "#203a43",
  fontSize: 14
};

const medicineLinkBtn = {
  border: "none",
  background: "transparent",
  color: "#11556f",
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
  fontWeight: 600
};

const smallActionBtn = {
  border: "1px solid #bfd1d9",
  background: "#f8fcfe",
  color: "#1f4d5f",
  borderRadius: 8,
  padding: "4px 10px",
  fontSize: 13,
  cursor: "pointer"
};

const tableHint = {
  marginTop: 8,
  fontSize: 12,
  color: "#4f6974"
};

const rxCard = {
  border: "1px solid #d6e3e8",
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
  background: "#f8fcfe"
};

const rxMeta = {
  margin: "4px 0",
  color: "#2f4a53",
  fontSize: 13
};

const rxTitle = {
  margin: "8px 0 4px",
  fontWeight: 700,
  color: "#1f3d49"
};

const rxItem = {
  margin: "2px 0",
  color: "#1f3d49",
  fontSize: 14
};

const rxNote = {
  marginTop: 8,
  color: "#1f3d49",
  fontSize: 13,
  fontStyle: "italic"
};
