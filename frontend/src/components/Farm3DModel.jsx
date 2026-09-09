import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ========================================
// STATUS KONDISI PETAK
// ========================================

function getStatus(item) {
  const soil = Number(item.soil_moisture);
  const temperature = Number(item.temperature);
  const light = Number(item.light);

  if (soil < 25 || temperature > 33 || light < 300) {
    return "critical";
  }

  if (soil < 40 || temperature > 31 || light > 850) {
    return "warning";
  }

  return "normal";
}

function getStatusColor(status) {
  if (status === "critical") return 0xef4444;
  if (status === "warning") return 0xfacc15;

  return 0x22c55e;
}

// ========================================
// LABEL NAMA PETAK
// ========================================

function createLabel(text, status) {
  const canvas = document.createElement("canvas");

  canvas.width = 300;
  canvas.height = 100;

  const context = canvas.getContext("2d");

  const borderColor =
    status === "critical"
      ? "#ef4444"
      : status === "warning"
      ? "#facc15"
      : "#22c55e";

  context.fillStyle = "rgba(6, 78, 59, 0.94)";
  context.fillRect(6, 12, 288, 70);

  context.strokeStyle = borderColor;
  context.lineWidth = 6;
  context.strokeRect(6, 12, 288, 70);

  context.fillStyle = "#ffffff";
  context.font = "bold 34px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 150, 47);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(2.4, 0.82, 1);

  return sprite;
}

// ========================================
// LABEL NILAI SENSOR
// ========================================

function createSensorLabel(text, backgroundColor) {
  const canvas = document.createElement("canvas");

  canvas.width = 320;
  canvas.height = 92;

  const context = canvas.getContext("2d");

  context.fillStyle = backgroundColor;
  context.fillRect(4, 8, 312, 72);

  context.strokeStyle = "#ffffff";
  context.lineWidth = 4;
  context.strokeRect(4, 8, 312, 72);

  context.fillStyle = "#ffffff";
  context.font = "bold 29px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 160, 44);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(2.1, 0.62, 1);

  return sprite;
}

// ========================================
// TANAMAN
// ========================================

function createPlant(status) {
  const plant = new THREE.Group();

  const stemColor =
    status === "normal"
      ? 0x65a30d
      : status === "warning"
      ? 0xca8a04
      : 0xb91c1c;

  const leafColor =
    status === "normal"
      ? 0xa3e635
      : status === "warning"
      ? 0xfacc15
      : 0xef4444;

  const bladeCount =
    status === "normal"
      ? 7
      : status === "warning"
      ? 5
      : 4;

  for (let index = 0; index < bladeCount; index++) {
    const height =
      status === "normal"
        ? 0.55 + Math.random() * 0.25
        : status === "warning"
        ? 0.42 + Math.random() * 0.2
        : 0.3 + Math.random() * 0.15;

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.035, height, 6),
      new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? stemColor : leafColor,
        roughness: 0.72,
      })
    );

    stem.position.y = height / 2;
    stem.rotation.z = (Math.random() - 0.5) * 0.5;

    plant.add(stem);
  }

  plant.userData.phase = Math.random() * Math.PI * 2;

  return plant;
}

// ========================================
// PEMBATAS KAYU SETIAP PETAK
// ========================================

function createPlotBorder() {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.86,
  });

  const createBorder = (width, depth, x, z) => {
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.18, depth),
      material
    );

    border.position.set(x, 0.73, z);
    border.castShadow = true;

    group.add(border);
  };

  createBorder(3.68, 0.12, 0, -1.72);
  createBorder(3.68, 0.12, 0, 1.72);
  createBorder(0.12, 3.55, -1.82, 0);
  createBorder(0.12, 3.55, 1.82, 0);

  return group;
}

// ========================================
// PIPA IRIGASI
// ========================================

function createIrrigationPipe() {
  const pipe = new THREE.Group();

  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.35,
    roughness: 0.45,
  });

  const mainPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 2.8, 10),
    pipeMaterial
  );

  mainPipe.rotation.z = Math.PI / 2;
  mainPipe.position.set(0, 0.85, 1.25);

  const sprinkler = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.12, 0.55, 10),
    pipeMaterial
  );

  sprinkler.position.set(0, 0.58, 1.25);

  const nozzle = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 14, 10),
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.25,
      roughness: 0.32,
    })
  );

  nozzle.position.set(0, 0.94, 1.25);

  pipe.add(mainPipe, sprinkler, nozzle);

  return pipe;
}

// ========================================
// EFEK AIR DARI POMPA
// ========================================

