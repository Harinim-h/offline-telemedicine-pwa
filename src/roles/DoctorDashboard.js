import { useTranslation } from "react-i18next";

export default function DoctorDashboard() {
  const { t } = useTranslation();
  return <h2>{t("doctor_analytics_title")}</h2>;
}
