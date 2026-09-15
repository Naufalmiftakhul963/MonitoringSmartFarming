import { useState } from "react";

import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  CloudRain,
  Code2,
  Cpu,
  Database,
  Droplets,
  Gauge,
  Layers3,
  Leaf,
  Network,
  Power,
  Server,
  ShieldCheck,
  Sprout,
  Sun,
  Wifi,
  Wind,
} from "lucide-react";

import "./AboutPage.css";

/* =========================================================
   SYSTEM MODULES
   ========================================================= */

const modules = [
  {
    id: "soil",
    title: "Monitoring Tanah",
    subtitle: "Sensor per petak",
    icon: Droplets,

    description:
      "Setiap petak memiliki pembacaan soil moisture sendiri sehingga kondisi tanah dapat dipantau secara individual.",

    points: [
      "11 petak pertanian",
      "Soil moisture per petak",
      "Normal, Waspada, dan Kritis",
      "Data monitoring real-time",
    ],
  },

  {
    id: "environment",
    title: "Lingkungan Global",
    subtitle: "Rain sensor & humidity",
    icon: CloudRain,

    description:
      "Rain sensor dan kelembapan udara digunakan sebagai kondisi lingkungan global untuk seluruh area pertanian.",

    points: [
      "Rain sensor global",
      "Humidity global",
      "Status CERAH / HUJAN",
      "Rain override untuk pompa",
    ],
  },

  {
    id: "irrigation",
    title: "Smart Irrigation",
    subtitle: "AUTO & MANUAL",
    icon: Bot,

    description:
      "Sistem irigasi dapat berjalan otomatis berdasarkan kondisi tanah atau dikontrol manual oleh pengguna.",

    points: [
      "Mode AUTO",
      "Mode MANUAL",
      "Soil < 25% → AUTO ON",
      "HUJAN → semua pompa OFF",
    ],
  },

  {
    id: "visual",
    title: "Visual Farm 3D",
    subtitle: "Interactive monitoring",
    icon: Layers3,

    description:
      "Visualisasi Three.js membantu pengguna memahami kondisi setiap petak secara visual dan interaktif.",

    points: [
      "Visual 11 petak",
      "Tanaman dan irigasi",
      "Klik petak untuk detail",
      "Visual kondisi lahan",
    ],
  },
];

/* =========================================================
   TECH STACK
   ========================================================= */

const technologies = [
  {
    name: "React + Vite",
    label: "Frontend",
    icon: Code2,
  },

  {
    name: "Node.js Express",
    label: "Backend API",
    icon: Server,
  },

  {
    name: "Supabase",
    label: "Database",
    icon: Database,
  },

  {
    name: "Three.js",
    label: "3D Visual",
    icon: Layers3,
  },
];

/* =========================================================
   ABOUT PAGE
   ========================================================= */

