import {
  AlertTriangle,
  Bot,
  CloudRain,
  Droplets,
  Power,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Sun,
  Wind,
} from "lucide-react";

import {
  getSoilCondition,
  getWeatherStatus,
  isRaining,
} from "../utils/farmUtils";

import "./ControlPanelPage.css";

function ControlPanelPage({
  sensors = [],
  summary,
  environment,
  togglePump,
  toggleControlMode,
  runAutoControl,
  updateRainSensor,
  updateHumidity,
}) {
  const raining =
    isRaining(environment);

  const weatherStatus =
    getWeatherStatus(environment);

  const humidity =
    Number(
      environment?.humidity ?? 0
    );

  const WeatherIcon =
    raining
      ? CloudRain
      : Sun;

  async function handleRainToggle() {
    await updateRainSensor(
      !raining
    );
  }

  async function handleHumidityChange(
    event
  ) {
    const value =
      Number(
        event.target.value
      );

    await updateHumidity(
      value
    );
  }

  return (
    <div className="control-shell">

      {/* ===================================================
          HERO
          =================================================== */}

      <section className="control-hero">

        <div>
          <span className="control-eyebrow">
            <Settings2 size={16} />
            SMART FARM CONTROL
          </span>

          <h1>
            Control Panel
          </h1>

          <p>
            Kelola mode AUTO/MANUAL,
            pompa irigasi, rain sensor,
            dan kondisi lingkungan global
            dari satu panel.
          </p>
        </div>

        <div className="control-hero-status">

          <WeatherIcon
            size={30}
          />

          <div>
            <span>
              Kondisi Global
            </span>

            <strong>
              {weatherStatus}
            </strong>
          </div>

        </div>

      </section>

      {/* ===================================================
          GLOBAL ENVIRONMENT
          =================================================== */}

      <section className="control-global-grid">

        <article
          className={`control-global-card ${
            raining
              ? "rain"
              : "clear"
          }`}
        >

          <div className="control-global-card-icon">
            <WeatherIcon
              size={24}
            />
          </div>

          <div className="control-global-card-content">

            <span>
              Rain Sensor
            </span>

            <strong>
              {weatherStatus}
            </strong>

            <p>
              {raining
                ? "Hujan terdeteksi. Semua pompa dipaksa OFF."
                : "Tidak ada hujan. Kontrol irigasi berjalan normal."}
            </p>

          </div>

          <button
            type="button"
            className={`control-rain-button ${
              raining
                ? "to-clear"
                : "to-rain"
            }`}
            onClick={
              handleRainToggle
            }
          >
            {raining
              ? "Set CERAH"
              : "Simulasi HUJAN"}
          </button>

        </article>

        <article className="control-global-card humidity">

          <div className="control-global-card-icon">
            <Wind
              size={24}
            />
          </div>

          <div className="control-global-card-content">

            <span>
              Kelembapan Udara
            </span>

            <strong>
              {humidity}%
            </strong>

            <p>
              Nilai humidity global
              untuk seluruh area pertanian.
            </p>

            <div className="control-humidity-control">

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={humidity}
                onChange={
                  handleHumidityChange
                }
              />

              <span>
                {humidity}%
              </span>

            </div>

          </div>

        </article>

      </section>

      {/* ===================================================
          SUMMARY
          =================================================== */}

      <section className="control-summary-grid">

        <article className="control-summary-card">

          <div className="control-summary-icon green">
            <Power
              size={21}
            />
          </div>

          <div>
            <span>
              Pompa Aktif
            </span>

            <strong>
              {raining
                ? 0
                : summary?.activePump ?? 0}
            </strong>
          </div>

        </article>

        <article className="control-summary-card">

          <div className="control-summary-icon lime">
            <Bot
              size={21}
            />
          </div>

          <div>
            <span>
              Mode AUTO
            </span>

            <strong>
              {summary?.autoModeArea ?? 0}
            </strong>
          </div>

        </article>

        <article className="control-summary-card">

          <div className="control-summary-icon red">
            <AlertTriangle
              size={21}
            />
          </div>

          <div>
            <span>
              Area Kritis
            </span>

            <strong>
              {summary?.criticalArea ?? 0}
            </strong>
          </div>

        </article>

      </section>

      {/* ===================================================
          AUTO CONTROL
          =================================================== */}

      <section className="control-auto-panel">

        <div className="control-section-heading">

          <div>

            <span>
              AUTO CONTROL
            </span>

            <h2>
              Jalankan Kontrol Otomatis
            </h2>

            <p>
              Saat CERAH, petak AUTO akan
              mengikuti nilai soil moisture.
              Saat HUJAN, seluruh pompa
              otomatis dimatikan.
            </p>

          </div>

          <button
            type="button"
            onClick={
              runAutoControl
            }
          >
            <RefreshCw size={16} />
            Jalankan AUTO
          </button>

        </div>

        <div className="control-rule-grid">

          <div className="control-rule-card rain">

            <CloudRain
              size={20}
            />

            <span>
              HUJAN
            </span>

            <strong>
              Semua OFF
            </strong>

          </div>

          <div className="control-rule-card dry">

            <Droplets
              size={20}
            />

            <span>
              CERAH + Soil &lt; 25%
            </span>

            <strong>
              Pompa ON
            </strong>

          </div>

          <div className="control-rule-card safe">

            <Droplets
              size={20}
            />

            <span>
              CERAH + Soil ≥ 25%
            </span>

            <strong>
              Pompa OFF
            </strong>

          </div>

        </div>

      </section>

      {/* ===================================================
          PETAK CONTROL
          =================================================== */}

      <section className="control-section">

        <div className="control-section-heading">

          <div>

            <span>
              PETAK CONTROL
            </span>

            <h2>
              Kontrol Setiap Petak
            </h2>

            <p>
              Ubah mode kontrol dan
              status pompa pada tiap petak.
            </p>

          </div>

          <SlidersHorizontal
            size={24}
          />

        </div>

        <div className="control-plot-grid">

          {sensors.map(
            (item) => {
              const pumpOn =
                String(
                  item.pump_status || ""
                ).toUpperCase() === "ON";

              const autoMode =
                String(
                  item.control_mode || ""
                ).toUpperCase() === "AUTO";

              const soil =
                Number(
                  item.soil_moisture ?? 0
                );

              const soilCondition =
                getSoilCondition(
                  item
                );

              const manualOnDisabled =
                raining &&
                !pumpOn;

              return (
                <article
                  className="control-plot-card"
                  key={item.id}
                >

                  <div className="control-plot-header">

                    <div>

                      <span>
                        PETAK
                      </span>

                      <h3>
                        {item.area}
                      </h3>

                    </div>

                    <div
                      className={`control-mode-badge ${
                        autoMode
                          ? "auto"
                          : "manual"
                      }`}
                    >
                      <Bot
                        size={13}
                      />

                      {autoMode
                        ? "AUTO"
                        : "MANUAL"}
                    </div>

                  </div>

                  <div className="control-plot-soil">

                    <div className="control-plot-soil-icon">
                      <Droplets
                        size={21}
                      />
                    </div>

                    <div>

                      <span>
                        Soil Moisture
                      </span>

                      <strong>
                        {soil}%
                      </strong>

                      <p>
                        {soilCondition}
                      </p>

                    </div>

                  </div>

                  <div className="control-plot-status">

                    <span>
                      Status Pompa
                    </span>

                    <strong
                      className={
                        pumpOn
                          ? "on"
                          : "off"
                      }
                    >
                      {pumpOn
                        ? "ON"
                        : "OFF"}
                    </strong>

                  </div>

                  <div className="control-plot-actions">

                    <button
                      type="button"
                      className="control-mode-button"
                      onClick={() =>
                        toggleControlMode(
                          item.id,
                          item.control_mode
                        )
                      }
                    >
                      <Bot
                        size={15}
                      />

                      {autoMode
                        ? "Ubah ke MANUAL"
                        : "Ubah ke AUTO"}
                    </button>

                    <button
                      type="button"
                      className={`control-pump-button ${
                        pumpOn
                          ? "off"
                          : "on"
                      }`}
                      disabled={
                        autoMode ||
                        manualOnDisabled
                      }
                      onClick={() =>
                        togglePump(
                          item.id,
                          item.pump_status
                        )
                      }
                    >
                      <Power
                        size={15}
                      />

                      {pumpOn
                        ? "Matikan Pompa"
                        : "Nyalakan Pompa"}
                    </button>

                  </div>

                  {autoMode && (
                    <p className="control-plot-note">
                      Pompa dikontrol otomatis
                      oleh sistem.
                    </p>
                  )}

                  {raining &&
                    !pumpOn && (
                      <p className="control-plot-note rain">
                        Pompa tidak dapat
                        dinyalakan saat hujan.
                      </p>
                    )}

                </article>
              );
            }
          )}

        </div>

      </section>

    </div>
  );
}

export default ControlPanelPage;