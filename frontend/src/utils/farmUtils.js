export const SOIL_DRY_THRESHOLD =
  25;

export const SOIL_WARNING_THRESHOLD =
  40;

/* =========================================================
   ENVIRONMENT
   ========================================================= */

export function getWeatherStatus(
  environment
) {
  if (
    environment?.rain_detected ===
    true
  ) {
    return "HUJAN";
  }

  if (
    String(
      environment?.weather_status ||
        ""
    )
      .trim()
      .toUpperCase() ===
    "HUJAN"
  ) {
    return "HUJAN";
  }

  return "CERAH";
}

export function isRaining(
  environment
) {
  return (
    getWeatherStatus(
      environment
    ) === "HUJAN"
  );
}

export function getGlobalHumidity(
  environment
) {
  return Number(
    environment?.humidity ?? 0
  );
}

/* =========================================================
   STATUS TANAH
   ========================================================= */

export function getGlobalStatusClass(
  item
) {
  const soilMoisture =
    Number(
      item?.soil_moisture ??
        0
    );

  if (
    soilMoisture <
    SOIL_DRY_THRESHOLD
  ) {
    return "critical";
  }

  if (
    soilMoisture <
    SOIL_WARNING_THRESHOLD
  ) {
    return "warning";
  }

  return "normal";
}

export function getGlobalStatusLabel(
  item
) {
  const status =
    getGlobalStatusClass(
      item
    );

  if (
    status ===
    "critical"
  ) {
    return "Kritis";
  }

  if (
    status ===
    "warning"
  ) {
    return "Waspada";
  }

  return "Normal";
}

/* =========================================================
   SOIL CONDITION
   ========================================================= */

export function getSoilCondition(
  item
) {
  const soilMoisture =
    Number(
      item?.soil_moisture ??
        0
    );

  if (
    soilMoisture <
    SOIL_DRY_THRESHOLD
  ) {
    return "Kering";
  }

  if (
    soilMoisture <
    SOIL_WARNING_THRESHOLD
  ) {
    return "Mulai Kering";
  }

  return "Cukup Lembap";
}

/* =========================================================
   AUTOMATIC PUMP
   ========================================================= */

export function getRecommendedPumpStatus(
  item,
  environment
) {
  if (
    isRaining(
      environment
    )
  ) {
    return "OFF";
  }

  const soilMoisture =
    Number(
      item?.soil_moisture ??
        0
    );

  return soilMoisture <
    SOIL_DRY_THRESHOLD
    ? "ON"
    : "OFF";
}

export function getAutomaticPumpStatus(
  item,
  environment
) {
  return getRecommendedPumpStatus(
    item,
    environment
  );
}

/* =========================================================
   RECOMMENDATION
   ========================================================= */

export function getRecommendation(
  item,
  environment
) {
  const soilMoisture =
    Number(
      item?.soil_moisture ??
        0
    );

  const controlMode =
    String(
      item?.control_mode ||
        "MANUAL"
    )
      .trim()
      .toUpperCase();

  if (
    isRaining(
      environment
    )
  ) {
    return "Hujan terdeteksi. Semua pompa dinonaktifkan sementara.";
  }

  if (
    soilMoisture <
    SOIL_DRY_THRESHOLD
  ) {
    if (
      controlMode ===
      "AUTO"
    ) {
      return "Tanah kering. Mode AUTO akan menyalakan pompa.";
    }

    return "Tanah kering. Pompa direkomendasikan untuk dinyalakan.";
  }

  if (
    soilMoisture <
    SOIL_WARNING_THRESHOLD
  ) {
    return "Kelembapan tanah mulai rendah, tetapi belum membutuhkan pompa otomatis.";
  }

  return "Kelembapan tanah mencukupi. Pompa tidak diperlukan.";
}

/* =========================================================
   FARM STATUS
   ========================================================= */

export function getFarmStatus(
  item,
  environment
) {
  return {
    soilMoisture:
      Number(
        item?.soil_moisture ??
          0
      ),

    humidity:
      getGlobalHumidity(
        environment
      ),

    soilCondition:
      getSoilCondition(
        item
      ),

    statusClass:
      getGlobalStatusClass(
        item
      ),

    statusLabel:
      getGlobalStatusLabel(
        item
      ),

    recommendedPump:
      getRecommendedPumpStatus(
        item,
        environment
      ),

    weatherStatus:
      getWeatherStatus(
        environment
      ),

    rainDetected:
      isRaining(
        environment
      ),
  };
}