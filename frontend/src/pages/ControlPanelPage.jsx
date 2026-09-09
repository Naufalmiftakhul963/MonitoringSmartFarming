import {
  Settings,
  Droplets,
  Wind,
  Lightbulb,
  Bot,
  RefreshCw,
} from "lucide-react";

function DeviceControl({
  icon: Icon,
  label,
  status,
  onToggle,
  disabled,
}) {
  return (
    <div className="device-control">
      <div className="device-control-head">
        <div className="device-icon">
          <Icon size={18} />
        </div>

        <div>
          <span>{label}</span>
          <strong className={status === "ON" ? "device-on" : "device-off"}>
            {status}
          </strong>
        </div>
      </div>

      <button
        className="device-action-btn"
        onClick={onToggle}
        disabled={disabled}
      >
        {status === "ON" ? `Matikan ${label}` : `Nyalakan ${label}`}
      </button>
    </div>
  );
}

function ControlPanelPage({
  sensors,
  togglePump,
  toggleFan,
  toggleLamp,
  toggleControlMode,
  runAutoControl,
}) {
  return (
    <div className="page control-page">
      <section className="page-header control-page-header">
        <div>
          <h1>Smart Farming Control Panel</h1>

          <p>
            Kelola pompa irigasi, kipas ventilasi, lampu tanaman, dan mode
            otomatis pada setiap petak lahan.
          </p>
        </div>

        <div className="control-header-actions">
          <button className="auto-run-btn" onClick={runAutoControl}>
            <RefreshCw size={18} />
            Jalankan Kontrol Otomatis
          </button>

          <Settings size={42} />
        </div>
      </section>

      <section className="control-grid">
        {sensors.map((item) => {
          const pumpStatus = item.pump_status || "OFF";
          const fanStatus = item.fan_status || "OFF";
          const lampStatus = item.lamp_status || "OFF";
          const controlMode = item.control_mode || "MANUAL";
          const isAuto = controlMode === "AUTO";

          return (
            <div className="control-card smart-control-card" key={item.id}>
              <div className="control-card-top">
                <div>
                  <h3>{item.area}</h3>

                  <p className="control-card-subtitle">
                    Pengaturan perangkat petak lahan
                  </p>
                </div>

                <button
                  className={isAuto ? "mode-btn auto" : "mode-btn manual"}
                  onClick={() =>
                    toggleControlMode(item.id, controlMode)
                  }
                >
                  <Bot size={16} />
                  {controlMode}
                </button>
              </div>

              <div className="sensor-mini-grid">
                <div>
                  <span>Kelembaban Tanah</span>
                  <strong>{item.soil_moisture}%</strong>
                </div>

                <div>
                  <span>Suhu</span>
                  <strong>{item.temperature}°C</strong>
                </div>

                <div>
                  <span>Kelembaban Udara</span>
                  <strong>{item.humidity}%</strong>
                </div>

                <div>
                  <span>Intensitas Cahaya</span>
                  <strong>{item.light} lux</strong>
                </div>
              </div>

              <div className="device-control-grid">
                <DeviceControl
                  icon={Droplets}
                  label="Pompa"
                  status={pumpStatus}
                  disabled={isAuto}
                  onToggle={() =>
                    togglePump(item.id, pumpStatus)
                  }
                />

                <DeviceControl
                  icon={Wind}
                  label="Kipas"
                  status={fanStatus}
                  disabled={isAuto}
                  onToggle={() =>
                    toggleFan(item.id, fanStatus)
                  }
                />

                <DeviceControl
                  icon={Lightbulb}
                  label="Lampu"
                  status={lampStatus}
                  disabled={isAuto}
                  onToggle={() =>
                    toggleLamp(item.id, lampStatus)
                  }
                />
              </div>

              {isAuto ? (
                <div className="auto-mode-note">
                  Mode otomatis aktif. Status perangkat ditentukan berdasarkan
                  nilai sensor.
                </div>
              ) : (
                <div className="manual-mode-note">
                  Mode manual aktif. Perangkat dapat dikontrol melalui tombol.
                </div>
              )}
            </div>
          );
        })}

        {sensors.length === 0 && (
          <div className="panel">
            <p>Data sensor belum tersedia.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ControlPanelPage;