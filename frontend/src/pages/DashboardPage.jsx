import {
  lazy,
  Suspense,
  useState,
} from "react";

import {
  Area,
  AreaChart,
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
  CloudRain,
  Cpu,
  Database,
  Droplets,
  Power,
  RefreshCw,
  Sprout,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";

import Farm2DOverview from "../components/Farm2DOverview/Farm2DOverview";
import SensorTable from "../components/SensorTable";

const Farm3DModel = lazy(() =>
  import(
    "../components/Farm3DModel/Farm3DModel"
  )
);

import {
  getGlobalStatusClass,
  getRecommendation,
  getWeatherStatus,
  isRaining,
} from "../utils/farmUtils";

import "./DashboardPage.css";

/* =========================================================
   STATISTIC HELPERS
   ========================================================= */

function getAverage(
  data,
  key
) {
  if (!data.length) {
    return 0;
  }

  const total =
    data.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item?.[key] || 0
        ),
      0
    );

  return (
    total /
    data.length
  ).toFixed(1);
}

function getMinimum(
  data,
  key
) {
  if (!data.length) {
    return 0;
  }

  return Math.min(
    ...data.map(
      (item) =>
        Number(
          item?.[key] || 0
        )
    )
  );
}

function getMaximum(
  data,
  key
) {
  if (!data.length) {
    return 0;
  }

  return Math.max(
    ...data.map(
      (item) =>
        Number(
          item?.[key] || 0
        )
    )
  );
}

/* =========================================================
   CHART TOOLTIP
   ========================================================= */

