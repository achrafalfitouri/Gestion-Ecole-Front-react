import React from 'react';
import { BrowserRouter , Route, Routes, Navigate } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Components from './Components/index'; // Assume Home is a component for the home page
import frFR from 'antd/es/locale/fr_FR';
import { ConfigProvider } from 'antd';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

const App = () => {
  return (

    <ConfigProvider locale={frFR}>

      <BrowserRouter>
  
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Components />} />
        </Routes>
      
      </BrowserRouter>
      </ConfigProvider>

  );
};

export default App;
