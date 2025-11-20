import React from "react";
import ReactDOM from "react-dom/client"; // note /client
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Room from "./pages/Room.jsx";
import InGame from "./pages/Ingame.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/room/:roomCode" element={<Room />} />
        <Route path="/game/:roomCode" element={<InGame />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);