import React from "react";
import ReactDOM from "react-dom/client"; // note /client
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login.jsx";
import Home from "./pages/Home.jsx";
import Room from "./pages/Room.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/room/:roomCode" element={<Room />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);