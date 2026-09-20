/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { initialTreatmentsData, patientsData } from './data/mockData';
import { CompatibilityAnalysis, Patient, PrescribedTreatment } from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PatientListView } from './components/PatientListView';
import { RecommendedDietsView } from './components/RecommendedDietsView';
import { TechnicalSheetModal } from './components/TechnicalSheetModal';
import { AssignmentModal } from './components/AssignmentModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { PatientClinicalReportModal } from './components/PatientClinicalReportModal';
import { TreatmentsView } from './components/TreatmentsView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Activity, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'patients' | 'recommended' | 'treatments'
  >('dashboard');

  const [patients] = useState<Patient[]>(patientsData);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patientsData[0]);
  const [treatments, setTreatments] = useState<PrescribedTreatment[]>(initialTreatmentsData);

  // Modals state
  const [profileModalPatient, setProfileModalPatient] = useState<Patient | null>(null);
  const [reportModalPatient, setReportModalPatient] = useState<Patient | null>(null);
  const [technicalSheetAnalysis, setTechnicalSheetAnalysis] =
    useState<CompatibilityAnalysis | null>(null);
  const [assignmentAnalysis, setAssignmentAnalysis] =
    useState<CompatibilityAnalysis | null>(null);

  // Actions
  const handleSelectPatientForEvaluation = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentTab('recommended');
  };

  const handleConfirmAssignment = (newTreatment: PrescribedTreatment) => {
    setTreatments((prev) => [newTreatment, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-teal-500 selection:text-white flex flex-col justify-between">
      {/* Offline Service Worker indicator for PWA */}
      <OfflineIndicator />

      <div>
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          selectedPatient={selectedPatient}
          treatmentsCount={treatments.length}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              patients={patients}
              treatments={treatments}
              onSelectPatientForEvaluation={handleSelectPatientForEvaluation}
              onViewPatientProfile={(patient) => setProfileModalPatient(patient)}
              onGoToTreatments={() => setCurrentTab('treatments')}
            />
          )}

          {currentTab === 'patients' && (
            <PatientListView
              patients={patients}
              onSelectPatient={handleSelectPatientForEvaluation}
              onViewProfile={(patient) => setProfileModalPatient(patient)}
              onOpenReport={(patient) => setReportModalPatient(patient)}
            />
          )}

          {currentTab === 'recommended' && selectedPatient && (
            <RecommendedDietsView
              patient={selectedPatient}
              allPatients={patients}
              onSwitchPatient={(patient) => setSelectedPatient(patient)}
              onOpenTechnicalSheet={(analysis) => setTechnicalSheetAnalysis(analysis)}
              onSelectDietToAssign={(analysis) => setAssignmentAnalysis(analysis)}
              onBackToPatients={() => setCurrentTab('patients')}
              onViewPatientProfile={(patient) => setProfileModalPatient(patient)}
            />
          )}

          {currentTab === 'treatments' && (
            <TreatmentsView
              treatments={treatments}
              onSelectPatient={(patientId) => {
                const p = patients.find((pat) => pat.id === patientId);
                if (p) {
                  setSelectedPatient(p);
                  setCurrentTab('recommended');
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Patient Profile Modal */}
      {profileModalPatient && (
        <PatientProfileModal
          patient={profileModalPatient}
          treatments={treatments}
          onClose={() => setProfileModalPatient(null)}
          onGoToRecommendedDiets={(patient) => {
            setSelectedPatient(patient);
            setCurrentTab('recommended');
          }}
          onOpenReport={(patient) => {
            setProfileModalPatient(null);
            setReportModalPatient(patient);
          }}
        />
      )}

      {/* Patient Clinical Report Modal (Feature 1: Impresión y PDF de Informe Clínico) */}
      {reportModalPatient && (
        <PatientClinicalReportModal
          patient={reportModalPatient}
          treatments={treatments}
          onClose={() => setReportModalPatient(null)}
        />
      )}

      {/* Technical Sheet Modal (CA3: Maintains patient and compatibility context) */}
      {technicalSheetAnalysis && selectedPatient && (
        <TechnicalSheetModal
          analysis={technicalSheetAnalysis}
          patient={selectedPatient}
          onClose={() => setTechnicalSheetAnalysis(null)}
          onSelectToAssign={(analysis) => {
            setTechnicalSheetAnalysis(null);
            setAssignmentAnalysis(analysis);
          }}
        />
      )}

      {/* Assignment & Prescription Modal (CA4) */}
      {assignmentAnalysis && selectedPatient && (
        <AssignmentModal
          analysis={assignmentAnalysis}
          patient={selectedPatient}
          onClose={() => setAssignmentAnalysis(null)}
          onConfirmAssignment={handleConfirmAssignment}
        />
      )}

      {/* Clinical Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-700" />
            <span className="font-bold text-slate-700">Dietas al Día</span>
            <span>—</span>
            <span>EPIC 28: Asignación de Tratamiento Nutricional Seguro</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cruce Automático de Alérgenos Activo
            </span>
            <span>•</span>
            <span>PWA Instalable Offline</span>
            <span>•</span>
            <span>Estándar CIE-10 & Fichas Nutricionales</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
