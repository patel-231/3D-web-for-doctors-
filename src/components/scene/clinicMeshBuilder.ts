import * as THREE from 'three';
import { createDoctorAvatar, createReceptionistAvatar, ClinicStaffCharacter } from './characterBuilder';

export interface InteractiveZoneObject {
  mesh: THREE.Object3D;
  zoneId: string;
  label: string;
  description: string;
}

export interface ClinicSceneData {
  group: THREE.Group;
  interactiveObjects: InteractiveZoneObject[];
  mainEntranceDoor: THREE.Group;
  cabinDoor: THREE.Group;
  doctorStaff: ClinicStaffCharacter;
  receptionistStaff: ClinicStaffCharacter;
}

// Procedural Canvas Textures
function createWelcomeMatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background - high quality textured coir / rubber mat
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 512, 256);

  // Border trim
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#38BDF8';
  ctx.strokeRect(10, 10, 492, 236);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(22, 22, 468, 212);

  // Medical Cross Icon
  ctx.fillStyle = '#38BDF8';
  const cx = 256;
  const cy = 70;
  const w = 14;
  const h = 42;
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.fillRect(cx - h / 2, cy - w / 2, h, w);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Segoe UI", Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WELCOME', 256, 140);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 16px "Segoe UI", Inter, system-ui, sans-serif';
  ctx.fillText('MEDICLINIC HEALTHCARE', 256, 185);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createTileFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Cream base tile
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle marble / polished sheen noise
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 3;

  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createHallwayArrowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EFF6FF';
  ctx.fillRect(0, 0, 256, 256);

  // Directional arrow
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.moveTo(128, 40);
  ctx.lineTo(200, 130);
  ctx.lineTo(155, 130);
  ctx.lineTo(155, 210);
  ctx.lineTo(101, 210);
  ctx.lineTo(101, 130);
  ctx.lineTo(56, 130);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createDoctorScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 256, 160);

  // Header
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(0, 0, 256, 26);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('PATIENT VITALS & EHR', 12, 18);

  // ECG Line in green
  ctx.strokeStyle = '#22C55E';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const ecg = [70, 70, 68, 70, 45, 95, 30, 80, 70, 70, 70, 68, 70, 45, 95, 30, 80, 70, 70];
  const step = 256 / ecg.length;
  ecg.forEach((y, i) => {
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i * step, y);
  });
  ctx.stroke();

  // Stats
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '11px sans-serif';
  ctx.fillText('BPM: 72  |  BP: 120/80  |  SpO2: 99%', 12, 130);

  return new THREE.CanvasTexture(canvas);
}

function createWallPosterTexture(title: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 256, 340);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 50);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 128, 32);

  // Graphic bars
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(30, 80, 196, 120);

  ctx.fillStyle = color;
  ctx.fillRect(50, 100, 40, 80);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(110, 120, 40, 60);
  ctx.fillStyle = '#34D399';
  ctx.fillRect(170, 90, 40, 90);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px sans-serif';
  ctx.fillText('Healthy Habits & Prevention', 128, 240);
  ctx.fillText('Authorized Medical Guidelines', 128, 270);

  return new THREE.CanvasTexture(canvas);
}

