import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import LanguageSelect from "./pages/LanguageSelect";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function App() {
  return (
    <HashRouter>
      <Navbar />

      <Routes>
        {/* FIRST PAGE ALWAYS */}
        <Route path="/" element={<LanguageSelect />} />

        {/* LOGIN AFTER LANGUAGE */}
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD */}
        <Route path="/home" element={<Home />} />

        {/* CATCH ALL: redirect unknown paths to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
