export function getGlobalStatusClass(item) {
  const soil = Number(item.soil_moisture);
  const temperature = Number(item.temperature);
  const humidity = Number(item.humidity);
  const light = Number(item.light);

  if (soil < 25 || temperature > 33 || light < 300) {
    return "critical";
  }

  if (
    soil < 40 ||
    temperature > 31 ||
    humidity > 85 ||
    light > 850
  ) {
    return "warning";
  }

  return "normal";
}

export function getGlobalStatusLabel(item) {
  const status = getGlobalStatusClass(item);

  if (status === "critical") return "Kritis";
  if (status === "warning") return "Waspada";

  return "Normal";
}

export function getRecommendation(item) {
  const soil = Number(item.soil_moisture);
  const temperature = Number(item.temperature);
  const humidity = Number(item.humidity);
  const light = Number(item.light);

  if (soil < 25) {
    return "Tanah terlalu kering. Aktifkan pompa atau gunakan mode AUTO.";
  }

  if (temperature > 33) {
    return "Suhu terlalu tinggi. Aktifkan kipas ventilasi atau gunakan mode AUTO.";
  }

  if (light < 300) {
    return "Intensitas cahaya terlalu rendah. Aktifkan lampu atau gunakan mode AUTO.";
  }

  if (light > 850) {
    return "Intensitas cahaya cukup tinggi. Pantau kondisi tanaman dan suhu petak.";
  }

  if (humidity > 85) {
    return "Kelembaban udara cukup tinggi. Pantau sirkulasi udara.";
  }

  if (soil < 40) {
    return "Kondisi tanah mulai mengering. Siapkan penyiraman jika terus menurun.";
  }

  return "Kondisi petak normal. Tidak diperlukan tindakan khusus.";
}