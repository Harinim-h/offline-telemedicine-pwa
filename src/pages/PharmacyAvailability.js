import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../firebase";

export default function PharmacyAvailability() {
  const { t } = useTranslation();

  const [pharmacies, setPharmacies] = useState([]);
  const [searchMedicine, setSearchMedicine] = useState("");

  /* ---------------- FETCH PHARMACIES ---------------- */
  useEffect(() => {
    const fetchPharmacies = async () => {
      const snapshot = await getDocs(collection(db, "pharmacies"));

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setPharmacies(list);
    };

    fetchPharmacies();
  }, []);

  const searchKey = searchMedicine.trim().toLowerCase();

  return (
    <div style={page}>
      <h2 style={title}>{t("pharmacy_title")}</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder={t("pharmacy_search_placeholder")}
        value={searchMedicine}
        onChange={(e) => setSearchMedicine(e.target.value)}
        style={searchBox}
      />

      {/* ℹ️ Helper Text */}
      {!searchMedicine && (
        <p style={helperText}>{t("pharmacy_helper")}</p>
      )}

      {/* 🏥 Pharmacy Cards */}
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
            <p>📍 {pharmacy.area}</p>
            <p>📞 {pharmacy.phone}</p>

            {searchKey && (
              <>
                {found ? (
                  stock > 0 ? (
                    <p style={available}>
                      {t("available")} — {stock} {t("units")}
                    </p>
                  ) : (
                    <p style={outOfStock}>
                      {t("out_of_stock")}
                    </p>
                  )
                ) : (
                  <p style={notFound}>
                    {t("not_available")}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- STYLES (THEME SAFE) ---------------- */

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
