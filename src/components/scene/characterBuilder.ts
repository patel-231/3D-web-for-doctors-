import * as THREE from 'three';

export interface AnimatedCharacter {
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  idleAction: THREE.AnimationAction;
  walkAction: THREE.AnimationAction;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Mesh;
  body: THREE.Mesh;
  selectionRing?: THREE.Mesh;
  isCurrentlyWalking: boolean;
}

export interface ClinicStaffCharacter {
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  idleAction: THREE.AnimationAction;
}

// Utility to create QuaternionKeyframeTrack from Euler angles
function createQuatTrack(
  trackName: string,
  times: number[],
  eulers: Array<[number, number, number]>
): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  const tempEuler = new THREE.Euler();
  const tempQuat = new THREE.Quaternion();

  for (const [x, y, z] of eulers) {
    tempEuler.set(x, y, z);
    tempQuat.setFromEuler(tempEuler);
    values.push(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w);
  }

  return new THREE.QuaternionKeyframeTrack(trackName, times, values);
}

// Utility to create VectorKeyframeTrack from 3D vectors
function createVec3Track(
  trackName: string,
  times: number[],
  vectors: Array<[number, number, number]>
): THREE.VectorKeyframeTrack {
  const values: number[] = [];
  for (const [x, y, z] of vectors) {
    values.push(x, y, z);
  }
  return new THREE.VectorKeyframeTrack(trackName, times, values);
}

/**
 * Creates Visitor Character with Three.js AnimationMixer (Idle breathing, looking around & Walk cycle)
 */
