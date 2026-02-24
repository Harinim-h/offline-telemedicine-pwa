import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import i18n from "../i18n";

const LOCAL_PATIENT_USERS_KEY = "offline_patient_users";

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

  const getOfflinePatients = () => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_PATIENT_USERS_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveOfflinePatient = (mobile, data) => {
    const allPatients = getOfflinePatients();
    allPatients[mobile] = data;
    localStorage.setItem(LOCAL_PATIENT_USERS_KEY, JSON.stringify(allPatients));
  };

  const getOfflinePatient = (mobile) => {
    const allPatients = getOfflinePatients();
    return allPatients[mobile] || null;
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
        if (
          email === "doctor@gmail.com" &&
          password === "doctor@123"
        ) {
          sessionStorage.setItem("role", "doctor");
          sessionStorage.setItem(
            "userData",
            JSON.stringify({ role: "doctor", email: "doctor@gmail.com" })
          );
          navigate("/doctor-home");
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
          sessionStorage.setItem("role", "admin");
          sessionStorage.setItem(
            "userData",
            JSON.stringify({ role: "admin", email: "admin@gmail.com" })
          );
          navigate("/admin-home");
        } else {
          alert("Invalid Admin Credentials");
        }
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

      const userRef = doc(db, "users", `patient_${userId}`);
      let snap = null;
      try {
        snap = await getDoc(userRef);
      } catch (error) {
        // Firestore can fail in offline/restricted mode; fallback to local storage.
        snap = null;
      }
      const offlineUser = getOfflinePatient(userId);
      const patientData = { ...formData, mobile: userId, role: "patient" };

      // REGISTER
      if (isNewUser) {
        if ((snap && snap.exists()) || offlineUser) {
          alert("User already exists. Please login.");
          setIsNewUser(false);
          setLoading(false);
          return;
        }

        saveOfflinePatient(userId, patientData);
        try {
          await setDoc(userRef, patientData);
        } catch (error) {
          // Keep registration successful offline.
        }
        alert(t("registered_success"));
        setIsNewUser(false);
        setFormData({});
        setLoading(false);
        return;
      }

      // LOGIN
      if (!(snap && snap.exists()) && !offlineUser) {
        alert(t("invalid_credentials"));
        setLoading(false);
        return;
      }

      sessionStorage.setItem("role", "patient");
      sessionStorage.setItem(
        "userData",
        JSON.stringify((snap && snap.exists() && snap.data()) || offlineUser)
      );
      navigate("/patient-home");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
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
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <h3 style={{ color: "#203a43" }}>{t("select_role")}</h3>
        {["patient", "doctor", "admin"].map((r) => (
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
