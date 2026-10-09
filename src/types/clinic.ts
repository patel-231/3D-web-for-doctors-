export type ClinicZoneId = 
  | 'welcome' 
  | 'reception' 
  | 'waiting_chairs' 
  | 'medicine_cabin' 
  | 'doctor_desk' 
  | 'examination_bed';

export interface Waypoint {
  id: string;
  x: number;
  z: number;
  label: string;
  zone: ClinicZoneId;
}

export interface ZoneInfo {
  id: ClinicZoneId;
  title: string;
  subtitle: string;
  zoneArea: string;
  description: string;
  features: string[];
  buttonLabel: string;
  icon: string;
  cameraPreset: {
    pos: [number, number, number];
    target: [number, number, number];
  };
}

export type CameraViewMode = 'isometric' | 'top_down' | 'follow' | 'cinematic';