export function buildClinicScene(): ClinicSceneData {
  const root = new THREE.Group();
  root.name = 'clinic_model';

  const interactiveObjects: InteractiveZoneObject[] = [];

  // -------------------------------------------------------------
  // SHARED MATERIALS (Medical Clean Palette)
  // -------------------------------------------------------------
  const woodMat = new THREE.MeshLambertMaterial({ color: 0xD4A373 }); // Light natural wood
  const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x9C6644 });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC });
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xE0F2FE }); // Pastel sky blue
  const wallTopMat = new THREE.MeshLambertMaterial({ color: 0xBAE6FD });
  const partitionGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xBAE6FD,
    transmission: 0.7,
    opacity: 0.6,
    transparent: true,
    roughness: 0.1,
    ior: 1.4,
  });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.7, roughness: 0.3 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.9, roughness: 0.1 });
  const tealCushionMat = new THREE.MeshLambertMaterial({ color: 0x0D9488 }); // Medical mint/teal
  const chairLeatherMat = new THREE.MeshLambertMaterial({ color: 0x1E293B }); // Executive dark chair
  const plantPotMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });
  const plantLeafMat = new THREE.MeshLambertMaterial({ color: 0x15803D });

  // -------------------------------------------------------------
  // 1. FLOOR BASE
  // -------------------------------------------------------------
  const floorGeo = new THREE.BoxGeometry(20, 0.4, 22);
  const floorMat = new THREE.MeshLambertMaterial({
    map: createTileFloorTexture(),
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set(0, -0.2, 0);
  floorMesh.receiveShadow = true;
  root.add(floorMesh);

  // Exterior ground plinth
  const plinthGeo = new THREE.BoxGeometry(22, 0.2, 24);
  const plinthMat = new THREE.MeshLambertMaterial({ color: 0xCBD5E1 });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.set(0, -0.5, 0);
  root.add(plinth);

  // -------------------------------------------------------------
  // 2. EXTERIOR WALLS & PARTITIONS (Cutaway for isometric view)
  // -------------------------------------------------------------
  const wallHeight = 2.2;
  const wallThickness = 0.35;

  // Back Wall (Top wall z = -11) - Full height
  const backWallGeo = new THREE.BoxGeometry(20, wallHeight, wallThickness);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, wallHeight / 2, -11 + wallThickness / 2);
  backWall.receiveShadow = true;
  root.add(backWall);

  // Wall trim on top
  const backTrim = new THREE.Mesh(new THREE.BoxGeometry(20, 0.08, wallThickness + 0.05), wallTopMat);
  backTrim.position.set(0, wallHeight + 0.04, -11 + wallThickness / 2);
  root.add(backTrim);

  // Left Outer Wall (x = -10)
  const leftWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 22);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
  leftWall.position.set(-10 + wallThickness / 2, wallHeight / 2, 0);
  leftWall.receiveShadow = true;
  root.add(leftWall);

  // Right Outer Wall (Cutaway low architectural edge)
  const rightWallGeo = new THREE.BoxGeometry(wallThickness, 0.6, 22);
  const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
  rightWall.position.set(10 - wallThickness / 2, 0.3, 0);
  root.add(rightWall);

  // Front Outer Wall (Cutaway with entrance opening in center)
  // Left side of front entrance
  const frontLeftWall = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, wallThickness), wallMat);
  frontLeftWall.position.set(-5.5, 0.3, 11 - wallThickness / 2);
  root.add(frontLeftWall);

  // Right side of front entrance
  const frontRightWall = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, wallThickness), wallMat);
  frontRightWall.position.set(5.5, 0.3, 11 - wallThickness / 2);
  root.add(frontRightWall);

  // -------------------------------------------------------------
  // ENTRANCE DOOR & WELCOME MAT (Bottom Center)
  // -------------------------------------------------------------
  // Entrance Mat at z = 9.8, x = 0
  const matGeo = new THREE.BoxGeometry(3.0, 0.03, 1.8);
  const matMat = new THREE.MeshLambertMaterial({
    map: createWelcomeMatTexture(),
  });
  const welcomeMat = new THREE.Mesh(matGeo, matMat);
  welcomeMat.position.set(0, 0.015, 9.6);
  welcomeMat.receiveShadow = true;
  root.add(welcomeMat);

  // Entrance Door Frame (Hinged inward door)
  const doorFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.3, 0.25), darkWoodMat);
  doorFrameLeft.position.set(-1.6, 1.15, 10.9);
  root.add(doorFrameLeft);

  const doorFrameRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.3, 0.25), darkWoodMat);
  doorFrameRight.position.set(1.6, 1.15, 10.9);
  root.add(doorFrameRight);

  const doorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(3.38, 0.18, 0.25), darkWoodMat);
  doorFrameTop.position.set(0, 2.3, 10.9);
  root.add(doorFrameTop);

  // Door leaf swinging inward
  const mainEntranceDoor = new THREE.Group();
  mainEntranceDoor.position.set(-1.5, 0, 10.9); // Pivot at left frame

  const doorLeafGeo = new THREE.BoxGeometry(1.45, 2.15, 0.08);
  const doorLeafMat = new THREE.MeshLambertMaterial({ color: 0xF1F5F9 });
  const doorLeaf = new THREE.Mesh(doorLeafGeo, doorLeafMat);
  doorLeaf.position.set(0.725, 1.075, 0);
  doorLeaf.castShadow = true;
  mainEntranceDoor.add(doorLeaf);

  // Door glass insert
  const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.09), partitionGlassMat);
  doorGlass.position.set(0.725, 1.2, 0);
  mainEntranceDoor.add(doorGlass);

  // Door handle
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3), metalMat);
  handle.position.set(1.3, 1.05, 0.06);
  mainEntranceDoor.add(handle);

  // Opened inward at an inviting angle
  mainEntranceDoor.rotation.y = -Math.PI / 3.8;
  root.add(mainEntranceDoor);

  interactiveObjects.push({
    mesh: welcomeMat,
    zoneId: 'welcome',
    label: 'Main Entrance & Welcome Mat',
    description: 'Clinic entrance threshold with sanitization and greeting mat.',
  });

  // -------------------------------------------------------------
  // ZONE PARTITION WALLS:
  // 1. Between Waiting Room and Medicine/Passage (z = 4.2)
  // 2. Between Medicine/Passage and Doctor's Cabin (z = -3.2)
  // -------------------------------------------------------------
  // Partition 1: Left partition wall separating Waiting Room from Medicine Cabin
  const part1 = new THREE.Mesh(new THREE.BoxGeometry(11, wallHeight, wallThickness), wallMat);
  part1.position.set(-4.5, wallHeight / 2, 3.8);
  part1.receiveShadow = true;
  root.add(part1);

  // Glass top decorative panel on partition 1
  const part1Glass = new THREE.Mesh(new THREE.BoxGeometry(7, 0.7, 0.05), partitionGlassMat);
  part1Glass.position.set(-4.5, 1.5, 3.8);
  root.add(part1Glass);

  // Partition 2: Separating Doctor's Cabin from Middle Zone (z = -3.2)
  // Wall on right side of cabin door
  const part2Right = new THREE.Mesh(new THREE.BoxGeometry(12.5, wallHeight, wallThickness), wallMat);
  part2Right.position.set(3.75, wallHeight / 2, -3.2);
  part2Right.receiveShadow = true;
  root.add(part2Right);

  // Wall on left side of cabin door
  const part2Left = new THREE.Mesh(new THREE.BoxGeometry(5.0, wallHeight, wallThickness), wallMat);
  part2Left.position.set(-7.5, wallHeight / 2, -3.2);
  part2Left.receiveShadow = true;
  root.add(part2Left);

  // DOCTOR'S CABIN ACCESS DOOR (at left wall/passage at x = -3.2, z = -3.2)
  const cabinDoorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.18, 0.25), darkWoodMat);
  cabinDoorFrameTop.position.set(-3.75, 2.2, -3.2);
  root.add(cabinDoorFrameTop);

  const cabinDoorSign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.28, 0.04), whiteMat);
  cabinDoorSign.position.set(-3.75, 2.0, -3.05);
  root.add(cabinDoorSign);

  // Doctor Cabin Door Group (hinged)
  const cabinDoor = new THREE.Group();
  cabinDoor.position.set(-5.0, 0, -3.2); // Hinged at left
  const cabinDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), woodMat);
  cabinDoorLeaf.position.set(0.8, 1.05, 0);
  cabinDoor.add(cabinDoorLeaf);

  const cHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), metalMat);
  cHandle.position.set(1.45, 1.05, 0.06);
  cabinDoor.add(cHandle);

  // Ajar inward into Doctor's Cabin
  cabinDoor.rotation.y = -Math.PI / 4.2;
  root.add(cabinDoor);

  // -------------------------------------------------------------
  // ZONE 1: WAITING ROOM (Bottom Zone)
  // Left: L-shaped Reception Table with Reception Chair & staff avatar
  // Right: 4 Patient Chairs positioned against the wall/corner
  // -------------------------------------------------------------
  const receptionGroup = new THREE.Group();
  receptionGroup.position.set(-4.5, 0, 7.2);
  receptionGroup.name = 'reception_area';

  // L-Shaped Desk: Main Counter facing Entrance
  const mainCounter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.05, 0.8), woodMat);
  mainCounter.position.set(0, 0.525, 0);
  mainCounter.castShadow = true;
  mainCounter.receiveShadow = true;
  receptionGroup.add(mainCounter);

  // White front modesty panel with clinic logo accent
  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.9, 0.08), whiteMat);
  frontPanel.position.set(0, 0.45, 0.42);
  receptionGroup.add(frontPanel);

  // L-Return Counter (extending towards the back / left)
  const returnCounter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.05, 2.2), woodMat);
  returnCounter.position.set(-1.4, 0.525, -1.1);
  returnCounter.castShadow = true;
  receptionGroup.add(returnCounter);

  const returnPanel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 2.0), whiteMat);
  returnPanel.position.set(-1.82, 0.45, -1.1);
  receptionGroup.add(returnPanel);

  // Countertop Raised Transaction Glass / Shield
  const receptionShield = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 0.04), partitionGlassMat);
  receptionShield.position.set(0, 1.25, 0.35);
  receptionGroup.add(receptionShield);

  // Computer Monitor on Reception Desk
  const monBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.2), metalMat);
  monBase.position.set(0.6, 1.07, 0);
  receptionGroup.add(monBase);

  const monStand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), metalMat);
  monStand.position.set(0.6, 1.21, 0);
  receptionGroup.add(monStand);

  const monScreen = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.04), chairLeatherMat);
  monScreen.position.set(0.6, 1.35, 0);
  receptionGroup.add(monScreen);

  // Keyboard & mouse
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.16), whiteMat);
  kb.position.set(0.6, 1.06, -0.2);
  receptionGroup.add(kb);

  // Desk documents & pen stand
  const docPaper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.22), whiteMat);
  docPaper.position.set(-0.3, 1.06, 0);
  receptionGroup.add(docPaper);

  const penStand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12), metalMat);
  penStand.position.set(-0.6, 1.11, 0.15);
  receptionGroup.add(penStand);

  // Reception Chair (behind desk)
  const recChair = createOfficeChair(0x0D9488);
  recChair.position.set(0.5, 0, -0.75);
  recChair.rotation.y = Math.PI;
  receptionGroup.add(recChair);

  // Staff Avatar (Receptionist) seated behind desk with AnimationMixer
  const receptionist = createReceptionistAvatar();
  receptionist.group.position.set(0.5, 0, -0.75);
  receptionist.group.rotation.y = Math.PI;
  receptionGroup.add(receptionist.group);

  root.add(receptionGroup);

  interactiveObjects.push({
    mesh: mainCounter,
    zoneId: 'reception',
    label: 'Reception & Registration',
    description: 'L-shaped reception counter with receptionist avatar, check-in terminal, and appointment desk.',
  });

  // RIGHT SIDE OF WAITING ROOM: 4 PATIENT CHAIRS
  const waitingAreaGroup = new THREE.Group();
  waitingAreaGroup.position.set(7.5, 0, 7.2);
  waitingAreaGroup.name = 'waiting_chairs_area';

  // 4 Patient Chairs lined along wall
  const chairSpacing = 1.15;
  for (let i = 0; i < 4; i++) {
    const chair = createPatientChair();
    chair.position.set(0, 0, -1.8 + i * chairSpacing);
    chair.rotation.y = -Math.PI / 2; // Facing into the room
    waitingAreaGroup.add(chair);
  }

  // Waiting Room Magazine Table in the corner
  const magTable = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.8), woodMat);
  magTable.position.set(0, 0.225, 2.2);
  magTable.castShadow = true;
  waitingAreaGroup.add(magTable);

  const mag1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.22), tealCushionMat);
  mag1.position.set(-0.1, 0.46, 2.2);
  mag1.rotation.y = 0.2;
  waitingAreaGroup.add(mag1);

  // Water Cooler / Dispenser nearby
  const waterCooler = createWaterDispenser();
  waterCooler.position.set(0.6, 0, -2.8);
  waitingAreaGroup.add(waterCooler);

  // Potted indoor plant
  const plant = createPottedPlant();
  plant.position.set(0.6, 0, 2.8);
  waitingAreaGroup.add(plant);

  // Wall mounted Queue / TV Display
  const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 1.4), chairLeatherMat);
  tvFrame.position.set(2.0, 1.6, 0);
  waitingAreaGroup.add(tvFrame);

  const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.72, 1.32), new THREE.MeshBasicMaterial({ color: 0x0284C7 }));
  tvScreen.position.set(1.98, 1.6, 0);
  waitingAreaGroup.add(tvScreen);

  root.add(waitingAreaGroup);

  interactiveObjects.push({
    mesh: waitingAreaGroup,
    zoneId: 'waiting_chairs',
    label: 'Waiting Lounge',
    description: '4 comfortable patient chairs with magazines, water cooler, and digital queue display.',
  });

  // -------------------------------------------------------------
  // ZONE 2: MEDICINE CABIN & HALLWAY (Middle Zone, z = -2.5 to 3.5)
  // Left: Three 3x1.5 shelves holding medicine stock
  // Right: Open hallway/passage connecting Waiting Room to Doctor's Cabin
  // -------------------------------------------------------------
  const pharmacyGroup = new THREE.Group();
  pharmacyGroup.position.set(-5.5, 0, 0.2);
  pharmacyGroup.name = 'medicine_cabin_area';

  // Three 3x1.5 shelves on the left side
  // Dimensions specified: 3 length x 1.5 height (or depth)
  // We place 3 distinct shelf units with rich medicine stock
  const shelfZPositions = [1.6, 0.0, -1.6];
  for (let idx = 0; idx < 3; idx++) {
    const shelfUnit = createMedicineShelfUnit(idx + 1);
    shelfUnit.position.set(0, 0, shelfZPositions[idx]);
    pharmacyGroup.add(shelfUnit);
  }

  // Medicine Dispensing / Pharmacist Counter Table
  const medCounter = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.95, 2.4), woodMat);
  medCounter.position.set(2.5, 0.475, 0);
  medCounter.castShadow = true;
  pharmacyGroup.add(medCounter);

  // Pharmacy sign on the counter
  const pharSign = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 1.2), tealCushionMat);
  pharSign.position.set(2.96, 0.75, 0);
  pharmacyGroup.add(pharSign);

  root.add(pharmacyGroup);

  interactiveObjects.push({
    mesh: pharmacyGroup,
    zoneId: 'medicine_cabin',
    label: 'Medicine Cabin & Pharmacy',
    description: 'Three 3x1.5 pharmaceutical stock shelves loaded with medicines, bottles, and dispensary counter.',
  });

  // RIGHT SIDE OPEN HALLWAY / PASSAGEWAY
  // Floor guide indicators leading from Waiting Room to Doctor's Cabin
  const passageArrow1 = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.2),
    new THREE.MeshBasicMaterial({ map: createHallwayArrowTexture(), transparent: true, opacity: 0.85 })
  );
  passageArrow1.rotation.x = -Math.PI / 2;
  passageArrow1.rotation.z = Math.PI; // Pointing towards Doctor's Cabin (north)
  passageArrow1.position.set(5.0, 0.02, 2.2);
  root.add(passageArrow1);

  const passageArrow2 = passageArrow1.clone();
  passageArrow2.position.set(5.0, 0.02, -0.8);
  root.add(passageArrow2);

  // Hand Sanitizer dispenser mounted on hallway wall
  const sanitizerBase = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.16), whiteMat);
  sanitizerBase.position.set(9.6, 1.3, 0);
  root.add(sanitizerBase);

  // Directional Sign on wall
  const dirSign = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 1.4), new THREE.MeshLambertMaterial({ color: 0x0284C7 }));
  dirSign.position.set(9.6, 1.8, 1.2);
  root.add(dirSign);

  // -------------------------------------------------------------
  // ZONE 3: DOCTOR'S CABIN (Top Zone, z = -11 to -3.2)
  // Center-Left: Large Doctor's Table with:
  //   - Main executive chair behind it
  //   - Secondary doctor/assistant chair
  //   - Patient visitor chair across the desk
  // Top-Right Corner: Examination Table/Bed against the wall
  // Door: Access door on left wall leading into the cabin
  // -------------------------------------------------------------
  const doctorCabinGroup = new THREE.Group();
  doctorCabinGroup.position.set(0, 0, -7.2);
  doctorCabinGroup.name = 'doctors_cabin_area';

  // LARGE DOCTOR'S TABLE (Center-Left)
  const deskGroup = new THREE.Group();
  deskGroup.position.set(-2.4, 0, 0);

  // Table top: Premium light wood finish
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 1.6), woodMat);
  deskTop.position.set(0, 0.82, 0);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);

  // Table Legs / modesty panels
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.76, 1.5), woodMat);
  leftLeg.position.set(-1.48, 0.38, 0);
  deskGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.76, 1.5), woodMat);
  rightLeg.position.set(1.48, 0.38, 0);
  deskGroup.add(rightLeg);

  const modestyPanel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.6, 0.08), woodMat);
  modestyPanel.position.set(0, 0.46, 0.6);
  deskGroup.add(modestyPanel);

  // Desk drawer pedestal on the left
  const drawerUnit = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.72, 1.3), whiteMat);
  drawerUnit.position.set(-1.1, 0.38, 0);
  deskGroup.add(drawerUnit);

  // Computer Screen showing ECG/Patient EHR
  const docMonBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.22), metalMat);
  docMonBase.position.set(-0.4, 0.9, -0.2);
  deskGroup.add(docMonBase);

  const docMonStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28), chromeMat);
  docMonStand.position.set(-0.4, 1.05, -0.2);
  deskGroup.add(docMonStand);

  const docMonDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.52, 0.04),
    new THREE.MeshBasicMaterial({ map: createDoctorScreenTexture() })
  );
  docMonDisplay.position.set(-0.4, 1.25, -0.2);
  deskGroup.add(docMonDisplay);

  // Stethoscope on desk
  const stethRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 16), metalMat);
  stethRing.rotation.x = Math.PI / 2;
  stethRing.position.set(0.6, 0.89, -0.1);
  deskGroup.add(stethRing);

  // Prescription Pad & Pen
  const rxPad = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.32), whiteMat);
  rxPad.position.set(0.3, 0.89, 0.2);
  deskGroup.add(rxPad);

  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2), metalMat);
  pen.rotation.z = Math.PI / 2;
  pen.position.set(0.48, 0.9, 0.2);
  deskGroup.add(pen);

  // Desk Lamp
  const deskLampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04), darkWoodMat);
  deskLampBase.position.set(1.2, 0.9, -0.4);
  deskGroup.add(deskLampBase);

  const deskLampHead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 12), metalMat);
  deskLampHead.position.set(1.15, 1.25, -0.25);
  deskLampHead.rotation.x = Math.PI / 4;
  deskGroup.add(deskLampHead);

  // 1. MAIN EXECUTIVE CHAIR BEHIND TABLE (for Doctor)
  const mainDoctorChair = createOfficeChair(0x1E293B, true);
  mainDoctorChair.position.set(0, 0, -1.2);
  mainDoctorChair.rotation.y = 0; // Facing desk forward
  deskGroup.add(mainDoctorChair);

  // Seated Doctor Avatar with AnimationMixer
  const doctorAvatar = createDoctorAvatar();
  doctorAvatar.group.position.set(0, 0, -1.2);
  doctorAvatar.group.rotation.y = 0;
  deskGroup.add(doctorAvatar.group);

  // 2. SECONDARY DOCTOR / ASSISTANT CHAIR (Beside main desk)
  const assistantChair = createOfficeChair(0x334155, false);
  assistantChair.position.set(1.8, 0, -0.5);
  assistantChair.rotation.y = -Math.PI / 6;
  deskGroup.add(assistantChair);

  // 3. PATIENT VISITOR CHAIR ACROSS THE DESK
  const visitorChair = createPatientChair();
  visitorChair.position.set(0.2, 0, 1.35);
  visitorChair.rotation.y = Math.PI; // Facing the doctor
  deskGroup.add(visitorChair);

  doctorCabinGroup.add(deskGroup);

  interactiveObjects.push({
    mesh: deskTop,
    zoneId: 'doctor_desk',
    label: "Doctor's Consultation Desk",
    description: "Doctor's executive table with main executive chair, secondary assistant chair, and patient visitor chair.",
  });

  // TOP-RIGHT CORNER: EXAMINATION TABLE / BED AGAINST THE WALL
  const examBedGroup = new THREE.Group();
  examBedGroup.position.set(6.2, 0, -1.4);
  examBedGroup.name = 'examination_bed_area';

  // Examination Table Base & Chrome Frame
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 3.2), chromeMat);
  bedFrame.position.set(0, 0.72, 0);
  examBedGroup.add(bedFrame);

  // 4 Chrome Legs
  const legPositions = [
    [-0.7, 0.36, -1.4],
    [0.7, 0.36, -1.4],
    [-0.7, 0.36, 1.4],
    [0.7, 0.36, 1.4],
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72), chromeMat);
    leg.position.set(lx, ly, lz);
    examBedGroup.add(leg);
  });

  // Comfortable Mint Medical Mattress Cushion
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 2.3), tealCushionMat);
  mattress.position.set(0, 0.86, 0.4);
  mattress.castShadow = true;
  examBedGroup.add(mattress);

  // Elevated Headrest Plinth
  const headrest = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 0.8), tealCushionMat);
  headrest.rotation.x = -Math.PI / 10;
  headrest.position.set(0, 0.94, -1.05);
  examBedGroup.add(headrest);

  // White Sanitary Paper Roll at the headrest
  const paperRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 16), whiteMat);
  paperRoll.rotation.z = Math.PI / 2;
  paperRoll.position.set(0, 0.9, -1.55);
  examBedGroup.add(paperRoll);

  // Medical Pillow
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.45), whiteMat);
  pillow.position.set(0, 1.05, -0.95);
  examBedGroup.add(pillow);

  // Patient Step Stool beside bed
  const stool = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.45), chromeMat);
  stool.position.set(-1.15, 0.14, 0.5);
  examBedGroup.add(stool);

  const stoolPad = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.41), chairLeatherMat);
  stoolPad.position.set(-1.15, 0.3, 0.5);
  examBedGroup.add(stoolPad);

  // IV Drip Pole Stand
  const ivBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12), chromeMat);
  ivBase.position.set(1.1, 0.025, -1.2);
  examBedGroup.add(ivBase);

  const ivPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.1), chromeMat);
  ivPole.position.set(1.1, 1.05, -1.2);
  examBedGroup.add(ivPole);

  const ivBag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.08), partitionGlassMat);
  ivBag.position.set(1.1, 1.9, -1.2);
  examBedGroup.add(ivBag);

  // Ceiling mounted Privacy Curtain Track
  const curtainRail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 3.6), metalMat);
  curtainRail.position.set(-0.3, 2.3, 0);
  examBedGroup.add(curtainRail);

  // Folded / Hanging Privacy Curtain
  const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 1.6), new THREE.MeshLambertMaterial({ color: 0x93C5FD }));
  curtain.position.set(-1.45, 1.35, 1.0);
  curtain.castShadow = true;
  examBedGroup.add(curtain);

  // Wall-mounted Diagnostic Station (Sphygmomanometer & Otoscope) on back wall
  const diagBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.08), whiteMat);
  diagBox.position.set(0.6, 1.6, -1.9);
  examBedGroup.add(diagBox);

  const diagGauge = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), chromeMat);
  diagGauge.rotation.x = Math.PI / 2;
  diagGauge.position.set(0.6, 1.6, -1.85);
  examBedGroup.add(diagGauge);

  // Medical examination lamp over the bed
  const examLampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8), chromeMat);
  examLampArm.position.set(1.1, 1.7, 0.2);
  examBedGroup.add(examLampArm);

  const examLampHead = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 16), chromeMat);
  examLampHead.rotation.x = Math.PI / 3;
  examLampHead.position.set(1.0, 2.05, 0.35);
  examBedGroup.add(examLampHead);

  doctorCabinGroup.add(examBedGroup);

  interactiveObjects.push({
    mesh: mattress,
    zoneId: 'examination_bed',
    label: 'Examination Bed / Table',
    description: 'Adjustable clinical examination bed in top-right corner with sanitary roll, IV pole, and diagnostic kit.',
  });

  // Wall X-ray Illuminator Lightbox on back wall
  const xrayBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.1), chairLeatherMat);
  xrayBox.position.set(-2.4, 1.6, -3.7);
  doctorCabinGroup.add(xrayBox);

  const xrayScreen = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.88, 0.04), new THREE.MeshBasicMaterial({ color: 0xBAE6FD }));
  xrayScreen.position.set(-2.4, 1.6, -3.64);
  doctorCabinGroup.add(xrayScreen);

  // Anatomical chart poster on doctor's wall
  const anatPoster = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.5),
    new THREE.MeshBasicMaterial({ map: createWallPosterTexture('HUMAN ANATOMY', '#0284C7') })
  );
  anatPoster.position.set(-5.5, 1.5, -3.64);
  doctorCabinGroup.add(anatPoster);

  root.add(doctorCabinGroup);

  return {
    group: root,
    interactiveObjects,
    mainEntranceDoor,
    cabinDoor,
    doctorStaff: doctorAvatar,
    receptionistStaff: receptionist,
  };
}

