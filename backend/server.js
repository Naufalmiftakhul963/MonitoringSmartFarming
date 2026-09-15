const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");

const supabase = require("./supabaseClient");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(cors());
app.use(express.json());

/* =========================================================
   KONFIGURASI
   ========================================================= */

const SOIL_DRY_THRESHOLD = 25;
const SOIL_WARNING_THRESHOLD = 40;

/* =========================================================
   HELPER
   ========================================================= */

function normalizeControlMode(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function normalizePumpStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

/* =========================================================
   FARM ENVIRONMENT
   ========================================================= */

async function getFarmEnvironment() {
  const {
    data,
    error,
  } = await supabase
    .from("farm_environment")
    .select(`
      id,
      humidity,
      rain_detected,
      weather_status,
      updated_at
    `)
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(
      `Gagal membaca farm_environment: ${error.message}`
    );
  }

  return data;
}

function getWeatherStatus(environment) {
  return environment?.rain_detected
    ? "HUJAN"
    : "CERAH";
}

/* =========================================================
   SOIL CONDITION
   ========================================================= */

function getSoilCondition(
  soilMoisture
) {
  const value = Number(
    soilMoisture ?? 0
  );

  if (
    value <
    SOIL_DRY_THRESHOLD
  ) {
    return "Kering";
  }

  if (
    value <
    SOIL_WARNING_THRESHOLD
  ) {
    return "Mulai Kering";
  }

  return "Cukup Lembap";
}

/* =========================================================
   AUTOMATIC PUMP LOGIC

   HUJAN:
   semua OFF

   CERAH:
   soil < 25 -> ON
   soil >= 25 -> OFF
   ========================================================= */

function getAutomaticPumpStatus(
  sensor,
  environment
) {
  if (
    getWeatherStatus(
      environment
    ) === "HUJAN"
  ) {
    return "OFF";
  }

  const soilMoisture =
    Number(
      sensor?.soil_moisture ??
        0
    );

  return soilMoisture <
    SOIL_DRY_THRESHOLD
    ? "ON"
    : "OFF";
}

/* =========================================================
   MATIKAN SEMUA POMPA
   ========================================================= */

async function turnOffAllPumps() {
  const {
    data,
    error,
  } = await supabase
    .from("sensor_data")
    .update({
      pump_status: "OFF",
    })
    .neq(
      "pump_status",
      "OFF"
    )
    .select(`
      id,
      plot_number,
      area,
      soil_moisture,
      pump_status,
      control_mode
    `);

  if (error) {
    throw new Error(
      `Gagal mematikan semua pompa: ${error.message}`
    );
  }

  return data || [];
}

/* =========================================================
   JALANKAN AUTO CONTROL UNTUK PETAK AUTO
   ========================================================= */

