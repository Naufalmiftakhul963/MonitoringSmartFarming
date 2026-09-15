import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Droplets,
  Power,
  Sprout,
} from "lucide-react";

import "./SensorTable.css";

function SensorTable({
  sensors = [],
  getStatusClass,
  getStatusLabel,
}) {
  return (
    <section className="sensor-table-section">

      <div className="sensor-table-header">

        <div className="sensor-table-header-icon">
          <Sprout size={22} />
        </div>

        <div className="sensor-table-header-text">

          <span>
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

      <div className="sensor-table-wrapper">

        <table className="sensor-table">

          <thead>
            <tr>

              <th>
                PETAK
              </th>

              <th>
                <span className="sensor-table-th-content">
                  <Droplets size={14} />
                  KELEMBAPAN TANAH
                </span>
              </th>

              <th>
                <span className="sensor-table-th-content">
                  <Power size={14} />
                  POMPA
                </span>
              </th>

              <th>
                <span className="sensor-table-th-content">
                  <Bot size={14} />
                  MODE
                </span>
              </th>

              <th>
                STATUS
              </th>

            </tr>
          </thead>

          <tbody>

            {sensors.map(
              (item) => {
                const statusClass =
                  getStatusClass(item);

                const statusLabel =
                  getStatusLabel(item);

                const pumpOn =
                  String(
                    item.pump_status || ""
                  ).toUpperCase() === "ON";

                const autoMode =
                  String(
                    item.control_mode || ""
                  ).toUpperCase() === "AUTO";

                return (
                  <tr key={item.id}>

                    <td>
                      <div className="sensor-table-area">

                        <span className="sensor-table-area-dot" />

                        <strong>
                          {item.area}
                        </strong>

                      </div>
                    </td>

                    <td>
                      <div className="sensor-table-soil">

                        <Droplets size={16} />

                        <strong>
                          {Number(
                            item.soil_moisture ?? 0
                          )}
                          %
                        </strong>

                      </div>
                    </td>

                    <td>
                      <span
                        className={`sensor-table-pill pump ${
                          pumpOn
                            ? "on"
                            : "off"
                        }`}
                      >
                        <Power size={13} />

                        {pumpOn
                          ? "ON"
                          : "OFF"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`sensor-table-pill mode ${
                          autoMode
                            ? "auto"
                            : "manual"
                        }`}
                      >
                        <Bot size={13} />

                        {autoMode
                          ? "AUTO"
                          : "MANUAL"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`sensor-table-status ${statusClass}`}
                      >
                        {statusClass === "normal" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <AlertTriangle size={14} />
                        )}

                        {statusLabel}
                      </span>
                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

      <div className="sensor-table-legend">

        <div className="sensor-table-legend-item normal">
          <span />
          Normal
          <strong>
            ≥ 40%
          </strong>
        </div>

        <div className="sensor-table-legend-item warning">
          <span />
          Waspada
          <strong>
            25–39%
          </strong>
        </div>

        <div className="sensor-table-legend-item critical">
          <span />
          Kritis
          <strong>
            &lt; 25%
          </strong>
        </div>

      </div>

    </section>
  );
}

export default SensorTable;