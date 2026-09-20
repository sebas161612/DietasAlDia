import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  FileText,
  HeartPulse,
  Search,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { Patient } from '../types';
import { getDiseaseById } from '../services/clinicalEngine';

interface PatientListViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onViewProfile: (patient: Patient) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  onSelectPatient,
  onViewProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'allergies' | 'safe'>('all');

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const disease = getDiseaseById(patient.activeDiseaseIds[0]);
      const matchesSearch =
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.roomBed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (disease && disease.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'allergies') {
        return patient.allergies.length > 0;
      }
      if (filterType === 'safe') {
        return patient.allergies.length === 0;
      }

      return true;
    });
  }, [patients, searchTerm, filterType]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Space_Grotesk'] flex items-center gap-2.5">
              <Users className="w-6 h-6 text-teal-700" />
              Directorio de Pacientes Hospitalizados
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Seleccione un paciente para revisar su perfil clínico y acceder directamente al cruce de dietas recomendadas.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-search-patients"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, HC o diagnóstico..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1">Filtros rápidos:</span>
          <button
            id="btn-filter-all"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({patients.length})
          </button>
          <button
            id="btn-filter-allergies"
            onClick={() => setFilterType('allergies')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterType === 'allergies'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Con Alergias Registradas ({patients.filter((p) => p.allergies.length > 0).length})
          </button>
          <button
            id="btn-filter-safe"
            onClick={() => setFilterType('safe')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterType === 'safe'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Sin Alergias Conocidas ({patients.filter((p) => p.allergies.length === 0).length})
          </button>
        </div>
      </div>

      {/* Patients Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => {
          const disease = getDiseaseById(patient.activeDiseaseIds[0]);
          const hasAllergies = patient.allergies.length > 0;

          return (
            <div
              key={patient.id}
              id={`patient-card-${patient.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {patient.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                        {patient.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {patient.medicalRecordNumber} • {patient.age} años ({patient.gender === 'F' ? 'Fem' : 'Masc'})
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                    {patient.roomBed}
                  </span>
                </div>

                {/* Clinical details */}
                <div className="mt-3 space-y-2.5">
                  {/* Diagnosis */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Diagnóstico Registrado
                    </span>
                    <div className="flex items-start gap-1.5 text-xs font-bold text-teal-900 bg-teal-50/80 border border-teal-200 p-2 rounded-lg">
                      <HeartPulse className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span>{disease ? disease.name : 'Diagnóstico general'}</span>
                        {disease && (
                          <span className="ml-1.5 text-[10px] font-mono text-teal-700 bg-teal-100 px-1 py-0.2 rounded">
                            CIE-10: {disease.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Allergies / Incompatibilities */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Alergias e Incompatibilidades
                    </span>
                    {hasAllergies ? (
                      <div className="space-y-1.5">
                        {patient.allergies.map((allergy) => (
                          <div
                            key={allergy.id}
                            className="flex items-start gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/90 p-2 rounded-lg"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">{allergy.name}</p>
                              <p className="text-[11px] font-normal text-amber-800">
                                Severidad: <strong className="font-bold">{allergy.severity}</strong> • {allergy.reaction}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Sin alergias conocidas registradas en historia clínica</span>
                      </div>
                    )}
                  </div>

                  {/* Food restrictions */}
                  {patient.foodRestrictions.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Restricciones Funcionales
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {patient.foodRestrictions.map((res) => (
                          <span
                            key={res.id}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {res.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vitals Summary */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>IMC: <strong className="text-slate-800">{patient.bmi}</strong></span>
                    <span>PA: <strong className="text-slate-800">{patient.vitalSigns.bloodPressure}</strong></span>
                    <span>SatO2: <strong className="text-slate-800">{patient.vitalSigns.oxygenSaturation}%</strong></span>
                    {patient.vitalSigns.glucoseMgDl && (
                      <span>Glucemia: <strong className="text-slate-800">{patient.vitalSigns.glucoseMgDl} mg/dL</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  id={`btn-profile-${patient.id}`}
                  onClick={() => onViewProfile(patient)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Historia Clínica</span>
                </button>

                <button
                  id={`btn-select-diets-${patient.id}`}
                  onClick={() => onSelectPatient(patient)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 shadow-xs transition active:scale-95"
                >
                  <span>Ver Dietas Recomendadas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="mt-3 font-bold text-slate-800 text-sm">No se encontraron pacientes</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifique los filtros o el término de búsqueda ingresado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
