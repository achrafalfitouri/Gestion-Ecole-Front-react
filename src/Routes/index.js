import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Unauthorized from "../Pages/Unauthorized";
import  { lazy } from "react";

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

const Calendrier = lazy(() => import("../Pages/Calendrier"));
const Utilisateur = lazy(() => import("../Pages/Utilisateurs/index"));
const Etudiant = lazy(() => import("../Pages/Scolarite/Etudiant"));
const Filiere = lazy(() => import("../Pages/Scolarite/Filiere"));
const Matiere = lazy(() => import("../Pages/Scolarite/Matiere"));
const Classe = lazy(() => import("../Pages/Scolarite/Classe"));
const Anneescolaire = lazy(() => import("../Pages/Scolarite/Anneescolaire"));
const Formateur = lazy(() => import("../Pages/Scolarite/Formateur"));
const Inscription = lazy(() => import("../Pages/Scolarite/Inscription"));
const Niveau = lazy(() => import("../Pages/Scolarite/Classe/Niveau"));
const Stage = lazy(() => import("../Pages/Scolarite/Stage"));
const Absence = lazy(() => import("../Pages/Scolarite/Abcense"));
const Fournisseur = lazy(() => import("../Pages/Finance/Fournisseur"));
const Personnel = lazy(() => import("../Pages/Finance/Personnel"));
const Planing = lazy(() => import("../Pages/Scolarite/Planing"));
const RendezVous = lazy(() => import("../Pages/RendezVous"));
const Dashboard = lazy(() => import("../Pages/Dashboard"));
const Salle = lazy(() => import("../Pages/Scolarite/Salle"));
const TypePaiement = lazy(() => import("../Pages/Finance/Paiement/TypePaiement"));
const ModePaiement = lazy(() => import("../Pages/Finance/Paiement/ModePaiement"));




function AppRoutes() {

  return (

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
          <Route path="/anneescolaire" element={<Anneescolaire />} />
          <Route path="/calendrier" element={<Calendrier />} />
          <Route path="/salle" element={<Salle />} />
          <Route path="/typepaiement" element={<TypePaiement/>} />
          <Route path="/modepaiement" element={<ModePaiement/>} />


          <Route path="/planing" element={<Planing />} />
          {/* Fallback route for unauthorized access */}
          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </Suspense>
   
  );
}

export default AppRoutes;
