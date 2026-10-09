import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Stethoscope,
  Pill,
  Bed,
  UserCheck,
  DoorOpen,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Activity,
  HeartPulse,
  Info,
} from 'lucide-react';
import { ClinicZoneId } from '../types/clinic';
import { CLINIC_ZONES } from '../data/clinicData';
import { soundFx } from '../utils/audio';

interface ZoneDetailsModalProps {
  isOpen: boolean;
  activeZone: ClinicZoneId;
  onClose: () => void;
  onNavigateTo: (zone: ClinicZoneId) => void;
}

export const ZoneDetailsModal: React.FC<ZoneDetailsModalProps> = ({
  isOpen,
  activeZone,
  onClose,
  onNavigateTo,
}) => {
  const [selectedZoneTab, setSelectedZoneTab] = useState<ClinicZoneId>(activeZone);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentInfo = CLINIC_ZONES[selectedZoneTab];

  const handleAction = (msg: string) => {
    soundFx.playClick();
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 3500);
  };

  const getZoneIcon = (id: ClinicZoneId) => {
    switch (id) {
      case 'welcome':
        return <DoorOpen className="w-4 h-4" />;
      case 'reception':
        return <UserCheck className="w-4 h-4" />;
      case 'waiting_chairs':
        return <Activity className="w-4 h-4" />;
      case 'medicine_cabin':
        return <Pill className="w-4 h-4" />;
      case 'doctor_desk':
        return <Stethoscope className="w-4 h-4" />;
      case 'examination_bed':
        return <Bed className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Clinic Floor Plan & Zone Specifications
              </h2>
              <p className="text-xs text-slate-500">
                Interactive zone details, architectural layout & simulation actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone Selector Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-slate-100 overflow-x-auto bg-slate-50/30 scrollbar-none">
          {Object.values(CLINIC_ZONES).map((z) => {
            const isTabActive = selectedZoneTab === z.id;
            return (
              <button
                key={z.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedZoneTab(z.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isTabActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {getZoneIcon(z.id)}
                <span>{z.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Zone Banner */}
          <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
                  {currentInfo.zoneArea}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {currentInfo.title}
                </h3>
                <p className="text-xs text-sky-800/80 font-medium mt-0.5">
                  {currentInfo.subtitle}
                </p>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigateTo(currentInfo.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <span>Walk Avatar Here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {currentInfo.description}
            </p>
          </div>

          {/* Architectural Layout Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Architectural & Floor Plan Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentInfo.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Actions for this Zone */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Zone Interactive Actions
            </h4>

            {selectedZoneTab === 'welcome' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction('Visitor wiped shoes on antimicrobial WELCOME mat and entered through the main door.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Sanitize & Enter Door
                </button>
                <button
                  onClick={() => handleAction('Automatic infrared door sensor triggered; main door opened inward.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Trigger Door Sensor
                </button>
              </div>
            )}

            {selectedZoneTab === 'reception' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction('Patient check-in recorded on receptionist computer. Queue Token #A-109 issued.')}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 rounded-lg transition"
                >
                  Check In & Issue Token #A-109
                </button>
                <button
                  onClick={() => handleAction('Receptionist avatar verified health insurance card and digital prescription.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Verify Health Insurance
                </button>
              </div>
            )}

            {selectedZoneTab === 'waiting_chairs' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction('Patient sat on chair #3 in the waiting corner with health brochure.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Take a Seat in Waiting Lounge
                </button>
                <button
                  onClick={() => handleAction('Dispensed cool filtered water from the clinic dispenser.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Drink from Water Cooler
                </button>
              </div>
            )}

            {selectedZoneTab === 'medicine_cabin' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction('Inspected three 3x1.5 shelves: 142 antibiotic units, 80 vitamin packs, 60 amber syrup bottles verified.')}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-lg transition"
                >
                  Audit 3x1.5 Shelves Stock
                </button>
                <button
                  onClick={() => handleAction('Dispensed prescribed medication from middle zone storage shelf.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Collect Doctor Prescription
                </button>
              </div>
            )}

            {selectedZoneTab === 'doctor_desk' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction('Doctor started consultation: review of patient vitals, ECG rhythms normal (72 BPM).')}
                  className="px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 rounded-lg transition"
                >
                  Start Medical Consultation
                </button>
                <button
                  onClick={() => handleAction('Doctor wrote medical prescription and notes on desk pad.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Write Prescription Pad
                </button>
              </div>
            )}

            {selectedZoneTab === 'examination_bed' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction('Patient stepped onto chrome stool and rested on mint examination table; vitals logged (BP 120/80 mmHg).')}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition"
                >
                  Conduct Clinical Examination
                </button>
                <button
                  onClick={() => handleAction('New sanitary paper sheet rolled over table plinth; hygiene sterilized.')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                >
                  Replace Sanitary Paper Roll
                </button>
              </div>
            )}

            {/* Live Feedback Toast */}
            {actionFeedback && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center gap-2 animate-fade-in shadow-md">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-snug">{actionFeedback}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Click any 3D object in the viewport to walk the avatar directly.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
