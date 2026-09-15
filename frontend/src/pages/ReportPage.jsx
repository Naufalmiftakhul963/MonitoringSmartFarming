import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CloudRain,
  Database,
  Download,
  Droplets,
  FileSpreadsheet,
  FileText,
  Gauge,
  Power,
  Sprout,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";

import {
  getGlobalStatusClass,
  getGlobalStatusLabel,
  getSoilCondition,
  getWeatherStatus,
  isRaining,
} from "../utils/farmUtils";

import "./ReportPage.css";

/* =========================================================
   CSV
   ========================================================= */

function escapeCSV(value) {
  const text =
    value === null || value === undefined
      ? ""
      : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

function getFileDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   REPORT PAGE
   ========================================================= */

function ReportPage({
  sensors = [],
  summary,
  environment,
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

  /* =======================================================
     SUMMARY
     ======================================================= */

  const totalPetak =
    Number(
      summary?.totalPetak ??
        sensors.length
    );

  const avgSoilMoisture =
    Number(
      summary?.avgSoilMoisture ??
        0
    );

  const activePump =
    raining
      ? 0
      : Number(
          summary?.activePump ??
            0
        );

  const autoModeArea =
    Number(
      summary?.autoModeArea ??
        0
    );

  const criticalArea =
    Number(
      summary?.criticalArea ??
        0
    );

  const warningArea =
    Number(
      summary?.warningArea ??
        0
    );

  const normalArea =
    Number(
      summary?.normalArea ??
        0
    );

  const manualModeArea =
    Math.max(
      totalPetak -
        autoModeArea,
      0
    );

  /* =======================================================
     DATE
     ======================================================= */

  const now =
    new Date();

  const reportDate =
    now.toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const reportTime =
    now.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  /* =======================================================
     HEALTH SCORE
     hanya representasi ringkasan laporan
     ======================================================= */

  const safePercentage =
    totalPetak > 0
      ? Math.round(
          (normalArea /
            totalPetak) *
            100
        )
      : 0;

  /* =======================================================
     SYSTEM FINDINGS
     ======================================================= */

  const findings = [];

  if (raining) {
    findings.push({
      type: "info",
      title:
        "Global rain override aktif",
      description:
        "Rain sensor mendeteksi hujan sehingga seluruh pompa harus berada dalam kondisi OFF.",
    });
  } else {
    findings.push({
      type: "success",
      title:
        "Rain sensor normal",
      description:
        "Tidak ada hujan terdeteksi. Petak dengan mode AUTO dapat mengikuti nilai soil moisture.",
    });
  }

  if (criticalArea > 0) {
    findings.push({
      type: "critical",
      title:
        `${criticalArea} petak berada pada kondisi kritis`,
      description:
        "Petak dengan soil moisture di bawah 25% membutuhkan perhatian terhadap kondisi tanah.",
    });
  } else {
    findings.push({
      type: "success",
      title:
        "Tidak ada petak kritis",
      description:
        "Seluruh petak memiliki soil moisture minimal 25%.",
    });
  }

  if (warningArea > 0) {
    findings.push({
      type: "warning",
      title:
        `${warningArea} petak berstatus waspada`,
      description:
        "Soil moisture berada pada rentang 25–39% dan perlu terus dipantau.",
    });
  }

  findings.push({
    type: "neutral",
    title:
      `${autoModeArea} dari ${totalPetak} petak menggunakan AUTO`,
    description:
      `${manualModeArea} petak lainnya saat ini menggunakan mode MANUAL.`,
  });

  /* =======================================================
     CSV EXPORT
     ======================================================= */

  function exportCSV() {
    if (!sensors.length) {
      window.alert(
        "Belum ada data yang dapat diekspor."
      );

      return;
    }

    const headers = [
      "No",
      "Petak",
      "Kelembapan Tanah (%)",
      "Kondisi Tanah",
      "Status Lahan",
      "Status Pompa",
      "Mode Kontrol",
      "Rain Sensor",
      "Kelembapan Udara Global (%)",
      "Tanggal Laporan",
      "Waktu Laporan",
    ];

    const rows =
      sensors.map(
        (
          item,
          index
        ) => [
          index + 1,

          item?.area ??
            `Petak ${
              item?.plot_number ??
              "-"
            }`,

          Number(
            item?.soil_moisture ??
              0
          ),

          getSoilCondition(
            item
          ),

          getGlobalStatusLabel(
            item
          ),

          String(
            item?.pump_status ||
              "OFF"
          ).toUpperCase(),

          String(
            item?.control_mode ||
              "MANUAL"
          ).toUpperCase(),

          weatherStatus,

          humidity,

          reportDate,

          reportTime,
        ]
      );

    const csv = [
      headers
        .map(escapeCSV)
        .join(","),

      ...rows.map(
        (row) =>
          row
            .map(escapeCSV)
            .join(",")
      ),
    ].join("\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
            csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `smartfarm-report-${getFileDate()}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  }

  return (
    <main className="report-page">

      {/* ===================================================
          DOCUMENT HEADER
          =================================================== */}

      <section className="report-document-header">

        <div className="report-document-brand">

          <div className="report-document-logo">
            <FileText
              size={28}
            />
          </div>

          <div>

            <span className="report-overline">
              SMART FARM MONITORING REPORT
            </span>

            <h1>
              Laporan Kondisi Lahan
              & Sistem Irigasi
            </h1>

            <p>
              Laporan ringkas hasil
              monitoring sensor,
              lingkungan, dan sistem
              irigasi Smart Farming.
            </p>

          </div>

        </div>

        <div className="report-header-actions">

          <div className="report-id">

            <span>
              REPORT DATE
            </span>

            <strong>
              {reportDate}
            </strong>

            <small>
              {reportTime}
            </small>

          </div>

          <button
            type="button"
            onClick={
              exportCSV
            }
            disabled={
              !sensors.length
            }
          >
            <Download
              size={17}
            />

            Export CSV
          </button>

        </div>

      </section>

      {/* ===================================================
          EXECUTIVE SUMMARY
          =================================================== */}

      <section className="report-executive">

        <div className="report-section-title">

          <div>

            <span>
              01 • EXECUTIVE SUMMARY
            </span>

            <h2>
              Ringkasan Monitoring
            </h2>

          </div>

          <Activity
            size={22}
          />

        </div>

        <div className="report-executive-grid">

          <article>

            <span>
              TOTAL PETAK
            </span>

            <strong>
              {totalPetak}
            </strong>

            <small>
              area terpantau
            </small>

          </article>

          <article>

            <span>
              AVG SOIL
            </span>

            <strong>
              {avgSoilMoisture}
              <small>%</small>
            </strong>

            <small>
              rata-rata lahan
            </small>

          </article>

          <article>

            <span>
              POMPA AKTIF
            </span>

            <strong>
              {activePump}
            </strong>

            <small>
              dari {totalPetak}
              {" "}
              petak
            </small>

          </article>

          <article>

            <span>
              AUTO MODE
            </span>

            <strong>
              {autoModeArea}
            </strong>

            <small>
              petak otomatis
            </small>

          </article>

          <article
            className={
              criticalArea > 0
                ? "danger"
                : ""
            }
          >

            <span>
              AREA KRITIS
            </span>

            <strong>
              {criticalArea}
            </strong>

            <small>
              soil &lt; 25%
            </small>

          </article>

        </div>

      </section>

      {/* ===================================================
          ENVIRONMENT + OPERATION
          =================================================== */}

      <section className="report-two-column">

        <article className="report-block">

          <div className="report-block-heading">

            <div>

              <span>
                02 • ENVIRONMENT
              </span>

              <h2>
                Kondisi Lingkungan
              </h2>

            </div>

            <WeatherIcon
              size={23}
            />

          </div>

          <div className="report-environment-main">

            <div
              className={`report-weather-symbol ${
                raining
                  ? "rain"
                  : "clear"
              }`}
            >
              <WeatherIcon
                size={38}
              />
            </div>

            <div>

              <span>
                KONDISI CUACA
              </span>

              <strong>
                {weatherStatus}
              </strong>

              <p>
                {raining
                  ? "Rain sensor sedang mendeteksi hujan."
                  : "Rain sensor tidak mendeteksi hujan."}
              </p>

            </div>

          </div>

          <div className="report-env-row">

            <div>

              <Wind
                size={18}
              />

              <span>
                Kelembapan Udara
              </span>

            </div>

            <strong>
              {humidity}%
            </strong>

          </div>

          <div className="report-env-row">

            <div>

              <Bot
                size={18}
              />

              <span>
                Status Override
              </span>

            </div>

            <strong>
              {raining
                ? "AKTIF"
                : "NONAKTIF"}
            </strong>

          </div>

        </article>

        <article className="report-block">

          <div className="report-block-heading">

            <div>

              <span>
                03 • OPERATION
              </span>

              <h2>
                Performa Operasional
              </h2>

            </div>

            <Gauge
              size={23}
            />

          </div>

          <div className="report-operation-list">

            <div className="report-operation-item">

              <div className="report-operation-icon green">
                <Bot
                  size={18}
                />
              </div>

              <div>

                <span>
                  Mode AUTO
                </span>

                <strong>
                  {autoModeArea}
                  {" "}
                  Petak
                </strong>

              </div>

              <small>
                {totalPetak
                  ? Math.round(
                      (
                        autoModeArea /
                        totalPetak
                      ) *
                        100
                    )
                  : 0}
                %
              </small>

            </div>

            <div className="report-operation-item">

              <div className="report-operation-icon violet">
                <Power
                  size={18}
                />
              </div>

              <div>

                <span>
                  Pompa Aktif
                </span>

                <strong>
                  {activePump}
                  {" "}
                  Pompa
                </strong>

              </div>

              <small>
                {raining
                  ? "Override"
                  : "Normal"}
              </small>

            </div>

            <div className="report-operation-item">

              <div className="report-operation-icon blue">
                <Droplets
                  size={18}
                />
              </div>

              <div>

                <span>
                  Soil Average
                </span>

                <strong>
                  {avgSoilMoisture}%
                </strong>

              </div>

              <small>
                Overall
              </small>

            </div>

          </div>

        </article>

      </section>

      {/* ===================================================
          FIELD CONDITION + FINDINGS
          =================================================== */}

      <section className="report-two-column report-analysis-grid">

        <article className="report-block">

          <div className="report-block-heading">

            <div>

              <span>
                04 • FIELD CONDITION
              </span>

              <h2>
                Distribusi Kondisi Lahan
              </h2>

            </div>

            <Sprout
              size={23}
            />

          </div>

          <div className="report-field-score">

            <div>

              <span>
                NORMAL AREA
              </span>

              <strong>
                {safePercentage}%
              </strong>

              <small>
                dari seluruh petak
              </small>

            </div>

            <div className="report-score-ring">

              <span>
                {normalArea}
              </span>

              <small>
                normal
              </small>

            </div>

          </div>

          <div className="report-distribution">

            <div className="normal">

              <div>
                <span />
                Normal
              </div>

              <strong>
                {normalArea}
              </strong>

            </div>

            <div className="warning">

              <div>
                <span />
                Waspada
              </div>

              <strong>
                {warningArea}
              </strong>

            </div>

            <div className="critical">

              <div>
                <span />
                Kritis
              </div>

              <strong>
                {criticalArea}
              </strong>

            </div>

          </div>

        </article>

        <article className="report-block report-findings">

          <div className="report-block-heading">

            <div>

              <span>
                05 • SYSTEM FINDINGS
              </span>

              <h2>
                Temuan Otomatis
              </h2>

            </div>

            <TrendingUp
              size={23}
            />

          </div>

          <div className="report-findings-list">

            {findings.map(
              (
                finding,
                index
              ) => (
                <div
                  className={`report-finding ${finding.type}`}
                  key={`${finding.title}-${index}`}
                >

                  <div className="report-finding-marker">

                    {finding.type ===
                    "critical" ? (
                      <AlertTriangle
                        size={16}
                      />
                    ) : finding.type ===
                      "warning" ? (
                      <AlertTriangle
                        size={16}
                      />
                    ) : (
                      <CheckCircle2
                        size={16}
                      />
                    )}

                  </div>

                  <div>

                    <strong>
                      {finding.title}
                    </strong>

                    <p>
                      {finding.description}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </article>

      </section>

      {/* ===================================================
          DATA TABLE
          =================================================== */}

      <section className="report-record-section">

        <div className="report-record-header">

          <div>

            <span>
              06 • SENSOR RECORD
            </span>

            <h2>
              Detail Data Setiap Petak
            </h2>

            <p>
              Data snapshot terbaru
              sensor tanah dan sistem
              kontrol irigasi.
            </p>

          </div>

          <div className="report-record-tools">

            <span>
              <FileSpreadsheet
                size={16}
              />

              {sensors.length}
              {" "}
              records
            </span>

          </div>

        </div>

        <div className="report-table-wrapper">

          <table className="report-table">

            <thead>

              <tr>
                <th>#</th>
                <th>PETAK</th>
                <th>SOIL</th>
                <th>KONDISI TANAH</th>
                <th>POMPA</th>
                <th>MODE</th>
                <th>STATUS</th>
              </tr>

            </thead>

            <tbody>

              {sensors.map(
                (
                  item,
                  index
                ) => {
                  const statusClass =
                    getGlobalStatusClass(
                      item
                    );

                  const statusLabel =
                    getGlobalStatusLabel(
                      item
                    );

                  const soilCondition =
                    getSoilCondition(
                      item
                    );

                  const soil =
                    Number(
                      item?.soil_moisture ??
                        0
                    );

                  const pumpOn =
                    String(
                      item?.pump_status ||
                        ""
                    ).toUpperCase() ===
                    "ON";

                  const autoMode =
                    String(
                      item?.control_mode ||
                        ""
                    ).toUpperCase() ===
                    "AUTO";

                  return (
                    <tr
                      key={
                        item.id
                      }
                    >

                      <td className="report-index">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </td>

                      <td>

                        <div className="report-plot-name">

                          <span />

                          <strong>
                            {item.area}
                          </strong>

                        </div>

                      </td>

                      <td>

                        <div className="report-soil">

                          <Droplets
                            size={14}
                          />

                          <strong>
                            {soil}%
                          </strong>

                        </div>

                      </td>

                      <td>
                        {soilCondition}
                      </td>

                      <td>

                        <span
                          className={`report-pill pump ${
                            pumpOn
                              ? "on"
                              : "off"
                          }`}
                        >
                          {pumpOn
                            ? "ON"
                            : "OFF"}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`report-pill mode ${
                            autoMode
                              ? "auto"
                              : "manual"
                          }`}
                        >
                          {autoMode
                            ? "AUTO"
                            : "MANUAL"}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`report-status ${statusClass}`}
                        >
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

      </section>

      {/* ===================================================
          REPORT FOOTER INFORMATION
          =================================================== */}

      <section className="report-notes">

        <div className="report-notes-heading">

          <ClipboardList
            size={21}
          />

          <div>

            <span>
              07 • REPORT NOTES
            </span>

            <h2>
              Informasi Laporan
            </h2>

          </div>

        </div>

        <div className="report-notes-grid">

          <div>

            <Database
              size={17}
            />

            <div>

              <strong>
                Sumber Data
              </strong>

              <p>
                Supabase database melalui
                backend Smart Farming.
              </p>

            </div>

          </div>

          <div>

            <CloudRain
              size={17}
            />

            <div>

              <strong>
                Rain Override
              </strong>

              <p>
                Hujan terdeteksi berarti
                seluruh pompa OFF.
              </p>

            </div>

          </div>

          <div>

            <Droplets
              size={17}
            />

            <div>

              <strong>
                Auto Irrigation
              </strong>

              <p>
                CERAH + soil &lt;25%
                menyalakan pompa AUTO.
              </p>

            </div>

          </div>

          <div>

            <CalendarDays
              size={17}
            />

            <div>

              <strong>
                Snapshot
              </strong>

              <p>
                {reportDate},
                {" "}
                {reportTime}
              </p>

            </div>

          </div>

        </div>

      </section>

      <footer className="report-footer">

        <span>
          Smart Farming IoT Monitoring Report
        </span>

        <strong>
          {reportDate}
        </strong>

      </footer>

    </main>
  );
}

export default ReportPage;