function ModernTooltip({
  active,
  payload,
  label,
  title,
  unit = "",
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  return (
    <div className="dashboard-tooltip">
      <span>
        {label}
      </span>

      <strong>
        {title}:{" "}
        {payload[0].value}
        {unit}
      </strong>
    </div>
  );
}

/* =========================================================
   CHART HEADER
   ========================================================= */

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

        <div
          className={`dashboard-chart-icon ${tone}`}
        >
          <Icon size={20} />
        </div>

        <div>
          <h3>
            {title}
          </h3>

          <p>
            {description}
          </p>
        </div>

      </div>

      <div className="dashboard-chart-stats">

        <div>
          <span>
            MIN
          </span>

          <strong>
            {getMinimum(
              sensors,
              dataKey
            )}
            {unit}
          </strong>
        </div>

        <div>
          <span>
            RATA-RATA
          </span>

          <strong>
            {getAverage(
              sensors,
              dataKey
            )}
            {unit}
          </strong>
        </div>

        <div>
          <span>
            MAKS
          </span>

          <strong>
            {getMaximum(
              sensors,
              dataKey
            )}
            {unit}
          </strong>
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DASHBOARD PAGE
   ========================================================= */

function DashboardPage({
  sensors = [],
  summary,
  environment,
  lastUpdate,
  fetchData,
  loading = false,
}) {
  const [
    visualMode,
    setVisualMode,
  ] = useState("2d");

  /* =======================================================
     ENVIRONMENT
     ======================================================= */

  const raining =
    isRaining(
      environment
    );

  const weatherStatus =
    getWeatherStatus(
      environment
    );

  const humidity =
    Number(
      environment?.humidity ??
        0
    );

  const WeatherIcon =
    raining
      ? CloudRain
      : Sun;

  /* =======================================================
     STATUS
     ======================================================= */

  const statusData = [
    {
      name: "Normal",
      value:
        sensors.filter(
          (item) =>
            getGlobalStatusClass(
              item
            ) === "normal"
        ).length,
    },

    {
      name: "Waspada",
      value:
        sensors.filter(
          (item) =>
            getGlobalStatusClass(
              item
            ) === "warning"
        ).length,
    },

    {
      name: "Kritis",
      value:
        sensors.filter(
          (item) =>
            getGlobalStatusClass(
              item
            ) === "critical"
        ).length,
    },
  ];

  const criticalSensors =
    sensors.filter(
      (item) =>
        getGlobalStatusClass(
          item
        ) === "critical"
    );

  /* =======================================================
     SOIL SUMMARY
     ======================================================= */

  const avgSoilMoisture =
    summary?.avgSoilMoisture !==
    undefined
      ? Number(
          summary.avgSoilMoisture
        )
      : Number(
          getAverage(
            sensors,
            "soil_moisture"
          )
        );

  const soilCondition =
    avgSoilMoisture < 25
      ? "Kering"
      : avgSoilMoisture < 40
      ? "Mulai Kering"
      : "Cukup Lembap";

  /* =======================================================
     SUMMARY CARDS
     ======================================================= */

  const summaryCards =
    summary
      ? [
          {
            label:
              "Total Petak",

            value:
              summary.totalPetak,

            caption:
              "Area lahan terpantau",

            icon:
              Sprout,

            tone:
              "green",
          },

          {
            label:
              "Kelembapan Tanah",

            value:
              `${avgSoilMoisture}%`,

            caption:
              `Kondisi ${soilCondition.toLowerCase()}`,

            icon:
              Droplets,

            tone:
              "blue",
          },

          {
            label:
              "Rain Sensor",

            value:
              weatherStatus,

            caption:
              raining
                ? "Hujan terdeteksi"
                : "Tidak ada hujan",

            icon:
              WeatherIcon,

            tone:
              raining
                ? "sky"
                : "amber",
          },

          {
            label:
              "Kelembapan Udara",

            value:
              `${humidity}%`,

            caption:
              "Kondisi udara global",

            icon:
              Wind,

            tone:
              "sky",
          },

          {
            label:
              "Pompa Aktif",

            value:
              summary.activePump,

            caption:
              raining
                ? "Semua dipaksa OFF"
                : "Pompa sedang menyala",

            icon:
              Power,

            tone:
              "purple",
          },

          {
            label:
              "Mode AUTO",

            value:
              summary.autoModeArea,

            caption:
              "Petak dikontrol otomatis",

            icon:
              Bot,

            tone:
              "lime",
          },

          {
            label:
              "Area Kritis",

            value:
              summary.criticalArea,

            caption:
              "Tanah di bawah 25%",

            icon:
              AlertTriangle,

            tone:
              "red",
          },
        ]
      : [];

  return (
    <div className="dashboard-shell">

      {/* ===================================================
          HERO
          =================================================== */}

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
            Pantau kelembapan tanah setiap
            petak, kondisi lingkungan global,
            rain sensor, pompa irigasi,
            visualisasi lahan, dan kontrol
            otomatis secara terintegrasi.
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

        {/* LIVE PANEL */}

        <div className="dashboard-live-panel">

          <div className="dashboard-live-label">
            <span />
            LIVE MONITORING
          </div>

          <Activity size={38} />

          <h3>
            Sistem Aktif
          </h3>

          <p>
            Update terakhir

            <strong>
              {lastUpdate || "-"}
            </strong>
          </p>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw size={16} />

            {loading
              ? "Memuat..."
              : "Refresh Data"}
          </button>

        </div>

      </section>

      {/* ===================================================
          ENVIRONMENT
          =================================================== */}

      <section
        className={`dashboard-panel dashboard-auto-info ${
          raining
            ? "rain-active"
            : ""
        }`}
      >

        <div className="dashboard-panel-header">

          <div>

            <span className="dashboard-section-label">
              KONDISI LINGKUNGAN
            </span>

            <h2>
              {raining
                ? "Hujan Terdeteksi"
                : "Kondisi Lahan Cerah"}
            </h2>

            <p>
              Rain sensor dan kelembapan
              udara merupakan kondisi global
              seluruh lahan. Kelembapan udara
              saat ini {humidity}%.
            </p>

          </div>

          <WeatherIcon size={28} />

        </div>

      </section>

      {/* ===================================================
          SUMMARY
          =================================================== */}

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

                <div
                  className={`dashboard-summary-icon ${tone}`}
                >
                  <Icon size={23} />
                </div>

                <div>

                  <p>
                    {label}
                  </p>

                  <h2>
                    {value}
                  </h2>

                  <span>
                    {caption}
                  </span>

                </div>

              </article>
            )
          )}

        </section>
      )}

      {/* ===================================================
          FARM VISUAL + ALERT
          =================================================== */}

      <section className="dashboard-primary-grid">

        {/* =================================================
            VISUAL MONITORING
            ================================================= */}

        <article className="dashboard-panel dashboard-3d-panel">

          {/* HEADER */}

          <div className="dashboard-panel-header dashboard-visual-header">

            <div>

              <span className="dashboard-section-label">
                VISUAL MONITORING
              </span>

              <h2>
                {visualMode === "2d"
                  ? "Denah Monitoring Lahan 2D"
                  : "Visualisasi Smart Farm 3D"}
              </h2>

              <p>
                {visualMode === "2d"
                  ? "Tampilan ringan untuk melihat kondisi seluruh petak dengan cepat."
                  : "Mode interaktif untuk menjelajahi sensor, pompa, tanaman, dan area Smart Farming."}
              </p>

            </div>

          </div>

          {/* ===============================================
              SPECIAL VISUAL MODE CARD
              =============================================== */}

          <div className="dashboard-visual-mode-card">

            {/* TOP */}

            <div className="dashboard-visual-mode-top">

              <div>

                <span className="dashboard-visual-mode-label">
                  MODE VISUALISASI
                </span>

                <h3>
                  Pilih tampilan lahan
                </h3>

                <p>
                  Gunakan tampilan 2D untuk
                  monitoring cepat atau buka
                  mode 3D untuk eksplorasi
                  lahan secara interaktif.
                </p>

              </div>

              <div className="dashboard-visual-current">

                <span className="dashboard-visual-current-dot" />

                {visualMode === "2d"
                  ? "2D sedang aktif"
                  : "3D sedang aktif"}

              </div>

            </div>

            {/* OPTIONS */}

            <div
              className="dashboard-visual-mode-options"
              role="group"
              aria-label="Pilih mode visualisasi"
            >

              {/* 2D */}

              <button
                type="button"
                aria-pressed={
                  visualMode === "2d"
                }
                className={
                  visualMode === "2d"
                    ? "dashboard-mode-option active"
                    : "dashboard-mode-option"
                }
                onClick={() =>
                  setVisualMode("2d")
                }
              >

                <div className="dashboard-mode-number">
                  2D
                </div>

                <div className="dashboard-mode-copy">

                  <div className="dashboard-mode-title-row">

                    <strong>
                      Tampilan 2D
                    </strong>

                    {visualMode === "2d" && (
                      <span className="dashboard-mode-active-badge">
                        AKTIF
                      </span>
                    )}

                  </div>

                  <span>
                    Monitoring cepat dan ringan
                  </span>

                  <p>
                    Lihat status seluruh petak,
                    kondisi tanah, cuaca, dan
                    lingkungan dalam satu denah.
                  </p>

                </div>

                <div className="dashboard-mode-action">
                  {visualMode === "2d"
                    ? "Sedang digunakan"
                    : "Pilih 2D"}
                </div>

              </button>

              {/* 3D */}

              <button
                type="button"
                aria-pressed={
                  visualMode === "3d"
                }
                className={
                  visualMode === "3d"
                    ? "dashboard-mode-option active"
                    : "dashboard-mode-option"
                }
                onClick={() =>
                  setVisualMode("3d")
                }
              >

                <div className="dashboard-mode-number">
                  3D
                </div>

                <div className="dashboard-mode-copy">

                  <div className="dashboard-mode-title-row">

                    <strong>
                      Visualisasi 3D
                    </strong>

                    {visualMode === "3d" && (
                      <span className="dashboard-mode-active-badge">
                        AKTIF
                      </span>
                    )}

                  </div>

                  <span>
                    Visualisasi interaktif
                  </span>

                  <p>
                    Jelajahi bentuk lahan,
                    tanaman, sensor, pompa,
                    irigasi, dan area Smart Farm.
                  </p>

                </div>

                <div className="dashboard-mode-action">
                  {visualMode === "3d"
                    ? "Sedang digunakan"
                    : "Buka 3D"}
                </div>

              </button>

            </div>

          </div>

          {/* ===============================================
              FARM VIEW
              =============================================== */}

          {visualMode === "2d" ? (
            <Farm2DOverview
              sensors={sensors}
              environment={environment}
            />
          ) : (
            <Suspense
              fallback={
                <div className="dashboard-3d-loading">

                  <div className="dashboard-3d-loading-icon">
                    <Sprout size={28} />
                  </div>

                  <strong>
                    Menyiapkan Smart Farm 3D...
                  </strong>

                  <span>
                    Model 3D dimuat hanya
                    saat dibutuhkan.
                  </span>

                  <div className="dashboard-3d-loading-bar">
                    <span />
                  </div>

                </div>
              }
            >

              <Farm3DModel
                sensors={sensors}
                environment={environment}
              />

            </Suspense>
          )}

        </article>

        {/* =================================================
            ALERT
            ================================================= */}

        <article className="dashboard-panel dashboard-alert-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-section-label">
                EARLY WARNING
              </span>

              <h2>
                Alert Kondisi Lahan
              </h2>

              <p>
                Petak yang membutuhkan
                perhatian berdasarkan
                kelembapan tanah.
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

                <strong>
                  Seluruh petak aman
                </strong>

                <p>
                  Tidak ditemukan tanah
                  dengan kondisi kritis.
                </p>

              </div>

            </div>
          ) : (
            <div className="dashboard-alert-list">

              {criticalSensors.map(
                (item) => (
                  <div
                    className="dashboard-alert-item"
                    key={item.id}
                  >

                    <AlertTriangle size={18} />

                    <div>

                      <strong>
                        {item.area} perlu
                        diperhatikan
                      </strong>

                      <p>
                        {getRecommendation(
                          item,
                          environment
                        )}
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </article>

      </section>

      {/* ===================================================
          DEVICE STATUS
          =================================================== */}

      <section className="dashboard-device-grid">

        <article className="dashboard-device-card pump-card">

          <div className="dashboard-device-icon">
            <Power size={22} />
          </div>

          <div>

            <span>
              Pompa Irigasi
            </span>

            <strong>
              {raining
                ? "Semua OFF"
                : `${summary?.activePump ?? 0} Aktif`}
            </strong>

          </div>

        </article>

        <article className="dashboard-device-card weather">

          <div className="dashboard-device-icon">
            <WeatherIcon size={22} />
          </div>

          <div>

            <span>
              Rain Sensor
            </span>

            <strong>
              {weatherStatus}
            </strong>

          </div>

        </article>

        <article className="dashboard-device-card humidity">

          <div className="dashboard-device-icon">
            <Wind size={22} />
          </div>

          <div>

            <span>
              Kelembapan Udara
            </span>

            <strong>
              {humidity}%
            </strong>

          </div>

        </article>

        <article className="dashboard-device-card auto">

          <div className="dashboard-device-icon">
            <Bot size={22} />
          </div>

          <div>

            <span>
              Kontrol Otomatis
            </span>

            <strong>
              {summary?.autoModeArea ?? 0}
              {" "}
              Petak AUTO
            </strong>

          </div>

        </article>

      </section>

      {/* ===================================================
          AUTO CONTROL
          =================================================== */}

      <section className="dashboard-panel dashboard-auto-info">

        <div className="dashboard-panel-header">

          <div>

            <span className="dashboard-section-label">
              AUTO CONTROL
            </span>

            <h2>
              Logika Kontrol Irigasi
            </h2>

            <p>
              Rain sensor menjadi global
              override. Saat tidak hujan,
              petak AUTO mengikuti nilai
              kelembapan tanah masing-masing.
            </p>

          </div>

          <Bot size={22} />

        </div>

        <div className="dashboard-auto-rule-grid">

          <div className="dashboard-auto-rule critical">

            <span>
              Rain Sensor
            </span>

            <strong>
              HUJAN
            </strong>

            <p>
              Semua pompa → OFF
            </p>

          </div>

          <div className="dashboard-auto-rule normal">

            <span>
              CERAH + Tanah
            </span>

            <strong>
              &lt; 25%
            </strong>

            <p>
              Pompa AUTO → ON
            </p>

          </div>

          <div className="dashboard-auto-rule normal">

            <span>
              CERAH + Tanah
            </span>

            <strong>
              ≥ 25%
            </strong>

            <p>
              Pompa AUTO → OFF
            </p>

          </div>

        </div>

        <div className="dashboard-auto-current">

          <span>
            Status sistem
          </span>

          <strong>
            {raining
              ? "Global override aktif → semua pompa OFF"
              : "CERAH → AUTO mengikuti kelembapan tanah"}
          </strong>

        </div>

      </section>

      {/* ===================================================
          STATUS DISTRIBUTION
          =================================================== */}

      <section className="dashboard-status-section">

        <div className="dashboard-status-info">

          <div className="dashboard-status-header">

            <div>

              <span className="dashboard-section-label">
                RINGKASAN KONDISI
              </span>

              <h2>
                Distribusi Status Petak
              </h2>

              <p>
                Status berdasarkan
                kelembapan tanah setiap
                petak.
              </p>

            </div>

            <div className="dashboard-petak-badge">

              <Sprout size={16} />

              {sensors.length}
              {" "}
              Petak

            </div>

          </div>

          <div className="dashboard-status-cards">

            <article className="dashboard-status-card normal">

              <div className="dashboard-status-icon">
                <CheckCircle size={21} />
              </div>

              <div>

                <span>
                  Normal
                </span>

                <strong>
                  {statusData[0].value}
                </strong>

                <p>
                  Soil ≥ 40%
                </p>

              </div>

            </article>

            <article className="dashboard-status-card warning">

              <div className="dashboard-status-icon">
                <AlertTriangle size={21} />
              </div>

              <div>

                <span>
                  Waspada
                </span>

                <strong>
                  {statusData[1].value}
                </strong>

                <p>
                  Soil 25–39%
                </p>

              </div>

            </article>

            <article className="dashboard-status-card critical">

              <div className="dashboard-status-icon">
                <AlertTriangle size={21} />
              </div>

              <div>

                <span>
                  Kritis
                </span>

                <strong>
                  {statusData[2].value}
                </strong>

                <p>
                  Soil &lt; 25%
                </p>

              </div>

            </article>

          </div>

        </div>

        {/* DONUT */}

        <div className="dashboard-donut-card">

          <div className="dashboard-donut-wrapper">

            <ResponsiveContainer
              width="100%"
              height={285}
            >
              <PieChart>

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

                  <Cell fill="#22c55e" />
                  <Cell fill="#eab308" />
                  <Cell fill="#ef4444" />

                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

            <div className="dashboard-donut-center">

              <strong>
                {sensors.length}
              </strong>

              <span>
                Total Petak
              </span>

            </div>

          </div>

          <div className="dashboard-donut-caption">
            <span />
            Data terkini
          </div>

        </div>

      </section>

      {/* ===================================================
          SENSOR ANALYTICS
          =================================================== */}

      <section className="dashboard-analytics-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              SENSOR ANALYTICS
            </span>

            <h2>
              Kelembapan Tanah Setiap Petak
            </h2>

            <p>
              Perbandingan nilai soil
              moisture dari Petak 1 sampai
              Petak 11.
            </p>

          </div>

          <div className="dashboard-live-data">
            <span />
            Live Data
          </div>

        </div>

        <div className="dashboard-chart-grid">

          <article className="dashboard-chart-card">

            <ChartHeader
              icon={Droplets}
              title="Kelembapan Tanah"
              description="Persentase kadar air tanah setiap petak."
              sensors={sensors}
              dataKey="soil_moisture"
              unit="%"
              tone="green"
            />

            <ResponsiveContainer
              width="100%"
              height={320}
            >
              <AreaChart
                data={sensors}
                margin={{
                  top: 18,
                  right: 20,
                  left: -10,
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
                      stopOpacity={0.4}
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
                />

                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
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
                  }}
                />

              </AreaChart>
            </ResponsiveContainer>

          </article>

        </div>

      </section>

      {/* ===================================================
          INSIGHTS
          =================================================== */}

      <section className="dashboard-insight-grid">

        {/* RECOMMENDATION */}

        <article className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-section-label">
                DECISION SUPPORT
              </span>

              <h2>
                Rekomendasi Sistem
              </h2>

              <p>
                Rekomendasi berdasarkan
                rain sensor dan
                kelembapan tanah.
              </p>

            </div>

            <TrendingUp size={21} />

          </div>

          <div className="dashboard-recommendation-list">

            {sensors.map(
              (item) => (
                <div
                  className={`dashboard-recommendation-item ${getGlobalStatusClass(
                    item
                  )}`}
                  key={item.id}
                >

                  <div>

                    {getGlobalStatusClass(
                      item
                    ) === "normal" ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}

                  </div>

                  <div>

                    <strong>
                      {item.area}
                    </strong>

                    <p>
                      {getRecommendation(
                        item,
                        environment
                      )}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </article>

        {/* ACTIVITY */}

        <article className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-section-label">
                SYSTEM ACTIVITY
              </span>

              <h2>
                Status Sistem
              </h2>

              <p>
                Ringkasan kondisi monitoring
                dan kontrol saat ini.
              </p>

            </div>

            <Activity size={21} />

          </div>

          <div className="dashboard-activity-list">

            <div className="dashboard-activity-item">

              <Database size={18} />

              <div>

                <strong>
                  Database aktif
                </strong>

                <p>
                  Data petak dan lingkungan
                  terhubung ke Supabase.
                </p>

              </div>

            </div>

            <div className="dashboard-activity-item">

              <WeatherIcon size={18} />

              <div>

                <strong>
                  Rain Sensor:{" "}
                  {weatherStatus}
                </strong>

                <p>
                  {raining
                    ? "Global override aktif."
                    : "Tidak ada hujan."}
                </p>

              </div>

            </div>

            <div className="dashboard-activity-item">

              <Wind size={18} />

              <div>

                <strong>
                  Humidity:{" "}
                  {humidity}%
                </strong>

                <p>
                  Kelembapan udara global
                  seluruh area pertanian.
                </p>

              </div>

            </div>

            <div className="dashboard-activity-item">

              <Droplets size={18} />

              <div>

                <strong>
                  AUTO Control aktif
                </strong>

                <p>
                  Saat cerah, soil di bawah
                  25% menyalakan pompa AUTO.
                </p>

              </div>

            </div>

          </div>

        </article>

      </section>

      {/* ===================================================
          SENSOR TABLE
          =================================================== */}

      <SensorTable
        sensors={sensors}
      />

    </div>
  );
}

export default DashboardPage;