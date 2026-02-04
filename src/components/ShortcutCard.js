export default function ShortcutCard({ title, desc, onClick }) {
  return (
    <div style={card} onClick={onClick}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

const card = {
  background: "#0f2027",
  color: "#e0f7fa",
  padding: 20,
  borderRadius: 14,
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  transition: "transform 0.2s",
};
