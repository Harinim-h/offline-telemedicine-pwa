import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";

export default function PatientDashboard() {
  return (
    <div style={{ paddingBottom: "70px" }}>
      <h2>Patient Dashboard</h2>
      <PatientForm />
      <PatientList />
    </div>
  );
}
