import {
  Bot,
  CheckCircle2,
  Droplets,
  Power,
  Sprout,
  TriangleAlert,
} from "lucide-react";

import "./SensorTable.css";

/* =========================================================
   HELPERS
   ========================================================= */

function getSoilStatus(soil) {
  const value =
    Number(soil) || 0;

  if (value < 25) {
    return {
      label: "Kritis",
      className: "critical",
      icon: TriangleAlert,
    };
  }

  if (value < 40) {
    return {
      label: "Waspada",
      className: "warning",
      icon: TriangleAlert,
    };
  }

  return {
    label: "Normal",
    className: "normal",
    icon: CheckCircle2,
  };
}

/* =========================================================
   SENSOR TABLE
   ========================================================= */

function SensorTable({
  sensors = [],
}) {
  return (
    <section className="sensor-table-section">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="sensor-table-heading">

        <div className="sensor-table-heading-icon">
          <Sprout size={25} />
        </div>

        <div>

          <span className="sensor-table-eyebrow">
            SENSOR DATA
          </span>

          <h2>
            Data Sensor dan Aktuator Terkini
          </h2>

          <p>
            Monitoring kelembapan tanah,
            status pompa, mode kontrol,
            dan kondisi setiap petak.
          </p>

        </div>

      </div>

      {/* ===================================================
          TABLE
          =================================================== */}

      <div className="sensor-table-wrapper">

        <table className="sensor-table">

          <thead>
            <tr>

              <th>
                <div className="sensor-table-th">
                  <Sprout size={16} />
                  Petak
                </div>
              </th>

              <th>
                <div className="sensor-table-th">
                  <Droplets size={16} />
                  Kelembapan Tanah
                </div>
              </th>

              <th>
                <div className="sensor-table-th">
                  <Power size={16} />
                  Pompa
                </div>
              </th>

              <th>
                <div className="sensor-table-th">
                  <Bot size={16} />
                  Mode
                </div>
              </th>

              <th>
                <div className="sensor-table-th">
                  Status
                </div>
              </th>

            </tr>
          </thead>

          <tbody>

            {sensors.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="sensor-table-empty"
                >
                  Belum ada data sensor.
                </td>
              </tr>
            ) : (
              sensors.map(
                (sensor, index) => {
                  const soil =
                    Number(
                      sensor?.soil_moisture
                    ) || 0;

                  const status =
                    getSoilStatus(
                      soil
                    );

                  const StatusIcon =
                    status.icon;

                  const pumpOn =
                    String(
                      sensor?.pump_status ||
                      ""
                    ).toUpperCase() ===
                    "ON";

                  const autoMode =
                    String(
                      sensor?.control_mode ||
                      ""
                    ).toUpperCase() ===
                    "AUTO";

                  return (
                    <tr
                      key={
                        sensor?.id ??
                        sensor?.plot_number ??
                        index
                      }
                    >

                      {/* PETAK */}

                      <td>

                        <div className="sensor-plot-cell">

                          <span className="sensor-plot-dot" />

                          <strong>
                            Petak{" "}
                            {
                              sensor?.plot_number ??
                              index + 1
                            }
                          </strong>

                        </div>

                      </td>

                      {/* SOIL */}

                      <td>

                        <div className="sensor-soil-cell">

                          <Droplets size={18} />

                          <strong>
                            {soil}%
                          </strong>

                          <div className="sensor-soil-progress">

                            <span
                              style={{
                                width:
                                  `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      soil
                                    )
                                  )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      {/* PUMP */}

                      <td>

                        <span
                          className={
                            pumpOn
                              ? "sensor-pill pump on"
                              : "sensor-pill pump off"
                          }
                        >

                          <Power size={15} />

                          {pumpOn
                            ? "ON"
                            : "OFF"}

                        </span>

                      </td>

                      {/* MODE */}

                      <td>

                        <span
                          className={
                            autoMode
                              ? "sensor-pill mode auto"
                              : "sensor-pill mode manual"
                          }
                        >

                          <Bot size={15} />

                          {autoMode
                            ? "AUTO"
                            : "MANUAL"}

                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            `sensor-pill status ${status.className}`
                          }
                        >

                          <StatusIcon
                            size={15}
                          />

                          {status.label}

                        </span>

                      </td>

                    </tr>
                  );
                }
              )
            )}

          </tbody>

        </table>

      </div>

      {/* ===================================================
          LEGEND
          =================================================== */}

      <div className="sensor-table-legend">

        <span>
          Status tanah:
        </span>

        <div>
          <i className="legend-dot critical" />
          Kritis &lt; 25%
        </div>

        <div>
          <i className="legend-dot warning" />
          Waspada 25–39%
        </div>

        <div>
          <i className="legend-dot normal" />
          Normal ≥ 40%
        </div>

      </div>

    </section>
  );
}

export default SensorTable;