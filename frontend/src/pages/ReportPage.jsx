import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  ClipboardList,
  Database,
  Download,
  Droplets,
  FileText,
  Lightbulb,
  Printer,
  RefreshCw,
  Sprout,
  Thermometer,
  Wind,
  Power,
} from "lucide-react";

import {
  getGlobalStatusClass,
  getGlobalStatusLabel,
  getRecommendation,
} from "../utils/farmUtils";

import "./ReportPage.css";

// ========================================
// FUNGSI BANTUAN
// ========================================

function getAverage(data, key) {
  if (!data.length) return 0;

  const total = data.reduce(
    (sum, item) => sum + Number(item[key] || 0),
    0
  );

  return (total / data.length).toFixed(1);
}

function getMaximum(data, key) {
  if (!data.length) return 0;

  return Math.max(
    ...data.map((item) => Number(item[key] || 0))
  );
}

function getMinimum(data, key) {
  if (!data.length) return 0;

  return Math.min(
    ...data.map((item) => Number(item[key] || 0))
  );
}

function downloadCSV(sensors) {
  if (!sensors.length) {
    alert("Data sensor belum tersedia.");
    return;
  }

  const headers = [
    "Petak",
    "Suhu (C)",
    "Kelembaban Tanah (%)",
    "Kelembaban Udara (%)",
    "Intensitas Cahaya (lux)",
    "Pompa",
    "Kipas",
    "Lampu",
    "Mode",
    "Status",
    "Rekomendasi",
  ];

  const rows = sensors.map((item) => [
    item.area,
    item.temperature,
    item.soil_moisture,
    item.humidity,
    item.light,
    item.pump_status || "OFF",
    item.fan_status || "OFF",
    item.lamp_status || "OFF",
    item.control_mode || "MANUAL",
    getGlobalStatusLabel(item),
    getRecommendation(item),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const safeCell = String(cell ?? "").replace(/"/g, '""');
          return `"${safeCell}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `laporan-smart-farming-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ========================================
// REPORT PAGE
// ========================================

function ReportPage({ sensors = [], summary = null }) {
  const normalCount = sensors.filter(
    (item) => getGlobalStatusClass(item) === "normal"
  ).length;

  const warningCount = sensors.filter(
    (item) => getGlobalStatusClass(item) === "warning"
  ).length;

  const criticalCount = sensors.filter(
    (item) => getGlobalStatusClass(item) === "critical"
  ).length;

  const statusData = [
    {
      name: "Normal",
      value: normalCount,
      color: "#22c55e",
    },
    {
      name: "Waspada",
      value: warningCount,
      color: "#eab308",
    },
    {
      name: "Kritis",
      value: criticalCount,
      color: "#ef4444",
    },
  ];

  const deviceData = [
    {
      name: "Pompa",
      value: summary?.activePump ?? 0,
    },
    {
      name: "Kipas",
      value: summary?.activeFan ?? 0,
    },
    {
      name: "Lampu",
      value: summary?.activeLamp ?? 0,
    },
    {
      name: "Mode AUTO",
      value: summary?.autoModeArea ?? 0,
    },
  ];

  const reportCards = [
    {
      label: "Total Petak",
      value: summary?.totalPetak ?? sensors.length,
      caption: "Area lahan terpantau",
      icon: Sprout,
      tone: "green",
    },
    {
      label: "Rata-rata Tanah",
      value: `${getAverage(sensors, "soil_moisture")}%`,
      caption: "Kelembaban keseluruhan",
      icon: Droplets,
      tone: "blue",
    },
    {
      label: "Rata-rata Suhu",
      value: `${getAverage(sensors, "temperature")}°C`,
      caption: "Suhu seluruh petak",
      icon: Thermometer,
      tone: "orange",
    },
    {
      label: "Area Kritis",
      value: criticalCount,
      caption: "Perlu tindak lanjut",
      icon: AlertTriangle,
      tone: "red",
    },
  ];

  return (
    <main className="report-shell">
      {/* ========================================
          HERO
      ======================================== */}

      <section className="report-hero">
        <div>
          <div className="report-eyebrow">
            <FileText size={17} />
            SMART FARMING REPORT
          </div>

          <h1>Laporan Monitoring Lahan</h1>

          <p>
            Ringkasan kondisi sensor, status perangkat, dan rekomendasi
            sistem berdasarkan data terbaru dari seluruh petak pertanian.
          </p>

          <div className="report-hero-badges">
            <span>
              <Database size={15} />
              Supabase Database
            </span>

            <span>
              <Activity size={15} />
              Live Monitoring
            </span>

            <span>
              <ClipboardList size={15} />
              {sensors.length} Petak Terpantau
            </span>
          </div>
        </div>

        <div className="report-actions">
          <button
            className="report-action secondary"
            onClick={() => window.print()}
          >
            <Printer size={17} />
            Cetak Laporan
          </button>

          <button
            className="report-action primary"
            onClick={() => downloadCSV(sensors)}
          >
            <Download size={17} />
            Download CSV
          </button>
        </div>
      </section>

      {/* ========================================
          SUMMARY
      ======================================== */}

      <section className="report-summary-grid">
        {reportCards.map(
          ({
            label,
            value,
            caption,
            icon: Icon,
            tone,
          }) => (
            <article className="report-summary-card" key={label}>
              <div className={`report-summary-icon ${tone}`}>
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

      {/* ========================================
          CHARTS
      ======================================== */}

      <section className="report-chart-grid">
        <article className="report-panel">
          <div className="report-panel-header">
            <div>
              <span className="report-section-label">
                STATUS DISTRIBUTION
              </span>

              <h2>Distribusi Kondisi Lahan</h2>

              <p>
                Jumlah area normal, waspada, dan kritis.
              </p>
            </div>

            <RefreshCw size={20} />
          </div>

          <div className="report-donut-layout">
            <div className="report-donut-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={66}
                    outerRadius={99}
                    paddingAngle={6}
                    cornerRadius={14}
                    stroke="none"
                  >
                    {statusData.map((item) => (
                      <Cell
                        fill={item.color}
                        key={item.name}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="report-donut-center">
                <strong>{sensors.length}</strong>
                <span>Total Petak</span>
              </div>
            </div>

            <div className="report-status-list">
              {statusData.map((item) => (
                <div className="report-status-item" key={item.name}>
                  <span
                    className="report-status-dot"
                    style={{
                      background: item.color,
                    }}
                  ></span>

                  <div>
                    <strong>{item.value}</strong>
                    <p>{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="report-panel">
          <div className="report-panel-header">
            <div>
              <span className="report-section-label">
                DEVICE MONITORING
              </span>

              <h2>Status Perangkat Aktif</h2>

              <p>
                Jumlah aktuator yang sedang aktif pada sistem.
              </p>
            </div>

            <Bot size={20} />
          </div>

          <ResponsiveContainer width="100%" height={275}>
            <BarChart
              data={deviceData}
              margin={{
                top: 18,
                right: 8,
                left: -16,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="reportDeviceGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 6"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(34, 197, 94, 0.08)",
                }}
              />

              <Bar
                dataKey="value"
                fill="url(#reportDeviceGradient)"
                radius={[12, 12, 4, 4]}
                barSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      {/* ========================================
          STATISTIK SENSOR
      ======================================== */}

      <section className="report-panel report-statistics-panel">
        <div className="report-panel-header">
          <div>
            <span className="report-section-label">
              SENSOR STATISTICS
            </span>

            <h2>Statistik Sensor Keseluruhan</h2>

            <p>
              Nilai minimum, rata-rata, dan maksimum dari seluruh petak.
            </p>
          </div>

          <Database size={20} />
        </div>

        <div className="report-statistics-grid">
          <article>
            <div className="report-statistics-icon soil">
              <Droplets size={20} />
            </div>

            <div>
              <span>Kelembaban Tanah</span>

              <strong>
                {getAverage(sensors, "soil_moisture")}%
              </strong>

              <p>
                Min {getMinimum(sensors, "soil_moisture")}% • Maks{" "}
                {getMaximum(sensors, "soil_moisture")}%
              </p>
            </div>
          </article>

          <article>
            <div className="report-statistics-icon temperature">
              <Thermometer size={20} />
            </div>

            <div>
              <span>Suhu Petak</span>

              <strong>
                {getAverage(sensors, "temperature")}°C
              </strong>

              <p>
                Min {getMinimum(sensors, "temperature")}°C • Maks{" "}
                {getMaximum(sensors, "temperature")}°C
              </p>
            </div>
          </article>

          <article>
            <div className="report-statistics-icon humidity">
              <Wind size={20} />
            </div>

            <div>
              <span>Kelembaban Udara</span>

              <strong>
                {getAverage(sensors, "humidity")}%
              </strong>

              <p>
                Min {getMinimum(sensors, "humidity")}% • Maks{" "}
                {getMaximum(sensors, "humidity")}%
              </p>
            </div>
          </article>

          <article>
            <div className="report-statistics-icon light">
              <Lightbulb size={20} />
            </div>

            <div>
              <span>Intensitas Cahaya</span>

              <strong>
                {getAverage(sensors, "light")} lux
              </strong>

              <p>
                Min {getMinimum(sensors, "light")} lux • Maks{" "}
                {getMaximum(sensors, "light")} lux
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ========================================
          TABLE REPORT
      ======================================== */}

      <section className="report-panel report-table-panel">
        <div className="report-panel-header">
          <div>
            <span className="report-section-label">
              DETAILED REPORT
            </span>

            <h2>Detail Kondisi Setiap Petak</h2>

            <p>
              Data sensor, status perangkat, serta rekomendasi sistem.
            </p>
          </div>

          <ClipboardList size={21} />
        </div>

        <div className="report-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Petak</th>
                <th>Suhu</th>
                <th>Tanah</th>
                <th>Udara</th>
                <th>Cahaya</th>
                <th>Pompa</th>
                <th>Kipas</th>
                <th>Lampu</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Rekomendasi</th>
              </tr>
            </thead>

            <tbody>
              {sensors.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.area}</strong>
                  </td>

                  <td>{item.temperature}°C</td>
                  <td>{item.soil_moisture}%</td>
                  <td>{item.humidity}%</td>
                  <td>{item.light} lux</td>

                  <td>
                    <span
                      className={`report-device-pill ${
                        item.pump_status === "ON"
                          ? "on"
                          : "off"
                      }`}
                    >
                      {item.pump_status || "OFF"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`report-device-pill ${
                        item.fan_status === "ON"
                          ? "on"
                          : "off"
                      }`}
                    >
                      {item.fan_status || "OFF"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`report-device-pill ${
                        item.lamp_status === "ON"
                          ? "on"
                          : "off"
                      }`}
                    >
                      {item.lamp_status || "OFF"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`report-mode-pill ${
                        item.control_mode === "AUTO"
                          ? "auto"
                          : "manual"
                      }`}
                    >
                      {item.control_mode || "MANUAL"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`report-status-pill ${getGlobalStatusClass(
                        item
                      )}`}
                    >
                      {getGlobalStatusLabel(item)}
                    </span>
                  </td>

                  <td className="report-recommendation-cell">
                    {getRecommendation(item)}
                  </td>
                </tr>
              ))}

              {sensors.length === 0 && (
                <tr>
                  <td
                    className="report-empty-state"
                    colSpan="11"
                  >
                    Data sensor belum tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================
          FOOTER REPORT
      ======================================== */}

      <section className="report-footer">
        <div>
          <CheckCircle size={20} />

          <p>
            Laporan dibuat berdasarkan data monitoring terbaru dari
            database Supabase.
          </p>
        </div>

        <span>
          Generated: {new Date().toLocaleString("id-ID")}
        </span>
      </section>
    </main>
  );
}

export default ReportPage;