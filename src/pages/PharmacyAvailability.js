import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createPharmacyCloud,
  getPharmaciesCloud,
  updatePharmacyMedicinesCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

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

  useEffect(() => {
    loadPharmacies();
    const timer = setInterval(loadPharmacies, 3000);
    return () => clearInterval(timer);
  }, [loadPharmacies]);

  async function saveMedicine() {
    if (!ownerPharmacy) {
      alert("Owner pharmacy not found.");
      return;
    }
    const key = medicineName.trim();
    const units = Number(medicineUnits);
    if (!key || Number.isNaN(units) || units < 0) {
      alert("Enter valid medicine and units.");
      return;
    }

    const next = { ...(ownerPharmacy.medicines || {}), [key]: units };
    const updated = await updatePharmacyMedicinesCloud(ownerPharmacy.id, next);
    setOwnerPharmacy(updated);
    setMedicineName("");
    setMedicineUnits("");
    await loadPharmacies();
  }

  async function addPharmacyOwner(e) {
    e.preventDefault();
    if (!newPharmacy.name || !newPharmacy.ownerEmail || !newPharmacy.ownerPassword) {
      alert("Name, owner email and password are required.");
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
    alert("Pharmacy owner created.");
  }

  const searchKey = searchMedicine.trim().toLowerCase();

  return (
    <div style={page}>
      <h2 style={title}>{t("pharmacy_title")}</h2>

      {!hasSupabase && <p style={helperText}>Supabase is not configured.</p>}
      {hasSupabase && !navigator.onLine && (
        <p style={helperText}>Internet required for cloud pharmacy data.</p>
      )}

      {role === "admin" && (
        <div style={card}>
          <h3 style={pharmacyName}>Create Pharmacy Owner (Admin)</h3>
          <form onSubmit={addPharmacyOwner} style={adminGrid}>
            <input
              style={searchBox}
              placeholder="Pharmacy Name"
              value={newPharmacy.name}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder="Area"
              value={newPharmacy.area}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, area: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder="Phone"
              value={newPharmacy.phone}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, phone: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder="Owner Email"
              value={newPharmacy.ownerEmail}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, ownerEmail: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder="Owner Password"
              value={newPharmacy.ownerPassword}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, ownerPassword: e.target.value }))}
            />
            <button style={btn} type="submit">Create Owner</button>
          </form>
        </div>
      )}

      {role === "pharmacy" && (
        <div style={card}>
          <h3 style={pharmacyName}>Update Medicine Stock</h3>
          <p style={helperText2}>
            Logged in as: {user?.email || "-"} {ownerPharmacy ? `| ${ownerPharmacy.name}` : ""}
          </p>
          <div style={adminGrid}>
            <input
              style={searchBox}
              placeholder="Medicine Name (example: Paracetamol)"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
            />
            <input
              style={searchBox}
              placeholder="Units"
              type="number"
              min="0"
              value={medicineUnits}
              onChange={(e) => setMedicineUnits(e.target.value)}
            />
            <button style={btn} onClick={saveMedicine} type="button">
              Update Units
            </button>
          </div>
          {ownerPharmacy && (
            <div style={{ marginTop: 10 }}>
              {Object.entries(ownerPharmacy.medicines || {}).map(([m, qty]) => (
                <div key={m} style={miniItem}>{m}: {qty} units</div>
              ))}
            </div>
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

      {!searchMedicine && <p style={helperText}>{t("pharmacy_helper")}</p>}
      {loading && <p style={helperText}>Loading...</p>}

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
            <h3 style={pharmacyName}>{pharmacy.name}</h3>
            <p>Area: {pharmacy.area}</p>
            <p>Phone: {pharmacy.phone}</p>

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

const miniItem = {
  background: "#eef4f7",
  borderRadius: 8,
  padding: "6px 10px",
  marginBottom: 6,
  fontSize: 14
};