// -------------------------------------------------------------
// HELPER COMPONENT BUILDERS
// -------------------------------------------------------------

function createOfficeChair(colorHex: number, isHighBack: boolean = false): THREE.Group {
  const chair = new THREE.Group();
  const seatMat = new THREE.MeshLambertMaterial({ color: colorHex });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8, roughness: 0.2 });

  // 5-Star base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.06, 8), chromeMat);
  base.position.y = 0.08;
  chair.add(base);

  // Central column
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42), chromeMat);
  stem.position.y = 0.28;
  chair.add(stem);

  // Seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.54), seatMat);
  seat.position.y = 0.52;
  seat.castShadow = true;
  chair.add(seat);

  // Backrest
  const backHeight = isHighBack ? 0.72 : 0.48;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, backHeight, 0.1), seatMat);
  back.position.set(0, 0.52 + backHeight / 2, -0.24);
  back.castShadow = true;
  chair.add(back);

  // Headrest for executive chair
  if (isHighBack) {
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.12), seatMat);
    headrest.position.set(0, 1.32, -0.24);
    chair.add(headrest);
  }

  // Armrests
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.38), chromeMat);
  leftArm.position.set(-0.31, 0.64, -0.05);
  chair.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.38), chromeMat);
  rightArm.position.set(0.31, 0.64, -0.05);
  chair.add(rightArm);

  return chair;
}

