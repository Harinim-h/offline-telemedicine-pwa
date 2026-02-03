import { useNavigate } from "react-router-dom";
import i18n from "../i18n";

export default function LanguageSelect() {
  const navigate = useNavigate();

  const chooseLang = (lang) => {
    i18n.changeLanguage(lang);
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Select Language</h2>
      <button onClick={() => chooseLang("en")}>English</button>
      <button onClick={() => chooseLang("ta")}>தமிழ்</button>
    </div>
  );
}
