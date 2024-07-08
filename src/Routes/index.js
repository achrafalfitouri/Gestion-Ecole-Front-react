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
import Matiere from "../Pages/Scolarite/Matiere";
import RendezVous from "../Pages/RendezVous";
import Classe from "../Pages/Scolarite/Classe";
import Formateur from "../Pages/Scolarite/Formateur";
import Inscription from "../Pages/Scolarite/Inscription";
import Niveau from "../Pages/Scolarite/Classe/Niveau";
import Stage from "../Pages/Scolarite/Stage";
import Absence from "../Pages/Scolarite/Abcense";
import Fournisseur from "../Pages/Finance/Fournisseur";
import Personnel from "../Pages/Finance/Personnel";



import Planing from "../Pages/Scolarite/Planing";





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
          <Route path="/niveau" element={<Niveau />} />
          <Route path="/matiere" element={<Matiere />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/stage" element={<Stage />} />
          <Route path="/absence" element={<Absence />} />
          <Route path="/fournisseur" element={<Fournisseur />} />
          <Route path="/personnel" element={<Personnel />} />

          <Route path="/planing" element={<Planing />} />
          {/* Fallback route for unauthorized access */}
          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default AppRoutes;
