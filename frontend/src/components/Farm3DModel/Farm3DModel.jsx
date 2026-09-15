import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./Farm3DModel.css";

/* =========================================================
   SMART FARMING RULE
   ========================================================= */

const SOIL_DRY_THRESHOLD = 25;
const SOIL_WARNING_THRESHOLD = 40;

/* =========================================================
   LAYOUT 11 PETAK

                    PETAK 1

      PETAK 2  3  4  5  6

      PETAK 7  8  9  10 11

                JALAN MASUK

                   GATE

   ========================================================= */

const PLOT_POSITIONS = [
  /* PETAK 1 */
  [0, 4.15],

  /* PETAK 2 - 6 */
  [-8.8, 0.2],
  [-4.4, 0.2],
  [0, 0.2],
  [4.4, 0.2],
  [8.8, 0.2],

  /* PETAK 7 - 11 */
  [-8.8, -4.35],
  [-4.4, -4.35],
  [0, -4.35],
  [4.4, -4.35],
  [8.8, -4.35],
];

/* =========================================================
   STATUS HELPERS
   ========================================================= */

function getStatus(item) {
  const soil = Number(
    item?.soil_moisture ?? 0
  );

  if (soil < SOIL_DRY_THRESHOLD) {
    return "critical";
  }

  if (soil < SOIL_WARNING_THRESHOLD) {
    return "warning";
  }

  return "normal";
}

function getStatusLabel(status) {
  if (status === "critical") {
    return "Kritis";
  }

  if (status === "warning") {
    return "Waspada";
  }

  return "Normal";
}

function getStatusColor(status) {
  if (status === "critical") {
    return 0xef4444;
  }

  if (status === "warning") {
    return 0xf59e0b;
  }

  return 0x22c55e;
}

function getStatusHex(status) {
  if (status === "critical") {
    return "#ef4444";
  }

  if (status === "warning") {
    return "#f59e0b";
  }

  return "#22c55e";
}

function getSoilCondition(item) {
  const soil = Number(
    item?.soil_moisture ?? 0
  );

  if (soil < SOIL_DRY_THRESHOLD) {
    return "Kering";
  }

  if (soil < SOIL_WARNING_THRESHOLD) {
    return "Mulai Kering";
  }

  return "Cukup Lembap";
}

function getWeatherStatus(environment) {
  if (environment?.rain_detected === true) {
    return "HUJAN";
  }

  return String(
    environment?.weather_status || ""
  ).toUpperCase() === "HUJAN"
    ? "HUJAN"
    : "CERAH";
}

function isRaining(environment) {
  return getWeatherStatus(environment) === "HUJAN";
}

function getAutomaticPumpStatus(
  item,
  environment
) {
  if (isRaining(environment)) {
    return "OFF";
  }

  const controlMode = String(
    item?.control_mode || "MANUAL"
  ).toUpperCase();

  if (controlMode === "MANUAL") {
    return String(
      item?.pump_status || "OFF"
    ).toUpperCase() === "ON"
      ? "ON"
      : "OFF";
  }

  const soil = Number(
    item?.soil_moisture ?? 0
  );

  return soil < SOIL_DRY_THRESHOLD
    ? "ON"
    : "OFF";
}

/* =========================================================
   CANVAS TEXTURE
   ========================================================= */

function createCanvasTexture(
  width,
  height,
  drawFunction
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d");

  if (ctx) {
    drawFunction(
      ctx,
      canvas
    );
  }

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.needsUpdate = true;

  return texture;
}

/* =========================================================
   LABEL PETAK
   ========================================================= */

function createPlotLabel(
  text,
  status
) {
  const texture =
    createCanvasTexture(
      900,
      250,
      (ctx, canvas) => {
        const statusColor =
          getStatusHex(status);

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        /* shadow */
        ctx.fillStyle =
          "rgba(15, 23, 42, 0.20)";

        ctx.beginPath();
        ctx.roundRect(
          48,
          58,
          804,
          142,
          24
        );
        ctx.fill();

        /* main green plate */
        const bg =
          ctx.createLinearGradient(
            50,
            42,
            850,
            200
          );

        bg.addColorStop(
          0,
          "#059669"
        );

        bg.addColorStop(
          1,
          "#16a34a"
        );

        ctx.fillStyle = bg;

        ctx.beginPath();
        ctx.roundRect(
          36,
          42,
          804,
          142,
          24
        );
        ctx.fill();

        /* cream border like physical sign */
        ctx.strokeStyle =
          "#fff7d6";
        ctx.lineWidth = 8;
        ctx.stroke();

        /* top status tab */
        ctx.fillStyle =
          statusColor;

        ctx.beginPath();
        ctx.roundRect(
          310,
          18,
          280,
          52,
          16
        );
        ctx.fill();

        ctx.fillStyle =
          "#ffffff";

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "middle";

        ctx.font =
          "900 25px Arial";

        ctx.fillText(
          getStatusLabel(status).toUpperCase(),
          canvas.width / 2,
          45
        );

        /* plot name */
        ctx.fillStyle =
          "#ffffff";

        ctx.font =
          "900 56px Arial";

        ctx.fillText(
          text || "Petak",
          canvas.width / 2,
          114
        );

        /* subtitle */
        ctx.fillStyle =
          "rgba(255,255,255,0.80)";

        ctx.font =
          "800 22px Arial";

        ctx.fillText(
          "AREA MONITORING",
          canvas.width / 2,
          158
        );
      }
    );

  const material =
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

  const sprite =
    new THREE.Sprite(material);

  sprite.scale.set(
    3.15,
    0.92,
    1
  );

  sprite.renderOrder = 20;

  return sprite;
}

/* =========================================================
   LABEL KELEMBAPAN TANAH
   ========================================================= */

function createMoistureLabel(
  soilValue,
  status
) {
  const texture =
    createCanvasTexture(
      820,
      230,
      (ctx, canvas) => {
        const statusColor =
          getStatusHex(status);

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        /* compact floating sensor tag */
        ctx.fillStyle =
          "rgba(15, 23, 42, 0.18)";

        ctx.beginPath();
        ctx.roundRect(
          46,
          50,
          728,
          126,
          22
        );
        ctx.fill();

        const bg =
          ctx.createLinearGradient(
            40,
            38,
            770,
            172
          );

        bg.addColorStop(
          0,
          "#fffdf7"
        );

        bg.addColorStop(
          1,
          "#ffffff"
        );

        ctx.fillStyle = bg;

        ctx.beginPath();
        ctx.roundRect(
          34,
          38,
          728,
          126,
          22
        );
        ctx.fill();

        ctx.strokeStyle =
          statusColor;

        ctx.lineWidth = 7;
        ctx.stroke();

        /* status bar left */
        ctx.fillStyle =
          statusColor;

        ctx.beginPath();
        ctx.roundRect(
          34,
          38,
          22,
          126,
          [
            22,
            0,
            0,
            22,
          ]
        );
        ctx.fill();

        /* large number */
        ctx.fillStyle =
          statusColor;

        ctx.textAlign =
          "left";

        ctx.textBaseline =
          "middle";

        ctx.font =
          "900 66px Arial";

        ctx.fillText(
          `${soilValue}%`,
          90,
          101
        );

        /* vertical divider */
        ctx.strokeStyle =
          "rgba(100,116,139,0.22)";

        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(
          345,
          66
        );
        ctx.lineTo(
          345,
          138
        );
        ctx.stroke();

        /* descriptor */
        ctx.fillStyle =
          "#64748b";

        ctx.font =
          "800 20px Arial";

        ctx.fillText(
          "KELEMBAPAN",
          390,
          87
        );

        ctx.fillText(
          "TANAH",
          390,
          117
        );

        /* compact condition chip */
        ctx.fillStyle =
          statusColor;

        ctx.beginPath();
        ctx.roundRect(
          575,
          73,
          150,
          46,
          16
        );
        ctx.fill();

        ctx.fillStyle =
          "#ffffff";

        ctx.textAlign =
          "center";

        ctx.font =
          "900 19px Arial";

        ctx.fillText(
          getStatusLabel(status),
          650,
          97
        );
      }
    );

  const material =
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

  const sprite =
    new THREE.Sprite(material);

  sprite.scale.set(
    2.85,
    0.80,
    1
  );

  sprite.renderOrder = 21;

  return sprite;
}

