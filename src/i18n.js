import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      select_role: "Select Role",
      patient: "Patient",
      doctor: "Doctor",
      admin: "Admin",
      register: "Register",
      login: "Login",
      name: "Name",
      age: "Age",
      mobile: "Mobile No",
      email: "Email",
      phone: "Phone No",
      password: "Password",
      already_account: "Already have an account? Login",
      new_user: "New user? Sign Up",
      registered_success: "Registered successfully",
      invalid_credentials: "Invalid credentials"
    }
  },
  ta: {
    translation: {
      welcome: "வரவேற்கிறோம்",
      select_role: "பாத்திரத்தை தேர்ந்தெடுக்கவும்",
      patient: "நோயாளி",
      doctor: "டாக்டர்",
      admin: "நிர்வாகி",
      register: "பதிவு செய்ய",
      login: "உள்நுழைய",
      name: "பெயர்",
      age: "வயது",
      mobile: "மொபைல் எண்",
      email: "மின்னஞ்சல்",
      phone: "தொலைபேசி எண்",
      password: "கடவுச்சொல்",
      already_account: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்",
      new_user: "புதிய பயனர்? பதிவு செய்யவும்",
      registered_success: "வெற்றிகரமாக பதிவு செய்யப்பட்டது",
      invalid_credentials: "தவறான விவரங்கள்"
    }
  },
  hi: {
    translation: {
      welcome: "स्वागत है",
      select_role: "भूमिका चुनें",
      patient: "रोगी",
      doctor: "डॉक्टर",
      admin: "प्रशासक",
      register: "रजिस्टर करें",
      login: "लॉगिन करें",
      name: "नाम",
      age: "उम्र",
      mobile: "मोबाइल नंबर",
      email: "ईमेल",
      phone: "फोन नंबर",
      password: "पासवर्ड",
      already_account: "पहले से खाता है? लॉगिन करें",
      new_user: "नया उपयोगकर्ता? साइन अप करें",
      registered_success: "सफलतापूर्वक रजिस्टर किया गया",
      invalid_credentials: "अमान्य क्रेडेंशियल्स"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
