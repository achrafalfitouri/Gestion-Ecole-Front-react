import React from 'react';
import { BrowserRouter , Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './UserContextData/UserContext';
import Login from './Pages/Login/Login';
import Components from './Components/index'; // Assume Home is a component for the home page

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
  
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Components />} />
        </Routes>
      
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