export function createVisitorAvatar(): AnimatedCharacter {
  const root = new THREE.Group();
  root.name = 'visitor_avatar';

  // Materials
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xF5D0C5 });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x3D2314 });
  const shirtMat = new THREE.MeshLambertMaterial({ color: 0x0284C7 }); // Nice medical blue jacket
  const innerShirtMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Slate dark pants
  const shoesMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 }); // Clean white sneakers

  // Torso Group (Breathing & vertical bobbing target)
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'visitor_torso';
  torsoGroup.position.y = 0.95;

  const torsoGeo = new THREE.BoxGeometry(0.5, 0.6, 0.32);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoGroup.add(torsoMesh);

  // Inner shirt collar accent
  const collarGeo = new THREE.BoxGeometry(0.2, 0.15, 0.33);
  const collarMesh = new THREE.Mesh(collarGeo, innerShirtMat);
  collarMesh.position.set(0, 0.22, 0);
  torsoGroup.add(collarMesh);

  // Head (Looking around target)
  const headGroup = new THREE.Group();
  headGroup.name = 'visitor_head';
  headGroup.position.set(0, 0.52, 0);

  const headGeo = new THREE.BoxGeometry(0.36, 0.38, 0.36);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Hair
  const hairGeo = new THREE.BoxGeometry(0.38, 0.16, 0.38);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 0.16, 0);
  headGroup.add(hairMesh);

  // Friendly face detail (eyes)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1E293B });
  const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.1, 0.01, 0.185);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.1, 0.01, 0.185);
  headGroup.add(rightEye);

  torsoGroup.add(headGroup);

  // Left Arm (pivot at shoulder)
  const leftArm = new THREE.Group();
  leftArm.name = 'visitor_left_arm';
  leftArm.position.set(-0.33, 0.22, 0);
  const armGeo = new THREE.BoxGeometry(0.14, 0.52, 0.16);
  const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
  leftArmMesh.position.set(0, -0.22, 0);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  
  // Left Hand
  const handGeo = new THREE.BoxGeometry(0.12, 0.12, 0.14);
  const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
  leftHandMesh.position.set(0, -0.52, 0);
  leftArm.add(leftHandMesh);
  torsoGroup.add(leftArm);

  // Right Arm (pivot at shoulder)
  const rightArm = new THREE.Group();
  rightArm.name = 'visitor_right_arm';
  rightArm.position.set(0.33, 0.22, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
  rightArmMesh.position.set(0, -0.22, 0);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  // Right Hand
  const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
  rightHandMesh.position.set(0, -0.52, 0);
  rightArm.add(rightHandMesh);
  torsoGroup.add(rightArm);

  root.add(torsoGroup);

  // Left Leg (pivot at hips y = 0.65)
  const leftLeg = new THREE.Group();
  leftLeg.name = 'visitor_left_leg';
  leftLeg.position.set(-0.16, 0.65, 0);
  const legGeo = new THREE.BoxGeometry(0.18, 0.55, 0.2);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.set(0, -0.24, 0);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  // Left Shoe
  const shoeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.26);
  const leftShoeMesh = new THREE.Mesh(shoeGeo, shoesMat);
  leftShoeMesh.position.set(0, -0.56, 0.03);
  leftShoeMesh.castShadow = true;
  leftLeg.add(leftShoeMesh);
  root.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.name = 'visitor_right_leg';
  rightLeg.position.set(0.16, 0.65, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.set(0, -0.24, 0);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  // Right Shoe
  const rightShoeMesh = new THREE.Mesh(shoeGeo, shoesMat);
  rightShoeMesh.position.set(0, -0.56, 0.03);
  rightShoeMesh.castShadow = true;
  rightLeg.add(rightShoeMesh);
  root.add(rightLeg);

  // Pulsing Selection Ring on floor
  const ringGeo = new THREE.RingGeometry(0.45, 0.58, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x0284C7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = 0.02;
  root.add(ringMesh);

  // Floating label indicator
  const beaconGeo = new THREE.ConeGeometry(0.14, 0.28, 4);
  beaconGeo.rotateX(Math.PI);
  const beaconMat = new THREE.MeshLambertMaterial({ color: 0x38BDF8 });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  beaconMesh.position.set(0, 2.0, 0);
  root.add(beaconMesh);

  // -------------------------------------------------------------
  // THREE.JS ANIMATION MIXER & KEYFRAME TRACKS
  // -------------------------------------------------------------
  const mixer = new THREE.AnimationMixer(root);

  // 1. VISITOR IDLE CLIP (Breathing, Looking around upon arriving)
  const idleTimes = [0, 1.2, 2.4, 3.6, 4.8, 6.0];
  
  // Head looking around: forward -> left glance -> subtle nod -> center -> right glance -> forward
  const headIdleRotations: Array<[number, number, number]> = [
    [0, 0, 0],
    [0.02, 0.28, 0],    // Glance left
    [0.08, 0.22, 0],    // Subtle thoughtful nod
    [0, 0, 0],          // Back to center
    [-0.04, -0.32, 0],  // Glance right at clinic signs
    [0, 0, 0],          // Back to front
  ];
  const headIdleTrack = createQuatTrack('visitor_head.quaternion', idleTimes, headIdleRotations);

  // Torso Breathing expansion & subtle vertical rise
  const torsoIdlePositions: Array<[number, number, number]> = [
    [0, 0.95, 0],
    [0, 0.965, 0], // Inhale
    [0, 0.95, 0],  // Exhale
    [0, 0.965, 0], // Inhale
    [0, 0.952, 0],
    [0, 0.95, 0],
  ];
  const torsoIdlePosTrack = createVec3Track('visitor_torso.position', idleTimes, torsoIdlePositions);

  const torsoIdleScales: Array<[number, number, number]> = [
    [1.0, 1.0, 1.0],
    [1.025, 1.03, 1.02], // Chest expansion
    [1.0, 1.0, 1.0],
    [1.025, 1.03, 1.02],
    [1.01, 1.015, 1.01],
    [1.0, 1.0, 1.0],
  ];
  const torsoIdleScaleTrack = createVec3Track('visitor_torso.scale', idleTimes, torsoIdleScales);

  // Arm subtle resting micro-sway
  const armLeftIdleRot: Array<[number, number, number]> = [
    [0, 0, 0],
    [0.04, 0, 0.03],
    [0, 0, 0],
    [0.04, 0, 0.03],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const armLeftIdleTrack = createQuatTrack('visitor_left_arm.quaternion', idleTimes, armLeftIdleRot);

  const armRightIdleRot: Array<[number, number, number]> = [
    [0, 0, 0],
    [-0.04, 0, -0.03],
    [0, 0, 0],
    [-0.04, 0, -0.03],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const armRightIdleTrack = createQuatTrack('visitor_right_arm.quaternion', idleTimes, armRightIdleRot);

  // Legs neutral standing
  const legNeutralRot: Array<[number, number, number]> = [
    [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]
  ];
  const legLeftNeutralTrack = createQuatTrack('visitor_left_leg.quaternion', idleTimes, legNeutralRot);
  const legRightNeutralTrack = createQuatTrack('visitor_right_leg.quaternion', idleTimes, legNeutralRot);

  const idleClip = new THREE.AnimationClip('visitor_idle', 6.0, [
    headIdleTrack,
    torsoIdlePosTrack,
    torsoIdleScaleTrack,
    armLeftIdleTrack,
    armRightIdleTrack,
    legLeftNeutralTrack,
    legRightNeutralTrack,
  ]);

  // 2. VISITOR WALK CLIP (Smooth limb oscillations)
  const walkTimes = [0, 0.2, 0.4, 0.6, 0.8];
  const leftLegWalk: Array<[number, number, number]> = [
    [0, 0, 0],
    [0.55, 0, 0],   // Step forward
    [0, 0, 0],
    [-0.55, 0, 0],  // Swing backward
    [0, 0, 0],
  ];
  const rightLegWalk: Array<[number, number, number]> = [
    [0, 0, 0],
    [-0.55, 0, 0],  // Swing backward
    [0, 0, 0],
    [0.55, 0, 0],   // Step forward
    [0, 0, 0],
  ];
  const leftArmWalk: Array<[number, number, number]> = [
    [0, 0, 0],
    [-0.45, 0, 0],
    [0, 0, 0],
    [0.45, 0, 0],
    [0, 0, 0],
  ];
  const rightArmWalk: Array<[number, number, number]> = [
    [0, 0, 0],
    [0.45, 0, 0],
    [0, 0, 0],
    [-0.45, 0, 0],
    [0, 0, 0],
  ];
  const torsoWalkPos: Array<[number, number, number]> = [
    [0, 0.95, 0],
    [0, 0.985, 0], // Bob up
    [0, 0.95, 0],
    [0, 0.985, 0], // Bob up
    [0, 0.95, 0],
  ];

  const walkClip = new THREE.AnimationClip('visitor_walk', 0.8, [
    createQuatTrack('visitor_left_leg.quaternion', walkTimes, leftLegWalk),
    createQuatTrack('visitor_right_leg.quaternion', walkTimes, rightLegWalk),
    createQuatTrack('visitor_left_arm.quaternion', walkTimes, leftArmWalk),
    createQuatTrack('visitor_right_arm.quaternion', walkTimes, rightArmWalk),
    createVec3Track('visitor_torso.position', walkTimes, torsoWalkPos),
    createQuatTrack('visitor_head.quaternion', walkTimes, [[0, 0, 0], [0.03, 0, 0], [0, 0, 0], [0.03, 0, 0], [0, 0, 0]]),
  ]);

  const idleAction = mixer.clipAction(idleClip);
  idleAction.setLoop(THREE.LoopRepeat, Infinity);
  idleAction.play();

  const walkAction = mixer.clipAction(walkClip);
  walkAction.setLoop(THREE.LoopRepeat, Infinity);

  return {
    group: root,
    mixer,
    idleAction,
    walkAction,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    head: headMesh,
    body: torsoMesh,
    selectionRing: ringMesh,
    isCurrentlyWalking: false,
  };
}

/**
 * Creates Doctor Avatar seated behind executive desk with Three.js AnimationMixer idle cycle
 */
export function createDoctorAvatar(): ClinicStaffCharacter {
  const root = new THREE.Group();
  root.name = 'doctor_avatar';

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xF3C5B5 });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Distinguished grey-brown hair
  const coatMat = new THREE.MeshLambertMaterial({ color: 0xFAFAFA }); // Crisp white doctor coat
  const shirtMat = new THREE.MeshLambertMaterial({ color: 0x0284C7 }); // Blue collar underneath
  const stethoscopeMat = new THREE.MeshLambertMaterial({ color: 0x1E293B }); // Stethoscope tubing
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0x334155 });

  // Doctor Torso Group
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'doctor_torso';
  torsoGroup.position.y = 0.95;

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.58, 0.32), coatMat);
  torso.castShadow = true;
  torsoGroup.add(torso);

  // Shirt V-neck
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.33), shirtMat);
  collar.position.set(0, 0.2, 0);
  torsoGroup.add(collar);

  // Stethoscope around neck
  const stethLoop = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), stethoscopeMat);
  stethLoop.rotation.x = Math.PI / 3;
  stethLoop.position.set(0, 0.19, 0.1);
  torsoGroup.add(stethLoop);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.name = 'doctor_head';
  headGroup.position.set(0, 0.5, 0);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.34), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.36), hairMat);
  hair.position.set(0, 0.17, 0);
  headGroup.add(hair);

  // Doctor glasses frame
  const glassesMat = new THREE.MeshBasicMaterial({ color: 0x0F172A });
  const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.03), glassesMat);
  glasses.position.set(0, 0.01, 0.18);
  headGroup.add(glasses);

  torsoGroup.add(headGroup);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.name = 'doctor_left_arm';
  leftArm.position.set(-0.3, 0.12, 0.18);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), coatMat);
  leftArmMesh.rotation.x = -Math.PI / 3.5;
  leftArm.add(leftArmMesh);
  torsoGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.name = 'doctor_right_arm';
  rightArm.position.set(0.3, 0.12, 0.18);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), coatMat);
  rightArmMesh.rotation.x = -Math.PI / 3.5;
  rightArm.add(rightArmMesh);
  torsoGroup.add(rightArm);

  root.add(torsoGroup);

  // Seated thighs
  const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.45), pantsMat);
  thighs.position.set(0, 0.62, 0.18);
  root.add(thighs);

  // -------------------------------------------------------------
  // ANIMATION MIXER FOR DOCTOR (Reading chart, looking up at patient)
  // -------------------------------------------------------------
  const mixer = new THREE.AnimationMixer(root);
  const docTimes = [0, 1.5, 3.2, 4.8, 6.0, 7.5];

  // Head idle cycle: reading prescription -> examining ECG screen -> looking up warmly at patient
  const docHeadRotations: Array<[number, number, number]> = [
    [0, 0, 0],
    [0.32, -0.18, 0],   // Look down at desk chart/ECG
    [0.38, -0.15, 0],   // Read notes with small nod
    [-0.08, 0.12, 0],   // Look up at patient visitor chair
    [0.12, 0, 0],       // Professional welcoming nod
    [0, 0, 0],          // Neutral forward gaze
  ];

  const docTorsoPositions: Array<[number, number, number]> = [
    [0, 0.95, 0],
    [0, 0.962, 0], // Inhale
    [0, 0.95, 0],
    [0, 0.964, 0],
    [0, 0.952, 0],
    [0, 0.95, 0],
  ];

  const docTorsoScales: Array<[number, number, number]> = [
    [1.0, 1.0, 1.0],
    [1.02, 1.025, 1.02],
    [1.0, 1.0, 1.0],
    [1.02, 1.025, 1.02],
    [1.01, 1.01, 1.01],
    [1.0, 1.0, 1.0],
  ];

  const docArmLeftRot: Array<[number, number, number]> = [
    [0, 0, 0],
    [0.08, 0, 0.05],  // Subtle typing
    [-0.04, 0, 0],
    [0.05, 0, 0.03],
    [0, 0, 0],
    [0, 0, 0],
  ];

  const docArmRightRot: Array<[number, number, number]> = [
    [0, 0, 0],
    [-0.06, 0, -0.04], // Writing with pen
    [0.06, 0, 0],
    [-0.04, 0, -0.03],
    [0, 0, 0],
    [0, 0, 0],
  ];

  const docIdleClip = new THREE.AnimationClip('doctor_idle', 7.5, [
    createQuatTrack('doctor_head.quaternion', docTimes, docHeadRotations),
    createVec3Track('doctor_torso.position', docTimes, docTorsoPositions),
    createVec3Track('doctor_torso.scale', docTimes, docTorsoScales),
    createQuatTrack('doctor_left_arm.quaternion', docTimes, docArmLeftRot),
    createQuatTrack('doctor_right_arm.quaternion', docTimes, docArmRightRot),
  ]);

  const idleAction = mixer.clipAction(docIdleClip);
  idleAction.setLoop(THREE.LoopRepeat, Infinity);
  idleAction.play();

  return {
    group: root,
    mixer,
    idleAction,
  };
}