function createPatientChair(): THREE.Group {
  const chair = new THREE.Group();
  const cushionMat = new THREE.MeshLambertMaterial({ color: 0x0284C7 }); // Comfortable medical cyan/blue
  const woodMat = new THREE.MeshLambertMaterial({ color: 0xD4A373 }); // Warm light wood legs

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.09, 0.52), cushionMat);
  seat.position.y = 0.45;
  seat.castShadow = true;
  chair.add(seat);

  // Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.45, 0.08), cushionMat);
  back.position.set(0, 0.72, -0.22);
  back.castShadow = true;
  chair.add(back);

  // 4 Legs
  const legGeo = new THREE.CylinderGeometry(0.028, 0.02, 0.45);
  const legCoords = [
    [-0.22, 0.225, 0.2],
    [0.22, 0.225, 0.2],
    [-0.22, 0.225, -0.2],
    [0.22, 0.225, -0.2],
  ];
  legCoords.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(lx, ly, lz);
    chair.add(leg);
  });

  return chair;
}

function createMedicineShelfUnit(shelfIndex: number): THREE.Group {
  const unit = new THREE.Group();
  unit.name = `medicine_shelf_${shelfIndex}`;

  const woodShelfMat = new THREE.MeshLambertMaterial({ color: 0xD4A373 });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC });
  const bottleGlassMat = new THREE.MeshLambertMaterial({ color: 0xB45309 }); // Amber bottle
  const whiteBottleMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const redBoxMat = new THREE.MeshLambertMaterial({ color: 0xEF4444 });
  const blueBoxMat = new THREE.MeshLambertMaterial({ color: 0x3B82F6 });
  const greenBoxMat = new THREE.MeshLambertMaterial({ color: 0x10B981 });
  const yellowBoxMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });

  // Specified Dimensions: 3x1.5 (Width 3.0, Height 2.2, Depth 0.7)
  const width = 3.0;
  const height = 2.1;
  const depth = 0.7;

  // Frame: Left, Right, Top, Bottom, Back
  const frameThick = 0.08;
  const leftSide = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height, depth), woodShelfMat);
  leftSide.position.set(-width / 2 + frameThick / 2, height / 2, 0);
  unit.add(leftSide);

  const rightSide = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height, depth), woodShelfMat);
  rightSide.position.set(width / 2 - frameThick / 2, height / 2, 0);
  unit.add(rightSide);

  const top = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, depth), woodShelfMat);
  top.position.set(0, height - frameThick / 2, 0);
  unit.add(top);

  const base = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, depth), woodShelfMat);
  base.position.set(0, frameThick / 2, 0);
  unit.add(base);

  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.04), whiteMat);
  backPanel.position.set(0, height / 2, -depth / 2 + 0.02);
  unit.add(backPanel);

  // 4 Shelves tiers
  const shelfYPositions = [0.55, 1.05, 1.55];
  shelfYPositions.forEach((sy) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(width - frameThick * 2, frameThick, depth - 0.05), woodShelfMat);
    shelf.position.set(0, sy, 0);
    unit.add(shelf);
  });

  // Medicine Stock Stocking:
  // Level 1: Drawers / Storage organizer bins
  const binGeo = new THREE.BoxGeometry(0.38, 0.28, 0.45);
  for (let b = -3; b <= 3; b++) {
    const binMesh = new THREE.Mesh(binGeo, whiteMat);
    binMesh.position.set(b * 0.42, 0.2, 0.04);
    unit.add(binMesh);
  }

  // Level 2: Medicine Boxes (Antibiotics, Paracetamol, Pain relief)
  const boxColors = [redBoxMat, blueBoxMat, greenBoxMat, yellowBoxMat, whiteMat];
  for (let x = -1.2; x <= 1.2; x += 0.22) {
    const cMat = boxColors[Math.abs(Math.floor(x * 10)) % boxColors.length];
    const bHeight = 0.16 + (Math.sin(x * 5) > 0 ? 0.08 : 0);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.18, bHeight, 0.24), cMat);
    box.position.set(x, 0.55 + frameThick / 2 + bHeight / 2, 0.05);
    unit.add(box);
  }

  // Level 3: Amber Medicine Bottles & Droppers
  const bottleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.24, 10);
  const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 10);
  for (let x = -1.2; x <= 1.2; x += 0.3) {
    const isAmber = (Math.floor(x * 8) % 2) === 0;
    const bMesh = new THREE.Mesh(bottleGeo, isAmber ? bottleGlassMat : whiteBottleMat);
    bMesh.position.set(x, 1.05 + frameThick / 2 + 0.12, 0.05);
    unit.add(bMesh);

    const capMesh = new THREE.Mesh(capGeo, whiteMat);
    capMesh.position.set(x, 1.05 + frameThick / 2 + 0.26, 0.05);
    unit.add(capMesh);
  }

  // Level 4: Syrups, Jars, First-aid supplies
  for (let x = -1.1; x <= 1.1; x += 0.35) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 12), whiteBottleMat);
    jar.position.set(x, 1.55 + frameThick / 2 + 0.14, 0.05);
    unit.add(jar);
  }

  // Shelf header label tag (e.g., "RX STOCK A", "PHARMACEUTICALS", "VACCINES")
  const labels = ['PHARMACEUTICALS A', 'ANTIBIOTICS & VACCINES', 'EMERGENCY MEDS'];
  const labelText = labels[(shelfIndex - 1) % labels.length];
  const labelBoard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.04), new THREE.MeshLambertMaterial({ color: 0x0284C7 }));
  labelBoard.position.set(0, height + 0.12, 0.25);
  unit.add(labelBoard);

  return unit;
}

