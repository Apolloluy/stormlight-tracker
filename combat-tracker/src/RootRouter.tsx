import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import GMScreen from './components/game/GMScreen';

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gm-screen/:fileName" element={<GMScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
