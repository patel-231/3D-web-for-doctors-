import React, { useState, useCallback } from 'react';
import { ClinicZoneId, CameraViewMode } from './types/clinic';
import { ClinicCanvas } from './components/ClinicCanvas';
import { NavigationOverlay } from './components/NavigationOverlay';
import { ZoneDetailsModal } from './components/ZoneDetailsModal';
import { CLINIC_ZONES } from './data/clinicData';
import { soundFx } from './utils/audio';

export default function App() {
  const [currentZone, setCurrentZone] = useState<ClinicZoneId>('welcome');
  const [targetZone, setTargetZone] = useState<ClinicZoneId | null>(null);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [hoveredZone, setHoveredZone] = useState<ClinicZoneId | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('isometric');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [arrivalToast, setArrivalToast] = useState<{ zone: ClinicZoneId; message: string } | null>(null);

  const handleSelectDestination = useCallback((destZone: ClinicZoneId) => {
    if (destZone === currentZone && !isWalking) {
      // Already there, open details or play gentle chime
      soundFx.playClick();
      return;
    }
    setTargetZone(destZone);
  }, [currentZone, isWalking]);

  const handleArrivedAtZone = useCallback((arrivedZone: ClinicZoneId) => {
    setCurrentZone(arrivedZone);
    setTargetZone(null);
    setIsWalking(false);

    // Show arrival toast
    const zoneData = CLINIC_ZONES[arrivedZone];
    setArrivalToast({
      zone: arrivedZone,
      message: `Arrived at ${zoneData.title}`,
    });

    setTimeout(() => {
      setArrivalToast(null);
    }, 4000);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundFx.setMuted(next);
      return next;
    });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <ClinicCanvas
        currentZone={currentZone}
        targetZone={targetZone}
        cameraMode={cameraMode}
        isWalking={isWalking}
        onArrivedAtZone={handleArrivedAtZone}
        onZoneSelect={handleSelectDestination}
        onHoverZone={setHoveredZone}
        onWalkingStateChange={setIsWalking}
      />

      {/* Floating 2D UI Overlay */}
      <NavigationOverlay
        currentZone={currentZone}
        targetZone={targetZone}
        hoveredZone={hoveredZone}
        isWalking={isWalking}
        cameraMode={cameraMode}
        isMuted={isMuted}
        onSelectDestination={handleSelectDestination}
        onSetCameraMode={setCameraMode}
        onToggleMute={handleToggleMute}
        onOpenZoneDetails={() => setIsDetailsModalOpen(true)}
      />

      {/* Floating Arrival Notification Toast */}
      {arrivalToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <div className="bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-xl border border-sky-500/50 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{arrivalToast.message}</span>
            <span className="text-[10px] text-slate-400 font-normal">| Explore details</span>
          </div>
        </div>
      )}

      {/* Floor Plan Specifications & Actions Modal */}
      <ZoneDetailsModal
        isOpen={isDetailsModalOpen}
        activeZone={currentZone}
        onClose={() => setIsDetailsModalOpen(false)}
        onNavigateTo={handleSelectDestination}
      />
    </div>
  );
}