function createWaterDispenser(): THREE.Group {
  const root = new THREE.Group();
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC });
  const waterBottleMat = new THREE.MeshPhysicalMaterial({
    color: 0x38BDF8,
    transmission: 0.8,
    opacity: 0.7,
    transparent: true,
    roughness: 0.1,
  });

  // Base cabinet
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.05, 0.42), whiteMat);
  base.position.y = 0.525;
  root.add(base);

  // Inverted blue water bottle
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.55, 16), waterBottleMat);
  bottle.position.y = 1.35;
  root.add(bottle);

  // Spigots
  const spigotRed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.08), new THREE.MeshLambertMaterial({ color: 0xEF4444 }));
  spigotRed.position.set(-0.08, 0.95, 0.24);
  root.add(spigotRed);

  const spigotBlue = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.08), new THREE.MeshLambertMaterial({ color: 0x3B82F6 }));
  spigotBlue.position.set(0.08, 0.95, 0.24);
  root.add(spigotBlue);

  return root;
}

function createPottedPlant(): THREE.Group {
  const root = new THREE.Group();
  const potMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });
  const plantMat = new THREE.MeshLambertMaterial({ color: 0x166534 });

  // Modern ceramic pot
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.65, 12), potMat);
  pot.position.y = 0.325;
  root.add(pot);

  // Stems & lush foliage
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.04), plantMat);
    leaf.position.set(Math.cos(angle) * 0.15, 0.8, Math.sin(angle) * 0.15);
    leaf.rotation.z = Math.cos(angle) * 0.35;
    leaf.rotation.x = Math.sin(angle) * 0.35;
    root.add(leaf);
  }

  return root;
}
