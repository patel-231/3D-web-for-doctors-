import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ClinicZoneId, CameraViewMode } from '../types/clinic';
import { buildClinicScene, InteractiveZoneObject } from './scene/clinicMeshBuilder';
import {
  createVisitorAvatar,
  updateCharacterMixers,
  AnimatedCharacter,
  ClinicStaffCharacter,
} from './scene/characterBuilder';
import { findPath, getClosestNode, WAYPOINT_GRAPH } from './scene/pathfinder';
import { CLINIC_ZONES } from '../data/clinicData';
import { soundFx } from '../utils/audio';

interface ClinicCanvasProps {
  currentZone: ClinicZoneId;
  targetZone: ClinicZoneId | null;
  cameraMode: CameraViewMode;
  isWalking: boolean;
  onArrivedAtZone: (zone: ClinicZoneId) => void;
  onZoneSelect: (zone: ClinicZoneId) => void;
  onHoverZone: (zone: ClinicZoneId | null) => void;
  onWalkingStateChange: (isWalking: boolean) => void;
}

export const ClinicCanvas: React.FC<ClinicCanvasProps> = ({
  currentZone,
  targetZone,
  cameraMode,
  isWalking,
  onArrivedAtZone,
  onZoneSelect,
  onHoverZone,
  onWalkingStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const visitorRef = useRef<AnimatedCharacter | null>(null);
  const doctorStaffRef = useRef<ClinicStaffCharacter | null>(null);
  const receptionistStaffRef = useRef<ClinicStaffCharacter | null>(null);
  const interactiveObjectsRef = useRef<InteractiveZoneObject[]>([]);
  const mainDoorRef = useRef<THREE.Group | null>(null);
  const cabinDoorRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Active walking timeline/tween
  const walkTweenRef = useRef<gsap.core.Tween | null>(null);
  const lastFootstepTime = useRef<number>(0);

  // Mouse raycasting
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Current avatar position state for path calculations
  const avatarPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 9.8 });

  // Navigation executor
  const navigateToDestination = useCallback((destZone: ClinicZoneId) => {
    if (!visitorRef.current) return;

    // Find destination waypoint node
    let targetNodeId = 'welcome';
    if (destZone === 'welcome') targetNodeId = 'welcome';
    else if (destZone === 'reception') targetNodeId = 'reception';
    else if (destZone === 'waiting_chairs') targetNodeId = 'waiting_chairs';
    else if (destZone === 'medicine_cabin') targetNodeId = 'medicine_shelves';
    else if (destZone === 'doctor_desk') targetNodeId = 'doctor_desk';
    else if (destZone === 'examination_bed') targetNodeId = 'examination_bed';

    const startNodeId = getClosestNode(avatarPosRef.current.x, avatarPosRef.current.z);
    const pathPoints = findPath(startNodeId, targetNodeId);

    // Prepend current precise avatar position
    const fullPath = [
      { x: avatarPosRef.current.x, z: avatarPosRef.current.z },
      ...pathPoints,
    ];

    // Filter adjacent duplicate points
    const waypoints: Array<{ x: number; z: number }> = [];
    for (let i = 0; i < fullPath.length; i++) {
      if (i === 0) {
        waypoints.push(fullPath[i]);
      } else {
        const prev = waypoints[waypoints.length - 1];
        const dist = Math.hypot(fullPath[i].x - prev.x, fullPath[i].z - prev.z);
        if (dist > 0.1) {
          waypoints.push(fullPath[i]);
        }
      }
    }

    if (waypoints.length <= 1) {
      onWalkingStateChange(false);
      onArrivedAtZone(destZone);
      return;
    }

    // Cancel existing walking tween if any
    if (walkTweenRef.current) {
      walkTweenRef.current.kill();
    }

    // Compute segment lengths & total distance
    const segmentLengths: number[] = [];
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const d = Math.hypot(
        waypoints[i + 1].x - waypoints[i].x,
        waypoints[i + 1].z - waypoints[i].z
      );
      segmentLengths.push(d);
      totalDistance += d;
    }

    // Paced walking speed: ~4 units per second
    const duration = Math.max(1.4, totalDistance / 3.8);

    onWalkingStateChange(true);

    const progressObj = { progress: 0 };
    walkTweenRef.current = gsap.to(progressObj, {
      progress: 1,
      duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (!visitorRef.current) return;
        const p = progressObj.progress;
        const currentDist = p * totalDistance;

        // Find current segment
        let accumulated = 0;
        let segmentIndex = 0;
        let segmentProgress = 0;

        for (let i = 0; i < segmentLengths.length; i++) {
          if (accumulated + segmentLengths[i] >= currentDist || i === segmentLengths.length - 1) {
            segmentIndex = i;
            const remaining = currentDist - accumulated;
            segmentProgress = segmentLengths[i] > 0 ? remaining / segmentLengths[i] : 1;
            break;
          }
          accumulated += segmentLengths[i];
        }

        const pA = waypoints[segmentIndex];
        const pB = waypoints[segmentIndex + 1] || pA;

        const currentX = pA.x + (pB.x - pA.x) * segmentProgress;
        const currentZ = pA.z + (pB.z - pA.z) * segmentProgress;

        visitorRef.current.group.position.x = currentX;
        visitorRef.current.group.position.z = currentZ;
        avatarPosRef.current = { x: currentX, z: currentZ };

        // Direction & rotation
        const dx = pB.x - pA.x;
        const dz = pB.z - pA.z;
        if (Math.hypot(dx, dz) > 0.01) {
          const targetAngle = Math.atan2(dx, dz);
          // Smooth rotation lerp
          const currentAngle = visitorRef.current.group.rotation.y;
          let diff = targetAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          visitorRef.current.group.rotation.y = currentAngle + diff * 0.25;
        }

        // Animate doors dynamically as visitor passes them
        if (mainDoorRef.current) {
          const distToEntrance = Math.hypot(currentX - 0, currentZ - 10.2);
          const doorOpenAngle = distToEntrance < 3.0 ? -Math.PI / 2.2 : -Math.PI / 4.0;
          mainDoorRef.current.rotation.y += (doorOpenAngle - mainDoorRef.current.rotation.y) * 0.1;
        }

        if (cabinDoorRef.current) {
          const distToCabinDoor = Math.hypot(currentX - (-3.2), currentZ - (-3.2));
          const cabinDoorAngle = distToCabinDoor < 2.8 ? -Math.PI / 2.0 : -Math.PI / 4.2;
          cabinDoorRef.current.rotation.y += (cabinDoorAngle - cabinDoorRef.current.rotation.y) * 0.1;
        }

        // Audio footsteps
        const now = performance.now();
        if (now - lastFootstepTime.current > 280) {
          soundFx.playFootstep();
          lastFootstepTime.current = now;
        }
      },
      onComplete: () => {
        // Smoothly orient visitor to zone interaction focal point
        if (visitorRef.current) {
          let finalYaw = visitorRef.current.group.rotation.y;
          if (destZone === 'welcome') finalYaw = Math.PI;
          else if (destZone === 'reception') finalYaw = -Math.PI / 1.7;
          else if (destZone === 'waiting_chairs') finalYaw = Math.PI / 2;
          else if (destZone === 'medicine_cabin') finalYaw = -Math.PI / 2;
          else if (destZone === 'doctor_desk') finalYaw = 0;
          else if (destZone === 'examination_bed') finalYaw = 0.2;

          gsap.to(visitorRef.current.group.rotation, {
            y: finalYaw,
            duration: 0.45,
            ease: 'power2.out',
          });
        }

        onWalkingStateChange(false);
        soundFx.playArrival();
        onArrivedAtZone(destZone);
      },
    });
  }, [onArrivedAtZone, onWalkingStateChange]);

  // Handle external targetZone triggers
  useEffect(() => {
    if (targetZone) {
      navigateToDestination(targetZone);
    }
  }, [targetZone, navigateToDestination]);

  // Handle Camera Mode & Presets
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (cameraMode === 'isometric') {
      gsap.to(camera.position, {
        x: 16,
        y: 19,
        z: 19,
        duration: 1.2,
        ease: 'power2.inOut',
      });
      gsap.to(controls.target, {
        x: 0,
        y: 0.5,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut',
      });
    } else if (cameraMode === 'top_down') {
      gsap.to(camera.position, {
        x: 0,
        y: 25,
        z: 0.05,
        duration: 1.2,
        ease: 'power2.inOut',
      });
      gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut',
      });
    } else if (cameraMode === 'cinematic') {
      const preset = CLINIC_ZONES[currentZone]?.cameraPreset;
      if (preset) {
        gsap.to(camera.position, {
          x: preset.pos[0],
          y: preset.pos[1],
          z: preset.pos[2],
          duration: 1.2,
          ease: 'power2.inOut',
        });
        gsap.to(controls.target, {
          x: preset.target[0],
          y: preset.target[1],
          z: preset.target[2],
          duration: 1.2,
          ease: 'power2.inOut',
        });
      }
    }
  }, [cameraMode, currentZone]);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF1F5F9); // Clean slate-100 medical canvas
    sceneRef.current = scene;

    // Fog for subtle depth
    scene.fog = new THREE.Fog(0xF1F5F9, 25, 60);

    // Camera - Isometric Angle
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 150);
    camera.position.set(16, 19, 19);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.5, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 5;
    controls.maxDistance = 45;
    controlsRef.current = controls;

    // -------------------------------------------------------------
    // LIGHTING
    // -------------------------------------------------------------
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.72);
    scene.add(ambientLight);

    // Hemisphere Light for natural soft bounce
    const hemiLight = new THREE.HemisphereLight(0xF0F9FF, 0xE2E8F0, 0.45);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Sun / Main Directional Key Light
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    dirLight.position.set(16, 24, 14);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -16;
    dirLight.shadow.camera.right = 16;
    dirLight.shadow.camera.top = 16;
    dirLight.shadow.camera.bottom = -16;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Secondary Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xBAE6FD, 0.4);
    fillLight.position.set(-14, 16, -12);
    scene.add(fillLight);

    // Cozy Accent Point Lights in Clinic
    const docDeskLight = new THREE.PointLight(0xFDE68A, 0.7, 8);
    docDeskLight.position.set(-2.4, 2.0, -7.0);
    scene.add(docDeskLight);

    const recLight = new THREE.PointLight(0xBAE6FD, 0.6, 8);
    recLight.position.set(-4.5, 2.0, 7.0);
    scene.add(recLight);

    // -------------------------------------------------------------
    // BUILD CLINIC MESH MODELS
    // -------------------------------------------------------------
    const clinicData = buildClinicScene();
    scene.add(clinicData.group);
    interactiveObjectsRef.current = clinicData.interactiveObjects;
    mainDoorRef.current = clinicData.mainEntranceDoor;
    cabinDoorRef.current = clinicData.cabinDoor;
    doctorStaffRef.current = clinicData.doctorStaff;
    receptionistStaffRef.current = clinicData.receptionistStaff;

    // -------------------------------------------------------------
    // VISITOR AVATAR (Starts at "WELCOME" mat at [0, 0, 9.8])
    // -------------------------------------------------------------
    const visitor = createVisitorAvatar();
    visitor.group.position.set(0, 0, 9.8);
    visitor.group.rotation.y = Math.PI; // Initially facing into clinic
    scene.add(visitor.group);
    visitorRef.current = visitor;
    avatarPosRef.current = { x: 0, z: 9.8 };

    // -------------------------------------------------------------
    // RAYCASTING & INTERACTION EVENTS
    // -------------------------------------------------------------
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      
      const meshesToTest: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach(item => {
        meshesToTest.push(item.mesh);
      });

      const intersects = raycaster.current.intersectObjects(meshesToTest, true);
      if (intersects.length > 0) {
        const hit = intersects[0];
        // Find which zone was clicked
        let foundZone: ClinicZoneId | null = null;
        for (const item of interactiveObjectsRef.current) {
          let currentObj: THREE.Object3D | null = hit.object;
          while (currentObj) {
            if (currentObj === item.mesh) {
              foundZone = item.zoneId as ClinicZoneId;
              break;
            }
            currentObj = currentObj.parent;
          }
          if (foundZone) break;
        }

        if (foundZone) {
          soundFx.playClick();
          onZoneSelect(foundZone);
        }
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const meshesToTest: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach(item => {
        meshesToTest.push(item.mesh);
      });

      const intersects = raycaster.current.intersectObjects(meshesToTest, true);
      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        let hoveredZone: ClinicZoneId | null = null;
        for (const item of interactiveObjectsRef.current) {
          let cur: THREE.Object3D | null = intersects[0].object;
          while (cur) {
            if (cur === item.mesh) {
              hoveredZone = item.zoneId as ClinicZoneId;
              break;
            }
            cur = cur.parent;
          }
          if (hoveredZone) break;
        }
        onHoverZone(hoveredZone);
      } else {
        container.style.cursor = 'default';
        onHoverZone(null);
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('click', handlePointerDown);
    domElement.addEventListener('mousemove', handlePointerMove);

    // -------------------------------------------------------------
    // WINDOW RESIZE
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // RENDER LOOP
    // -------------------------------------------------------------
    let lastTime = performance.now();
    const animate = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update Controls
      controls.update();

      // Update character Three.js AnimationMixers (breathing, looking around, typing, and walking)
      updateCharacterMixers(
        visitorRef.current,
        doctorStaffRef.current,
        receptionistStaffRef.current,
        isWalking,
        delta
      );

      // Follow camera mode tracking
      if (visitorRef.current && cameraMode === 'follow') {
        const charPos = visitorRef.current.group.position;
        controls.target.lerp(new THREE.Vector3(charPos.x, charPos.y + 0.8, charPos.z), 0.05);
      }

      renderer.render(scene, camera);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('click', handlePointerDown);
      domElement.removeEventListener('mousemove', handlePointerMove);
      if (walkTweenRef.current) walkTweenRef.current.kill();
      controls.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [cameraMode, isWalking, onArrivedAtZone, onHoverZone, onWalkingStateChange, onZoneSelect]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden touch-none"
    />
  );
};
