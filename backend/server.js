const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ========================================
// FUNGSI BANTUAN
// ========================================

// Menentukan status perangkat berdasarkan kondisi sensor
function getAutomaticStatuses(sensor) {
  const soilMoisture = Number(sensor.soil_moisture);
  const temperature = Number(sensor.temperature);
  const light = Number(sensor.light);

  return {
    // Pompa menyala jika tanah terlalu kering
    pump_status: soilMoisture < 25 ? "ON" : "OFF",

    // Kipas menyala jika suhu terlalu tinggi
    fan_status: temperature > 33 ? "ON" : "OFF",

    // Lampu menyala jika intensitas cahaya terlalu rendah
    lamp_status: light < 300 ? "ON" : "OFF",
  };
}

// ========================================
// CEK SERVER
// ========================================

app.get("/", (req, res) => {
  res.send("Smart Farming Backend is running");
});

// ========================================
// AMBIL DATA SENSOR
// ========================================

// Ambil seluruh data sensor
app.get("/api/sensors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Ambil ringkasan dashboard
app.get("/api/summary", async (req, res) => {
  try {
    const { data, error } = await supabase.from("sensor_data").select("*");

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const totalPetak = data.length;

    const avgSoilMoisture =
      totalPetak === 0
        ? 0
        : data.reduce(
            (sum, item) => sum + Number(item.soil_moisture),
            0
          ) / totalPetak;

    const maxTemperature =
      totalPetak === 0
        ? 0
        : Math.max(...data.map((item) => Number(item.temperature)));

    const activePump = data.filter(
      (item) => item.pump_status === "ON"
    ).length;

    const activeFan = data.filter(
      (item) => item.fan_status === "ON"
    ).length;

    const activeLamp = data.filter(
      (item) => item.lamp_status === "ON"
    ).length;

    const autoModeArea = data.filter(
      (item) => item.control_mode === "AUTO"
    ).length;

    const criticalArea = data.filter(
      (item) =>
        Number(item.soil_moisture) < 25 ||
        Number(item.temperature) > 33
    ).length;

    res.json({
      totalPetak,
      avgSoilMoisture: avgSoilMoisture.toFixed(1),
      maxTemperature,
      activePump,
      activeFan,
      activeLamp,
      autoModeArea,
      criticalArea,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ========================================
// KONTROL MANUAL PERANGKAT
// ========================================

// Update status pompa
app.put("/api/pump/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { pump_status } = req.body;

    if (!["ON", "OFF"].includes(pump_status)) {
      return res.status(400).json({
        message: "Status pompa harus ON atau OFF",
      });
    }

    const { data, error } = await supabase
      .from("sensor_data")
      .update({ pump_status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      message: "Status pompa berhasil diubah",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update status kipas
app.put("/api/fan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fan_status } = req.body;

    if (!["ON", "OFF"].includes(fan_status)) {
      return res.status(400).json({
        message: "Status kipas harus ON atau OFF",
      });
    }

    const { data, error } = await supabase
      .from("sensor_data")
      .update({ fan_status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      message: "Status kipas berhasil diubah",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update status lampu
app.put("/api/lamp/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { lamp_status } = req.body;

    if (!["ON", "OFF"].includes(lamp_status)) {
      return res.status(400).json({
        message: "Status lampu harus ON atau OFF",
      });
    }

    const { data, error } = await supabase
      .from("sensor_data")
      .update({ lamp_status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      message: "Status lampu berhasil diubah",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ========================================
// MODE AUTO / MANUAL
// ========================================

// Ubah mode kontrol satu petak
app.put("/api/control-mode/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { control_mode } = req.body;

    if (!["AUTO", "MANUAL"].includes(control_mode)) {
      return res.status(400).json({
        message: "Mode kontrol harus AUTO atau MANUAL",
      });
    }

    const { data: sensor, error: findError } = await supabase
      .from("sensor_data")
      .select("*")
      .eq("id", id)
      .single();

    if (findError) {
      return res.status(500).json({ message: findError.message });
    }

    let updateData = { control_mode };

    // Jika AUTO dipilih, status perangkat langsung disesuaikan
    if (control_mode === "AUTO") {
      updateData = {
        ...updateData,
        ...getAutomaticStatuses(sensor),
      };
    }

    const { data, error } = await supabase
      .from("sensor_data")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      message: `Mode kontrol berhasil diubah menjadi ${control_mode}`,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Jalankan ulang kontrol otomatis untuk seluruh petak AUTO
app.post("/api/auto-control", async (req, res) => {
  try {
    const { data: sensors, error: findError } = await supabase
      .from("sensor_data")
      .select("*")
      .eq("control_mode", "AUTO");

    if (findError) {
      return res.status(500).json({ message: findError.message });
    }

    const updatedAreas = [];

    for (const sensor of sensors) {
      const automaticStatuses = getAutomaticStatuses(sensor);

      const { error: updateError } = await supabase
        .from("sensor_data")
        .update(automaticStatuses)
        .eq("id", sensor.id);

      if (updateError) {
        return res.status(500).json({
          message: updateError.message,
        });
      }

      updatedAreas.push({
        id: sensor.id,
        area: sensor.area,
        ...automaticStatuses,
      });
    }

    res.json({
      message: "Kontrol otomatis berhasil dijalankan",
      updatedAreas,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ========================================
// JALANKAN SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});