function createPumpEffect() {
  const group = new THREE.Group();

  for (let index = 0; index < 18; index++) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9,
      })
    );

    drop.position.set(
      (Math.random() - 0.5) * 2.6,
      1.15 + Math.random() * 1.65,
      (Math.random() - 0.5) * 2.3
    );

    drop.userData.speed =
      0.022 + Math.random() * 0.035;

    group.add(drop);
  }

  return group;
}

// ========================================
// EFEK TANAH BASAH
// ========================================

function createWetSoilEffect() {
  const group = new THREE.Group();

  for (let index = 0; index < 8; index++) {
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(
        0.2 + Math.random() * 0.18,
        18
      ),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.34,
        roughness: 0.25,
      })
    );

    puddle.rotation.x = -Math.PI / 2;

    puddle.position.set(
      (Math.random() - 0.5) * 2.4,
      0.695,
      (Math.random() - 0.5) * 2.25
    );

    group.add(puddle);
  }

  return group;
}

// ========================================
// EFEK SUHU PANAS
// ========================================

function createHeatEffect(temperature) {
  const group = new THREE.Group();

  const waveCount = temperature > 33 ? 8 : 5;

  for (let index = 0; index < waveCount; index++) {
    const wave = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.032, 8, 24),
      new THREE.MeshBasicMaterial({
        color:
          temperature > 33
            ? 0xef4444
            : 0xf97316,
        transparent: true,
        opacity: 0.54,
      })
    );

    wave.rotation.x = Math.PI / 2;

    wave.position.set(
      (Math.random() - 0.5) * 2,
      0.95 + Math.random() * 1.4,
      (Math.random() - 0.5) * 1.8
    );

    wave.userData.speed =
      0.008 + Math.random() * 0.014;

    wave.userData.startY = wave.position.y;

    group.add(wave);
  }

  return group;
}

// ========================================
// INDIKATOR SUHU
// ========================================

function createTemperatureIndicator(temperature) {
  const group = new THREE.Group();

  const indicatorColor =
    temperature > 33
      ? 0xef4444
      : temperature > 31
      ? 0xf97316
      : 0x22c55e;

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.045,
      0.045,
      1.05,
      10
    ),
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
    })
  );

  stand.position.y = 0.53;

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    new THREE.MeshStandardMaterial({
      color: indicatorColor,
      emissive: indicatorColor,
      emissiveIntensity: 0.7,
    })
  );

  bulb.position.y = 1.16;

  const temperatureLabel = createSensorLabel(
    `${temperature}°C`,
    temperature > 33
      ? "rgba(220, 38, 38, 0.93)"
      : temperature > 31
      ? "rgba(234, 88, 12, 0.93)"
      : "rgba(22, 163, 74, 0.93)"
  );

  temperatureLabel.position.set(0, 1.65, 0);

  group.add(stand, bulb, temperatureLabel);

  return group;
}

// ========================================
// INDIKATOR INTENSITAS CAHAYA
// ========================================

function createLightIndicator(lightValue) {
  const group = new THREE.Group();

  const indicatorColor =
    lightValue < 300
      ? 0x64748b
      : lightValue > 850
      ? 0xf97316
      : 0xfacc15;

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.04,
      0.055,
      0.95,
      10
    ),
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.65,
    })
  );

  stand.position.y = 0.48;

  const sensorHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 16, 12),
    new THREE.MeshStandardMaterial({
      color: indicatorColor,
      emissive: indicatorColor,
      emissiveIntensity: 0.75,
    })
  );

  sensorHead.position.y = 1.03;

  const lightLabel = createSensorLabel(
    `${lightValue} lux`,
    lightValue < 300
      ? "rgba(71, 85, 105, 0.94)"
      : lightValue > 850
      ? "rgba(234, 88, 12, 0.94)"
      : "rgba(202, 138, 4, 0.94)"
  );

  lightLabel.position.set(0, 1.52, 0);

  group.add(stand, sensorHead, lightLabel);

  return group;
}

// ========================================
// KIPAS DAN PARTIKEL ANGIN
// ========================================

function createFanEffect() {
  const group = new THREE.Group();

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.045,
      0.07,
      1.3,
      8
    ),
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
    })
  );

  stand.position.y = 0.65;

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 12),
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.4,
    })
  );

  center.position.y = 1.35;

  const blades = new THREE.Group();

  blades.position.y = 1.35;

  for (let index = 0; index < 4; index++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.14,
        0.72,
        0.04
      ),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.42,
      })
    );

    blade.position.y = 0.36;

    blade.rotation.z =
      (Math.PI / 2) * index;

    blades.add(blade);
  }

  const windParticles = new THREE.Group();

  for (let index = 0; index < 14; index++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.025,
        8,
        6
      ),
      new THREE.MeshBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.84,
      })
    );

    particle.position.set(
      0.3 + Math.random() * 2,
      1.05 + Math.random() * 0.65,
      (Math.random() - 0.5) * 0.75
    );

    particle.userData.startX =
      particle.position.x;

    particle.userData.speed =
      0.022 + Math.random() * 0.028;

    windParticles.add(particle);
  }

  group.add(
    stand,
    center,
    blades,
    windParticles
  );

  group.userData.blades = blades;
  group.userData.windParticles =
    windParticles;

  return group;
}