/* =========================================================
   SENSOR SOIL MOISTURE
   ========================================================= */

function createMoistureSensor(
  soilValue,
  status
) {
  const group =
    new THREE.Group();

  const statusColor =
    getStatusColor(status);

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.48,
        0.3,
        0.32
      ),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.25,
      })
    );

  body.position.y =
    0.82;

  body.castShadow =
    true;

  group.add(body);

  const led =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.05,
        14,
        14
      ),
      new THREE.MeshStandardMaterial({
        color: statusColor,
        emissive: statusColor,
        emissiveIntensity: 1.25,
      })
    );

  led.position.set(
    0,
    0.83,
    0.18
  );

  group.add(led);

  const probe =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.06,
        0.8,
        0.06
      ),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.3,
        metalness: 0.7,
      })
    );

  probe.position.y =
    0.28;

  probe.castShadow =
    true;

  group.add(probe);

  const foot =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.1,
        0.08,
        0.08,
        12
      ),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.55,
        metalness: 0.45,
      })
    );

  foot.position.y =
    -0.12;

  group.add(foot);

  const texture =
    createCanvasTexture(
      430,
      150,
      (ctx, canvas) => {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.fillStyle =
          "rgba(255,255,255,0.96)";

        ctx.beginPath();

        ctx.roundRect(
          12,
          12,
          406,
          126,
          20
        );

        ctx.fill();

        ctx.fillStyle =
          getStatusHex(status);

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "middle";

        ctx.font =
          "900 46px Arial";

        ctx.fillText(
          `${soilValue}%`,
          canvas.width / 2,
          58
        );

        ctx.fillStyle =
          "#64748b";

        ctx.font =
          "800 18px Arial";

        ctx.fillText(
          "SOIL SENSOR",
          canvas.width / 2,
          102
        );
      }
    );

  const display =
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      })
    );

  display.position.set(
    0,
    1.42,
    0
  );

  display.scale.set(
    1.35,
    0.48,
    1
  );

  group.add(display);

  return group;
}

/* =========================================================
   TANAMAN
   ========================================================= */

function createPlant(
  status = "normal",
  variant = 0
) {
  const group =
    new THREE.Group();

  const stemMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x237a3b,
      roughness: 0.82,
    });

  let leafColor =
    0x22c55e;

  if (
    status === "warning"
  ) {
    leafColor =
      0x34d399;
  }

  if (
    status === "critical"
  ) {
    leafColor =
      0x4ade80;
  }

  const leafMaterial =
    new THREE.MeshStandardMaterial({
      color: leafColor,
      roughness: 0.78,
    });

  const stemHeight =
    0.52 +
    variant * 0.03;

  const stem =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.03,
        0.048,
        stemHeight,
        8
      ),
      stemMaterial
    );

  stem.position.y =
    stemHeight / 2;

  group.add(stem);

  const leafGeometry =
    new THREE.SphereGeometry(
      0.13,
      10,
      10
    );

  const leaf1 =
    new THREE.Mesh(
      leafGeometry,
      leafMaterial
    );

  leaf1.scale.set(
    1.6,
    0.5,
    0.7
  );

  leaf1.rotation.z =
    -0.5;

  leaf1.position.set(
    -0.12,
    stemHeight * 0.7,
    0
  );

  group.add(leaf1);

  const leaf2 =
    new THREE.Mesh(
      leafGeometry,
      leafMaterial
    );

  leaf2.scale.set(
    1.65,
    0.52,
    0.7
  );

  leaf2.rotation.z =
    0.45;

  leaf2.position.set(
    0.12,
    stemHeight * 0.82,
    0
  );

  group.add(leaf2);

  const leaf3 =
    new THREE.Mesh(
      leafGeometry,
      leafMaterial
    );

  leaf3.scale.set(
    1.4,
    0.55,
    0.72
  );

  leaf3.position.set(
    0,
    stemHeight + 0.06,
    0
  );

  group.add(leaf3);

  const flower =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.05,
        10,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffe66d,
        roughness: 0.35,
      })
    );

  flower.position.y =
    stemHeight + 0.13;

  group.add(flower);

  group.traverse(
    (object) => {
      if (
        object.isMesh
      ) {
        object.castShadow =
          true;

        object.receiveShadow =
          true;
      }
    }
  );

  return group;
}

/* =========================================================
   RAISED BED
   ========================================================= */

function createRaisedBed(
  status,
  soilValue
) {
  const group =
    new THREE.Group();

  const darkWood =
    new THREE.MeshStandardMaterial({
      color: 0x6b3f22,
      roughness: 0.9,
    });

  const wood =
    new THREE.MeshStandardMaterial({
      color: 0xa65f2a,
      roughness: 0.84,
    });

  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.75,
        0.52,
        3.65
      ),
      darkWood
    );

  base.position.y =
    0.22;

  base.castShadow =
    true;

  base.receiveShadow =
    true;

  group.add(base);

  const frameParts = [
    [0, -1.74, 3.75, 0.18],
    [0, 1.74, 3.75, 0.18],
    [-1.78, 0, 0.18, 3.65],
    [1.78, 0, 0.18, 3.65],
  ];

  frameParts.forEach(
    ([x, z, sx, sz]) => {
      const part =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            sx,
            0.28,
            sz
          ),
          wood
        );

      part.position.set(
        x,
        0.48,
        z
      );

      part.castShadow =
        true;

      group.add(part);
    }
  );

  let soilColor;

  if (
    soilValue <
    SOIL_DRY_THRESHOLD
  ) {
    soilColor =
      0xa5673f;
  } else if (
    soilValue <
    SOIL_WARNING_THRESHOLD
  ) {
    soilColor =
      0x70482f;
  } else {
    soilColor =
      0x4f3524;
  }

  const soil =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.35,
        0.28,
        3.25
      ),
      new THREE.MeshStandardMaterial({
        color: soilColor,
        roughness: 0.92,
      })
    );

  soil.position.y =
    0.63;

  soil.castShadow =
    true;

  soil.receiveShadow =
    true;

  group.add(soil);

  const statusColor =
    getStatusColor(status);

  const statusTop =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.48,
        0.08,
        3.38
      ),
      new THREE.MeshStandardMaterial({
        color: statusColor,
        emissive: statusColor,
        emissiveIntensity: 0.12,
        roughness: 0.58,
      })
    );

  statusTop.position.y =
    0.82;

  group.add(statusTop);

  return {
    group,
    clickableSoil: soil,
    clickableTop:
      statusTop,
  };
}

/* =========================================================
   IRRIGATION
   ========================================================= */

function createIrrigationSystem() {
  const group =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.45,
      metalness: 0.18,
    });

  const mainPipe =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.05,
        0.05,
        2.8,
        12
      ),
      material
    );

  mainPipe.rotation.z =
    Math.PI / 2;

  mainPipe.position.set(
    0,
    1,
    -1.15
  );

  group.add(mainPipe);

  for (
    let i = 0;
    i < 4;
    i += 1
  ) {
    const pipe =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.025,
          0.025,
          0.45,
          8
        ),
        material
      );

    pipe.position.set(
      -1.03 +
        i * 0.68,
      0.78,
      -1.15
    );

    group.add(pipe);

    const nozzle =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.04,
          10,
          10
        ),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.25,
        })
      );

    nozzle.position.set(
      -1.03 +
        i * 0.68,
      1,
      -1.15
    );

    group.add(nozzle);
  }

  return group;
}

/* =========================================================
   WATER EFFECT
   ========================================================= */

function createWaterStream() {
  const group =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      roughness: 0.08,
    });

  for (
    let i = 0;
    i < 22;
    i += 1
  ) {
    const drop =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.042,
          8,
          8
        ),
        material
      );

    const angle =
      Math.random() *
      Math.PI *
      2;

    const radius =
      0.25 +
      Math.random() *
        1.15;

    drop.position.set(
      Math.cos(angle) *
        radius,

      0.95 +
        Math.random() *
          0.85,

      Math.sin(angle) *
        radius
    );

    drop.userData.offset =
      Math.random() *
      Math.PI *
      2;

    drop.userData.speed =
      1.25 +
      Math.random() *
        1.5;

    group.add(drop);
  }

  return group;
}

