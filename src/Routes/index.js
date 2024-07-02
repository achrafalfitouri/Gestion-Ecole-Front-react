import React, { lazy, Suspense, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Unauthorized from "../Pages/Unauthorized";
import { AnimatePresence } from "framer-motion";
import { UserContext } from "../UserContextData/UserContext";
// import { fetchUserData } from "../interceptors/axios"; // Import fetchUserData from axios.js
// import DashboardDataProvider from '../../Pages/Dashbaord/DashboardProvider';

// Lazy-loaded components
// const RendezVous = lazy(() => import("../../Pages/RendezVous"));
// const Ordonance = lazy(() => import("../../Pages/Ordonance"));
// const DossiersMedicaux = lazy(() => import("../../Pages/DossiersMedicaux"));
// const Patient = lazy(() => import("../../Pages/Patient"));
// const Utilisateur = lazy(() => import("../../Pages/Utilisateur"));
// const Pharmacie = lazy(() => import("../../Pages/Pharmacie"));
// const Examen = lazy(() => import("../../Pages/Examen"));
// const Formateur = lazy(() => import("../../Pages/Formateur"));

import Dashboard from "../Pages/Dashboard";
import Utilisateur from "../Pages/Utilisateurs/index";




function AppRoutes() {
  const { user } = useContext(UserContext);

  return (
    <AnimatePresence>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Dashboard */}
          {/* <Route path="/" element={<DashboardDataProvider>{(data) => <Dashboard data={data} />}</DashboardDataProvider>} /> */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/utilisateur" element={<Utilisateur />} />
          {/* Fallback route for unauthorized access */}
          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default AppRoutes;