// ========================================
// LAMPU DAN SOROTAN CAHAYA
// ========================================

function createLampEffect() {
  const group = new THREE.Group();

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.045,
      0.065,
      1.65,
      8
    ),
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
    })
  );

  stand.position.set(0, 0.83, 0);

  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.035,
      0.035,
      0.68,
      8
    ),
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
    })
  );

  arm.position.set(-0.31, 1.64, 0);
  arm.rotation.z = Math.PI / 2;

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 18, 14),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 2.2,
    })
  );

  bulb.position.set(-0.66, 1.63, 0);

  const light = new THREE.PointLight(
    0xfacc15,
    2.4,
    5
  );

  light.position.copy(bulb.position);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.95,
      2.45,
      24,
      1,
      true
    ),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.17,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );

  cone.position.set(-0.66, 0.52, 0);

  group.add(
    stand,
    arm,
    bulb,
    light,
    cone
  );

  for (let index = 0; index < 11; index++) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.026,
        8,
        6
      ),
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.92,
      })
    );

    spark.position.set(
      -0.66 +
        (Math.random() - 0.5) * 1.3,
      0.55 + Math.random() * 1.1,
      (Math.random() - 0.5) * 1.15
    );

    spark.userData.startY =
      spark.position.y;

    spark.userData.speed =
      0.006 + Math.random() * 0.011;

    group.add(spark);
  }

  return group;
}

// ========================================
// POHON
// ========================================

function createTree(scale = 1) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.12,
      0.18,
      0.9,
      10
    ),
    new THREE.MeshStandardMaterial({
      color: 0x7c4a24,
      roughness: 0.8,
    })
  );

  trunk.position.y = 0.45;

  const leafMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.7,
    });

  const leaves = [
    [-0.28, 1.05, 0],
    [0.24, 1.05, 0.04],
    [0, 1.33, 0],
  ];

  group.add(trunk);

  leaves.forEach(([x, y, z]) => {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.43,
        14,
        10
      ),
      leafMaterial
    );

    leaf.position.set(x, y, z);

    group.add(leaf);
  });

  group.scale.setScalar(scale);

  return group;
}

// ========================================
// PAGAR PEMBATAS UTAMA
// ========================================

function createFence(scene) {
  const woodMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.82,
    });

  const postHeight = 0.95;

  const minX = -10;
  const maxX = 10;

  const minZ = -6.9;
  const maxZ = 6.9;

  const createPost = (x, z) => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.07,
        0.095,
        postHeight,
        8
      ),
      woodMaterial
    );

    post.position.set(
      x,
      postHeight / 2,
      z
    );

    post.castShadow = true;

    scene.add(post);
  };

  const createRail = (
    x,
    z,
    length,
    rotationY = 0
  ) => {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(
        length,
        0.11,
        0.11
      ),
      woodMaterial
    );

    rail.position.set(x, 0.46, z);
    rail.rotation.y = rotationY;
    rail.castShadow = true;

    scene.add(rail);

    const upperRail = rail.clone();

    upperRail.position.y = 0.76;

    scene.add(upperRail);
  };

  for (
    let x = minX;
    x <= maxX;
    x += 1.25
  ) {
    const isEntrance =
      x > -1.25 && x < 1.25;

    if (!isEntrance) {
      createPost(x, maxZ);
    }

    createPost(x, minZ);
  }

  for (
    let z = minZ;
    z <= maxZ;
    z += 1.25
  ) {
    createPost(minX, z);
    createPost(maxX, z);
  }

  createRail(0, minZ, 20);

  createRail(-5.6, maxZ, 8.7);
  createRail(5.6, maxZ, 8.7);

  createRail(
    minX,
    0,
    13.8,
    Math.PI / 2
  );

  createRail(
    maxX,
    0,
    13.8,
    Math.PI / 2
  );

  const gateLabel = createSensorLabel(
    "SMART FARM",
    "rgba(22, 101, 52, 0.94)"
  );

  gateLabel.position.set(0, 1.55, maxZ);

  scene.add(gateLabel);
}

// ========================================
// JALAN SETAPAK
// ========================================

