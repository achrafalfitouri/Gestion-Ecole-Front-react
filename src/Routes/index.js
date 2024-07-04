import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Unauthorized from "../Pages/Unauthorized";
import { AnimatePresence } from "framer-motion";
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
import Etudiant from "../Pages/Scolarite/Etudiant";
import Filiere from "../Pages/Scolarite/Filiere";
import RendezVous from "../Pages/RendezVous";
import Classe from "../Pages/Scolarite/Classe";
import Formateur from "../Pages/Scolarite/Formateur";




function AppRoutes() {

  return (
    <AnimatePresence>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Dashboard */}
          {/* <Route path="/" element={<DashboardDataProvider>{(data) => <Dashboard data={data} />}</DashboardDataProvider>} /> */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/utilisateur" element={<Utilisateur />} />
          <Route path="/etudiant" element={<Etudiant />} />
          <Route path="/rendezvous" element={<RendezVous />} />
          <Route path="/filiere" element={<Filiere />} />
          <Route path="/classe" element={<Classe />} />
          <Route path="/formateur" element={<Formateur />} />
          {/* Fallback route for unauthorized access */}
          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default AppRoutes;
