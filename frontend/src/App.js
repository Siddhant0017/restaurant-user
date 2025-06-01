
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuScreen from './Pages/MenuScreen';
import CheckoutScreen from './Pages/CheckoutScreen';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<MenuScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