/* =========================================================
   PUMP
   ========================================================= */

function createPump(
  pumpStatus
) {
  const group =
    new THREE.Group();

  const base =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.34,
        0.38,
        0.18,
        14
      ),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.65,
        metalness: 0.35,
      })
    );

  base.position.y =
    0.12;

  group.add(base);

  const motor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.58,
        0.4,
        0.46
      ),
      new THREE.MeshStandardMaterial({
        color:
          pumpStatus ===
          "ON"
            ? 0x0ea5e9
            : 0x64748b,

        roughness: 0.52,
        metalness: 0.35,
      })
    );

  motor.position.y =
    0.42;

  group.add(motor);

  const indicator =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.055,
        12,
        12
      ),
      new THREE.MeshStandardMaterial({
        color:
          pumpStatus ===
          "ON"
            ? 0x22c55e
            : 0x64748b,

        emissive:
          pumpStatus ===
          "ON"
            ? 0x16a34a
            : 0x334155,

        emissiveIntensity:
          pumpStatus ===
          "ON"
            ? 1.1
            : 0.1,
      })
    );

  indicator.position.set(
    0,
    0.7,
    0.24
  );

  group.add(indicator);

  return group;
}

/* =========================================================
   FAN ACCESSORY
   ========================================================= */

function createFan() {
  const group =
    new THREE.Group();

  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.05,
        0.065,
        0.95,
        12
      ),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.65,
        metalness: 0.28,
      })
    );

  pole.position.y =
    0.48;

  group.add(pole);

  const hub =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.14,
        14,
        14
      ),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.45,
        metalness: 0.45,
      })
    );

  hub.position.y =
    1.02;

  group.add(hub);

  const bladeGroup =
    new THREE.Group();

  bladeGroup.position.y =
    1.02;

  const bladeMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.48,
      metalness: 0.12,
      side: THREE.DoubleSide,
    });

  for (
    let i = 0;
    i < 4;
    i += 1
  ) {
    const blade =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.08,
          0.46,
          0.14
        ),
        bladeMaterial
      );

    blade.position.y =
      0.17;

    blade.rotation.y =
      (Math.PI / 2) *
      i;

    blade.rotation.z =
      0.35;

    bladeGroup.add(blade);
  }

  group.add(bladeGroup);

  const guard =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.42,
        0.02,
        12,
        32
      ),
      new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.55,
        metalness: 0.18,
      })
    );

  guard.position.y =
    1.02;

  guard.rotation.x =
    Math.PI / 2;

  group.add(guard);

  group.userData.bladeGroup =
    bladeGroup;

  return group;
}

/* =========================================================
   LAMP ACCESSORY
   ========================================================= */

function createLamp() {
  const group =
    new THREE.Group();

  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.045,
        0.06,
        1.02,
        12
      ),
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.6,
      })
    );

  pole.position.y =
    0.52;

  group.add(pole);

  const arm =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.3,
        0.04,
        0.04
      ),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
      })
    );

  arm.position.set(
    0.12,
    0.97,
    0
  );

  group.add(arm);

  const bulb =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.13,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.75,
      })
    );

  bulb.position.set(
    0.24,
    0.92,
    0
  );

  group.add(bulb);

  const light =
    new THREE.PointLight(
      0xfbbf24,
      0.45,
      3
    );

  light.position.copy(
    bulb.position
  );

  group.add(light);

  return group;
}

/* =========================================================
   TREE
   ========================================================= */

function createTree() {
  const group =
    new THREE.Group();

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.18,
        0.25,
        1.45,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: 0x8b5e3c,
        roughness: 0.92,
      })
    );

  trunk.position.y =
    0.72;

  group.add(trunk);

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.82,
    });

  [
    [0, 1.65, 0, 0.82],
    [-0.44, 1.95, 0.05, 0.62],
    [0.48, 1.9, 0, 0.6],
  ].forEach(
    ([x, y, z, radius]) => {
      const leaf =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            radius,
            18,
            18
          ),
          material
        );

      leaf.position.set(
        x,
        y,
        z
      );

      leaf.castShadow =
        true;

      group.add(leaf);
    }
  );

  return group;
}

/* =========================================================
   BUSH
   ========================================================= */

function createBush() {
  const group =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.9,
    });

  [
    [-0.35, 0.32, 0],
    [0, 0.48, 0],
    [0.36, 0.34, 0],
  ].forEach(
    ([x, y, z]) => {
      const part =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.4,
            14,
            14
          ),
          material
        );

      part.position.set(
        x,
        y,
        z
      );

      group.add(part);
    }
  );

  return group;
}

/* =========================================================
   GROUND
   ========================================================= */

function createGround() {
  const group =
    new THREE.Group();

  const grass =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        40,
        28
      ),
      new THREE.MeshStandardMaterial({
        color: 0x9ddd68,
        roughness: 1,
      })
    );

  grass.rotation.x =
    -Math.PI / 2;

  grass.position.y =
    -0.04;

  grass.receiveShadow =
    true;

  group.add(grass);

  const base =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        44,
        32
      ),
      new THREE.MeshStandardMaterial({
        color: 0xe8f3dc,
        roughness: 1,
      })
    );

  base.rotation.x =
    -Math.PI / 2;

  base.position.y =
    -0.09;

  group.add(base);

  return group;
}

/* =========================================================
   PATH

   GATE → PETAK 1
   + JALAN KE AREA RUMAH
   ========================================================= */

function createPath() {
  const group =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xe7c58f,
      roughness: 0.96,
    });

  /* ENTRANCE */

  const entrancePath =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.55,
        0.06,
        3.0
      ),
      material
    );

  entrancePath.position.set(
    0,
    0,
    6.25
  );

  entrancePath.receiveShadow =
    true;

  group.add(
    entrancePath
  );

  /* CENTER */

  const centerPath =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.35,
        0.06,
        3.0
      ),
      material
    );

  centerPath.position.set(
    0,
    0,
    2.2
  );

  centerPath.receiveShadow =
    true;

  group.add(
    centerPath
  );

  /* CROSS ROAD */

  const crossPath =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        21,
        0.06,
        1.05
      ),
      material
    );

  crossPath.position.set(
    0,
    0,
    -2.05
  );

  crossPath.receiveShadow =
    true;

  group.add(
    crossPath
  );

  /* UTILITY PATH */

  const utilityPath =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        5.6,
        0.06,
        1.1
      ),
      material
    );

  utilityPath.position.set(
    13.2,
    0,
    1.3
  );

  utilityPath.rotation.y =
    -0.12;

  utilityPath.receiveShadow =
    true;

  group.add(
    utilityPath
  );

  return group;
}

/* =========================================================
   FENCE + FRONT GATE
   ========================================================= */