function createPath(scene) {
  const material =
    new THREE.MeshStandardMaterial({
      color: 0xd6b98c,
      roughness: 0.95,
    });

  const verticalPath = new THREE.Mesh(
    new THREE.BoxGeometry(
      1,
      0.07,
      14
    ),
    material
  );

  verticalPath.position.set(0, 0.045, 0);

  const horizontalPath = new THREE.Mesh(
    new THREE.BoxGeometry(
      20,
      0.07,
      0.85
    ),
    material
  );

  horizontalPath.position.set(
    0,
    0.05,
    0
  );

  scene.add(verticalPath, horizontalPath);
}

// ========================================
// MATAHARI
// ========================================

function createSun() {
  const group = new THREE.Group();

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.95,
      30,
      24
    ),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
    })
  );

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(
      1.28,
      30,
      24
    ),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.28,
    })
  );

  group.add(sphere, glow);

  group.position.set(-7, 8.8, -9);

  return group;
}

// ========================================
// AWAN
// ========================================

function createCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      roughness: 0.72,
    });

  const parts = [
    [-0.68, 0, 0, 0.62],
    [0, 0.25, 0, 0.88],
    [0.78, 0.02, 0, 0.7],
    [0.2, -0.05, 0.42, 0.65],
  ];

  parts.forEach(
    ([partX, partY, partZ, radius]) => {
      const part = new THREE.Mesh(
        new THREE.SphereGeometry(
          radius,
          18,
          14
        ),
        material
      );

      part.position.set(
        partX,
        partY,
        partZ
      );

      cloud.add(part);
    }
  );

  cloud.position.set(x, y, z);

  cloud.scale.setScalar(scale);

  cloud.userData.speed =
    0.003 + Math.random() * 0.004;

  return cloud;
}

// ========================================
// RUMAH PETANI
// ========================================

function createFarmHouse() {
  const house = new THREE.Group();

  const wallMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.82,
    });

  const woodMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.78,
    });

  const roofMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.74,
    });

  const glassMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.22,
      roughness: 0.35,
    });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(
      2.8,
      1.9,
      2.35
    ),
    wallMaterial
  );

  body.position.y = 0.95;
  body.castShadow = true;

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(
      2.35,
      1.25,
      4
    ),
    roofMaterial
  );

  roof.position.y = 2.46;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.7,
      1.28,
      0.08
    ),
    woodMaterial
  );

  door.position.set(
    0,
    0.65,
    1.21
  );

  const leftWindow = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.55,
      0.55,
      0.09
    ),
    glassMaterial
  );

  leftWindow.position.set(
    -0.88,
    1.22,
    1.22
  );

  const rightWindow = leftWindow.clone();

  rightWindow.position.x = 0.88;

  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.32,
      0.95,
      0.32
    ),
    woodMaterial
  );

  chimney.position.set(
    0.72,
    2.62,
    -0.25
  );

  house.add(
    body,
    roof,
    door,
    leftWindow,
    rightWindow,
    chimney
  );

  return house;
}

// ========================================
// ASAP CEROBONG
// ========================================

function createSmokeEffect() {
  const smokeGroup = new THREE.Group();

  for (let index = 0; index < 8; index++) {
    const smoke = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.12 + Math.random() * 0.09,
        12,
        10
      ),
      new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.55,
      })
    );

    smoke.position.set(
      0.72 +
        (Math.random() - 0.5) * 0.18,
      3.05 + index * 0.24,
      -0.25 +
        (Math.random() - 0.5) * 0.15
    );

    smoke.userData.startY =
      smoke.position.y;

    smoke.userData.speed =
      0.006 + Math.random() * 0.008;

    smokeGroup.add(smoke);
  }

  return smokeGroup;
}

// ========================================
// BURUNG TERBANG
// ========================================

function createBird(
  radius,
  speed,
  height,
  offset
) {
  const bird = new THREE.Group();

  const material =
    new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
    });

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.13,
      10,
      8
    ),
    material
  );

  const leftWing = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.22,
      0.7,
      3
    ),
    material
  );

  leftWing.rotation.z = Math.PI / 2;
  leftWing.position.x = -0.3;

  const rightWing = leftWing.clone();

  rightWing.rotation.z = -Math.PI / 2;
  rightWing.position.x = 0.3;

  bird.add(leftWing, rightWing, body);

  bird.userData.leftWing = leftWing;
  bird.userData.rightWing = rightWing;

  bird.userData.radius = radius;
  bird.userData.speed = speed;
  bird.userData.height = height;
  bird.userData.offset = offset;

  return bird;
}

// ========================================
// SEMAK
// ========================================

