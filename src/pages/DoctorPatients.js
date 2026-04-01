import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  deletePatientRecordCloud,
  getAllPatientRecordsCloud,
  updatePatientRecordCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

export default function DoctorPatients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    condition: "",
    additionalData: ""
  });
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      if (!hasSupabase || !navigator.onLine) {
        setPatients([]);
        setMsg(t("doctor_patients_internet_required"));
        return;
      }
      const data = await getAllPatientRecordsCloud();
      setPatients(data);
      setMsg("");
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const key = String(filterText || "").trim().toLowerCase();
    if (!key) return patients;
    return patients.filter((p) => {
      const name = String(p?.name || "").toLowerCase();
      const age = String(p?.age || "").toLowerCase();
      const condition = String(p?.condition || "").toLowerCase();
      const additional = String(p?.additionalData || "").toLowerCase();
      return (
        name.includes(key) ||
        age.includes(key) ||
        condition.includes(key) ||
        additional.includes(key)
      );
    });
  }, [patients, filterText]);

  function startEdit(patient) {
    setEditingId(patient.id);
    setEditForm({
      name: patient.name || "",
      age: patient.age || "",
      condition: patient.condition || "",
      additionalData: patient.additionalData || ""
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", age: "", condition: "", additionalData: "" });
  }

  async function saveEdit(patientId) {
    try {
      if (!String(editForm.name || "").trim()) {
        setMsg(t("doctor_patients_name_required"));
        return;
      }
      setBusyId(patientId);
      const updated = await updatePatientRecordCloud(patientId, editForm);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? updated : p))
      );
      setMsg(t("doctor_patients_updated"));
      cancelEdit();
    } catch (error) {
      setMsg(`${t("doctor_patients_update_failed_prefix")} ${String(error?.message || "")}`);
    } finally {
      setBusyId(null);
    }
  }

  async function removePatient(patientId) {
    const confirmed = window.confirm(
      t("doctor_patients_delete_confirm")
    );
    if (!confirmed) return;
    try {
      setBusyId(patientId);
      await deletePatientRecordCloud(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
      setMsg(t("doctor_patients_deleted"));
    } catch (error) {
      setMsg(`${t("doctor_patients_delete_failed_prefix")} ${String(error?.message || "")}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={page}>
      <div style={container}>
        <h2 style={title}>{t("doctor_patients_title")}</h2>
        <p style={subTitle}>{t("doctor_patients_subtitle")}</p>
        <div style={filterRow}>
          <input
            style={filterInput}
            placeholder={t("doctor_patients_filter_placeholder")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        {msg ? <p style={msgStyle}>{msg}</p> : null}

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>{t("name")}</th>
                <th style={th}>{t("age")}</th>
                <th style={th}>{t("condition")}</th>
                <th style={th}>{t("additional_data_label")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td style={emptyTd} colSpan={5}>{t("doctor_patients_no_records")}</td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id}>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      ) : (
                        p.name
                      )}
                    </td>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.age}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, age: e.target.value }))
                          }
                        />
                      ) : (
                        p.age
                      )}
                    </td>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.condition}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, condition: e.target.value }))
                          }
                        />
                      ) : (
                        p.condition
                      )}
                    </td>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.additionalData}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              additionalData: e.target.value
                            }))
                          }
                        />
                      ) : (
                        p.additionalData || "-"
                      )}
                    </td>
                    <td style={td}>
                      <div style={actionRow}>
                        {editingId === p.id ? (
                          <>
                            <button
                              style={saveBtn}
                              onClick={() => saveEdit(p.id)}
                              disabled={busyId === p.id}
                              type="button"
                            >
                              {t("save")}
                            </button>
                            <button
                              style={cancelBtn}
                              onClick={cancelEdit}
                              disabled={busyId === p.id}
                              type="button"
                            >
                              {t("cancel")}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={editBtn}
                              onClick={() => startEdit(p)}
                              type="button"
                            >
                              {t("common_edit")}
                            </button>
                            <button
                              style={deleteBtn}
                              onClick={() => removePatient(p.id)}
                              disabled={busyId === p.id}
                              type="button"
                            >
                              {t("doctor_patients_delete")}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const container = {
  maxWidth: 980,
  margin: "0 auto"
};

const title = {
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  marginTop: 0,
  marginBottom: 18,
  color: "#365662"
};

const filterRow = {
  marginBottom: 10
};

const filterInput = {
  width: "100%",
  border: "1px solid #c2d5dc",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14
};

const msgStyle = {
  marginTop: 0,
  marginBottom: 12,
  color: "#2f5661",
  background: "#edf7fa",
  border: "1px solid #d2e6ec",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13
};

const tableWrap = {
  background: "#fff",
  borderRadius: 12,
  padding: 10,
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  overflowX: "auto"
};

const table = {
  width: "100%",
  background: "#fff",
  borderCollapse: "collapse",
  minWidth: 760
};

const th = {
  background: "#203a43",
  color: "#fff",
  textAlign: "left",
  padding: 10
};

const td = {
  borderBottom: "1px solid #e2ecef",
  padding: 10,
  verticalAlign: "top"
};

const editInput = {
  width: "100%",
  border: "1px solid #c7d9df",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 13
};

const actionRow = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap"
};

const editBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#2c5364",
  color: "#fff",
  cursor: "pointer"
};

const saveBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#0f8f56",
  color: "#fff",
  cursor: "pointer"
};

const cancelBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#7a8d94",
  color: "#fff",
  cursor: "pointer"
};

const deleteBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#b23a3a",
  color: "#fff",
  cursor: "pointer"
};

const emptyTd = {
  padding: 16,
  color: "#496874",
  textAlign: "center"
};
