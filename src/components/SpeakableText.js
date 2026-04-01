import React from "react";
import { useTranslation } from "react-i18next";
import { speakText } from "../utils/speech";

export default function SpeakableText({
  text,
  as = "span",
  style,
  wrapperStyle,
  buttonStyle
}) {
  const { i18n, t } = useTranslation();
  const Tag = as;
  const role = sessionStorage.getItem("role");

  return (
    <span style={{ ...wrap, ...wrapperStyle }}>
      <Tag style={style}>{text}</Tag>
      {role === "patient" && (
        <button
          type="button"
          onClick={() => speakText(text, i18n.language)}
          aria-label={t("read_aloud")}
          style={{ ...iconBtn, ...buttonStyle }}
        >
          🔊
        </button>
      )}
    </span>
  );
}

const wrap = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8
};

const iconBtn = {
  border: "1px solid #c7d4dc",
  borderRadius: 999,
  background: "#ffffff",
  cursor: "pointer",
  width: 30,
  height: 30,
  fontSize: 14,
  lineHeight: 1
};