function createFence() {
  const group =
    new THREE.Group();

  const postMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x9a6034,
      roughness: 0.9,
    });

  const railMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xe57a14,
      roughness: 0.82,
    });

  const fenceX = 24;
  const fenceZ = 15.6;

  const frontZ = 7.8;
  const backZ = -7.8;

  function addHorizontal(
    z
  ) {
    for (
      let x = -fenceX / 2;
      x <= fenceX / 2;
      x += 1.8
    ) {
      const post =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.18,
            1.55,
            0.18
          ),
          postMaterial
        );

      post.position.set(
        x,
        0.78,
        z
      );

      post.castShadow =
        true;

      group.add(post);
    }

    const rail1 =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          fenceX,
          0.13,
          0.12
        ),
        railMaterial
      );

    rail1.position.set(
      0,
      1.08,
      z
    );

    const rail2 =
      rail1.clone();

    rail2.position.y =
      0.58;

    group.add(
      rail1,
      rail2
    );
  }

  function addFrontFenceWithGate(
    z
  ) {
    const gateWidth =
      3.6;

    const halfFence =
      fenceX / 2;

    const halfGate =
      gateWidth / 2;

    const sideLength =
      halfFence -
      halfGate;

    /* LEFT POSTS */

    for (
      let x = -halfFence;
      x <= -halfGate;
      x += 1.8
    ) {
      const post =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.18,
            1.55,
            0.18
          ),
          postMaterial
        );

      post.position.set(
        x,
        0.78,
        z
      );

      post.castShadow =
        true;

      group.add(post);
    }

    /* RIGHT POSTS */

    for (
      let x = halfGate;
      x <= halfFence;
      x += 1.8
    ) {
      const post =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.18,
            1.55,
            0.18
          ),
          postMaterial
        );

      post.position.set(
        x,
        0.78,
        z
      );

      post.castShadow =
        true;

      group.add(post);
    }

    /* LEFT RAIL */

    const leftRail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          sideLength,
          0.13,
          0.12
        ),
        railMaterial
      );

    leftRail.position.set(
      -halfGate -
        sideLength / 2,
      1.08,
      z
    );

    const leftRailBottom =
      leftRail.clone();

    leftRailBottom.position.y =
      0.58;

    group.add(
      leftRail,
      leftRailBottom
    );

    /* RIGHT RAIL */

    const rightRail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          sideLength,
          0.13,
          0.12
        ),
        railMaterial
      );

    rightRail.position.set(
      halfGate +
        sideLength / 2,
      1.08,
      z
    );

    const rightRailBottom =
      rightRail.clone();

    rightRailBottom.position.y =
      0.58;

    group.add(
      rightRail,
      rightRailBottom
    );

    /* GATE POSTS */

    const gatePostLeft =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.26,
          1.85,
          0.26
        ),
        postMaterial
      );

    gatePostLeft.position.set(
      -halfGate,
      0.925,
      z
    );

    const gatePostRight =
      gatePostLeft.clone();

    gatePostRight.position.x =
      halfGate;

    group.add(
      gatePostLeft,
      gatePostRight
    );

    /* LEFT GATE */

    const gateHalfWidth =
      gateWidth / 2 -
      0.2;

    const leftGate =
      new THREE.Group();

    const leftTop =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          gateHalfWidth,
          0.13,
          0.12
        ),
        railMaterial
      );

    leftTop.position.set(
      gateHalfWidth / 2,
      1.05,
      0
    );

    const leftBottom =
      leftTop.clone();

    leftBottom.position.y =
      0.55;

    const leftDiagonal =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          gateHalfWidth *
            1.05,
          0.1,
          0.1
        ),
        railMaterial
      );

    leftDiagonal.position.set(
      gateHalfWidth / 2,
      0.8,
      0
    );

    leftDiagonal.rotation.z =
      -0.55;

    leftGate.add(
      leftTop,
      leftBottom,
      leftDiagonal
    );

    leftGate.position.set(
      -halfGate,
      0,
      z
    );

    leftGate.rotation.y =
      -0.9;

    group.add(leftGate);

    /* RIGHT GATE */

    const rightGate =
      new THREE.Group();

    const rightTop =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          gateHalfWidth,
          0.13,
          0.12
        ),
        railMaterial
      );

    rightTop.position.set(
      -gateHalfWidth / 2,
      1.05,
      0
    );

    const rightBottom =
      rightTop.clone();

    rightBottom.position.y =
      0.55;

    const rightDiagonal =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          gateHalfWidth *
            1.05,
          0.1,
          0.1
        ),
        railMaterial
      );

    rightDiagonal.position.set(
      -gateHalfWidth / 2,
      0.8,
      0
    );

    rightDiagonal.rotation.z =
      0.55;

    rightGate.add(
      rightTop,
      rightBottom,
      rightDiagonal
    );

    rightGate.position.set(
      halfGate,
      0,
      z
    );

    rightGate.rotation.y =
      0.9;

    group.add(rightGate);
  }

  function addVertical(
    x
  ) {
    for (
      let z = -fenceZ / 2;
      z <= fenceZ / 2;
      z += 1.8
    ) {
      const post =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.18,
            1.55,
            0.18
          ),
          postMaterial
        );

      post.position.set(
        x,
        0.78,
        z
      );

      post.castShadow =
        true;

      group.add(post);
    }

    const rail1 =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          0.13,
          fenceZ
        ),
        railMaterial
      );

    rail1.position.set(
      x,
      1.08,
      0
    );

    const rail2 =
      rail1.clone();

    rail2.position.y =
      0.58;

    group.add(
      rail1,
      rail2
    );
  }

  addFrontFenceWithGate(
    frontZ
  );

  addHorizontal(
    backZ
  );

  addVertical(-12);
  addVertical(12);

  return group;
}

/* =========================================================
   HOUSE
   ========================================================= */

function createHouse() {
  const group =
    new THREE.Group();

  const wall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.15,
        2.05,
        2.65
      ),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.85,
      })
    );

  wall.position.set(
    0,
    1.025,
    0
  );

  wall.castShadow =
    true;

  group.add(wall);

  const roof =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        2.5,
        1.45,
        4
      ),
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.82,
      })
    );

  roof.rotation.y =
    Math.PI / 4;

  roof.position.set(
    0,
    2.75,
    0
  );

  roof.castShadow =
    true;

  group.add(roof);

  const door =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.72,
        1.2,
        0.07
      ),
      new THREE.MeshStandardMaterial({
        color: 0x7c2d12,
        roughness: 0.82,
      })
    );

  door.position.set(
    0,
    0.6,
    1.36
  );

  group.add(door);

  const glass =
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      roughness: 0.2,
      metalness: 0.18,
    });

  const window1 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.65,
        0.55,
        0.07
      ),
      glass
    );

  window1.position.set(
    -0.92,
    1.32,
    1.36
  );

  group.add(window1);

  const window2 =
    window1.clone();

  window2.position.x =
    0.92;

  group.add(window2);

  const houseBase =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.6,
        0.12,
        3.05
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd6d3d1,
        roughness: 1,
      })
    );

  houseBase.position.y =
    0.04;

  group.add(houseBase);

  return group;
}

/* =========================================================
   WATER TANK
   ========================================================= */

function createWaterTank() {
  const group =
    new THREE.Group();

  const legMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.58,
      metalness: 0.35,
    });

  [
    [-0.45, -0.45],
    [0.45, -0.45],
    [-0.45, 0.45],
    [0.45, 0.45],
  ].forEach(
    ([x, z]) => {
      const leg =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.1,
            1.3,
            0.1
          ),
          legMaterial
        );

      leg.position.set(
        x,
        0.65,
        z
      );

      group.add(leg);
    }
  );

  const tank =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.8,
        0.8,
        1.15,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        roughness: 0.42,
        metalness: 0.15,
      })
    );

  tank.position.y =
    1.7;

  tank.castShadow =
    true;

  group.add(tank);

  const cap =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.84,
        0.84,
        0.08,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
      })
    );

  cap.position.y =
    2.29;

  group.add(cap);

  return group;
}

/* =========================================================
   IoT GATEWAY
   ========================================================= */

function createIoTGateway() {
  const group =
    new THREE.Group();

  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.08,
        0.12,
        3,
        12
      ),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.55,
        metalness: 0.35,
      })
    );

  pole.position.y =
    1.5;

  group.add(pole);

  const gatewayBox =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.55,
        0.38,
        0.24
      ),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
      })
    );

  gatewayBox.position.set(
    0.35,
    1.85,
    0
  );

  group.add(
    gatewayBox
  );

  const led =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.05,
        12,
        12
      ),
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x16a34a,
        emissiveIntensity: 1,
      })
    );

  led.position.set(
    0.48,
    1.88,
    0.13
  );

  group.add(led);

  const antenna =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.16,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.28,
        metalness: 0.38,
      })
    );

  antenna.position.y =
    3.1;

  group.add(antenna);

  const ringMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.75,
    });

  const ring1 =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.45,
        0.025,
        10,
        42
      ),
      ringMaterial
    );

  ring1.rotation.x =
    Math.PI / 2;

  ring1.position.y =
    3.15;

  group.add(ring1);

  const ring2 =
    ring1.clone();

  ring2.scale.setScalar(
    1.45
  );

  ring2.position.y =
    3.2;

  group.add(ring2);

  group.userData.rings = [
    ring1,
    ring2,
  ];

  return group;
}

/* =========================================================
   SMART FARM SIGN
   ========================================================= */

