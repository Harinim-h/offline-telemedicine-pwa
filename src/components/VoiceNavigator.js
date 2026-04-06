import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSpeechLang, getSpeechRecognition, speakText } from "../utils/speech";

const UI_COPY = {
  en: {
    buttonIdle: "Speak Nav",
    buttonBusy: "Listening...",
    unsupported: "Voice navigation is not supported on this device.",
    notRecognized:
      "I could not match that page. Try saying home, appointments, symptoms, doctors, profile, analytics, pharmacy, chat, or consultation.",
    couldntHear: "I could not hear clearly. Please try again.",
    openingPrefix: "Opening",
    pagePrefix: "Voice navigation"
  },
  hi: {
    buttonIdle: "\u092c\u094b\u0932\u0915\u0930 \u0916\u094b\u0932\u0947\u0902",
    buttonBusy: "\u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0948...",
    unsupported:
      "\u0907\u0938 \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u0935\u0949\u0907\u0938 \u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928 \u0938\u092a\u094b\u0930\u094d\u091f \u0928\u0939\u0940\u0902 \u0939\u0948.",
    notRecognized:
      "\u092e\u0948\u0902 \u0909\u0938 \u092a\u0947\u091c \u0915\u094b \u092a\u0939\u091a\u093e\u0928 \u0928\u0939\u0940\u0902 \u092a\u093e\u092f\u093e. \u0939\u094b\u092e, \u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f, \u0932\u0915\u094d\u0937\u0923, \u0921\u0949\u0915\u094d\u091f\u0930, \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932, \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938, \u092b\u093e\u0930\u094d\u092e\u0947\u0938\u0940, \u091a\u0948\u091f \u092f\u093e \u0915\u0902\u0938\u0932\u094d\u091f\u0947\u0936\u0928 \u092c\u094b\u0932\u0947\u0902.",
    couldntHear:
      "\u092e\u0941\u091d\u0947 \u0906\u0935\u093e\u091c \u0938\u093e\u092b \u0928\u0939\u0940\u0902 \u0938\u0941\u0928\u093e\u0908 \u0926\u0940. \u0915\u0943\u092a\u092f\u093e \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902.",
    openingPrefix: "\u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0948",
    pagePrefix: "\u0935\u0949\u0907\u0938 \u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928"
  },
  ta: {
    buttonIdle: "\u0baa\u0bc7\u0b9a\u0bbf \u0ba4\u0bbf\u0bb1",
    buttonBusy: "\u0b95\u0bc7\u0b9f\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1...",
    unsupported:
      "\u0b87\u0ba8\u0bcd\u0ba4 \u0b9a\u0bbe\u0ba4\u0ba9\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0ba8\u0bc7\u0bb5\u0bbf\u0b95\u0bc7\u0b9a\u0ba9\u0bcd \u0b86\u0ba4\u0bb0\u0bb5\u0bc1 \u0b87\u0bb2\u0bcd\u0bb2\u0bc8.",
    notRecognized:
      "\u0b85\u0ba8\u0bcd\u0ba4 \u0baa\u0b95\u0bcd\u0b95\u0ba4\u0bcd\u0ba4\u0bc8 \u0b95\u0ba3\u0bcd\u0b9f\u0bb1\u0bbf\u0baf \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1, \u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd, \u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf, \u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd, \u0b9a\u0bc1\u0baf\u0bb5\u0bbf\u0bb5\u0bb0\u0bae\u0bcd, \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1, \u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0b95\u0bae\u0bcd, \u0b9a\u0bbe\u0b9f\u0bcd \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0b86\u0bb2\u0bcb\u0b9a\u0ba9\u0bc8 \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd.",
    couldntHear:
      "\u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0ba4\u0bc6\u0bb3\u0bbf\u0bb5\u0bbe\u0b95 \u0b95\u0bc7\u0b9f\u0bcd\u0b95\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bae\u0bc0\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd \u0bae\u0bc1\u0baf\u0bb1\u0bcd\u0b9a\u0bbf\u0b95\u0bcd\u0b95\u0bb5\u0bc1\u0bae\u0bcd.",
    openingPrefix: "\u0ba4\u0bbf\u0bb1\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1",
    pagePrefix: "\u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0ba8\u0bc7\u0bb5\u0bbf\u0b95\u0bc7\u0b9a\u0ba9\u0bcd"
  },
  ml: {
    buttonIdle: "\u0d2a\u0d31\u0d1e\u0d4d\u0d1e\u0d4d \u0d24\u0d41\u0d31\u0d15\u0d4d\u0d15\u0d41\u0d15",
    buttonBusy: "\u0d15\u0d47\u0d7e\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d41...",
    unsupported:
      "\u0d08 \u0d21\u0d3f\u0d35\u0d48\u0d38\u0d3f\u0d7d \u0d35\u0d4b\u0d2f\u0d4d\u0d38\u0d4d \u0d28\u0d3e\u0d35\u0d3f\u0d17\u0d47\u0d37\u0d7b \u0d2a\u0d3f\u0d28\u0d4d\u0d24\u0d41\u0d23\u0d2f\u0d4d\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d3f\u0d32\u0d4d\u0d32.",
    notRecognized:
      "\u0d06 \u0d2a\u0d47\u0d1c\u0d4d \u0d24\u0d3f\u0d30\u0d3f\u0d1a\u0d4d\u0d1a\u0d31\u0d3f\u0d2f\u0d3e\u0d7b \u0d15\u0d34\u0d3f\u0d9e\u0d4d\u0d9e\u0d3f\u0d32\u0d4d\u0d32. \u0d39\u0d4b\u0d02, \u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d, \u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02, \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c, \u0d2a\u0d4d\u0d30\u0d4a\u0d2b\u0d48\u0d7d, \u0d05\u0d28\u0d3e\u0d32\u0d3f\u0d31\u0d3f\u0d15\u0d4d\u0d38\u0d4d, \u0d2b\u0d3e\u0d7c\u0d2e\u0d38\u0d3f, \u0d1a\u0d3e\u0d31\u0d4d\u0d31\u0d4d \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d15\u0d7a\u0d7b\u0d38\u0d7d\u0d1f\u0d4d\u0d1f\u0d47\u0d37\u0d7b \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
    couldntHear:
      "\u0d15\u0d41\u0d30\u0d7d \u0d35\u0d4d\u0d2f\u0d15\u0d4d\u0d24\u0d2e\u0d3e\u0d2f\u0d3f \u0d15\u0d47\u0d7e\u0d15\u0d4d\u0d15\u0d3e\u0d7b \u0d15\u0d34\u0d3f\u0d9e\u0d4d\u0d9e\u0d3f\u0d32\u0d4d\u0d32. \u0d26\u0d2f\u0d35\u0d3e\u0d2f\u0d3f \u0d35\u0d40\u0d23\u0d4d\u0d1f\u0d41\u0d02 \u0d36\u0d4d\u0d30\u0d2e\u0d3f\u0d15\u0d4d\u0d15\u0d41\u0d15.",
    openingPrefix: "\u0d24\u0d41\u0d31\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d41",
    pagePrefix: "\u0d35\u0d4b\u0d2f\u0d4d\u0d38\u0d4d \u0d28\u0d3e\u0d35\u0d3f\u0d17\u0d47\u0d37\u0d7b"
  }
};

