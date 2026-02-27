import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import {
  getPatientUserCloud,
  registerPatientUserCloud,
  getPharmacyOwnerLoginCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";
import {
  getPatientUserByMobile,
  saveOfflineCredential,
  getOfflineCredential,
  savePatientUserLocal
} from "../services/localData";

const DOCTOR_ACCOUNTS = [
  {
    id: "doc_kumar",
    name: "Dr. Kumar",
    email: "doctor@gmail.com",
    password: "doctor@123"
  },
  {
    id: "doc_anjali",
    name: "Dr. Anjali",
    email: "anjali@gmail.com",
    password: "anjali@123"
  },
  {
    id: "doc_arun",
    name: "Dr. Arun",
    email: "arun@gmail.com",
    password: "arun@123"
  }
];

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ---------------- ROLE FIELDS ---------------- */
  const roleFields = {
    patient: [
      { label: t("name"), name: "name", type: "text" },
      { label: t("age"), name: "age", type: "number" },
      { label: t("mobile"), name: "mobile", type: "tel" }
    ],
    doctor: [
      { label: t("email"), name: "email", type: "email" },
      { label: t("password"), name: "password", type: "password" }
    ],
    pharmacy: [
      { label: t("email"), name: "email", type: "email" },
      { label: t("password"), name: "password", type: "password" }
    ],
    admin: [
      { label: t("email"), name: "email", type: "email" },
      { label: t("password"), name: "password", type: "password" }
    ]
  };

  /* ---------------- HANDLERS ---------------- */
  const handleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleRole = (r) => {
    setRole(r);
    setFormData({});
    setIsNewUser(r === "patient"); // ✅ only patient can register
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const completeLogin = (loggedRole, userData, route, extra = {}) => {
    sessionStorage.setItem("role", loggedRole);
    if (extra.patientMobile) {
      sessionStorage.setItem("patientMobile", String(extra.patientMobile));
    }
    sessionStorage.setItem("userData", JSON.stringify(userData));
    navigate(route);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ===== DOCTOR DIRECT LOGIN ===== */
      if (role === "doctor") {
        const email = (formData.email || "").trim().toLowerCase();
        const password = (formData.password || "").trim();
        const doctor = DOCTOR_ACCOUNTS.find(
          (d) => d.email === email && d.password === password
        );
        if (doctor) {
          completeLogin(
            "doctor",
            {
              role: "doctor",
              id: doctor.id,
              name: doctor.name,
              email: doctor.email
            },
            "/doctor-home"
          );
        } else {
          alert("Invalid Doctor Credentials");
        }
        setLoading(false);
        return;
      }

      /* ===== ADMIN DIRECT LOGIN ===== */
      if (role === "admin") {
        const email = (formData.email || "").trim().toLowerCase();
        const password = (formData.password || "").trim();
        if (
          email === "admin@gmail.com" &&
          password === "admin@123"
        ) {
          completeLogin(
            "admin",
            { role: "admin", email: "admin@gmail.com" },
            "/admin-home"
          );
        } else {
          alert("Invalid Admin Credentials");
        }
        setLoading(false);
        return;
      }

      /* ===== PHARMACY LOGIN (FROM SUPABASE) ===== */
      if (role === "pharmacy") {
        const email = (formData.email || "").trim().toLowerCase();
        const password = (formData.password || "").trim();
        let pharmacy = null;

        if (hasSupabase && navigator.onLine) {
          try {
            pharmacy = await getPharmacyOwnerLoginCloud(email, password);
            if (pharmacy) {
              await saveOfflineCredential("pharmacy", email, password, pharmacy);
            }
          } catch (error) {
            console.warn("Cloud pharmacy login failed, trying offline cache.", error);
          }
        }

        if (!pharmacy) {
          const cached = await getOfflineCredential("pharmacy", email);
          if (cached && cached.password === password) {
            pharmacy = cached.userData;
          }
        }

        if (!pharmacy) {
          if (!navigator.onLine) {
            alert("Offline pharmacy login failed. First login once with internet to cache credentials.");
          } else {
            alert("Invalid Pharmacy Credentials");
          }
          setLoading(false);
          return;
        }

        completeLogin(
          "pharmacy",
          {
            role: "pharmacy",
            email: pharmacy.ownerEmail,
            pharmacyId: pharmacy.id,
            pharmacyName: pharmacy.name
          },
          "/pharmacy"
        );
        setLoading(false);
        return;
      }

      /* ===== PATIENT REGISTER / LOGIN ===== */
      const userId = (formData.mobile || "").trim();
      if (!userId) {
        alert("Mobile number required");
        setLoading(false);
        return;
      }

      const patientData = { ...formData, mobile: userId, role: "patient" };

      // REGISTER
      if (isNewUser) {
        if (!hasSupabase || !navigator.onLine) {
          alert("Patient registration requires internet.");
          setLoading(false);
          return;
        }
        const cloudExisting = await getPatientUserCloud(userId);
        if (cloudExisting) {
          alert("User already exists. Please login.");
          setIsNewUser(false);
          setLoading(false);
          return;
        }
        const registered = await registerPatientUserCloud(patientData);
        await savePatientUserLocal(registered);
        alert(t("registered_success"));
        setIsNewUser(false);
        setFormData({});
        setLoading(false);
        return;
      }

      // LOGIN
      let loginUser = null;

      if (hasSupabase && navigator.onLine) {
        try {
          loginUser = await getPatientUserCloud(userId);
          if (loginUser) {
            await savePatientUserLocal(loginUser);
          }
        } catch (error) {
          console.warn("Cloud patient login failed, trying offline cache.", error);
        }
      }

      if (!loginUser) {
        loginUser = await getPatientUserByMobile(userId);
      }

      if (!loginUser) {
        if (!navigator.onLine) {
          alert("Offline login failed. Register/login once online first.");
        } else {
          alert(t("invalid_credentials"));
        }
        setLoading(false);
        return;
      }

      completeLogin(
        "patient",
        loginUser,
        "/patient-home",
        { patientMobile: userId }
      );
    } catch (err) {
      console.error(err);
      if (role === "pharmacy") {
        const msg = String(err?.message || "");
        const code = String(err?.code || "");
        if (code === "42P01" || msg.toLowerCase().includes("relation") || msg.toLowerCase().includes("pharmacies")) {
          alert("Pharmacy login failed: 'pharmacies' table not found. Run supabase-schema.sql in Supabase SQL Editor.");
        } else if (code === "42501") {
          alert("Pharmacy login failed: Supabase RLS policy denied access. Re-run supabase-schema.sql policies.");
        } else {
          alert(`Pharmacy login failed: ${msg || "Unknown error"}`);
        }
      } else {
        alert(`Something went wrong: ${err?.message || "Unknown error"}`);
      }
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={container}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#0f2027" }}>{t("welcome")}</h2>

        <div style={langWrap}>
          <button onClick={() => handleLanguage("en")} style={langBtn}>English</button>
          <button onClick={() => handleLanguage("ta")} style={langBtn}>தமிழ்</button>
          <button onClick={() => handleLanguage("hi")} style={langBtn}>हिन्दी</button>
          <button onClick={() => handleLanguage("ml")} style={langBtn}>മലയാളം</button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <h3 style={{ color: "#203a43" }}>{t("select_role")}</h3>
        {["patient", "doctor", "pharmacy", "admin"].map((r) => (
          <button key={r} onClick={() => handleRole(r)} style={roleBtn}>
            {t(r)}
          </button>
        ))}
      </div>

      {role && (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <h3 style={{ textAlign: "center", color: "#203a43" }}>
            {isNewUser ? t("register") : t("login")}
          </h3>

          {roleFields[role].map((f) => (
            <input
              key={f.name}
              {...f}
              placeholder={f.label}
              value={formData[f.name] || ""}
              onChange={handleChange}
              required
              style={input}
            />
          ))}

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? "Please wait..." : isNewUser ? t("register") : t("login")}
          </button>

          {/* ✅ TOGGLE ONLY FOR PATIENT */}
          {role === "patient" && (
            <p style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setIsNewUser(!isNewUser)}
                style={toggleBtn}
              >
                {isNewUser ? t("already_account") : t("new_user")}
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  );
}

/* ---------------- THEME ---------------- */
const container = {
  maxWidth: 480,
  margin: "40px auto",
  padding: 24,
  borderRadius: 12,
  background: "#e0f7fa",
  boxShadow: "0 8px 24px rgba(15,32,39,0.35)"
};

const langWrap = { display: "flex", justifyContent: "center", gap: 10, marginTop: 10 };

const langBtn = {
  padding: "8px 16px",
  borderRadius: 20,
  border: "1px solid #2c5364",
  background: "#ffffff",
  color: "#203a43",
  fontWeight: "600",
  cursor: "pointer"
};

const roleBtn = {
  margin: 6,
  padding: "10px 22px",
  background: "#2c5364",
  color: "#ffffff",
  border: "none",
  borderRadius: 20,
  cursor: "pointer"
};

const input = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #b0bec5"
};

const submitBtn = {
  width: "100%",
  marginTop: 16,
  padding: 12,
  background: "#203a43",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
};

const toggleBtn = {
  background: "none",
  border: "none",
  color: "#203a43",
  cursor: "pointer",
  textDecoration: "underline"
};
