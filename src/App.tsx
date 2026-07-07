import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  );
}
