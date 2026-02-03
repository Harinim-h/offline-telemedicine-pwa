import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import i18n from "../i18n";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // -----------------------------
  // State
  // -----------------------------

  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [isNewUser, setIsNewUser] = useState(true); // signup vs login
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Role-specific fields
  // -----------------------------
  const roleFields = {
    patient: [
      { label: t("name"), name: "name", type: "text" },
      { label: t("age"), name: "age", type: "number" },
      { label: t("mobile"), name: "mobile", type: "tel" }
    ],
    doctor: [
      { label: t("name"), name: "name", type: "text" },
      { label: t("email"), name: "email", type: "email" },
      { label: t("phone"), name: "phone", type: "tel" },
      { label: t("password"), name: "password", type: "password" }
    ],
    admin: [
      { label: t("email"), name: "email", type: "email" },
      { label: t("password"), name: "password", type: "password" }
    ]
  };

  // -----------------------------
  // Effects
  // -----------------------------


  // -----------------------------
  // Handlers
  // -----------------------------
 const handleLanguage = (lang) => {
  i18n.changeLanguage(lang);     // 🔥 this alone triggers re-render
  localStorage.setItem("language", lang);
};


  const handleRole = (selectedRole) => {
    setRole(selectedRole);
    setFormData({});
    setIsNewUser(selectedRole !== "admin"); // admin → login only
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // -----------------------------
  // REGISTER & LOGIN (Firebase)
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔑 Unique ID per role
      const userId =
        role === "patient"
          ? formData.mobile
          : formData.email;

      if (!userId) {
        alert("Missing required credentials");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", `${role}_${userId}`);
      const snap = await getDoc(userRef);

      // -----------------------------
      // SIGN UP
      // -----------------------------
      if (isNewUser) {
        if (role === "admin") {
          alert("Admin registration is not allowed");
          setLoading(false);
          return;
        }

        if (snap.exists()) {
          alert("User already registered. Please login.");
          setIsNewUser(false);
          setLoading(false);
          return;
        }

        await setDoc(userRef, {
          ...formData,
          role
        });

        alert(t("registered_success"));
        setIsNewUser(false);
        setFormData({});
        setLoading(false);
        return; // ❌ NO REDIRECT
      }

      // -----------------------------
      // LOGIN
      // -----------------------------
      if (!snap.exists()) {
        alert(t("invalid_credentials"));
        setLoading(false);
        return;
      }

      const dbUser = snap.data();

      if (
        (dbUser.password && dbUser.password !== formData.password) ||
        dbUser.role !== role
      ) {
        alert(t("invalid_credentials"));
        setLoading(false);
        return;
      }

      sessionStorage.setItem("role", role);
      sessionStorage.setItem("userData", JSON.stringify(dbUser));
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={container}>
      {/* Language */}
      <div style={{ textAlign: "center" }}>
  <h2>{t("welcome")}</h2>
  <button onClick={() => handleLanguage("en")} style={langBtn}>English</button>
  <button onClick={() => handleLanguage("ta")} style={langBtn}>தமிழ்</button>
  <button onClick={() => handleLanguage("hi")} style={langBtn}>हिन्दी</button>
</div>

      {/* Role */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <h3>{t("select_role")}</h3>
        {["patient", "doctor", "admin"].map((r) => (
          <button key={r} onClick={() => handleRole(r)} style={roleBtn}>
            {t(r)}
          </button>
        ))}
      </div>

      {/* Form */}
      {role && (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <h3 style={{ textAlign: "center" }}>
            {isNewUser ? t("register") : t("login")}
          </h3>

          {roleFields[role].map((f) => (
            <input
              key={f.name}
              type={f.type}
              name={f.name}
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

          {role !== "admin" && (
            <p style={{ textAlign: "center" }}>
              <button type="button" onClick={() => setIsNewUser(!isNewUser)} style={toggleBtn}>
                {isNewUser ? t("already_account") : t("new_user")}
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  );
}

/* 🎨 Styles */
const container = {
  maxWidth: 500,
  margin: "40px auto",
  padding: 20,
  borderRadius: 10,
  background: "#faf5ff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
};

const langBtn = {
  margin: 5,
  padding: "8px 16px",
  cursor: "pointer"
};

const roleBtn = {
  margin: 5,
  padding: "10px 20px",
  background: "#6a1b9a",
  color: "white",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  borderRadius: 5,
  border: "1px solid #ccc"
};

const submitBtn = {
  width: "100%",
  marginTop: 15,
  padding: 12,
  background: "#4a148c",
  color: "white",
  border: "none",
  borderRadius: 5,
  fontWeight: "bold",
  cursor: "pointer"
};

const toggleBtn = {
  background: "none",
  border: "none",
  color: "#4a148c",
  cursor: "pointer",
  textDecoration: "underline"
};
