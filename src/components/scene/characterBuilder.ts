import * as THREE from 'three';

export interface AnimatedCharacter {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Mesh;
  body: THREE.Mesh;
  selectionRing?: THREE.Mesh;
  walkTime: number;
}

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

  // Torso
  const torsoGroup = new THREE.Group();
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

  // Head
  const headGeo = new THREE.BoxGeometry(0.36, 0.38, 0.36);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.set(0, 0.52, 0);
  headMesh.castShadow = true;
  torsoGroup.add(headMesh);

  // Hair
  const hairGeo = new THREE.BoxGeometry(0.38, 0.16, 0.38);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 0.68, 0);
  torsoGroup.add(hairMesh);

  // Friendly face detail (eyes + smile)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1E293B });
  const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.1, 0.53, 0.185);
  torsoGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.1, 0.53, 0.185);
  torsoGroup.add(rightEye);

  // Left Arm (pivot at shoulder)
  const leftArm = new THREE.Group();
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

  // Legs (pivot at hips y = 0.65)
  const leftLeg = new THREE.Group();
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

  const rightLeg = new THREE.Group();
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

  return {
    group: root,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    head: headMesh,
    body: torsoMesh,
    selectionRing: ringMesh,
    walkTime: 0,
  };
}

export function updateCharacterAnimation(
  char: AnimatedCharacter,
  isWalking: boolean,
  delta: number
) {
  if (isWalking) {
    char.walkTime += delta * 11;
    const legAngle = Math.sin(char.walkTime) * 0.65;
    const armAngle = Math.sin(char.walkTime) * 0.55;

    char.leftLeg.rotation.x = legAngle;
    char.rightLeg.rotation.x = -legAngle;
    char.leftArm.rotation.x = -armAngle;
    char.rightArm.rotation.x = armAngle;

    // Subtle natural vertical bobbing
    char.group.position.y = Math.abs(Math.sin(char.walkTime)) * 0.07;
  } else {
    // Smooth damp to idle
    char.leftLeg.rotation.x *= 0.8;
    char.rightLeg.rotation.x *= 0.8;
    char.leftArm.rotation.x *= 0.8;
    char.rightArm.rotation.x *= 0.8;
    char.group.position.y *= 0.8;

    // Gentle breathing
    const idleTime = performance.now() * 0.002;
    char.head.position.y = 0.52 + Math.sin(idleTime) * 0.015;
  }

  if (char.selectionRing) {
    const pulse = 0.6 + Math.sin(performance.now() * 0.005) * 0.25;
    (char.selectionRing.material as THREE.MeshBasicMaterial).opacity = pulse;
  }
}

/**
 * Creates Doctor Avatar seated behind executive desk in cabin
 */
export function createDoctorAvatar(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'doctor_avatar';

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xF3C5B5 });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Distinguished grey-brown hair
  const coatMat = new THREE.MeshLambertMaterial({ color: 0xFAFAFA }); // Crisp white doctor coat
  const shirtMat = new THREE.MeshLambertMaterial({ color: 0x0284C7 }); // Blue collar underneath
  const stethoscopeMat = new THREE.MeshLambertMaterial({ color: 0x1E293B }); // Stethoscope tubing
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0x334155 });

  // Doctor seated torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.58, 0.32), coatMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  root.add(torso);

  // Shirt V-neck
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.33), shirtMat);
  collar.position.set(0, 1.15, 0);
  root.add(collar);

  // Stethoscope around neck
  const stethLoop = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), stethoscopeMat);
  stethLoop.rotation.x = Math.PI / 3;
  stethLoop.position.set(0, 1.14, 0.1);
  root.add(stethLoop);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.34), skinMat);
  head.position.set(0, 1.45, 0);
  head.castShadow = true;
  root.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.36), hairMat);
  hair.position.set(0, 1.62, 0);
  root.add(hair);

  // Doctor glasses frame
  const glassesMat = new THREE.MeshBasicMaterial({ color: 0x0F172A });
  const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.03), glassesMat);
  glasses.position.set(0, 1.46, 0.18);
  root.add(glasses);

  // Arms resting on desk
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), coatMat);
  leftArm.rotation.x = -Math.PI / 3.5;
  leftArm.position.set(-0.3, 0.98, 0.18);
  root.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), coatMat);
  rightArm.rotation.x = -Math.PI / 3.5;
  rightArm.position.set(0.3, 0.98, 0.18);
  root.add(rightArm);

  // Seated thighs
  const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.45), pantsMat);
  thighs.position.set(0, 0.62, 0.18);
  root.add(thighs);

  return root;
}

/**
 * Creates Receptionist Avatar stationed at reception desk
 */
export function createReceptionistAvatar(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'receptionist_avatar';

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xFAD2C0 });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x1E1B4B }); // Dark neat bun/hair
  const scrubsMat = new THREE.MeshLambertMaterial({ color: 0x0D9488 }); // Medical teal/mint scrubs
  const badgeMat = new THREE.MeshLambertMaterial({ color: 0xE0E7FF }); // Staff ID badge

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.3), scrubsMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  root.add(torso);

  // ID Badge on chest
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.02), badgeMat);
  badge.position.set(-0.12, 1.05, 0.16);
  root.add(badge);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), skinMat);
  head.position.set(0, 1.42, 0);
  head.castShadow = true;
  root.add(head);

  // Hair with bun
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.34), hairMat);
  hair.position.set(0, 1.58, 0);
  root.add(hair);

  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), hairMat);
  bun.position.set(0, 1.62, -0.16);
  root.add(bun);

  // Headset phone for receptionist
  const headsetMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
  const headset = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 12, Math.PI), headsetMat);
  headset.rotation.z = Math.PI;
  headset.position.set(0, 1.48, 0);
  root.add(headset);

  // Seated thighs
  const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.42), scrubsMat);
  thighs.position.set(0, 0.62, 0.16);
  root.add(thighs);

  return root;
}
