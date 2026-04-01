import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  return <h2>{t("admin_dashboard")}</h2>;
}