function createSmartFarmSign() {
  const group =
    new THREE.Group();

  const texture =
    createCanvasTexture(
      1100,
      420,
      (ctx, canvas) => {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        /* board shadow */
        ctx.fillStyle =
          "rgba(15,23,42,0.16)";

        ctx.beginPath();

        ctx.roundRect(
          40,
          42,
          1020,
          326,
          34
        );

        ctx.fill();

        /* main white board */
        const bg =
          ctx.createLinearGradient(
            30,
            25,
            1040,
            370
          );

        bg.addColorStop(
          0,
          "#ffffff"
        );

        bg.addColorStop(
          1,
          "#f3fbf6"
        );

        ctx.fillStyle = bg;

        ctx.beginPath();

        ctx.roundRect(
          24,
          24,
          1020,
          326,
          34
        );

        ctx.fill();

        /* thick dark frame */
        ctx.strokeStyle =
          "#0f172a";

        ctx.lineWidth =
          12;

        ctx.stroke();

        /* green top accent */
        ctx.fillStyle =
          "#22c55e";

        ctx.beginPath();

        ctx.roundRect(
          72,
          66,
          956,
          15,
          8
        );

        ctx.fill();

        /* brand */
        ctx.fillStyle =
          "#16a34a";

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "middle";

        ctx.font =
          "900 92px Arial";

        ctx.fillText(
          "SMART FARM",
          canvas.width / 2,
          175
        );

        ctx.fillStyle =
          "#334155";

        ctx.font =
          "900 34px Arial";

        ctx.fillText(
          "IoT MONITORING SYSTEM",
          canvas.width / 2,
          250
        );

        ctx.fillStyle =
          "#94a3b8";

        ctx.font =
          "700 25px Arial";

        ctx.fillText(
          "11 PLOTS • SOIL • IRRIGATION • RAIN SENSOR",
          canvas.width / 2,
          304
        );
      }
    );

  const board =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.55,
        1.38,
        0.11
      ),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.52,
        metalness: 0.03,
      })
    );

  board.position.y =
    2.0;

  board.castShadow =
    true;

  group.add(board);

  [-1.22, 1.22].forEach(
    (x) => {
      const pole =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.14,
            2.65,
            0.14
          ),
          new THREE.MeshStandardMaterial({
            color: 0x8b5e3c,
            roughness: 0.88,
          })
        );

      pole.position.set(
        x,
        1.18,
        0
      );

      pole.castShadow =
        true;

      group.add(pole);
    }
  );

  return group;
}

/* =========================================================
   CLOUD
   ========================================================= */

function createCloud(
  x,
  y,
  z,
  scale = 1
) {
  const group =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      transparent: true,
      opacity: 0.94,
    });

  [
    [-0.55, 0, 0, 0.42],
    [0, 0.16, 0, 0.55],
    [0.55, 0, 0, 0.42],
  ].forEach(
    ([px, py, pz, r]) => {
      const cloud =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            r,
            16,
            16
          ),
          material
        );

      cloud.position.set(
        px,
        py,
        pz
      );

      group.add(cloud);
    }
  );

  group.position.set(
    x,
    y,
    z
  );

  group.scale.setScalar(
    scale
  );

  return group;
}

/* =========================================================
   BIRD
   ========================================================= */

function createBird(
  x,
  y,
  z
) {
  const group =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
    });

  const body =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.14,
        10,
        10
      ),
      material
    );

  body.scale.set(
    1.5,
    0.7,
    0.9
  );

  group.add(body);

  const wing1 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.34,
        0.035,
        0.15
      ),
      material
    );

  wing1.position.set(
    -0.15,
    0.04,
    0
  );

  wing1.rotation.z =
    0.25;

  group.add(wing1);

  const wing2 =
    wing1.clone();

  wing2.position.x =
    0.15;

  wing2.rotation.z =
    -0.25;

  group.add(wing2);

  group.position.set(
    x,
    y,
    z
  );

  return group;
}

/* =========================================================
   GLOBAL RAIN EFFECT
   ========================================================= */

function createRainEffect() {
  const dropCount = 850;
  const positions =
    new Float32Array(
      dropCount * 3
    );

  for (
    let i = 0;
    i < dropCount;
    i += 1
  ) {
    positions[i * 3] =
      (Math.random() - 0.5) * 34;

    positions[i * 3 + 1] =
      2 + Math.random() * 18;

    positions[i * 3 + 2] =
      (Math.random() - 0.5) * 24;
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  const material =
    new THREE.PointsMaterial({
      color: 0xb7ddff,
      size: 0.08,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });

  const rain =
    new THREE.Points(
      geometry,
      material
    );

  rain.userData.dropCount =
    dropCount;

  return rain;
}


/* =========================================================
   FARMING DECOR
   Tambahan suasana pertanian tanpa menghapus elemen lama
   ========================================================= */

function createScarecrow() {
  const group = new THREE.Group();

  const woodMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.9,
    });

  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.07,
        2.5,
        10
      ),
      woodMaterial
    );

  pole.position.y = 1.25;
  pole.castShadow = true;
  group.add(pole);

  const arm =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.045,
        0.05,
        1.75,
        10
      ),
      woodMaterial
    );

  arm.rotation.z =
    Math.PI / 2;

  arm.position.y =
    1.72;

  arm.castShadow = true;
  group.add(arm);

  const shirt =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.72,
        0.68,
        0.24
      ),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.72,
      })
    );

  shirt.position.y =
    1.48;

  shirt.castShadow = true;
  group.add(shirt);

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.22,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xf4c98b,
        roughness: 0.82,
      })
    );

  head.position.y =
    2.03;

  head.castShadow = true;
  group.add(head);

  const hatTop =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.19,
        0.24,
        0.24,
        18
      ),
      new THREE.MeshStandardMaterial({
        color: 0xeab308,
        roughness: 0.92,
      })
    );

  hatTop.position.y =
    2.30;

  group.add(hatTop);

  const hatBrim =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.36,
        0.36,
        0.055,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.9,
      })
    );

  hatBrim.position.y =
    2.20;

  group.add(hatBrim);

  const pantsMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
    });

  [-0.14, 0.14].forEach((x) => {
    const leg =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          0.78,
          0.18
        ),
        pantsMaterial
      );

    leg.position.set(
      x,
      0.73,
      0
    );

    leg.castShadow = true;
    group.add(leg);
  });

  return group;
}

function createHayBale() {
  const group = new THREE.Group();

  const hay =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.55,
        0.55,
        1.05,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0xeabf53,
        roughness: 0.98,
      })
    );

  hay.rotation.z =
    Math.PI / 2;

  hay.position.y =
    0.56;

  hay.castShadow = true;
  hay.receiveShadow = true;

  group.add(hay);

  [-0.25, 0.25].forEach((x) => {
    const band =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.56,
          0.025,
          8,
          24
        ),
        new THREE.MeshStandardMaterial({
          color: 0x8b5a2b,
          roughness: 0.8,
        })
      );

    band.rotation.y =
      Math.PI / 2;

    band.position.x =
      x;

    group.add(band);
  });

  return group;
}

function createProduceCrate() {
  const group = new THREE.Group();

  const wood =
    new THREE.MeshStandardMaterial({
      color: 0xb96b2f,
      roughness: 0.9,
    });

  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.1,
        0.14,
        0.72
      ),
      wood
    );

  base.position.y =
    0.08;

  group.add(base);

  [-0.48, 0.48].forEach((x) => {
    const side =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          0.52,
          0.72
        ),
        wood
      );

    side.position.set(
      x,
      0.31,
      0
    );

    group.add(side);
  });

  [-0.3, 0, 0.3].forEach((z) => {
    const rail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.98,
          0.09,
          0.07
        ),
        wood
      );

    rail.position.set(
      0,
      0.30,
      z
    );

    group.add(rail);
  });

  const produceColors = [
    0xef4444,
    0xf97316,
    0xfacc15,
    0x22c55e,
  ];

  for (let i = 0; i < 12; i += 1) {
    const produce =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.075,
          10,
          10
        ),
        new THREE.MeshStandardMaterial({
          color:
            produceColors[
              i %
              produceColors.length
            ],
          roughness: 0.65,
        })
      );

    produce.position.set(
      -0.34 +
        (i % 4) * 0.22,
      0.29 +
        Math.floor(i / 8) *
          0.09,
      -0.20 +
        Math.floor(
          (i % 8) / 4
        ) *
          0.30
    );

    group.add(produce);
  }

  group.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return group;
}

