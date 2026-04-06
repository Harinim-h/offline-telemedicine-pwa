import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import {
  getPharmacyOwnerLoginCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";
import {
  getPatientUserByMobile,
  registerPatientUser,
  saveOfflineCredential,
  getOfflineCredential,
  savePharmacyLocal,
  getDoctorByEmail
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

const PHARMACY_DEMO_ACCOUNTS = [
  {
    id: "ph_apollo",
    name: "Apollo Pharmacy",
    ownerEmail: "apollo@gmail.com",
    ownerPassword: "apollo@123"
  },
  {
    id: "ph_pharmeasy",
    name: "PharmEasy",
    ownerEmail: "pharmeasy@gmail.com",
    ownerPassword: "pharmeasy@123"
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
    patientRegister: [
      { label: t("name"), name: "name", type: "text" },
      { label: t("age"), name: "age", type: "number" },
      { label: t("mobile"), name: "mobile", type: "tel" }
    ],
    patientLogin: [
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
    sessionStorage.setItem("userLanguage", lang);
  };

  const handleRole = (r) => {
    setRole(r);
    setFormData({});
    setIsNewUser(r === "patient"); // ✅ only patient can register
  };

  const activeFields =
    role === "patient"
      ? (isNewUser ? roleFields.patientRegister : roleFields.patientLogin)
      : roleFields[role] || [];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const normalizeName = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const completeLogin = (loggedRole, userData, route, extra = {}) => {
    sessionStorage.setItem("role", loggedRole);
    const activeLang = String(i18n.language || localStorage.getItem("language") || "en");
    sessionStorage.setItem("userLanguage", activeLang);
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
        const storedDoctor = await getDoctorByEmail(email);
        if (storedDoctor && storedDoctor.password === password) {
          completeLogin(
            "doctor",
            {
              role: "doctor",
              id: storedDoctor.id,
              name: storedDoctor.name,
              email: storedDoctor.email,
              specialty: storedDoctor.specialty
            },
            "/doctor-home"
          );
          setLoading(false);
          return;
        }
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
          alert(t("login_invalid_doctor_credentials"));
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
          alert(t("login_invalid_admin_credentials"));
        }
        setLoading(false);
        return;
      }

      /* ===== PHARMACY LOGIN (OFFLINE FIRST) ===== */
      if (role === "pharmacy") {
        const email = (formData.email || "").trim().toLowerCase();
        const password = (formData.password || "").trim();
        let pharmacy = null;

        // Try offline cache first
        const cached = await getOfflineCredential("pharmacy", email);
        if (cached && cached.password === password) {
          pharmacy = cached.userData;
        }

        // If no offline cache, try static demo accounts
        if (!pharmacy) {
          const staticMatch = PHARMACY_DEMO_ACCOUNTS.find(
            (p) =>
              p.ownerEmail.toLowerCase() === email &&
              p.ownerPassword === password
          );
          if (staticMatch) {
            pharmacy = {
              id: staticMatch.id,
              name: staticMatch.name,
              ownerEmail: staticMatch.ownerEmail,
              ownerPassword: staticMatch.ownerPassword,
              medicines: {
                Paracetamol: 20,
                Ibuprofen: 15
              }
            };
            await saveOfflineCredential("pharmacy", email, password, pharmacy);
          }
        }

        // If still no match and online, try cloud
        if (!pharmacy && hasSupabase && navigator.onLine) {
          try {
            pharmacy = await getPharmacyOwnerLoginCloud(email, password);
            if (pharmacy) {
              await saveOfflineCredential("pharmacy", email, password, pharmacy);
            }
          } catch (error) {
            console.warn("Cloud pharmacy login failed.", error);
          }
        }

        if (!pharmacy) {
          alert(t("login_invalid_pharmacy_credentials"));
          setLoading(false);
          return;
        }

        await savePharmacyLocal({
          ...pharmacy,
          syncStatus: "synced"
        });

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
        alert(t("login_mobile_required"));
        setLoading(false);
        return;
      }

      const patientData = { ...formData, mobile: userId, role: "patient" };

      // REGISTER
      if (isNewUser) {
        const localExisting = await getPatientUserByMobile(userId);
        if (localExisting) {
          alert(t("login_user_already_exists"));
          setIsNewUser(false);
          setLoading(false);
          return;
        }

        // Register locally (offline)
        await registerPatientUser(patientData);
        alert(t("registered_success"));
        setIsNewUser(false);
        setFormData({});
        setLoading(false);
        return;
      }

      // LOGIN
      let loginUser = await getPatientUserByMobile(userId);

      if (!loginUser) {
        alert(t("invalid_credentials"));
        setLoading(false);
        return;
      }

      const enteredName = normalizeName(formData.name);
      const storedName = normalizeName(loginUser?.name);
      const enteredAgeNum = Number(formData.age);
      const storedAgeNum = Number(loginUser?.age);
      const isAgeMismatch =
        Number.isFinite(enteredAgeNum) && Number.isFinite(storedAgeNum)
          ? enteredAgeNum !== storedAgeNum
          : String(formData.age || "").trim() !== String(loginUser?.age ?? "").trim();
      if (!enteredName || enteredName !== storedName || isAgeMismatch) {
        alert(t("invalid_credentials"));
        setLoading(false);
        return;
      }

      completeLogin(
        "patient",
        {
          ...loginUser,
          name: String(loginUser?.name || "").trim() || t("patient")
        },
        "/patient-home",
        { patientMobile: userId }
      );
    } catch (err) {
      console.error(err);
      if (role === "pharmacy") {
        const msg = String(err?.message || "");
        const code = String(err?.code || "");
        if (code === "42P01" || msg.toLowerCase().includes("relation") || msg.toLowerCase().includes("pharmacies")) {
          alert(t("login_pharmacy_table_missing"));
        } else if (code === "42501") {
          alert(t("login_pharmacy_rls_denied"));
        } else {
          alert(`${t("login_pharmacy_failed_prefix")} ${msg || t("unknown_error")}`);
        }
      } else {
        alert(`${t("generic_error_prefix")} ${err?.message || t("unknown_error")}`);
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

          {activeFields.map((f) => (
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
            {loading ? t("please_wait") : isNewUser ? t("register") : t("login")}
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
