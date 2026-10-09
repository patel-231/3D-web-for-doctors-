import React from 'react';
import {
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  Eye,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Pill,
  Bed,
  UserCheck,
  DoorOpen,
} from 'lucide-react';
import { ClinicZoneId, CameraViewMode } from '../types/clinic';
import { CLINIC_ZONES } from '../data/clinicData';
import { soundFx } from '../utils/audio';

interface NavigationOverlayProps {
  currentZone: ClinicZoneId;
  targetZone: ClinicZoneId | null;
  hoveredZone: ClinicZoneId | null;
  isWalking: boolean;
  cameraMode: CameraViewMode;
  isMuted: boolean;
  onSelectDestination: (zone: ClinicZoneId) => void;
  onSetCameraMode: (mode: CameraViewMode) => void;
  onToggleMute: () => void;
  onOpenZoneDetails: () => void;
}

export const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  currentZone,
  targetZone,
  hoveredZone,
  isWalking,
  cameraMode,
  isMuted,
  onSelectDestination,
  onSetCameraMode,
  onToggleMute,
  onOpenZoneDetails,
}) => {
  const activeZoneData = CLINIC_ZONES[currentZone];

  const primaryDestinations: Array<{
    id: ClinicZoneId;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'reception',
      label: 'Go to Reception',
      sublabel: 'L-Shaped Table & Staff Avatar',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'hover:border-teal-500 hover:text-teal-700',
    },
    {
      id: 'medicine_cabin',
      label: 'Get Medicines',
      sublabel: 'Three 3x1.5 Shelves & Stock',
      icon: <Pill className="w-4 h-4" />,
      color: 'hover:border-amber-500 hover:text-amber-700',
    },
    {
      id: 'doctor_desk',
      label: 'Consult Doctor',
      sublabel: 'Executive Table & Chairs',
      icon: <Stethoscope className="w-4 h-4" />,
      color: 'hover:border-sky-600 hover:text-sky-700',
    },
    {
      id: 'examination_bed',
      label: 'Examination Bed',
      sublabel: 'Top-Right Corner Plinth',
      icon: <Bed className="w-4 h-4" />,
      color: 'hover:border-emerald-600 hover:text-emerald-700',
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6">
      {/* Top Bar: Clinic Brand & Global Controls */}
      <div className="flex items-start justify-between gap-4">
        {/* Brand Card */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-3.5 shadow-sm max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-slate-900">
                  MediClinic 3D
                </h1>
                <span className="text-[10px] uppercase font-semibold text-sky-700 tracking-wider bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                  Interactive Floor Plan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Low-poly architectural clinic with real-time waypoint avatar
              </p>
            </div>
          </div>

          {/* Current Avatar Location Status */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-500 font-medium">Location:</span>
              <span className="text-slate-900 font-semibold truncate max-w-[130px]">
                {activeZoneData.title.split(' ')[0]} {activeZoneData.title.split(' ')[1] || ''}
              </span>
            </div>
            {isWalking ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Walking...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Arrived
              </span>
            )}
          </div>
        </div>

        {/* Top Right Tool Bar: Camera Modes & Settings */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Camera View Mode Switcher */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-1 shadow-sm flex items-center gap-1 text-xs">
            <button
              onClick={() => onSetCameraMode('isometric')}
              title="Isometric 3D Perspective"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                cameraMode === 'isometric'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Isometric</span>
            </button>

            <button
              onClick={() => onSetCameraMode('top_down')}
              title="Top-Down 2D Architectural Plan"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                cameraMode === 'top_down'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Plan</span>
            </button>

            <button
              onClick={() => onSetCameraMode('follow')}
              title="Follow Avatar Position"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                cameraMode === 'follow'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Follow</span>
            </button>

            <button
              onClick={() => onSetCameraMode('cinematic')}
              title="Focus on Current Room"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                cameraMode === 'cinematic'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-2.5 shadow-sm text-slate-700 hover:bg-slate-100 transition"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-600" />
            )}
          </button>

          {/* Zone Details / Info Modal Trigger */}
          <button
            onClick={onOpenZoneDetails}
            title="Floor Plan Specifications"
            className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-2.5 shadow-sm text-slate-700 hover:bg-slate-100 transition"
          >
            <Info className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Floating Center Notification when Hovering */}
      {hoveredZone && (
        <div className="self-center bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-slate-700/50 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Click to walk to: <strong>{CLINIC_ZONES[hoveredZone].title}</strong></span>
        </div>
      )}

      {/* Bottom Floating Navigation Modal */}
      <div className="pointer-events-auto max-w-3xl w-full mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 md:p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Clinic Waypoint Navigator
              </span>
              <span className="text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-medium border border-sky-100">
                Smooth GSAP Waypoints
              </span>
            </div>
            <h2 className="text-sm md:text-base font-semibold text-slate-900 mt-0.5">
              Select Destination for Visitor Avatar
            </h2>
          </div>

          {/* Reset / Return to Welcome button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSelectDestination('welcome');
            }}
            disabled={isWalking && targetZone === 'welcome'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 self-start sm:self-center ${
              currentZone === 'welcome'
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Welcome Mat</span>
          </button>
        </div>

        {/* The 4 Core Destination Buttons Requested in Prompt */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
          {primaryDestinations.map((dest) => {
            const isActive = currentZone === dest.id;
            const isTarget = targetZone === dest.id && isWalking;

            return (
              <button
                key={dest.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectDestination(dest.id);
                }}
                disabled={isTarget}
                className={`relative group text-left p-3 rounded-xl border transition-all duration-200 ${
                  isTarget
                    ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-400/40'
                    : isActive
                    ? 'bg-sky-50/70 border-sky-400 shadow-xs ring-1 ring-sky-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : isTarget
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-sky-100 group-hover:text-sky-700'
                    }`}
                  >
                    {dest.icon}
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                  {isTarget && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded animate-pulse">
                      Walking...
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <h3 className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition">
                    {dest.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {dest.sublabel}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-sky-600">
                  <span>Waypoint route</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Context Action Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Active Zone:</strong> {activeZoneData.zoneArea} ({activeZoneData.title})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenZoneDetails}
              className="text-xs font-medium text-sky-700 hover:text-sky-800 underline underline-offset-2 flex items-center gap-1"
            >
              <span>View Room Specifications</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