function createFarmDecor() {
  const group =
    new THREE.Group();

  const scarecrow =
    createScarecrow();

  scarecrow.position.set(
    -11.0,
    0,
    2.5
  );

  scarecrow.rotation.y =
    0.28;

  group.add(scarecrow);

  const hay1 =
    createHayBale();

  hay1.position.set(
    13.6,
    0,
    5.1
  );

  hay1.rotation.y =
    0.22;

  group.add(hay1);

  const hay2 =
    createHayBale();

  hay2.position.set(
    14.8,
    0,
    5.2
  );

  hay2.rotation.y =
    -0.18;

  group.add(hay2);

  const crate1 =
    createProduceCrate();

  crate1.position.set(
    13.2,
    0,
    1.85
  );

  crate1.rotation.y =
    -0.18;

  group.add(crate1);

  const crate2 =
    createProduceCrate();

  crate2.position.set(
    14.2,
    0,
    1.55
  );

  crate2.rotation.y =
    0.10;

  group.add(crate2);

  return group;
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function Farm3DModel({
  sensors = [],
  environment = {
    humidity: 0,
    rain_detected: false,
    weather_status: "CERAH",
  },
}) {
  const mountRef =
    useRef(null);

  const cameraStateRef =
    useRef(null);

  const animationFrameRef =
    useRef(null);

  const [
    selectedPlot,
    setSelectedPlot,
  ] = useState(null);

  useEffect(() => {
    const mount =
      mountRef.current;

    if (!mount) {
      return;
    }

    const width =
      mount.clientWidth;

    const height =
      mount.clientHeight;

    if (
      !width ||
      !height
    ) {
      return;
    }

    /* =====================================================
       SCENE
       ===================================================== */

    const scene =
      new THREE.Scene();

    const raining =
      isRaining(
        environment
      );

    scene.background =
      new THREE.Color(
        raining
          ? 0xb9c9d3
          : 0xdaf5ff
      );

    scene.fog =
      new THREE.Fog(
        raining
          ? 0xc6d2d9
          : 0xeaf8ff,
        raining
          ? 20
          : 28,
        raining
          ? 62
          : 80
      );

    /* =====================================================
       CAMERA
       ===================================================== */

    const camera =
      new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        1000
      );

    camera.position.set(
      15,
      12,
      21
    );

    /* =====================================================
       RENDERER
       ===================================================== */

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

    renderer.setSize(
      width,
      height
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.shadowMap.enabled =
      true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
      1.18;

    mount.innerHTML = "";

    mount.appendChild(
      renderer.domElement
    );

    /* =====================================================
       ORBIT CONTROL
       ===================================================== */

    const controls =
      new OrbitControls(
        camera,
        renderer.domElement
      );

    controls.enableDamping =
      true;

    controls.dampingFactor =
      0.08;

    controls.minDistance =
      8;

    controls.maxDistance =
      44;

    controls.minPolarAngle =
      0.45;

    controls.maxPolarAngle =
      Math.PI / 2.08;

    controls.target.set(
      1.8,
      0.9,
      0
    );

    if (
      cameraStateRef.current
    ) {
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

    /* =====================================================
       LIGHT
       ===================================================== */

    scene.add(
      new THREE.AmbientLight(
        0xffffff,
        1.62
      )
    );

    scene.add(
      new THREE.HemisphereLight(
        0xffffff,
        0xa7f3d0,
        1.08
      )
    );

    const sun =
      new THREE.DirectionalLight(
        0xffffff,
        raining
          ? 1.45
          : 2.8
      );

    sun.position.set(
      13,
      19,
      11
    );

    sun.castShadow =
      true;

    sun.shadow.mapSize.width =
      2048;

    sun.shadow.mapSize.height =
      2048;

    sun.shadow.camera.left =
      -28;

    sun.shadow.camera.right =
      28;

    sun.shadow.camera.top =
      28;

    sun.shadow.camera.bottom =
      -24;

    scene.add(sun);

    /* decorative sun */
    const sunDisc =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1.15,
          28,
          28
        ),
        new THREE.MeshBasicMaterial({
          color: 0xffe082,
          transparent: true,
          opacity: 0.86,
        })
      );

    sunDisc.position.set(
      -12,
      12.5,
      -18
    );

    scene.add(sunDisc);

    /* =====================================================
       WORLD
       ===================================================== */

    scene.add(
      createGround()
    );

    scene.add(
      createPath()
    );

    scene.add(
      createFence()
    );

    /* =====================================================
       FARMING DECOR
       ===================================================== */

    scene.add(
      createFarmDecor()
    );

    /* =====================================================
       HOUSE
       DILUAR PAGAR KANAN
       ===================================================== */

    const house =
      createHouse();

    house.position.set(
      14.7,
      0,
      3
    );

    scene.add(house);

    /* =====================================================
       WATER TANK
       DILUAR PAGAR KANAN
       ===================================================== */

    const waterTank =
      createWaterTank();

    waterTank.position.set(
      14.8,
      0,
      -2.5
    );

    scene.add(
      waterTank
    );

    /* =====================================================
       IoT GATEWAY
       ===================================================== */

    const gateway =
      createIoTGateway();

    gateway.position.set(
      -10.5,
      0,
      5.5
    );

    scene.add(gateway);

    /* =====================================================
       SMART FARM SIGN
       ===================================================== */

    const sign =
      createSmartFarmSign();

    sign.position.set(
      -3.2,
      0,
      7.05
    );

    sign.rotation.y =
      -0.045;

    scene.add(sign);

    /* =====================================================
       TREES
       ===================================================== */

    const treePositions = [
      [-10.7, 0, -5.8],
      [-10.1, 0, 5.8],

      [15.6, 0, 5.6],
      [15.8, 0, -5.1],
    ];

    treePositions.forEach(
      ([x, y, z]) => {
        const tree =
          createTree();

        tree.position.set(
          x,
          y,
          z
        );

        scene.add(tree);
      }
    );

    /* =====================================================
       BUSH
       ===================================================== */

    const bushPositions = [
      [-8.5, 0, -6.3],
      [-7.6, 0, 6.2],

      [13.4, 0, 5.8],
      [13.6, 0, -5.8],
    ];

    bushPositions.forEach(
      ([x, y, z]) => {
        const bush =
          createBush();

        bush.position.set(
          x,
          y,
          z
        );

        scene.add(bush);
      }
    );

    /* =====================================================
       CLOUD
       ===================================================== */

    const clouds = [
      createCloud(
        -7.5,
        10.8,
        -7,
        1.2
      ),

      createCloud(
        6.5,
        12.3,
        -4.5,
        0.95
      ),
    ];

    clouds.forEach(
      (cloud) => {
        if (raining) {
          cloud.traverse(
            (object) => {
              if (
                object.isMesh &&
                object.material
              ) {
                object.material.color.set(
                  0xb8c5ce
                );
              }
            }
          );
        }

        scene.add(cloud);
      }
    );

    let rainEffect = null;

    if (raining) {
      rainEffect =
        createRainEffect();

      scene.add(
        rainEffect
      );
    }

    /* =====================================================
       BIRDS
       ===================================================== */

    const birds = [
      createBird(
        -2.8,
        9.3,
        -5.5
      ),

      createBird(
        2.8,
        9.2,
        -1.8
      ),
    ];

    birds.forEach(
      (bird) =>
        scene.add(bird)
    );

    /* =====================================================
       ARRAYS
       ===================================================== */

    const clickableObjects =
      [];

    const plantObjects =
      [];

    const rotatingFans =
      [];

    const waterEffects =
      [];

    const gatewayRings =
      gateway.userData.rings ||
      [];

    /* =====================================================
       DATA SENSOR
       ===================================================== */

    const sensorData =
      sensors.slice(
        0,
        11
      );

    sensorData.forEach(
      (
        sensor,
        index
      ) => {
        const position =
          PLOT_POSITIONS[
            index
          ];

        if (!position) {
          return;
        }

        const [x, z] =
          position;

        const status =
          getStatus(sensor);

        const soilValue =
          Number(
            sensor
              ?.soil_moisture ??
              0
          );

        const pumpStatus =
          getAutomaticPumpStatus(
            sensor,
            environment
          );

        const plot =
          new THREE.Group();

        plot.position.set(
          x,
          0,
          z
        );

        plot.userData.sensor =
          sensor;

        plot.userData.index =
          index;

        /* ===============================================
           RAISED BED
           =============================================== */

        const bed =
          createRaisedBed(
            status,
            soilValue
          );

        bed.clickableSoil.userData.plot =
          plot;

        bed.clickableTop.userData.plot =
          plot;

        clickableObjects.push(
          bed.clickableSoil,
          bed.clickableTop
        );

        plot.add(
          bed.group
        );

        /* ===============================================
           IRRIGATION
           =============================================== */

        const irrigation =
          createIrrigationSystem();

        plot.add(irrigation);

        /* ===============================================
           PUMP
           =============================================== */

        const pump =
          createPump(
            pumpStatus
          );

        pump.position.set(
          1.12,
          0.85,
          1.1
        );

        plot.add(pump);

        /* ===============================================
           FAN ACCESSORY
           =============================================== */

        const fan =
          createFan();

        fan.position.set(
          -1.18,
          0.86,
          -1
        );

        plot.add(fan);

        rotatingFans.push(
          fan
        );

        /* ===============================================
           LAMP ACCESSORY
           =============================================== */

        const lamp =
          createLamp();

        lamp.position.set(
          -1.18,
          0.86,
          1.05
        );

        plot.add(lamp);

        /* ===============================================
           SOIL SENSOR
           =============================================== */

        const sensorProbe =
          createMoistureSensor(
            soilValue,
            status
          );

        sensorProbe.position.set(
          1,
          0.88,
          0.2
        );

        plot.add(
          sensorProbe
        );

        /* ===============================================
           LABEL PETAK
           =============================================== */

        const label =
          createPlotLabel(
            sensor?.area ||
              `Petak ${
                index + 1
              }`,
            status
          );

        label.position.set(
          0,
          2.52,
          0
        );

        plot.add(label);

        /* ===============================================
           MOISTURE LABEL
           =============================================== */

        const moistureLabel =
          createMoistureLabel(
            soilValue,
            status
          );

        moistureLabel.position.set(
          0,
          4.02,
          0
        );

        plot.add(
          moistureLabel
        );

        /* ===============================================
           PLANTS
           =============================================== */

        const xs = [
          -1.05,
          -0.35,
          0.35,
          1.05,
        ];

        const zs = [
          -0.85,
          0,
          0.85,
        ];

        let plantIndex = 0;

        zs.forEach(
          (pz) => {
            xs.forEach(
              (px) => {
                const plant =
                  createPlant(
                    status,
                    plantIndex %
                      3
                  );

                plant.position.set(
                  px +
                    (Math.random() -
                      0.5) *
                      0.1,

                  0.82,

                  pz +
                    (Math.random() -
                      0.5) *
                      0.1
                );

                plot.add(
                  plant
                );

                plantObjects.push({
                  mesh: plant,

                  offset:
                    plantIndex *
                      0.4 +
                    index,
                });

                plantIndex += 1;
              }
            );
          }
        );

        /* ===============================================
           WATER EFFECT
           =============================================== */

        if (
          pumpStatus ===
          "ON"
        ) {
          const water =
            createWaterStream();

          water.position.set(
            0,
            0.35,
            -1
          );

          plot.add(water);

          waterEffects.push(
            water
          );
        }

        plot.traverse(
          (object) => {
            if (
              object.isMesh
            ) {
              object.castShadow =
                true;

              object.receiveShadow =
                true;
            }
          }
        );

        scene.add(plot);
      }
    );

    /* =====================================================
       CLICK
       ===================================================== */

    const raycaster =
      new THREE.Raycaster();

    const mouse =
      new THREE.Vector2();

    const handlePointerDown =
      (event) => {
        const rect =
          renderer.domElement.getBoundingClientRect();

        mouse.x =
          ((event.clientX -
            rect.left) /
            rect.width) *
            2 -
          1;

        mouse.y =
          -(
            (event.clientY -
              rect.top) /
            rect.height
          ) *
            2 +
          1;

        raycaster.setFromCamera(
          mouse,
          camera
        );

        const intersects =
          raycaster.intersectObjects(
            clickableObjects,
            true
          );

        if (
          !intersects.length
        ) {
          setSelectedPlot(
            null
          );

          return;
        }

        const clicked =
          intersects[0]
            .object;

        const plot =
          clicked.userData
            ?.plot;

        if (!plot) {
          return;
        }

        const sensor =
          plot.userData
            .sensor;

        const index =
          plot.userData
            .index;

        setSelectedPlot({
          index,

          item: sensor,

          status:
            getStatus(sensor),

          soilValue:
            Number(
              sensor
                ?.soil_moisture ??
                0
            ),

          pumpStatus:
            getAutomaticPumpStatus(
              sensor,
              environment
            ),
        });
      };

    renderer.domElement.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    /* =====================================================
       RESIZE
       ===================================================== */

    const handleResize =
      () => {
        const newWidth =
          mount.clientWidth;

        const newHeight =
          mount.clientHeight;

        if (
          !newWidth ||
          !newHeight
        ) {
          return;
        }

        camera.aspect =
          newWidth /
          newHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
          newWidth,
          newHeight
        );
      };

    window.addEventListener(
      "resize",
      handleResize
    );

    /* =====================================================
       ANIMATION
       ===================================================== */

    const clock =
      new THREE.Clock();

    const animate =
      () => {
        const elapsed =
          clock.getElapsedTime();

        /* tanaman */

        plantObjects.forEach(
          ({
            mesh,
            offset,
          }) => {
            mesh.rotation.z =
              Math.sin(
                elapsed *
                  1.1 +
                  offset
              ) *
              0.03;
          }
        );

        /* fan */

        rotatingFans.forEach(
          (fan) => {
            if (
              fan.userData
                .bladeGroup
            ) {
              fan.userData.bladeGroup.rotation.z =
                elapsed *
                15;
            }
          }
        );

        /* air */

        waterEffects.forEach(
          (group) => {
            group.children.forEach(
              (
                drop,
                index
              ) => {
                const offset =
                  drop.userData
                    .offset ??
                  index *
                    0.3;

                const speed =
                  drop.userData
                    .speed ??
                  1.5;

                drop.position.y =
                  0.9 +
                  Math.abs(
                    Math.sin(
                      elapsed *
                        speed +
                        offset
                    )
                  ) *
                    0.9;
              }
            );
          }
        );

        /* gateway signal */

        gatewayRings.forEach(
          (
            ring,
            index
          ) => {
            const scale =
              1 +
              Math.sin(
                elapsed *
                  1.8 +
                  index
              ) *
                0.06;

            ring.scale.setScalar(
              scale
            );
          }
        );

        /* cloud */

        clouds.forEach(
          (
            cloud,
            index
          ) => {
            cloud.position.x +=
              Math.sin(
                elapsed *
                  0.18 +
                  index
              ) *
              0.001;
          }
        );

        /* bird */

        birds.forEach(
          (
            bird,
            index
          ) => {
            bird.position.y +=
              Math.sin(
                elapsed *
                  1.6 +
                  index
              ) *
              0.001;
          }
        );

        /* rain */

        if (rainEffect) {
          const position =
            rainEffect.geometry.attributes.position;

          for (
            let i = 0;
            i < position.count;
            i += 1
          ) {
            let y =
              position.getY(i);

            y -=
              0.18 +
              (i % 7) * 0.008;

            if (y < 0.2) {
              y =
                10 +
                Math.random() *
                  10;
            }

            position.setY(
              i,
              y
            );
          }

          position.needsUpdate =
            true;
        }

        controls.update();

        renderer.render(
          scene,
          camera
        );

        animationFrameRef.current =
          requestAnimationFrame(
            animate
          );
      };

    animate();

    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      renderer.domElement.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      controls.dispose();

      scene.traverse(
        (object) => {
          if (
            object.geometry
          ) {
            object.geometry.dispose();
          }

          if (
            object.material
          ) {
            const materials =
              Array.isArray(
                object.material
              )
                ? object.material
                : [
                    object.material,
                  ];

            materials.forEach(
              (material) => {
                if (
                  material.map
                ) {
                  material.map.dispose();
                }

                material.dispose();
              }
            );
          }
        }
      );

      renderer.dispose();

      if (
        renderer.domElement
          .parentNode ===
        mount
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }
    };
  }, [sensors, environment]);

  /* =========================================================
     SUMMARY
     ========================================================= */

  const totalPlots =
    sensors.length;

  const criticalPlots =
    sensors.filter(
      (item) =>
        getStatus(item) ===
        "critical"
    ).length;

  const warningPlots =
    sensors.filter(
      (item) =>
        getStatus(item) ===
        "warning"
    ).length;

  const normalPlots =
    sensors.filter(
      (item) =>
        getStatus(item) ===
        "normal"
    ).length;

  const activePumps =
    sensors.filter(
      (item) =>
        getAutomaticPumpStatus(
          item,
          environment
        ) === "ON"
    ).length;

  const weatherStatus =
    getWeatherStatus(
      environment
    );

  const globalHumidity =
    Number(
      environment?.humidity ??
        0
    );

  const raining =
    isRaining(
      environment
    );

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="farm-3d-wrapper">

      <div className="farm-3d-toolbar">

        <div className="farm-3d-toolbar-left">

          <div className="farm-3d-toolbar-icon">
            🌱
          </div>

          <div>

            <h3 className="farm-3d-toolbar-title">
              Visualisasi Smart Farming 3D
            </h3>

            <p className="farm-3d-toolbar-subtitle">
              Monitoring real-time 11 petak, soil moisture, irigasi, rain sensor, dan gateway IoT
            </p>

          </div>

        </div>

        <div className="farm-3d-legend">

          <div className="farm-3d-legend-item">
            <span className="farm-3d-legend-dot normal" />
            Normal
          </div>

          <div className="farm-3d-legend-item">
            <span className="farm-3d-legend-dot warning" />
            Waspada
          </div>

          <div className="farm-3d-legend-item">
            <span className="farm-3d-legend-dot critical" />
            Kritis
          </div>

          <div
            className={`farm-3d-environment-chip ${
              raining
                ? "rain"
                : "clear"
            }`}
          >
            {raining
              ? "🌧️"
              : "☀️"}

            {weatherStatus}
          </div>

          <div className="farm-3d-environment-chip humidity">
            💨
            Humidity {globalHumidity}%
          </div>

        </div>

      </div>

      <div className="farm-3d-canvas-container">

        <div className="farm-3d-live-badge">
          <span className="farm-3d-live-dot" />
          {raining
            ? "LIVE • HUJAN"
            : "LIVE MONITORING"}
        </div>

        <div
          ref={mountRef}
          className="farm-3d-canvas"
        />

        <div className="farm-3d-control-hint">
          <kbd>Drag</kbd>
          putar

          <kbd>Scroll</kbd>
          zoom

          <kbd>Click</kbd>
          detail
        </div>

        {selectedPlot && (
          <div className="farm-3d-detail-panel">

            <div className="farm-3d-detail-header">

              <div>

                <p className="farm-3d-detail-overline">
                  DETAIL PETAK
                </p>

                <h4 className="farm-3d-detail-title">
                  {selectedPlot.item?.area ||
                    `Petak ${
                      selectedPlot.index +
                      1
                    }`}
                </h4>

                <p className="farm-3d-detail-subtitle">
                  Monitoring sensor tanah
                </p>

              </div>

              <button
                type="button"
                className="farm-3d-detail-close"
                onClick={() =>
                  setSelectedPlot(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div
              className={`farm-3d-detail-status ${selectedPlot.status}`}
            >
              <span className="farm-3d-detail-status-dot" />

              {getStatusLabel(
                selectedPlot.status
              )}
            </div>

            <div className="farm-3d-detail-grid">

              <div className="farm-3d-detail-card">

                <span className="farm-3d-detail-card-label">
                  Kelembapan Tanah
                </span>

                <strong className="farm-3d-detail-card-value">
                  {selectedPlot.soilValue}
                  <small>%</small>
                </strong>

              </div>

              <div className="farm-3d-detail-card">

                <span className="farm-3d-detail-card-label">
                  Kondisi Tanah
                </span>

                <strong className="farm-3d-detail-card-value text-small">
                  {getSoilCondition(
                    selectedPlot.item
                  )}
                </strong>

              </div>

              <div className="farm-3d-detail-card full">

                <span className="farm-3d-detail-card-label">
                  Mode Kontrol
                </span>

                <strong className="farm-3d-detail-card-value text-small">
                  {String(
                    selectedPlot.item?.control_mode ||
                      "MANUAL"
                  ).toUpperCase()}
                </strong>

              </div>

            </div>

            <div className="farm-3d-detail-footer">

              <span>
                Pompa Irigasi
              </span>

              <span
                className={`farm-3d-pump-status ${
                  getAutomaticPumpStatus(
                    selectedPlot.item,
                    environment
                  ) === "ON"
                    ? "on"
                    : "off"
                }`}
              >
                <span className="farm-3d-pump-dot" />

                {getAutomaticPumpStatus(
                  selectedPlot.item,
                  environment
                )}
              </span>

            </div>

            <div className="farm-3d-detail-rule">

              {raining
                ? "Hujan terdeteksi. Rain sensor menjadi global override sehingga pompa petak ini dipaksa OFF."
                : String(
                    selectedPlot.item?.control_mode ||
                      "MANUAL"
                  ).toUpperCase() === "AUTO"
                ? selectedPlot.soilValue <
                  SOIL_DRY_THRESHOLD
                  ? "Mode AUTO: kelembapan tanah di bawah 25%. Pompa irigasi aktif."
                  : "Mode AUTO: kelembapan tanah minimal 25%. Pompa irigasi tidak diperlukan."
                : getAutomaticPumpStatus(
                    selectedPlot.item,
                    environment
                  ) === "ON"
                ? "Mode MANUAL: pompa sedang dinyalakan oleh pengguna."
                : "Mode MANUAL: pompa sedang dimatikan oleh pengguna."}

            </div>

          </div>
        )}

      </div>

      <div className="farm-3d-info-strip">

        <div className="farm-3d-info-card">

          <p className="farm-3d-info-card-label">
            Total Petak
          </p>

          <p className="farm-3d-info-card-value">
            {totalPlots}
          </p>

          <p className="farm-3d-info-card-description">
            Seluruh area pertanian yang sedang dimonitor.
          </p>

        </div>

        <div className="farm-3d-info-card environment">

          <p className="farm-3d-info-card-label">
            Lingkungan Global
          </p>

          <p
            className={`farm-3d-info-card-value ${
              raining
                ? "blue"
                : "green"
            }`}
          >
            {weatherStatus}
          </p>

          <p className="farm-3d-info-card-description">
            Humidity {globalHumidity}% • rain sensor berlaku untuk seluruh lahan.
          </p>

        </div>

        <div className="farm-3d-info-card">

          <p className="farm-3d-info-card-label">
            Pompa Aktif
          </p>

          <p className="farm-3d-info-card-value green">
            {activePumps}
          </p>

          <p className="farm-3d-info-card-description">
            {raining
              ? "Hujan terdeteksi, seluruh pompa dipaksa OFF."
              : "AUTO mengikuti soil < 25%; MANUAL mengikuti kontrol pengguna."}
          </p>

        </div>

        <div className="farm-3d-info-card">

          <p className="farm-3d-info-card-label">
            Distribusi Kondisi
          </p>

          <p className="farm-3d-info-card-value">
            {normalPlots}
            {" / "}
            {warningPlots}
            {" / "}
            {criticalPlots}
          </p>

          <p className="farm-3d-info-card-description">
            Normal / Waspada / Kritis berdasarkan kelembapan tanah.
          </p>

        </div>

      </div>

      <div className="farm-3d-rule-box">

        <div className="farm-3d-rule-icon">
          {raining
            ? "🌧️"
            : "💧"}
        </div>

        <div>

          <strong>
            Aturan Irigasi Smart Farming
          </strong>

          <p>
            HUJAN → Semua pompa OFF

            <span>
              {" • "}
            </span>

            CERAH + AUTO + Soil &lt; 25%
            → Pompa ON

            <span>
              {" • "}
            </span>

            CERAH + AUTO + Soil ≥ 25%
            → Pompa OFF
          </p>

        </div>

      </div>

    </div>
  );
}