function createBush(scale = 1) {
  const bush = new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.8,
    });

  const parts = [
    [-0.2, 0.25, 0],
    [0.2, 0.25, 0],
    [0, 0.42, 0],
  ];

  parts.forEach(([x, y, z]) => {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.32,
        12,
        9
      ),
      material
    );

    leaf.position.set(x, y, z);

    bush.add(leaf);
  });

  bush.scale.setScalar(scale);

  return bush;
}

// ========================================
// BUNGA KECIL
// ========================================

function createFlower(color = 0xf472b6) {
  const flower = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.018,
      0.025,
      0.34,
      6
    ),
    new THREE.MeshStandardMaterial({
      color: 0x16a34a,
    })
  );

  stem.position.y = 0.17;

  const blossom = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.09,
      10,
      8
    ),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.14,
    })
  );

  blossom.position.y = 0.4;

  flower.add(stem, blossom);

  return flower;
}

// ========================================
// RUMPUT DAN BATU KECIL
// ========================================

function createGroundDecoration(scene) {
  const grassMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.88,
    });

  const stoneMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.92,
    });

  for (let index = 0; index < 55; index++) {
    const grass = new THREE.Mesh(
      new THREE.ConeGeometry(
        0.045,
        0.28 + Math.random() * 0.2,
        5
      ),
      grassMaterial
    );

    grass.position.set(
      -10 + Math.random() * 20,
      0.15,
      -6.4 + Math.random() * 12.8
    );

    scene.add(grass);
  }

  for (let index = 0; index < 22; index++) {
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(
        0.1 + Math.random() * 0.1
      ),
      stoneMaterial
    );

    stone.position.set(
      -9.7 + Math.random() * 19.4,
      0.11,
      -6.2 + Math.random() * 12.4
    );

    stone.rotation.set(
      Math.random(),
      Math.random(),
      Math.random()
    );

    scene.add(stone);
  }
}

// ========================================
// KOMPONEN UTAMA
// ========================================

