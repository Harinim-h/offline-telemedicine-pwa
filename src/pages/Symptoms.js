import React from "react";
import { useTranslation } from "react-i18next";
import OfflineSymptomChecker from "../components/OfflineSymptomChecker";
import SpeakableText from "../components/SpeakableText";

export default function Symptoms() {
  const { t } = useTranslation();
  return (
    <div style={page}>
      <SpeakableText
        as="h2"
        text={t("symptom_checker_title")}
        style={title}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />
      <SpeakableText
        as="p"
        text={t("symptom_on_device_ai_info")}
        style={helper}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />
      <OfflineSymptomChecker />
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  marginTop: 0,
  color: "#0f2027",
  marginBottom: 14
};

const helper = {
  marginTop: 0,
  color: "#35515d"
};
