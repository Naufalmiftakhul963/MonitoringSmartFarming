import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle,
  CloudSun,
  Cpu,
  Database,
  Droplets,
  Gauge,
  Lightbulb,
  Power,
  RefreshCw,
  Sprout,
  Thermometer,
  TrendingUp,
  Wind,
} from "lucide-react";

import Farm3DModel from "../components/Farm3DModel";
import SensorTable from "../components/SensorTable";

import {
  getGlobalStatusClass,
  getGlobalStatusLabel,
  getRecommendation,
} from "../utils/farmUtils";

import "./DashboardPage.css";

// ========================================
// FUNGSI BANTUAN STATISTIK
// ========================================

function getAverage(data, key) {
  if (!data.length) return 0;

  const total = data.reduce(
    (sum, item) => sum + Number(item[key] || 0),
    0
  );

  return (total / data.length).toFixed(1);
}

function getMinimum(data, key) {
  if (!data.length) return 0;

  return Math.min(
    ...data.map((item) => Number(item[key] || 0))
  );
}

function getMaximum(data, key) {
  if (!data.length) return 0;

  return Math.max(
    ...data.map((item) => Number(item[key] || 0))
  );
}

// ========================================
// TOOLTIP GRAFIK
// ========================================

function ModernTooltip({
  active,
  payload,
  label,
  title,
  unit = "",
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="dashboard-tooltip">
      <span>{label}</span>

      <strong>
        {title}: {payload[0].value}
        {unit}
      </strong>
    </div>
  );
}

// ========================================
// HEADER SETIAP GRAFIK
// ========================================

function ChartHeader({
  icon: Icon,
  title,
  description,
  sensors,
  dataKey,
  unit,
  tone,
}) {
  return (
    <div className="dashboard-chart-header">
      <div className="dashboard-chart-heading">
        <div className={`dashboard-chart-icon ${tone}`}>
          <Icon size={20} />
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="dashboard-chart-stats">
        <div>
          <span>MIN</span>

          <strong>
            {getMinimum(sensors, dataKey)}
            {unit}
          </strong>
        </div>

        <div>
          <span>RATA-RATA</span>

          <strong>
            {getAverage(sensors, dataKey)}
            {unit}
          </strong>
        </div>

        <div>
          <span>MAKS</span>

          <strong>
            {getMaximum(sensors, dataKey)}
            {unit}
          </strong>
        </div>
      </div>
    </div>
  );
}

// ========================================
// DASHBOARD PAGE
// ========================================