function Farm3DModel({ sensors = [] }) {
  const mountRef = useRef(null);

  const cameraStateRef = useRef(null);

  const [selectedSensor, setSelectedSensor] =
    useState(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return undefined;

    const width = mount.clientWidth || 900;

    const height = 660;

    const scene = new THREE.Scene();

    scene.background =
      new THREE.Color(0xdff4ff);

    scene.fog = new THREE.Fog(
      0xdff4ff,
      24,
      68
    );

    const camera =
      new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        1000
      );

    camera.position.set(
      13,
      11.5,
      18
    );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
      });

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.shadowMap.enabled = true;

    mount.innerHTML = "";

    mount.appendChild(
      renderer.domElement
    );

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.08;

    controls.minDistance = 8;

    controls.maxDistance = 38;

    controls.maxPolarAngle =
      Math.PI / 2.1;

    controls.target.set(0, 0.8, 0);

    if (cameraStateRef.current) {
      camera.position.copy(
        cameraStateRef.current.position
      );

      controls.target.copy(
        cameraStateRef.current.target
      );
    }

    controls.addEventListener(
      "change",
      () => {
        cameraStateRef.current = {
          position:
            camera.position.clone(),

          target:
            controls.target.clone(),
        };
      }
    );

    controls.update();

    // ========================================
    // PENCAHAYAAN
    // ========================================

    scene.add(
      new THREE.AmbientLight(
        0xffffff,
        1.55
      )
    );

    const sunlight =
      new THREE.DirectionalLight(
        0xffffff,
        2.7
      );

    sunlight.position.set(
      12,
      18,
      10
    );

    sunlight.castShadow = true;

    scene.add(sunlight);

    // ========================================
    // TANAH UTAMA
    // ========================================

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(
        34,
        27
      ),
      new THREE.MeshStandardMaterial({
        color: 0x8ccf62,
        roughness: 0.9,
      })
    );

    ground.rotation.x =
      -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);

    createPath(scene);

    createFence(scene);

    createGroundDecoration(scene);

    // ========================================
    // MATAHARI DAN AWAN
    // ========================================

    const sun = createSun();

    scene.add(sun);

    const clouds = [
      createCloud(
        -8,
        8.6,
        -4,
        0.9
      ),

      createCloud(
        3,
        9.2,
        -7,
        1.15
      ),

      createCloud(
        8,
        7.8,
        -2,
        0.76
      ),
    ];

    clouds.forEach((cloud) =>
      scene.add(cloud)
    );

    // ========================================
    // RUMAH DAN ASAP
    // ========================================

    const farmHouse =
      createFarmHouse();

    farmHouse.position.set(
      -12.4,
      0,
      3.1
    );

    farmHouse.rotation.y =
      Math.PI / 5;

    scene.add(farmHouse);

    const smokeGroup =
      createSmokeEffect();

    smokeGroup.position.set(
      -12.4,
      0,
      3.1
    );

    scene.add(smokeGroup);

    // ========================================
    // SEMAK-SEMAK
    // ========================================

    const bushPositions = [
      [-11.1, 0, 2],
      [-11.2, 0, 4.4],
      [-9.1, 0, 6.1],
      [9.2, 0, 5.8],
      [9.4, 0, -5.7],
      [-8.8, 0, -5.8],
    ];

    bushPositions.forEach(
      ([x, y, z], index) => {
        const bush = createBush(
          0.8 +
            (index % 3) * 0.14
        );

        bush.position.set(x, y, z);

        scene.add(bush);
      }
    );

    // ========================================
    // BUNGA DI DEKAT PINTU MASUK
    // ========================================

    const flowerColors = [
      0xf472b6,
      0xfacc15,
      0xa78bfa,
      0xfb7185,
    ];

    for (
      let index = 0;
      index < 20;
      index++
    ) {
      const flower = createFlower(
        flowerColors[
          index %
            flowerColors.length
        ]
      );

      flower.position.set(
        -2.1 + Math.random() * 4.2,
        0,
        5.4 + Math.random() * 1.1
      );

      scene.add(flower);
    }

    // ========================================
    // BURUNG TERBANG
    // ========================================

    const birds = [
      createBird(
        8.5,
        0.34,
        7.2,
        0
      ),

      createBird(
        6.8,
        0.41,
        6.4,
        2.1
      ),

      createBird(
        10.2,
        0.27,
        8.1,
        4.3
      ),

      createBird(
        7.7,
        0.37,
        7.7,
        5.2
      ),
    ];

    birds.forEach((bird) =>
      scene.add(bird)
    );

    // ========================================
    // ARRAY ANIMASI
    // ========================================

    const clickablePlots = [];

    const waterGroups = [];

    const heatGroups = [];

    const lampGroups = [];

    const fanGroups = [];

    const plants = [];

    // ========================================
    // DATA PETAK
    // ========================================

    const data =
      sensors.length > 0
        ? sensors.slice(0, 8)
        : [];

    const columnCount = 4;

    const gapX = 4.35;

    const gapZ = 4.45;

    data.forEach((sensor, index) => {
      const status = getStatus(sensor);

      const column =
        index % columnCount;

      const row = Math.floor(
        index / columnCount
      );

      const x =
        (column - 1.5) * gapX;

      const z =
        (row - 0.5) * gapZ;

      const plot = new THREE.Group();

      plot.position.set(x, 0, z);

      plot.userData.sensor = sensor;

      // ========================================
      // TANAH PETAK
      // ========================================

      const soilColor =
        sensor.pump_status === "ON"
          ? 0x5b371f
          : 0x7c4a24;

      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(
          3.4,
          0.55,
          3.3
        ),
        new THREE.MeshStandardMaterial({
          color: soilColor,
          roughness: 0.84,
        })
      );

      soil.position.y = 0.27;

      soil.castShadow = true;

      soil.receiveShadow = true;

      soil.userData.plot = plot;

      clickablePlots.push(soil);

      plot.add(soil);

      const topColor =
        getStatusColor(status);

      const top = new THREE.Mesh(
        new THREE.BoxGeometry(
          3.42,
          0.12,
          3.32
        ),
        new THREE.MeshStandardMaterial({
          color: topColor,
          emissive: topColor,
          emissiveIntensity: 0.075,
          roughness: 0.68,
        })
      );

      top.position.y = 0.62;

      top.userData.plot = plot;

      clickablePlots.push(top);

      plot.add(top);

      // Pembatas kayu setiap petak
      plot.add(createPlotBorder());

      // ========================================
      // TANAMAN
      // ========================================

      for (
        let plantIndex = 0;
        plantIndex < 12;
        plantIndex++
      ) {
        const plant =
          createPlant(status);

        plant.position.set(
          -1.2 +
            (plantIndex % 4) *
              0.8,

          0.68,

          -1 +
            Math.floor(
              plantIndex / 4
            ) *
              0.85
        );

        plants.push(plant);

        plot.add(plant);
      }

      // ========================================
      // LABEL PETAK
      // ========================================

      const label = createLabel(
        sensor.area,
        status
      );

      label.position.set(
        0,
        2.5,
        0
      );

      plot.add(label);

      // ========================================
      // PIPA
      // ========================================

      plot.add(
        createIrrigationPipe()
      );

      // ========================================
      // INDIKATOR SUHU
      // ========================================

      const temperatureIndicator =
        createTemperatureIndicator(
          Number(
            sensor.temperature
          )
        );

      temperatureIndicator.position.set(
        -1.38,
        0.66,
        -1.18
      );

      plot.add(
        temperatureIndicator
      );

      // ========================================
      // INDIKATOR CAHAYA
      // ========================================

      const lightIndicator =
        createLightIndicator(
          Number(sensor.light)
        );

      lightIndicator.position.set(
        1.35,
        0.66,
        -1.18
      );

      plot.add(lightIndicator);

      // ========================================
      // AIR DAN TANAH BASAH
      // ========================================

      if (
        sensor.pump_status === "ON"
      ) {
        const water =
          createPumpEffect();

        water.position.y = 0.6;

        plot.add(water);

        waterGroups.push(water);

        plot.add(
          createWetSoilEffect()
        );
      }

      // ========================================
      // PANAS
      // ========================================

      if (
        Number(
          sensor.temperature
        ) > 31
      ) {
        const heat =
          createHeatEffect(
            Number(
              sensor.temperature
            )
          );

        plot.add(heat);

        heatGroups.push(heat);
      }

      // ========================================
      // KIPAS
      // ========================================

      if (
        sensor.fan_status === "ON"
      ) {
        const fan =
          createFanEffect();

        fan.position.set(
          -1.16,
          0.65,
          0.92
        );

        plot.add(fan);

        fanGroups.push(fan);
      }

      // ========================================
      // LAMPU
      // ========================================

      if (
        sensor.lamp_status === "ON"
      ) {
        const lamp =
          createLampEffect();

        lamp.position.set(
          1.17,
          0.65,
          0.85
        );

        plot.add(lamp);

        lampGroups.push(lamp);
      }

      scene.add(plot);
    });

    // ========================================
    // POHON BERUKURAN BERVARIASI
    // ========================================

    const treePositions = [
      [-9, 0, -5.5, 1],
      [-8.4, 0, 5.5, 1.2],
      [8.6, 0, -5.5, 1.1],
      [8.9, 0, 5, 1.35],
      [7.4, 0, 6.1, 0.85],
      [-6.7, 0, 6.05, 0.95],
      [-12.8, 0, -1.8, 1.25],
      [12.2, 0, 0.8, 1.05],
    ];

    treePositions.forEach(
      ([x, y, z, scale]) => {
        const tree =
          createTree(scale);

        tree.position.set(x, y, z);

        scene.add(tree);
      }
    );

    // ========================================
    // KLIK PETAK
    // ========================================

    const raycaster =
      new THREE.Raycaster();

    const pointer =
      new THREE.Vector2();

    const handleClick = (event) => {
      const bounds =
        renderer.domElement.getBoundingClientRect();

      pointer.x =
        ((event.clientX -
          bounds.left) /
          bounds.width) *
          2 -
        1;

      pointer.y =
        -(
          (event.clientY -
            bounds.top) /
          bounds.height
        ) *
          2 +
        1;

      raycaster.setFromCamera(
        pointer,
        camera
      );

      const intersections =
        raycaster.intersectObjects(
          clickablePlots,
          false
        );

      if (
        intersections.length > 0
      ) {
        const plot =
          intersections[0].object
            .userData.plot;

        setSelectedSensor(
          plot.userData.sensor
        );
      }
    };

    renderer.domElement.addEventListener(
      "click",
      handleClick
    );

    // ========================================
    // ANIMASI
    // ========================================

    const clock = new THREE.Clock();

    let animationFrame;

    const animate = () => {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      const elapsed =
        clock.getElapsedTime();

      controls.update();

      // Matahari berdenyut lembut
      sun.children[1].scale.setScalar(
        1 +
          Math.sin(
            elapsed * 1.25
          ) *
            0.055
      );

      // Awan berjalan
      clouds.forEach((cloud) => {
        cloud.position.x +=
          cloud.userData.speed;

        if (
          cloud.position.x > 13
        ) {
          cloud.position.x = -13;
        }
      });

      // Burung terbang dan mengepak
      birds.forEach((bird) => {
        const angle =
          elapsed *
            bird.userData.speed +
          bird.userData.offset;

        bird.position.set(
          Math.cos(angle) *
            bird.userData.radius,

          bird.userData.height +
            Math.sin(
              elapsed * 1.8
            ) *
              0.18,

          Math.sin(angle) *
            bird.userData.radius
        );

        bird.rotation.y = -angle;

        bird.userData.leftWing.rotation.x =
          Math.sin(
            elapsed * 7
          ) * 0.42;

        bird.userData.rightWing.rotation.x =
          -Math.sin(
            elapsed * 7
          ) * 0.42;
      });

      // Asap rumah bergerak ke atas
      smokeGroup.children.forEach(
        (smoke) => {
          smoke.position.y +=
            smoke.userData.speed;

          smoke.position.x +=
            0.002;

          if (
            smoke.position.y >
            smoke.userData.startY +
              1.8
          ) {
            smoke.position.y =
              smoke.userData.startY;

            smoke.position.x =
              0.72 +
              (Math.random() -
                0.5) *
                0.18;
          }
        }
      );

      // Air pompa bergerak turun
      waterGroups.forEach(
        (group) => {
          group.children.forEach(
            (drop) => {
              drop.position.y -=
                drop.userData.speed;

              if (
                drop.position.y <
                0.55
              ) {
                drop.position.y =
                  1.4 +
                  Math.random() *
                    1.8;
              }
            }
          );
        }
      );

      // Gelombang panas bergerak naik
      heatGroups.forEach(
        (group) => {
          group.children.forEach(
            (wave) => {
              wave.position.y +=
                wave.userData.speed;

              wave.scale.x =
                1 +
                Math.sin(
                  elapsed * 2
                ) *
                  0.18;

              wave.scale.z =
                1 +
                Math.cos(
                  elapsed * 2
                ) *
                  0.18;

              if (
                wave.position.y >
                3.2
              ) {
                wave.position.y =
                  wave.userData.startY;
              }
            }
          );
        }
      );

      // Cahaya lampu bergerak
      lampGroups.forEach(
        (group) => {
          group.children.forEach(
            (item) => {
              if (
                !item.userData.speed
              ) {
                return;
              }

              item.position.y +=
                item.userData.speed;

              if (
                item.position.y >
                item.userData.startY +
                  1.25
              ) {
                item.position.y =
                  item.userData.startY;
              }
            }
          );
        }
      );

      // Baling-baling kipas dan angin
      fanGroups.forEach(
        (group) => {
          group.userData.blades.rotation.z -=
            0.14;

          group.userData.windParticles.children.forEach(
            (particle) => {
              particle.position.x +=
                particle.userData.speed;

              if (
                particle.position.x >
                2.6
              ) {
                particle.position.x =
                  particle.userData.startX;
              }
            }
          );
        }
      );

      // Tanaman bergoyang
      plants.forEach((plant) => {
        plant.rotation.z =
          Math.sin(
            elapsed * 1.5 +
              plant.userData.phase
          ) * 0.045;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ========================================
    // RESPONSIVE CANVAS
    // ========================================

    const handleResize = () => {
      const resizedWidth =
        mount.clientWidth || 900;

      camera.aspect =
        resizedWidth / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        resizedWidth,
        height
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      renderer.domElement.removeEventListener(
        "click",
        handleClick
      );

      controls.dispose();

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (
            Array.isArray(
              object.material
            )
          ) {
            object.material.forEach(
              (material) =>
                material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      mount.innerHTML = "";
    };
  }, [sensors]);

  return (
    <div className="farm3d-wrapper">
      <div className="farm3d-legend">
        <div className="farm3d-toolbar">
          <span>
            Drag untuk memutar • Scroll untuk zoom • Klik petak untuk melihat detail
          </span>
        </div>

        <div className="visual-legend">
          <span>💧 Pompa ON</span>
          <span>🌡️ Suhu tinggi</span>
          <span>💨 Kipas ON</span>
          <span>💡 Lampu ON</span>
        </div>
      </div>

      <div
        className="farm3d-canvas"
        ref={mountRef}
      />

      {selectedSensor && (
        <div className="farm3d-detail">
          <button
            onClick={() =>
              setSelectedSensor(null)
            }
          >
            ×
          </button>

          <h4>{selectedSensor.area}</h4>

          <div>
            <span>Suhu</span>

            <strong>
              {selectedSensor.temperature}°C
            </strong>
          </div>

          <div>
            <span>Kelembaban Tanah</span>

            <strong>
              {selectedSensor.soil_moisture}%
            </strong>
          </div>

          <div>
            <span>Kelembaban Udara</span>

            <strong>
              {selectedSensor.humidity}%
            </strong>
          </div>

          <div>
            <span>Intensitas Cahaya</span>

            <strong>
              {selectedSensor.light} lux
            </strong>
          </div>

          <div>
            <span>Pompa</span>

            <strong>
              {selectedSensor.pump_status ||
                "OFF"}
            </strong>
          </div>

          <div>
            <span>Kipas</span>

            <strong>
              {selectedSensor.fan_status ||
                "OFF"}
            </strong>
          </div>

          <div>
            <span>Lampu</span>

            <strong>
              {selectedSensor.lamp_status ||
                "OFF"}
            </strong>
          </div>

          <div>
            <span>Mode</span>

            <strong>
              {selectedSensor.control_mode ||
                "MANUAL"}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default Farm3DModel;