async function syncAutoPumps(
  environment
) {
  const {
    data: sensors,
    error,
  } = await supabase
    .from("sensor_data")
    .select(`
      id,
      plot_number,
      area,
      soil_moisture,
      pump_status,
      control_mode
    `)
    .eq(
      "control_mode",
      "AUTO"
    )
    .order(
      "plot_number",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Gagal membaca petak AUTO: ${error.message}`
    );
  }

  const updatedAreas = [];

  for (
    const sensor of
    sensors || []
  ) {
    const pumpStatus =
      getAutomaticPumpStatus(
        sensor,
        environment
      );

    const {
      data: updated,
      error:
        updateError,
    } = await supabase
      .from("sensor_data")
      .update({
        pump_status:
          pumpStatus,
      })
      .eq(
        "id",
        sensor.id
      )
      .select(`
        id,
        plot_number,
        area,
        soil_moisture,
        pump_status,
        control_mode
      `)
      .single();

    if (updateError) {
      throw new Error(
        `Gagal update ${sensor.area}: ${updateError.message}`
      );
    }

    updatedAreas.push(
      updated
    );
  }

  return updatedAreas;
}

/* =========================================================
   ROOT
   ========================================================= */

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "Smart Farming Backend berjalan.",

      status: "OK",

      irrigation_rule: {
        rain:
          "Rain sensor mendeteksi hujan = semua pompa OFF.",

        clear:
          "Tidak hujan = pompa AUTO mengikuti kelembapan tanah.",

        soil_threshold:
          `${SOIL_DRY_THRESHOLD}%`,
      },

      environment: {
        humidity:
          "Global monitoring",

        rain_sensor:
          "Global monitoring + irrigation override",
      },
    });
  }
);

/* =========================================================
   GET ENVIRONMENT
   ========================================================= */

app.get(
  "/api/environment",
  async (
    req,
    res
  ) => {
    try {
      const environment =
        await getFarmEnvironment();

      res.json({
        id:
          environment.id,

        humidity:
          Number(
            environment.humidity ??
              0
          ),

        rain_detected:
          Boolean(
            environment.rain_detected
          ),

        weather_status:
          getWeatherStatus(
            environment
          ),

        updated_at:
          environment.updated_at,
      });
    } catch (error) {
      console.error(
        "GET /api/environment:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Server error.",
        });
    }
  }
);

/* =========================================================
   PUT RAIN SENSOR

   BODY:
   {
     "rain_detected": true
   }
   ========================================================= */

app.put(
  "/api/environment/rain",
  async (
    req,
    res
  ) => {
    try {
      const {
        rain_detected,
      } = req.body;

      if (
        typeof rain_detected !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            message:
              "rain_detected harus true atau false.",
          });
      }

      const weatherStatus =
        rain_detected
          ? "HUJAN"
          : "CERAH";

      const {
        data:
          environment,
        error,
      } = await supabase
        .from(
          "farm_environment"
        )
        .update({
          rain_detected,

          weather_status:
            weatherStatus,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          1
        )
        .select(`
          id,
          humidity,
          rain_detected,
          weather_status,
          updated_at
        `)
        .single();

      if (error) {
        return res
          .status(500)
          .json({
            message:
              error.message,
          });
      }

      let updatedAreas = [];

      /*
       * HUJAN
       * Semua pompa dipaksa OFF,
       * termasuk mode MANUAL.
       */
      if (rain_detected) {
        updatedAreas =
          await turnOffAllPumps();
      } else {
        /*
         * CERAH lagi.
         *
         * Petak AUTO langsung
         * dihitung ulang.
         *
         * Petak MANUAL tetap pada
         * kondisi terakhirnya.
         *
         * Karena saat hujan tadi
         * dipaksa OFF, MANUAL akan
         * tetap OFF sampai user
         * menyalakannya lagi.
         */
        updatedAreas =
          await syncAutoPumps(
            environment
          );
      }

      res.json({
        message:
          rain_detected
            ? "Hujan terdeteksi. Semua pompa dimatikan."
            : "Hujan berhenti. Petak AUTO dihitung ulang berdasarkan kelembapan tanah.",

        environment,

        updatedAreas,
      });
    } catch (error) {
      console.error(
        "PUT /api/environment/rain:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Server error.",
        });
    }
  }
);

/* =========================================================
   PUT HUMIDITY GLOBAL

   BODY:
   {
     "humidity": 68.1
   }

   Nanti endpoint ini dapat dipakai
   ESP32 / humidity sensor.
   ========================================================= */

app.put(
  "/api/environment/humidity",
  async (
    req,
    res
  ) => {
    try {
      const humidity =
        Number(
          req.body.humidity
        );

      if (
        Number.isNaN(
          humidity
        ) ||
        humidity < 0 ||
        humidity > 100
      ) {
        return res
          .status(400)
          .json({
            message:
              "humidity harus berupa angka 0 sampai 100.",
          });
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "farm_environment"
        )
        .update({
          humidity,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          1
        )
        .select(`
          id,
          humidity,
          rain_detected,
          weather_status,
          updated_at
        `)
        .single();

      if (error) {
        return res
          .status(500)
          .json({
            message:
              error.message,
          });
      }

      res.json({
        message:
          "Kelembapan udara global berhasil diperbarui.",

        environment:
          data,
      });
    } catch (error) {
      console.error(
        "PUT /api/environment/humidity:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Server error.",
        });
    }
  }
);

/* =========================================================
   GET SENSOR DATA
   ========================================================= */

app.get(
  "/api/sensors",
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          "sensor_data"
        )
        .select(`
          id,
          plot_number,
          area,
          soil_moisture,
          pump_status,
          control_mode,
          created_at
        `)
        .order(
          "plot_number",
          {
            ascending: true,
          }
        );

      if (error) {
        return res
          .status(500)
          .json({
            message:
              error.message,
          });
      }

      res.json(
        data || []
      );
    } catch (error) {
      console.error(
        "GET /api/sensors:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Server error.",
        });
    }
  }
);

/* =========================================================
   SUMMARY
   ========================================================= */

app.get(
  "/api/summary",
  async (
    req,
    res
  ) => {
    try {
      const [
        sensorResult,
        environment,
      ] =
        await Promise.all([
          supabase
            .from(
              "sensor_data"
            )
            .select(`
              id,
              plot_number,
              area,
              soil_moisture,
              pump_status,
              control_mode
            `),

          getFarmEnvironment(),
        ]);

      if (
        sensorResult.error
      ) {
        return res
          .status(500)
          .json({
            message:
              sensorResult
                .error
                .message,
          });
      }

      const sensors =
        sensorResult.data ||
        [];

      const totalPetak =
        sensors.length;

      const avgSoilMoisture =
        totalPetak === 0
          ? 0
          : sensors.reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item
                    .soil_moisture ??
                    0
                ),
              0
            ) /
            totalPetak;

      const activePump =
        sensors.filter(
          (item) =>
            normalizePumpStatus(
              item.pump_status
            ) === "ON"
        ).length;

      const autoModeArea =
        sensors.filter(
          (item) =>
            normalizeControlMode(
              item.control_mode
            ) === "AUTO"
        ).length;

      const criticalArea =
        sensors.filter(
          (item) =>
            Number(
              item
                .soil_moisture ??
                0
            ) <
            SOIL_DRY_THRESHOLD
        ).length;

      const warningArea =
        sensors.filter(
          (item) => {
            const soil =
              Number(
                item
                  .soil_moisture ??
                  0
              );

            return (
              soil >=
                SOIL_DRY_THRESHOLD &&
              soil <
                SOIL_WARNING_THRESHOLD
            );
          }
        ).length;

      const normalArea =
        sensors.filter(
          (item) =>
            Number(
              item
                .soil_moisture ??
                0
            ) >=
            SOIL_WARNING_THRESHOLD
        ).length;

      res.json({
        totalPetak,

        avgSoilMoisture:
          Number(
            avgSoilMoisture.toFixed(
              1
            )
          ),

        humidity:
          Number(
            environment.humidity ??
              0
          ),

        activePump,

        autoModeArea,

        criticalArea,

        warningArea,

        normalArea,

        rainDetected:
          Boolean(
            environment.rain_detected
          ),

        weatherStatus:
          getWeatherStatus(
            environment
          ),
      });
    } catch (error) {
      console.error(
        "GET /api/summary:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Server error.",
        });
    }
  }
);

/* =========================================================
   MANUAL PUMP
   ========================================================= */

app.put(
  "/api/pump/:id",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const pumpStatus =
        normalizePumpStatus(
          req.body.pump_status
        );

      if (
        ![
          "ON",
          "OFF",
        ].includes(
          pumpStatus
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "pump_status harus ON atau OFF.",
          });
      }

      const {
        data: sensor,
        error:
          sensorError,
      } = await supabase
        .from(
          "sensor_data"
        )
        .select(`
          id,
          plot_number,
          area,
          soil_moisture,
          pump_status,
          control_mode
        `)
        .eq(
          "id",
          id
        )
        .single();

      if (
        sensorError ||
        !sensor
      ) {
        return res
          .status(404)
          .json({
            message:
              "Data petak tidak ditemukan.",
          });
      }

      if (
        normalizeControlMode(
          sensor.control_mode
        ) === "AUTO"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Pompa tidak dapat dikontrol manual saat mode AUTO.",
          });
      }

      const environment =
        await getFarmEnvironment();

      if (
        environment.rain_detected &&
        pumpStatus === "ON"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Pompa tidak dapat dinyalakan karena rain sensor mendeteksi hujan.",
          });
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "sensor_data"
        )
        .update({
          pump_status:
            pumpStatus,
        })
        .eq(
          "id",
          id
        )
        .select(`
          id,
          plot_number,
          area,
          soil_moisture,
          pump_status,
          control_mode
        `)
        .single();

      if (error) {
        return res
          .status(500)
          .json({
            message:
              error.message,
          });
      }

      res.json({
        message:
          `Pompa ${sensor.area} berhasil diubah menjadi ${pumpStatus}.`,

        data,
      });
    } catch (error) {
      console.error(
        "PUT /api/pump/:id:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Server error.",
        });
    }
  }
);

/* =========================================================
   CONTROL MODE
   ========================================================= */

app.put(
  "/api/control-mode/:id",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const controlMode =
        normalizeControlMode(
          req.body.control_mode
        );

      if (
        ![
          "AUTO",
          "MANUAL",
        ].includes(
          controlMode
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "control_mode harus AUTO atau MANUAL.",
          });
      }

      const {
        data: sensor,
        error:
          sensorError,
      } = await supabase
        .from(
          "sensor_data"
        )
        .select(`
          id,
          plot_number,
          area,
          soil_moisture,
          pump_status,
          control_mode
        `)
        .eq(
          "id",
          id
        )
        .single();

      if (
        sensorError ||
        !sensor
      ) {
        return res
          .status(404)
          .json({
            message:
              "Data petak tidak ditemukan.",
          });
      }

      const environment =
        await getFarmEnvironment();

      const updateData = {
        control_mode:
          controlMode,
      };

      if (
        controlMode ===
        "AUTO"
      ) {
        updateData.pump_status =
          getAutomaticPumpStatus(
            sensor,
            environment
          );
      }

      if (
        environment.rain_detected
      ) {
        updateData.pump_status =
          "OFF";
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "sensor_data"
        )
        .update(
          updateData
        )
        .eq(
          "id",
          id
        )
        .select(`
          id,
          plot_number,
          area,
          soil_moisture,
          pump_status,
          control_mode
        `)
        .single();

      if (error) {
        return res
          .status(500)
          .json({
            message:
              error.message,
          });
      }

      res.json({
        message:
          `Mode ${sensor.area} berhasil diubah menjadi ${controlMode}.`,

        weather_status:
          getWeatherStatus(
            environment
          ),

        data,
      });
    } catch (error) {
      console.error(
        "PUT /api/control-mode/:id:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Server error.",
        });
    }
  }
);

/* =========================================================
   AUTO CONTROL
   ========================================================= */

app.post(
  "/api/auto-control",
  async (
    req,
    res
  ) => {
    try {
      const environment =
        await getFarmEnvironment();

      if (
        environment.rain_detected
      ) {
        const updatedAreas =
          await turnOffAllPumps();

        return res.json({
          message:
            "Hujan terdeteksi. Semua pompa dimatikan.",

          rain_detected:
            true,

          weather_status:
            "HUJAN",

          updatedAreas,
        });
      }

      const updatedAreas =
        await syncAutoPumps(
          environment
        );

      res.json({
        message:
          "Kontrol otomatis berhasil dijalankan.",

        rain_detected:
          false,

        weather_status:
          "CERAH",

        threshold:
          SOIL_DRY_THRESHOLD,

        rule:
          "soil < 25% = ON, soil >= 25% = OFF",

        updatedAreas,
      });
    } catch (error) {
      console.error(
        "POST /api/auto-control:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Server error.",
        });
    }
  }
);

/* =========================================================
   START SERVER
   ========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `Smart Farming Backend berjalan di http://localhost:${PORT}`
    );

    console.log(
      "Rain sensor = global override."
    );

    console.log(
      "Humidity = global monitoring."
    );

    console.log(
      "Soil moisture = per petak."
    );
  }
);