const BASE_ALIASES = {
  "/patient-home": [
    "home",
    "dashboard",
    "\u0939\u094b\u092e",
    "\u0918\u0930",
    "\u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1",
    "\u0bb5\u0bc0\u0b9f\u0bc1",
    "\u0d39\u0d4b\u0d02",
    "\u0d35\u0d40\u0d1f\u0d4d"
  ],
  "/doctor-home": [
    "doctor home",
    "doctor dashboard",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u0939\u094b\u092e",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0b9f\u0bbe\u0bb7\u0bcd\u0baa\u0bcb\u0bb0\u0bcd\u0b9f\u0bc1",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d39\u0d4b\u0d02",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d21\u0d3e\u0d37\u0d4d\u0d2c\u0d4b\u0d7c\u0d21\u0d4d"
  ],
  "/admin-home": [
    "admin home",
    "admin dashboard",
    "\u090f\u0921\u092e\u093f\u0928 \u0939\u094b\u092e",
    "\u090f\u0921\u092e\u093f\u0928 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
    "\u0ba8\u0bbf\u0bb0\u0bcd\u0bb5\u0bbe\u0b95 \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1",
    "\u0ba8\u0bbf\u0bb0\u0bcd\u0bb5\u0bbe\u0b95 \u0b9f\u0bbe\u0bb7\u0bcd\u0baa\u0bcb\u0bb0\u0bcd\u0b9f\u0bc1",
    "\u0d05\u0d21\u0d4d\u0d2e\u0d3f\u0d7b \u0d39\u0d4b\u0d02",
    "\u0d05\u0d21\u0d4d\u0d2e\u0d3f\u0d7b \u0d21\u0d3e\u0d37\u0d4d\u0d2c\u0d4b\u0d7c\u0d21\u0d4d"
  ],
  "/appointments": [
    "appointment",
    "appointments",
    "book appointment",
    "token",
    "queue",
    "\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f",
    "\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f\u094d\u0938",
    "\u091f\u094b\u0915\u0928",
    "\u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd",
    "\u0ba8\u0bbf\u0baf\u0bae\u0ba9\u0bae\u0bcd",
    "\u0b9f\u0bcb\u0b95\u0bcd\u0b95\u0ba9\u0bcd",
    "\u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d",
    "\u0d1f\u0d4b\u0d15\u0d4d\u0d15\u0d7a\u0d7b"
  ],
  "/symptoms": [
    "symptom",
    "symptoms",
    "checker",
    "\u0932\u0915\u094d\u0937\u0923",
    "\u0938\u093f\u0902\u092a\u094d\u091f\u092e",
    "\u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf",
    "\u0b9a\u0bbf\u0bae\u0bcd\u0baa\u0bcd\u0b9f\u0bae\u0bcd",
    "\u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02"
  ],
  "/doctor-availability": [
    "doctor",
    "doctors",
    "doctor availability",
    "availability",
    "\u0921\u0949\u0915\u094d\u091f\u0930",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u0909\u092a\u0932\u092c\u094d\u0927\u0924\u093e",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0b95\u0bbf\u0b9f\u0bc8\u0baa\u0bcd\u0baa\u0bc1",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d32\u0d2d\u0d4d\u0d2f\u0d24"
  ],
  "/profile": [
    "profile",
    "my profile",
    "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
    "\u0b9a\u0bc1\u0baf\u0bb5\u0bbf\u0bb5\u0bb0\u0bae\u0bcd",
    "\u0d2a\u0d4d\u0d30\u0d4a\u0d2b\u0d48\u0d7d"
  ],
  "/pharmacy": [
    "pharmacy",
    "medicine",
    "medicines",
    "\u092b\u093e\u0930\u094d\u092e\u0947\u0938\u0940",
    "\u0926\u0935\u093e",
    "\u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0b95\u0bae\u0bcd",
    "\u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1",
    "\u0d2b\u0d3e\u0d7c\u0d2e\u0d38\u0d3f",
    "\u0d2e\u0d30\u0d41\u0d28\u0d4d\u0d28\u0d4d"
  ],
  "/consult": [
    "consult",
    "consultation",
    "video call",
    "call doctor",
    "\u0915\u0902\u0938\u0932\u094d\u091f\u0947\u0936\u0928",
    "\u092a\u0930\u093e\u092e\u0930\u094d\u0936",
    "\u0935\u0940\u0921\u093f\u092f\u094b \u0915\u0949\u0932",
    "\u0b86\u0bb2\u0bcb\u0b9a\u0ba9\u0bc8",
    "\u0bb5\u0bc0\u0b9f\u0bbf\u0baf\u0bcb \u0b95\u0bbe\u0bb2\u0bcd",
    "\u0d15\u0d7a\u0d7b\u0d38\u0d7d\u0d1f\u0d4d\u0d1f\u0d47\u0d37\u0d7b",
    "\u0d35\u0d40\u0d21\u0d3f\u0d2f\u0d4b \u0d15\u0d4b\u0d7e"
  ],
  "/chat": [
    "chat",
    "text consultation",
    "message",
    "\u091a\u0948\u091f",
    "\u0938\u0902\u0926\u0947\u0936",
    "\u0b9a\u0bbe\u0b9f\u0bcd",
    "\u0b9a\u0bc6\u0baf\u0bcd\u0ba4\u0bbf",
    "\u0d1a\u0d3e\u0d31\u0d4d\u0d31\u0d4d",
    "\u0d38\u0d28\u0d4d\u0d26\u0d47\u0d36\u0d02"
  ],
  "/doctor/add-patient": [
    "add patient",
    "new patient",
    "\u092e\u0930\u0940\u091c \u091c\u094b\u0921\u093c\u0947\u0902",
    "\u0928\u092f\u093e \u092e\u0930\u0940\u091c",
    "\u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bbf\u0baf\u0bc8 \u0b9a\u0bc7\u0bb0\u0bcd\u0b95\u0bcd\u0b95",
    "\u0baa\u0bc1\u0ba4\u0bbf\u0baf \u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bbf",
    "\u0d30\u0d4b\u0d17\u0d3f\u0d2f\u0d46 \u0d1a\u0d47\u0d7c\u0d15\u0d4d\u0d15\u0d41\u0d15",
    "\u0d2a\u0d41\u0d24\u0d3f\u0d2f \u0d30\u0d4b\u0d17\u0d3f"
  ],
  "/doctor/patients": [
    "patients",
    "patient list",
    "patient records",
    "users",
    "\u092e\u0930\u0940\u091c",
    "\u092e\u0930\u0940\u091c \u0938\u0942\u091a\u0940",
    "\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e",
    "\u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bb0\u0bcd",
    "\u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bb0\u0bcd \u0baa\u0b9f\u0bcd\u0b9f\u0bbf\u0baf\u0bb2\u0bcd",
    "\u0baa\u0baf\u0ba9\u0bb0\u0bcd\u0b95\u0bb3\u0bcd",
    "\u0d30\u0d4b\u0d17\u0d3f",
    "\u0d30\u0d4b\u0d17\u0d3f \u0d2a\u0d1f\u0d4d\u0d1f\u0d3f\u0d15",
    "\u0d09\u0d2a\u0d2f\u0d4b\u0d15\u0d4d\u0d24\u0d3e\u0d15\u0d4d\u0d15\u0d7e"
  ],
  "/doctor-analytics": [
    "doctor analytics",
    "analytics",
    "reports",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
    "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02",
    "\u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02"
  ],
  "/admin-analytics": [
    "admin analytics",
    "platform analytics",
    "analytics",
    "reports",
    "\u090f\u0921\u092e\u093f\u0928 \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
    "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923",
    "\u0ba8\u0bbf\u0bb0\u0bcd\u0bb5\u0bbe\u0b95 \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0d05\u0d21\u0d4d\u0d2e\u0d3f\u0d7b \u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02",
    "\u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02"
  ]
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getHomeRoute(role) {
  if (role === "doctor") return "/doctor-home";
  if (role === "admin") return "/admin-home";
  if (role === "pharmacy") return "/pharmacy";
  return "/patient-home";
}

function getPageName(path, role) {
  const names = {
    "/patient-home": "home",
    "/doctor-home": "doctor home",
    "/admin-home": "admin home",
    "/appointments": "appointments",
    "/symptoms": "symptoms",
    "/doctor-availability": "doctor availability",
    "/profile": "profile",
    "/pharmacy": "pharmacy",
    "/consult": "consultation",
    "/chat": "chat",
    "/doctor/add-patient": "add patient",
    "/doctor/patients": "patient records",
    "/doctor-analytics": "doctor analytics",
    "/admin-analytics": "admin analytics"
  };

  if (path === "/patient-home" || path === "/doctor-home" || path === "/admin-home") {
    return names[getHomeRoute(role)];
  }

  return names[path] || "page";
}

export default function VoiceNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const role = sessionStorage.getItem("role");
  const activeLang = ["en", "hi", "ta", "ml"].includes(i18n.language)
    ? i18n.language
    : String(i18n.language || "en").split("-")[0].toLowerCase();
  const copy = UI_COPY[activeLang] || UI_COPY.en;

  const routes = useMemo(() => {
    const homeRoute = getHomeRoute(role);
    const commonEntries = [
      {
        route: homeRoute,
        aliases: [
          t("nav.home"),
          t("nav.dashboard"),
          ...(BASE_ALIASES[homeRoute] || [])
        ]
      },
      {
        route: "/appointments",
        aliases: [t("nav.appointments"), t("appointments_page_title"), ...(BASE_ALIASES["/appointments"] || [])]
      },
      {
        route: "/symptoms",
        aliases: [t("nav.symptoms"), t("symptom_checker_title"), ...(BASE_ALIASES["/symptoms"] || [])]
      },
      {
        route: "/doctor-availability",
        aliases: [t("nav.doctors"), t("doctor_availability_title"), ...(BASE_ALIASES["/doctor-availability"] || [])]
      },
      {
        route: "/profile",
        aliases: [t("nav.profile"), t("profile_title"), ...(BASE_ALIASES["/profile"] || [])]
      },
      {
        route: "/pharmacy",
        aliases: [t("nav.pharmacy"), t("pharmacy_title"), ...(BASE_ALIASES["/pharmacy"] || [])]
      },
      {
        route: "/consult",
        aliases: [t("nav.consultation"), t("consultation_title"), t("video_call_title"), ...(BASE_ALIASES["/consult"] || [])]
      },
      {
        route: "/chat",
        aliases: [t("chat_title"), ...(BASE_ALIASES["/chat"] || [])]
      },
      {
        route: "/doctor/add-patient",
        aliases: [t("add_patient_title"), ...(BASE_ALIASES["/doctor/add-patient"] || [])]
      },
      {
        route: "/doctor/patients",
        aliases: [t("doctor_patients_title"), t("view_patients_title"), t("nav.users"), ...(BASE_ALIASES["/doctor/patients"] || [])]
      },
      {
        route: "/doctor-analytics",
        aliases: [t("doctor_analytics_title"), t("nav.analytics"), ...(BASE_ALIASES["/doctor-analytics"] || [])]
      },
      {
        route: "/admin-analytics",
        aliases: [t("admin_analytics_title"), t("nav.analytics"), ...(BASE_ALIASES["/admin-analytics"] || [])]
      }
    ];

    const routesByRole = {
      patient: [
        homeRoute,
        "/appointments",
        "/symptoms",
        "/doctor-availability",
        "/profile",
        "/pharmacy",
        "/consult",
        "/chat"
      ],
      doctor: [
        homeRoute,
        "/appointments",
        "/pharmacy",
        "/consult",
        "/chat",
        "/doctor/add-patient",
        "/doctor/patients",
        "/doctor-analytics"
      ],
      admin: [homeRoute, "/admin-analytics", "/appointments", "/doctor/patients", "/pharmacy"],
      pharmacy: [homeRoute]
    };

    const allowedRoutes = routesByRole[role] || routesByRole.patient;

    return commonEntries
      .filter((entry) => allowedRoutes.includes(entry.route))
      .map((entry) => ({
      route: entry.route,
      aliases: Array.from(
        new Set(
          entry.aliases
            .map(normalize)
            .filter(Boolean)
        )
      ).sort((a, b) => b.length - a.length)
      }));
  }, [role, t]);

  const availableCommands = useMemo(
    () =>
      routes
        .filter((entry) => entry.route !== location.pathname)
        .flatMap((entry) => entry.aliases.map((alias) => ({ route: entry.route, alias })))
        .sort((a, b) => b.alias.length - a.alias.length),
    [location.pathname, routes]
  );

  function findRoute(rawText) {
    const text = normalize(rawText);
    if (!text) return "";

    for (const command of availableCommands) {
      if (text.includes(command.alias)) {
        return command.route;
      }
    }

    return "";
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }

  function navigateFromText(rawText) {
    const nextRoute = findRoute(rawText);
    if (nextRoute) {
      speakText(`${copy.openingPrefix} ${getPageName(nextRoute, role)}`, i18n.language);
      navigate(nextRoute);
      return true;
    }
    speakText(copy.notRecognized, i18n.language);
    return false;
  }

  function startListening() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      const manualCommand = window.prompt(
        `${copy.pagePrefix} - ${copy.notRecognized}\n${copy.pagePrefix} command:`
      );
      if (manualCommand) {
        navigateFromText(manualCommand);
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang(i18n.language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcripts = Array.from(event?.results?.[0] || []).map(
        (result) => result.transcript || ""
      );

      const nextRoute = transcripts.map(findRoute).find(Boolean);
      if (nextRoute) {
        speakText(
          `${copy.openingPrefix} ${getPageName(nextRoute, role)}`,
          i18n.language
        );
        navigate(nextRoute);
        return;
      }

      speakText(copy.notRecognized, i18n.language);
    };

    recognition.onerror = () => {
      speakText(copy.couldntHear, i18n.language);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.start();
  }

  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (isListening) {
          stopListening();
          return;
        }

        startListening();
      }}
      style={fabButton}
      aria-label={copy.pagePrefix}
      title={copy.pagePrefix}
    >
      {isListening ? copy.buttonBusy : copy.buttonIdle}
    </button>
  );
}

const fabButton = {
  position: "fixed",
  right: 16,
  bottom: 16,
  zIndex: 1200,
  minWidth: 128,
  minHeight: 58,
  border: "none",
  borderRadius: 999,
  background: "linear-gradient(135deg, #0f766e, #155e75)",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 700,
  boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
  cursor: "pointer",
  padding: "12px 18px"
};
