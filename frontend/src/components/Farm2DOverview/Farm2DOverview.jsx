import { useMemo, useState } from "react";
import {
  Bot,
  CloudRain,
  Droplets,
  Power,
  Sprout,
  Sun,
  Wind,
} from "lucide-react";

import {
  getGlobalStatusClass,
  getGlobalStatusLabel,
  getWeatherStatus,
  isRaining,
} from "../../utils/farmUtils";

import "./Farm2DOverview.css";

const PLOT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function Farm2DOverview({ sensors = [], environment }) {
  const [selectedPlot, setSelectedPlot] = useState(null);

  const raining = isRaining(environment);
  const weatherStatus = getWeatherStatus(environment);
  const humidity = Number(environment?.humidity ?? 0);

  const plots = useMemo(() => {
    return PLOT_ORDER.map((plotNumber) => {
      const sensor = sensors.find(
        (item) => Number(item.plot_number) === plotNumber
      );

      return {
        id: sensor?.id ?? `plot-${plotNumber}`,
        plot_number: plotNumber,
        area: sensor?.area ?? `Petak ${plotNumber}`,
        soil_moisture: Number(sensor?.soil_moisture ?? 0),
        pump_status: raining ? "OFF" : sensor?.pump_status ?? "OFF",
        control_mode: sensor?.control_mode ?? "AUTO",
        raw: sensor,
      };
    });
  }, [sensors, raining]);

  const activePlot =
    plots.find((plot) => plot.plot_number === selectedPlot) ?? null;

  const renderPlot = (plot, extraClass = "") => {
    const sensorForStatus = plot.raw ?? {
      soil_moisture: plot.soil_moisture,
    };

    const statusClass = getGlobalStatusClass(sensorForStatus);
    const statusLabel = getGlobalStatusLabel(sensorForStatus);
    const pumpOn = plot.pump_status === "ON";
    const isSelected = selectedPlot === plot.plot_number;

    return (
      <button
        type="button"
        key={plot.plot_number}
        className={`farm2d-plot ${statusClass} ${extraClass} ${
          isSelected ? "selected" : ""
        }`}
        onClick={() =>
          setSelectedPlot((current) =>
            current === plot.plot_number ? null : plot.plot_number
          )
        }
        aria-pressed={isSelected}
      >
        <div className="farm2d-plot-top">
          <span className="farm2d-plot-number">
            PETAK {plot.plot_number}
          </span>

          <span className={`farm2d-status-dot ${statusClass}`} />
        </div>

        <div className="farm2d-crop-lines" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="farm2d-plot-bottom">
          <div>
            <Droplets size={15} />
            <strong>{plot.soil_moisture}%</strong>
          </div>

          <span className={`farm2d-pump ${pumpOn ? "on" : "off"}`}>
            <Power size={13} />
            {plot.pump_status}
          </span>
        </div>

        <span className={`farm2d-condition ${statusClass}`}>
          {statusLabel}
        </span>
      </button>
    );
  };

  return (
    <div className="farm2d-shell">
      <div className="farm2d-environment-strip">
        <div>
          {raining ? <CloudRain size={19} /> : <Sun size={19} />}
          <span>Cuaca</span>
          <strong>{weatherStatus}</strong>
        </div>

        <div>
          <Wind size={19} />
          <span>Humidity Global</span>
          <strong>{humidity}%</strong>
        </div>

        <div>
          <Sprout size={19} />
          <span>Area Monitoring</span>
          <strong>11 Petak</strong>
        </div>
      </div>

      <div className="farm2d-map-wrap">
        <div className="farm2d-map-header">
          <div>
            <span>SMART FARM • TOP VIEW</span>
            <strong>Denah lahan 2D</strong>
          </div>

          <div className="farm2d-legend">
            <span><i className="normal" /> Normal</span>
            <span><i className="warning" /> Waspada</span>
            <span><i className="critical" /> Kritis</span>
          </div>
        </div>

        <div className="farm2d-map">
          <div className="farm2d-field-decoration left" aria-hidden="true">
            <Sprout size={22} />
          </div>

          <div className="farm2d-field-decoration right" aria-hidden="true">
            <Droplets size={22} />
          </div>

          <div className="farm2d-row farm2d-row-one">
            {renderPlot(plots[0], "featured")}
          </div>

          <div className="farm2d-path-label">JALUR UTAMA</div>

          <div className="farm2d-row farm2d-row-five">
            {plots.slice(1, 6).map((plot) => renderPlot(plot))}
          </div>

          <div className="farm2d-path-line" aria-hidden="true" />

          <div className="farm2d-row farm2d-row-five">
            {plots.slice(6, 11).map((plot) => renderPlot(plot))}
          </div>

          <div className="farm2d-utility-row">
            <div className="farm2d-utility-card">
              <Droplets size={17} />
              <span>Water Tank</span>
            </div>

            <div className="farm2d-utility-card">
              <Bot size={17} />
              <span>IoT Gateway</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`farm2d-detail ${activePlot ? "visible" : ""}`}>
        {activePlot ? (
          <>
            <div className="farm2d-detail-heading">
              <div>
                <span>DETAIL PETAK</span>
                <h3>Petak {activePlot.plot_number}</h3>
              </div>

              <button type="button" onClick={() => setSelectedPlot(null)}>
                Tutup
              </button>
            </div>

            <div className="farm2d-detail-grid">
              <div>
                <Droplets size={18} />
                <span>Soil Moisture</span>
                <strong>{activePlot.soil_moisture}%</strong>
              </div>

              <div>
                <Power size={18} />
                <span>Status Pompa</span>
                <strong>{activePlot.pump_status}</strong>
              </div>

              <div>
                <Bot size={18} />
                <span>Mode Kontrol</span>
                <strong>{activePlot.control_mode}</strong>
              </div>
            </div>
          </>
        ) : (
          <p>Klik salah satu petak untuk melihat detail singkat.</p>
        )}
      </div>
    </div>
  );
}

export default Farm2DOverview;