/**
 * Creates Receptionist Avatar stationed at reception desk with Three.js AnimationMixer idle cycle
 */
export function createReceptionistAvatar(): ClinicStaffCharacter {
  const root = new THREE.Group();
  root.name = 'receptionist_avatar';

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xFAD2C0 });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x1E1B4B }); // Dark neat bun/hair
  const scrubsMat = new THREE.MeshLambertMaterial({ color: 0x0D9488 }); // Medical teal/mint scrubs
  const badgeMat = new THREE.MeshLambertMaterial({ color: 0xE0E7FF }); // Staff ID badge

  // Torso Group
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'receptionist_torso';
  torsoGroup.position.y = 0.95;

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.3), scrubsMat);
  torso.castShadow = true;
  torsoGroup.add(torso);

  // ID Badge on chest
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.02), badgeMat);
  badge.position.set(-0.12, 0.1, 0.16);
  torsoGroup.add(badge);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.name = 'receptionist_head';
  headGroup.position.set(0, 0.47, 0);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Hair with bun
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.34), hairMat);
  hair.position.set(0, 0.16, 0);
  headGroup.add(hair);

  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), hairMat);
  bun.position.set(0, 0.2, -0.16);
  headGroup.add(bun);

  // Headset phone for receptionist
  const headsetMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
  const headset = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 12, Math.PI), headsetMat);
  headset.rotation.z = Math.PI;
  headset.position.set(0, 0.06, 0);
  headGroup.add(headset);

  torsoGroup.add(headGroup);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.name = 'receptionist_left_arm';
  leftArm.position.set(-0.28, 0.12, 0.14);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), scrubsMat);
  leftArmMesh.rotation.x = -Math.PI / 3.8;
  leftArm.add(leftArmMesh);
  torsoGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.name = 'receptionist_right_arm';
  rightArm.position.set(0.28, 0.12, 0.14);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), scrubsMat);
  rightArmMesh.rotation.x = -Math.PI / 3.8;
  rightArm.add(rightArmMesh);
  torsoGroup.add(rightArm);

  root.add(torsoGroup);

  // Seated thighs
  const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.42), scrubsMat);
  thighs.position.set(0, 0.62, 0.16);
  root.add(thighs);

  // -------------------------------------------------------------
  // ANIMATION MIXER FOR RECEPTIONIST (Looking up to greet visitor, typing)
  // -------------------------------------------------------------
  const mixer = new THREE.AnimationMixer(root);
  const recTimes = [0, 1.8, 3.4, 4.8, 6.5];

  // Head idle cycle: checking terminal monitor -> looking up towards entrance -> welcoming nod -> back to terminal
  const recHeadRotations: Array<[number, number, number]> = [
    [0.24, -0.12, 0],  // Monitor screen focus
    [-0.08, 0.36, 0],  // Look up towards entrance door
    [0.08, 0.32, 0],   // Warm welcoming nod
    [0.26, -0.1, 0],   // Look back down at keyboard
    [0.24, -0.12, 0],  // Reset to monitor
  ];

  const recTorsoPositions: Array<[number, number, number]> = [
    [0, 0.95, 0],
    [0, 0.963, 0],
    [0, 0.95, 0],
    [0, 0.962, 0],
    [0, 0.95, 0],
  ];

  const recTorsoScales: Array<[number, number, number]> = [
    [1.0, 1.0, 1.0],
    [1.02, 1.025, 1.02],
    [1.0, 1.0, 1.0],
    [1.02, 1.025, 1.02],
    [1.0, 1.0, 1.0],
  ];

  const recArmLeftRot: Array<[number, number, number]> = [
    [0, 0, 0],
    [0.07, 0, 0.04], // Keyboard typing strokes
    [-0.05, 0, 0],
    [0.06, 0, 0.03],
    [0, 0, 0],
  ];

  const recArmRightRot: Array<[number, number, number]> = [
    [0, 0, 0],
    [-0.06, 0, -0.04],
    [0.05, 0, 0],
    [-0.06, 0, -0.03],
    [0, 0, 0],
  ];

  const recIdleClip = new THREE.AnimationClip('receptionist_idle', 6.5, [
    createQuatTrack('receptionist_head.quaternion', recTimes, recHeadRotations),
    createVec3Track('receptionist_torso.position', recTimes, recTorsoPositions),
    createVec3Track('receptionist_torso.scale', recTimes, recTorsoScales),
    createQuatTrack('receptionist_left_arm.quaternion', recTimes, recArmLeftRot),
    createQuatTrack('receptionist_right_arm.quaternion', recTimes, recArmRightRot),
  ]);

  const idleAction = mixer.clipAction(recIdleClip);
  idleAction.setLoop(THREE.LoopRepeat, Infinity);
  idleAction.play();

  return {
    group: root,
    mixer,
    idleAction,
  };
}

/**
 * Updates Three.js AnimationMixer state for characters
 */
export function updateCharacterMixers(
  visitor: AnimatedCharacter | null,
  doctor: ClinicStaffCharacter | null,
  receptionist: ClinicStaffCharacter | null,
  isWalking: boolean,
  delta: number
) {
  // Visitor crossfade & mixer update
  if (visitor) {
    if (isWalking && !visitor.isCurrentlyWalking) {
      visitor.isCurrentlyWalking = true;
      visitor.idleAction.crossFadeTo(visitor.walkAction, 0.25, false);
      visitor.walkAction.reset().play();
    } else if (!isWalking && visitor.isCurrentlyWalking) {
      visitor.isCurrentlyWalking = false;
      visitor.walkAction.crossFadeTo(visitor.idleAction, 0.3, false);
      visitor.idleAction.reset().play();
    }

    visitor.mixer.update(delta);

    if (visitor.selectionRing) {
      const pulse = 0.6 + Math.sin(performance.now() * 0.005) * 0.25;
      (visitor.selectionRing.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  }

  // Doctor idle mixer update
  if (doctor) {
    doctor.mixer.update(delta);
  }

  // Receptionist idle mixer update
  if (receptionist) {
    receptionist.mixer.update(delta);
  }
}