function AboutPage() {
  const [activeModule, setActiveModule] =
    useState(modules[0]);

  const ActiveIcon =
    activeModule.icon;

  return (
    <main className="about-page">

      {/* ===================================================
          HERO
          =================================================== */}

      <section className="about-hero">

        <div className="about-hero-copy">

          <div className="about-eyebrow">
            <span />
            SMART FARMING IoT
          </div>

          <h1>
            Membawa teknologi
            <br />

            <span>
              ke dalam pertanian.
            </span>
          </h1>

          <p>
            Smart Farming IoT adalah sistem
            monitoring dan kontrol pertanian
            yang menggabungkan sensor,
            database, automation, dan
            visualisasi 3D dalam satu
            platform.
          </p>

          <div className="about-hero-actions">

            <a
              href="#system"
              className="about-main-button"
            >
              Explore System

              <ArrowRight
                size={17}
              />
            </a>

            <a
              href="#technology"
              className="about-ghost-button"
            >
              <Cpu
                size={17}
              />

              Technology
            </a>

          </div>

          <div className="about-hero-meta">

            <div>
              <strong>
                11
              </strong>

              <span>
                Petak
              </span>
            </div>

            <div>
              <strong>
                2
              </strong>

              <span>
                Global Sensor
              </span>
            </div>

            <div>
              <strong>
                AUTO
              </strong>

              <span>
                Irrigation
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            HERO VISUAL
            ================================================= */}

        <div className="about-hero-visual">

          <div className="about-visual-ring ring-one" />
          <div className="about-visual-ring ring-two" />

          <div className="about-core">

            <div className="about-core-icon">
              <Sprout
                size={44}
              />
            </div>

            <span>
              SMART FARM
            </span>

            <strong>
              IoT Ecosystem
            </strong>

          </div>

          <div className="about-node soil-node">

            <Droplets
              size={18}
            />

            <div>
              <span>
                Soil
              </span>

              <strong>
                11 Sensor
              </strong>
            </div>

          </div>

          <div className="about-node rain-node">

            <CloudRain
              size={18}
            />

            <div>
              <span>
                Rain Sensor
              </span>

              <strong>
                Global
              </strong>
            </div>

          </div>

          <div className="about-node pump-node">

            <Power
              size={18}
            />

            <div>
              <span>
                Irrigation
              </span>

              <strong>
                Smart Pump
              </strong>
            </div>

          </div>

          <div className="about-node database-node">

            <Database
              size={18}
            />

            <div>
              <span>
                Data
              </span>

              <strong>
                Supabase
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          INTRO
          =================================================== */}

      <section className="about-story">

        <div className="about-story-number">
          01
        </div>

        <div className="about-story-title">

          <span>
            PROJECT OVERVIEW
          </span>

          <h2>
            Monitoring lebih jelas,
            keputusan lebih cepat.
          </h2>

        </div>

        <div className="about-story-copy">

          <p>
            Sistem ini dibuat untuk membantu
            pengguna mengetahui kondisi
            lahan tanpa harus memeriksa
            seluruh area secara manual.
          </p>

          <p>
            Sensor per petak menangani
            kondisi tanah, sedangkan rain
            sensor dan humidity digunakan
            sebagai informasi lingkungan
            global seluruh lahan.
          </p>

        </div>

      </section>

      {/* ===================================================
          VALUE CARDS
          =================================================== */}

      <section className="about-benefit-grid">

        <article>

          <div className="about-benefit-icon green">
            <Activity
              size={22}
            />
          </div>

          <span>
            MONITORING
          </span>

          <h3>
            Data setiap petak
          </h3>

          <p>
            Kondisi soil moisture tidak
            disamaratakan dan dapat
            dipantau secara individual.
          </p>

        </article>

        <article>

          <div className="about-benefit-icon yellow">
            <Bot
              size={22}
            />
          </div>

          <span>
            AUTOMATION
          </span>

          <h3>
            Smart irrigation
          </h3>

          <p>
            Pompa AUTO bekerja berdasarkan
            nilai kelembapan tanah setiap
            petak.
          </p>

        </article>

        <article>

          <div className="about-benefit-icon blue">
            <ShieldCheck
              size={22}
            />
          </div>

          <span>
            SAFETY
          </span>

          <h3>
            Rain override
          </h3>

          <p>
            Ketika hujan terdeteksi,
            seluruh pompa langsung
            diprioritaskan OFF.
          </p>

        </article>

      </section>

      {/* ===================================================
          INTERACTIVE SYSTEM
          =================================================== */}

      <section
        className="about-system"
        id="system"
      >

        <div className="about-heading">

          <div>

            <span>
              02 • SYSTEM EXPLORER
            </span>

            <h2>
              Kenali bagian
              dalam sistem.
            </h2>

            <p>
              Klik modul untuk melihat
              cara kerja setiap bagian.
            </p>

          </div>

          <Network
            size={27}
          />

        </div>

        <div className="about-system-layout">

          {/* NAVIGATION */}

          <div className="about-module-list">

            {modules.map(
              (module) => {
                const Icon =
                  module.icon;

                const isActive =
                  activeModule.id ===
                  module.id;

                return (
                  <button
                    type="button"
                    key={
                      module.id
                    }
                    className={
                      isActive
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveModule(
                        module
                      )
                    }
                  >

                    <div className="about-module-icon">
                      <Icon
                        size={19}
                      />
                    </div>

                    <div>

                      <strong>
                        {
                          module.title
                        }
                      </strong>

                      <span>
                        {
                          module.subtitle
                        }
                      </span>

                    </div>

                    <ArrowRight
                      size={15}
                    />

                  </button>
                );
              }
            )}

          </div>

          {/* DETAIL */}

          <article className="about-module-detail">

            <div className="about-module-detail-icon">
              <ActiveIcon
                size={31}
              />
            </div>

            <span className="about-module-tag">
              ACTIVE MODULE
            </span>

            <h3>
              {activeModule.title}
            </h3>

            <p>
              {
                activeModule.description
              }
            </p>

            <div className="about-module-points">

              {activeModule.points.map(
                (point) => (
                  <div
                    key={point}
                  >

                    <CheckCircle2
                      size={15}
                    />

                    <span>
                      {point}
                    </span>

                  </div>
                )
              )}

            </div>

          </article>

        </div>

      </section>

      {/* ===================================================
          ARCHITECTURE
          =================================================== */}

      <section className="about-data-section">

        <div className="about-heading">

          <div>

            <span>
              03 • DATA STRUCTURE
            </span>

            <h2>
              Global environment
              dan per-petak data.
            </h2>

          </div>

          <Database
            size={27}
          />

        </div>

        <div className="about-data-layout">

          {/* GLOBAL */}

          <article className="about-data-panel global">

            <div className="about-data-panel-header">

              <div>

                <span>
                  GLOBAL
                </span>

                <h3>
                  Farm Environment
                </h3>

              </div>

              <Wind
                size={23}
              />

            </div>

            <div className="about-data-items">

              <div>

                <Wind
                  size={18}
                />

                <div>
                  <span>
                    Humidity
                  </span>

                  <strong>
                    Kelembapan Udara
                  </strong>
                </div>

              </div>

              <div>

                <CloudRain
                  size={18}
                />

                <div>
                  <span>
                    Rain Sensor
                  </span>

                  <strong>
                    CERAH / HUJAN
                  </strong>
                </div>

              </div>

            </div>

            <code>
              farm_environment
            </code>

          </article>

          {/* CORE */}

          <div className="about-data-core">

            <span />

            <div>

              <Wifi
                size={25}
              />

              <strong>
                IoT
              </strong>

              <small>
                Data Flow
              </small>

            </div>

            <span />

          </div>

          {/* PER PLOT */}

          <article className="about-data-panel plot">

            <div className="about-data-panel-header">

              <div>

                <span>
                  PER PETAK
                </span>

                <h3>
                  Sensor Data
                </h3>

              </div>

              <Sprout
                size={23}
              />

            </div>

            <div className="about-data-items">

              <div>

                <Droplets
                  size={18}
                />

                <div>
                  <span>
                    Soil Sensor
                  </span>

                  <strong>
                    Soil Moisture
                  </strong>
                </div>

              </div>

              <div>

                <Power
                  size={18}
                />

                <div>
                  <span>
                    Irrigation
                  </span>

                  <strong>
                    Pump + Mode
                  </strong>
                </div>

              </div>

            </div>

            <code>
              sensor_data
            </code>

          </article>

        </div>

      </section>

      {/* ===================================================
          IRRIGATION RULE
          =================================================== */}

      <section className="about-rule-section">

        <div className="about-rule-copy">

          <span>
            04 • AUTOMATION LOGIC
          </span>

          <h2>
            Aturan irigasi
            yang sederhana,
            tapi jelas.
          </h2>

          <p>
            Rain sensor selalu memiliki
            prioritas tertinggi dalam
            sistem kontrol pompa.
          </p>

        </div>

        <div className="about-rule-grid">

          <article className="rain">

            <CloudRain
              size={22}
            />

            <span>
              HUJAN
            </span>

            <strong>
              Semua OFF
            </strong>

            <p>
              Global override aktif.
            </p>

          </article>

          <article className="dry">

            <Droplets
              size={22}
            />

            <span>
              CERAH + SOIL &lt; 25%
            </span>

            <strong>
              AUTO ON
            </strong>

            <p>
              Tanah membutuhkan air.
            </p>

          </article>

          <article className="normal">

            <Sun
              size={22}
            />

            <span>
              CERAH + SOIL ≥ 25%
            </span>

            <strong>
              AUTO OFF
            </strong>

            <p>
              Kelembapan mencukupi.
            </p>

          </article>

        </div>

      </section>

      {/* ===================================================
          TECH STACK
          =================================================== */}

      <section
        className="about-tech-section"
        id="technology"
      >

        <div className="about-heading">

          <div>

            <span>
              05 • TECHNOLOGY STACK
            </span>

            <h2>
              Teknologi yang
              menggerakkan sistem.
            </h2>

          </div>

          <Cpu
            size={27}
          />

        </div>

        <div className="about-tech-grid">

          {technologies.map(
            (technology) => {
              const Icon =
                technology.icon;

              return (
                <article
                  key={
                    technology.name
                  }
                >

                  <div>
                    <Icon
                      size={22}
                    />
                  </div>

                  <span>
                    {
                      technology.label
                    }
                  </span>

                  <h3>
                    {
                      technology.name
                    }
                  </h3>

                </article>
              );
            }
          )}

        </div>

      </section>

      {/* ===================================================
          CLOSING
          =================================================== */}

      <section className="about-ending">

        <div className="about-ending-icon">
          <Leaf
            size={29}
          />
        </div>

        <div>

          <span>
            SMART FARMING IoT
          </span>

          <h2>
            Lebih terhubung.
            Lebih terukur.
            Lebih cerdas.
          </h2>

          <p>
            Menggabungkan teknologi IoT,
            automation, database, dan
            visualisasi untuk membantu
            monitoring pertanian modern.
          </p>

        </div>

        <div className="about-ending-chip">

          <Sprout
            size={16}
          />

          11 PLOTS CONNECTED

        </div>

      </section>

    </main>
  );
}

export default AboutPage;