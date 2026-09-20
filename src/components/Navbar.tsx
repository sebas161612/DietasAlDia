import React from 'react';
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { Patient } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: 'dashboard' | 'patients' | 'recommended' | 'treatments';
  onSelectTab: (tab: 'dashboard' | 'patients' | 'recommended' | 'treatments') => void;
  selectedPatient: Patient | null;
  treatmentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedPatient,
  treatmentsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <button
              id="brand-home-btn"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 font-['Space_Grotesk']">
                    Dietas al Día
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    EPIC 28
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                  Soporte a la Asignación Nutricional Clínica
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-tab-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                currentTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Panel</span>
            </button>

            <button
              id="nav-tab-patients"
              onClick={() => onSelectTab('patients')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                currentTab === 'patients'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pacientes</span>
            </button>

            {selectedPatient && (
              <button
                id="nav-tab-recommended"
                onClick={() => onSelectTab('recommended')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition relative ${
                  currentTab === 'recommended'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
                title={`Ver cruce de dietas de ${selectedPatient.fullName}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="max-w-[120px] truncate sm:max-w-none">
                  Dietas: {selectedPatient.fullName.split(' ')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
              </button>
            )}

            <button
              id="nav-tab-treatments"
              onClick={() => onSelectTab('treatments')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                currentTab === 'treatments'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Tratamientos</span>
              {treatmentsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  {treatmentsCount}
                </span>
              )}
            </button>
          </nav>

          {/* User & PWA Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />

            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 font-bold text-xs">
                RV
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  Dr. Roberto Valenzuela
                  <UserCheck className="w-3.5 h-3.5 text-teal-600 inline" />
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Médico Nutricionista Clínico
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