function DashboardPage({
  sensors,
  summary,
  lastUpdate,
  fetchData,
}) {
  const statusData = [
    {
      name: "Normal",
      value: sensors.filter(
        (item) => getGlobalStatusClass(item) === "normal"
      ).length,
    },
    {
      name: "Waspada",
      value: sensors.filter(
        (item) => getGlobalStatusClass(item) === "warning"
      ).length,
    },
    {
      name: "Kritis",
      value: sensors.filter(
        (item) => getGlobalStatusClass(item) === "critical"
      ).length,
    },
  ];

  const criticalSensors = sensors.filter(
    (item) => getGlobalStatusClass(item) === "critical"
  );

  const summaryCards = summary
    ? [
        {
          label: "Total Petak",
          value: summary.totalPetak,
          caption: "Area lahan terpantau",
          icon: Sprout,
          tone: "green",
        },
        {
          label: "Rata-rata Tanah",
          value: `${summary.avgSoilMoisture}%`,
          caption: "Kelembaban keseluruhan",
          icon: Droplets,
          tone: "blue",
        },
        {
          label: "Suhu Tertinggi",
          value: `${summary.maxTemperature}°C`,
          caption: "Suhu maksimum petak",
          icon: Thermometer,
          tone: "orange",
        },
        {
          label: "Pompa Aktif",
          value: summary.activePump,
          caption: "Pompa irigasi menyala",
          icon: Power,
          tone: "purple",
        },
        {
          label: "Kipas Aktif",
          value: summary.activeFan,
          caption: "Ventilasi sedang aktif",
          icon: Wind,
          tone: "sky",
        },
        {
          label: "Lampu Aktif",
          value: summary.activeLamp,
          caption: "Lampu tanaman menyala",
          icon: Lightbulb,
          tone: "amber",
        },
        {
          label: "Mode AUTO",
          value: summary.autoModeArea,
          caption: "Petak dikontrol otomatis",
          icon: Bot,
          tone: "lime",
        },
        {
          label: "Area Kritis",
          value: summary.criticalArea,
          caption: "Memerlukan perhatian",
          icon: AlertTriangle,
          tone: "red",
        },
      ]
    : [];

  return (
    <div className="dashboard-shell">
      {/* ========================================
          HERO DASHBOARD
      ======================================== */}

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-eyebrow">
            <Sprout size={17} />
            Smart Farming IoT Dashboard
          </div>

          <h1>
            Monitoring dan Kontrol
            <br />
            Lahan Pertanian
          </h1>

          <p>
            Pantau kondisi sensor, status aktuator, visualisasi lahan 3D,
            dan sistem otomatis pada setiap petak secara terintegrasi.
          </p>

          <div className="dashboard-tech-list">
            <span>
              <Database size={15} />
              Supabase Database
            </span>

            <span>
              <Cpu size={15} />
              Node.js Express
            </span>

            <span>
              <Activity size={15} />
              React Monitoring
            </span>
          </div>
        </div>

        <div className="dashboard-live-panel">
          <div className="dashboard-live-label">
            <span></span>
            LIVE MONITORING
          </div>

          <Activity size={38} />

          <h3>Sistem Aktif</h3>

          <p>
            Update terakhir
            <strong>{lastUpdate || "-"}</strong>
          </p>

          <button onClick={fetchData}>
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </section>

      {/* ========================================
          SUMMARY CARD
      ======================================== */}

      {summary && (
        <section className="dashboard-summary-grid">
          {summaryCards.map(
            ({
              label,
              value,
              caption,
              icon: Icon,
              tone,
            }) => (
              <article
                className="dashboard-summary-card"
                key={label}
              >
                <div className={`dashboard-summary-icon ${tone}`}>
                  <Icon size={23} />
                </div>

                <div>
                  <p>{label}</p>
                  <h2>{value}</h2>
                  <span>{caption}</span>
                </div>
              </article>
            )
          )}
        </section>
      )}

      {/* ========================================
          VISUAL 3D DAN ALERT
      ======================================== */}

      <section className="dashboard-primary-grid">
        <article className="dashboard-panel dashboard-3d-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-section-label">
                VISUAL MONITORING
              </span>

              <h2>Denah Visual Petak Lahan 3D</h2>

              <p>
                Model interaktif yang mengikuti nilai sensor dan status
                aktuator pada setiap petak.
              </p>
            </div>

            <div className="dashboard-header-badge">
              <Gauge size={15} />
              Interactive Model
            </div>
          </div>

          <Farm3DModel sensors={sensors} />
        </article>

        <article className="dashboard-panel dashboard-alert-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-section-label">
                EARLY WARNING
              </span>

              <h2>Alert Kondisi Lahan</h2>

              <p>
                Area yang membutuhkan perhatian lebih lanjut.
              </p>
            </div>

            <div className="dashboard-alert-count">
              {criticalSensors.length}
            </div>
          </div>

          {criticalSensors.length === 0 ? (
            <div className="dashboard-safe-alert">
              <CheckCircle size={23} />

              <div>
                <strong>Seluruh petak aman</strong>
                <p>Tidak ditemukan kondisi kritis.</p>
              </div>
            </div>
          ) : (
            <div className="dashboard-alert-list">
              {criticalSensors.map((item) => (
                <div
                  className="dashboard-alert-item"
                  key={item.id}
                >
                  <AlertTriangle size={18} />

                  <div>
                    <strong>
                      {item.area} perlu diperhatikan
                    </strong>

                    <p>{getRecommendation(item)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* ========================================
          STATUS AKTUATOR
      ======================================== */}

      <section className="dashboard-device-grid">
        <article className="dashboard-device-card pump">
          <div className="dashboard-device-icon">
            <Power size={22} />
          </div>

          <div>
            <span>Pompa Irigasi</span>
            <strong>{summary?.activePump ?? 0} Aktif</strong>
          </div>
        </article>

        <article className="dashboard-device-card fan">
          <div className="dashboard-device-icon">
            <Wind size={22} />
          </div>

          <div>
            <span>Kipas Ventilasi</span>
            <strong>{summary?.activeFan ?? 0} Aktif</strong>
          </div>
        </article>

        <article className="dashboard-device-card lamp">
          <div className="dashboard-device-icon">
            <Lightbulb size={22} />
          </div>

          <div>
            <span>Lampu Tanaman</span>
            <strong>{summary?.activeLamp ?? 0} Aktif</strong>
          </div>
        </article>

        <article className="dashboard-device-card auto">
          <div className="dashboard-device-icon">
            <Bot size={22} />
          </div>

          <div>
            <span>Kontrol Otomatis</span>
            <strong>
              {summary?.autoModeArea ?? 0} Petak AUTO
            </strong>
          </div>
        </article>
      </section>

      {/* ========================================
          DISTRIBUSI STATUS
      ======================================== */}

      <section className="dashboard-status-section">
        <div className="dashboard-status-info">
          <div className="dashboard-status-header">
            <div>
              <span className="dashboard-section-label">
                RINGKASAN KONDISI
              </span>

              <h2>Distribusi Status Lahan</h2>

              <p>
                Kondisi seluruh petak berdasarkan kelembaban tanah,
                suhu, dan intensitas cahaya.
              </p>
            </div>

            <div className="dashboard-petak-badge">
              <Sprout size={16} />
              {sensors.length} Petak Terpantau
            </div>
          </div>

          <div className="dashboard-status-cards">
            <article className="dashboard-status-card normal">
              <div className="dashboard-status-icon">
                <CheckCircle size={21} />
              </div>

              <div>
                <span>Normal</span>
                <strong>{statusData[0].value}</strong>
                <p>Kondisi petak aman</p>
              </div>
            </article>

            <article className="dashboard-status-card warning">
              <div className="dashboard-status-icon">
                <AlertTriangle size={21} />
              </div>

              <div>
                <span>Waspada</span>
                <strong>{statusData[1].value}</strong>
                <p>Perlu pemantauan</p>
              </div>
            </article>

            <article className="dashboard-status-card critical">
              <div className="dashboard-status-icon">
                <AlertTriangle size={21} />
              </div>

              <div>
                <span>Kritis</span>
                <strong>{statusData[2].value}</strong>
                <p>Perlu tindak lanjut</p>
              </div>
            </article>
          </div>
        </div>

        <div className="dashboard-donut-card">
          <div className="dashboard-donut-wrapper">
            <ResponsiveContainer width="100%" height={285}>
              <PieChart>
                <defs>
                  <linearGradient
                    id="normalGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#86efac" />
                  </linearGradient>

                  <linearGradient
                    id="warningGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#fde68a" />
                  </linearGradient>

                  <linearGradient
                    id="criticalGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#fca5a5" />
                  </linearGradient>
                </defs>

                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={76}
                  outerRadius={111}
                  paddingAngle={7}
                  cornerRadius={15}
                  stroke="none"
                >
                  <Cell fill="url(#normalGradient)" />
                  <Cell fill="url(#warningGradient)" />
                  <Cell fill="url(#criticalGradient)" />
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="dashboard-donut-center">
              <strong>{sensors.length}</strong>
              <span>Total Petak</span>
            </div>
          </div>

          <div className="dashboard-donut-caption">
            <span></span>
            Data terkini dari Supabase
          </div>
        </div>
      </section>

      {/* ========================================
          SENSOR ANALYTICS
      ======================================== */}

      <section className="dashboard-analytics-section">
        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-section-label">
              SENSOR ANALYTICS
            </span>

            <h2>Analisis Kondisi Setiap Petak</h2>

            <p>
              Grafik interaktif berdasarkan data terbaru dari database.
            </p>
          </div>

          <div className="dashboard-live-data">
            <span></span>
            Live Data
          </div>
        </div>

        <div className="dashboard-chart-grid">
          {/* KELEMBABAN TANAH */}

          <article className="dashboard-chart-card">
            <ChartHeader
              icon={Droplets}
              title="Kelembaban Tanah"
              description="Persentase kadar air pada setiap area."
              sensors={sensors}
              dataKey="soil_moisture"
              unit="%"
              tone="green"
            />

            <ResponsiveContainer width="100%" height={285}>
              <AreaChart
                data={sensors}
                margin={{
                  top: 18,
                  right: 12,
                  left: -14,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="soilGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#16a34a"
                      stopOpacity={0.42}
                    />

                    <stop
                      offset="100%"
                      stopColor="#16a34a"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 6"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="area"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  content={
                    <ModernTooltip
                      title="Tanah"
                      unit="%"
                    />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="soil_moisture"
                  stroke="#16a34a"
                  strokeWidth={4}
                  fill="url(#soilGradient)"
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "#16a34a",
                    strokeWidth: 3,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#16a34a",
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </article>

          {/* SUHU */}

          <article className="dashboard-chart-card">
            <ChartHeader
              icon={Thermometer}
              title="Suhu Petak"
              description="Monitoring suhu pada setiap area."
              sensors={sensors}
              dataKey="temperature"
              unit="°C"
              tone="orange"
            />

            <ResponsiveContainer width="100%" height={285}>
              <BarChart
                data={sensors}
                margin={{
                  top: 18,
                  right: 12,
                  left: -14,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="temperatureGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 6"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="area"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(251, 146, 60, 0.08)",
                  }}
                  content={
                    <ModernTooltip
                      title="Suhu"
                      unit="°C"
                    />
                  }
                />

                <Bar
                  dataKey="temperature"
                  fill="url(#temperatureGradient)"
                  radius={[13, 13, 5, 5]}
                  barSize={43}
                />
              </BarChart>
            </ResponsiveContainer>
          </article>

          {/* KELEMBABAN UDARA */}

          <article className="dashboard-chart-card">
            <ChartHeader
              icon={Wind}
              title="Kelembaban Udara"
              description="Kondisi udara pada setiap area."
              sensors={sensors}
              dataKey="humidity"
              unit="%"
              tone="sky"
            />

            <ResponsiveContainer width="100%" height={285}>
              <AreaChart
                data={sensors}
                margin={{
                  top: 18,
                  right: 12,
                  left: -14,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="humidityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#0ea5e9"
                      stopOpacity={0.42}
                    />

                    <stop
                      offset="100%"
                      stopColor="#0ea5e9"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 6"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="area"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  content={
                    <ModernTooltip
                      title="Udara"
                      unit="%"
                    />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#0ea5e9"
                  strokeWidth={4}
                  fill="url(#humidityGradient)"
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "#0ea5e9",
                    strokeWidth: 3,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#0ea5e9",
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </article>

          {/* INTENSITAS CAHAYA */}

          <article className="dashboard-chart-card">
            <ChartHeader
              icon={Lightbulb}
              title="Intensitas Cahaya"
              description="Jumlah cahaya yang diterima setiap petak."
              sensors={sensors}
              dataKey="light"
              unit=" lux"
              tone="amber"
            />

            <ResponsiveContainer width="100%" height={285}>
              <BarChart
                data={sensors}
                margin={{
                  top: 18,
                  right: 12,
                  left: -8,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="lightGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 6"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="area"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(250, 204, 21, 0.1)",
                  }}
                  content={
                    <ModernTooltip
                      title="Cahaya"
                      unit=" lux"
                    />
                  }
                />

                <Bar
                  dataKey="light"
                  fill="url(#lightGradient)"
                  radius={[13, 13, 5, 5]}
                  barSize={43}
                />
              </BarChart>
            </ResponsiveContainer>
          </article>
        </div>
      </section>

      {/* ========================================
          REKOMENDASI DAN ACTIVITY LOG
      ======================================== */}

      <section className="dashboard-insight-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-section-label">
                DECISION SUPPORT
              </span>

              <h2>Rekomendasi Sistem</h2>

              <p>
                Saran tindakan berdasarkan kondisi sensor.
              </p>
            </div>

            <TrendingUp size={21} />
          </div>

          <div className="dashboard-recommendation-list">
            {sensors.map((item) => (
              <div
                className={`dashboard-recommendation-item ${getGlobalStatusClass(
                  item
                )}`}
                key={item.id}
              >
                <div>
                  {getGlobalStatusClass(item) === "normal" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}
                </div>

                <div>
                  <strong>{item.area}</strong>
                  <p>{getRecommendation(item)}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-section-label">
                SYSTEM ACTIVITY
              </span>

              <h2>Activity Log</h2>

              <p>
                Ringkasan kondisi sistem monitoring.
              </p>
            </div>

            <Activity size={21} />
          </div>

          <div className="dashboard-activity-list">
            <div className="dashboard-activity-item">
              <Cpu size={18} />

              <div>
                <strong>Backend aktif</strong>

                <p>
                  Node.js Express berjalan pada localhost:5000.
                </p>
              </div>
            </div>

            <div className="dashboard-activity-item">
              <Database size={18} />

              <div>
                <strong>Database terhubung</strong>

                <p>
                  Data sensor berhasil diambil dari Supabase.
                </p>
              </div>
            </div>

            <div className="dashboard-activity-item">
              <RefreshCw size={18} />

              <div>
                <strong>Auto refresh aktif</strong>

                <p>
                  Data dashboard diperbarui secara berkala.
                </p>
              </div>
            </div>

            <div className="dashboard-activity-item">
              <CloudSun size={18} />

              <div>
                <strong>Visualisasi 3D aktif</strong>

                <p>
                  Model lahan mengikuti data sensor dan aktuator.
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* ========================================
          TABEL DATA SENSOR
      ======================================== */}

      <SensorTable
        sensors={sensors}
        getStatusClass={getGlobalStatusClass}
        getStatusLabel={getGlobalStatusLabel}
      />
    </div>
  );
}

export default DashboardPage;