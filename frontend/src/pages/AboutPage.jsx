import {
  ArrowRight,
  Bot,
  CloudRain,
  Code2,
  Database,
  Droplets,
  Leaf,
  Power,
  Server,
  ShieldCheck,
  Sprout,
  Wind,
} from "lucide-react";

import "./AboutPage.css";

/* =========================================================
   FEATURES
   ========================================================= */

const features = [
  {
    title: "Soil Monitoring",
    description:
      "Monitoring kelembapan tanah pada masing-masing Petak 1 sampai Petak 11.",
    icon: Droplets,
    className: "soil",
  },

  {
    title: "Rain Sensor",
    description:
      "Sensor hujan global untuk menentukan kondisi CERAH atau HUJAN.",
    icon: CloudRain,
    className: "rain",
  },

  {
    title: "Global Humidity",
    description:
      "Monitoring kelembapan udara sebagai data lingkungan seluruh lahan.",
    icon: Wind,
    className: "humidity",
  },

  {
    title: "AUTO / MANUAL",
    description:
      "Mode kontrol pompa dapat dipilih secara otomatis atau manual pada setiap petak.",
    icon: Bot,
    className: "automation",
  },

  {
    title: "Smart Irrigation",
    description:
      "Pompa bekerja berdasarkan kondisi tanah dan rain sensor.",
    icon: Power,
    className: "pump",
  },
];

/* =========================================================
   TECHNOLOGY
   ========================================================= */

const technologies = [
  {
    name: "React + Vite",
    type: "Frontend",
    icon: Code2,
  },

  {
    name: "Node.js Express",
    type: "Backend",
    icon: Server,
  },

  {
    name: "Supabase",
    type: "Database",
    icon: Database,
  },

  {
    name: "Three.js",
    type: "3D Visualization",
    icon: Sprout,
  },
];

/* =========================================================
   ABOUT PAGE
   ========================================================= */

function AboutPage() {
  return (
    <main className="about-page">

      {/* ===================================================
          HERO
          =================================================== */}

      <section className="about-hero">

        <div className="about-hero-content">

          <div className="about-eyebrow">
            <Sprout size={17} />

            ABOUT SMART FARMING
          </div>

          <h1>
            Smart Farming
            <span>
              IoT Monitoring System
            </span>
          </h1>

          <p>
            Sistem monitoring dan kontrol
            pertanian berbasis IoT yang
            menghubungkan sensor,
            otomatisasi irigasi, database,
            dan visualisasi digital dalam
            satu platform.
          </p>

          <div className="about-hero-tags">

            <span>
              <Sprout size={15} />
              11 Petak
            </span>

            <span>
              <CloudRain size={15} />
              Rain Sensor
            </span>

            <span>
              <Bot size={15} />
              Smart Irrigation
            </span>

          </div>

        </div>

        {/* HERO CARD */}

        <div className="about-hero-card">

          <div className="about-hero-card-icon">
            <Leaf size={38} />
          </div>

          <span>
            SMART FARMING IoT
          </span>

          <strong>
            Monitoring &
            Irrigation System
          </strong>

          <p>
            11 petak terhubung dalam
            satu sistem monitoring
            pertanian.
          </p>

          <div className="about-online-status">
            <span />
            SYSTEM PROJECT
          </div>

        </div>

      </section>

      {/* ===================================================
          ABOUT + PURPOSE
          =================================================== */}

      <section className="about-overview-grid">

        {/* ABOUT */}

        <article className="about-overview-card">

          <div className="about-card-heading">

            <div className="about-heading-icon green">
              <Sprout size={23} />
            </div>

            <div>

              <span>
                TENTANG SISTEM
              </span>

              <h2>
                Apa itu Smart Farming?
              </h2>

            </div>

          </div>

          <p>
            Smart Farming IoT merupakan
            sistem yang dirancang untuk
            membantu proses monitoring
            kondisi pertanian melalui
            sensor dan teknologi digital.
          </p>

          <p>
            Setiap petak memiliki data
            soil moisture sendiri,
            sedangkan rain sensor dan
            humidity digunakan sebagai
            kondisi lingkungan global
            untuk seluruh area pertanian.
          </p>

          <div className="about-info-highlight">

            <Leaf size={18} />

            <span>
              Sistem berfokus pada
              monitoring kondisi lahan
              dan pengelolaan irigasi.
            </span>

          </div>

        </article>

        {/* PURPOSE */}

        <article className="about-overview-card">

          <div className="about-card-heading">

            <div className="about-heading-icon blue">
              <ShieldCheck size={23} />
            </div>

            <div>

              <span>
                TUJUAN SISTEM
              </span>

              <h2>
                Kenapa sistem ini dibuat?
              </h2>

            </div>

          </div>

          <div className="about-purpose-list">

            <div>

              <span>
                01
              </span>

              <p>
                Mempermudah monitoring
                kondisi tanah setiap
                petak.
              </p>

            </div>

            <div>

              <span>
                02
              </span>

              <p>
                Membantu proses irigasi
                menggunakan kontrol
                otomatis.
              </p>

            </div>

            <div>

              <span>
                03
              </span>

              <p>
                Mencegah penyiraman
                yang tidak diperlukan
                ketika hujan.
              </p>

            </div>

            <div>

              <span>
                04
              </span>

              <p>
                Menampilkan data dalam
                dashboard yang mudah
                dipahami.
              </p>

            </div>

          </div>

        </article>

      </section>

      {/* ===================================================
          FEATURES
          =================================================== */}

      <section className="about-section">

        <div className="about-section-heading">

          <span>
            FITUR UTAMA
          </span>

          <h2>
            Komponen utama sistem
          </h2>

          <p>
            Fitur utama yang digunakan
            untuk monitoring dan kontrol
            Smart Farming.
          </p>

        </div>

        <div className="about-feature-grid">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="about-feature-card"
              >

                <div
                  className={`about-feature-icon ${feature.className}`}
                >
                  <Icon size={24} />
                </div>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

              </article>
            );
          })}

        </div>

      </section>

      {/* ===================================================
          FLOW
          =================================================== */}

      <section className="about-section">

        <div className="about-section-heading">

          <span>
            CARA KERJA
          </span>

          <h2>
            Alur sistem Smart Farming
          </h2>

          <p>
            Mulai dari pembacaan sensor
            sampai data ditampilkan dan
            digunakan untuk kontrol
            irigasi.
          </p>

        </div>

        <div className="about-flow">

          <div className="about-flow-item">

            <div className="about-flow-icon">
              <Droplets size={23} />
            </div>

            <span>
              STEP 01
            </span>

            <strong>
              Sensor
            </strong>

            <p>
              Membaca kondisi lahan
            </p>

          </div>

          <ArrowRight
            className="about-flow-arrow"
            size={22}
          />

          <div className="about-flow-item">

            <div className="about-flow-icon">
              <Server size={23} />
            </div>

            <span>
              STEP 02
            </span>

            <strong>
              Backend
            </strong>

            <p>
              Memproses data dan logic
            </p>

          </div>

          <ArrowRight
            className="about-flow-arrow"
            size={22}
          />

          <div className="about-flow-item">

            <div className="about-flow-icon">
              <Database size={23} />
            </div>

            <span>
              STEP 03
            </span>

            <strong>
              Supabase
            </strong>

            <p>
              Menyimpan data
            </p>

          </div>

          <ArrowRight
            className="about-flow-arrow"
            size={22}
          />

          <div className="about-flow-item">

            <div className="about-flow-icon">
              <Code2 size={23} />
            </div>

            <span>
              STEP 04
            </span>

            <strong>
              Dashboard
            </strong>

            <p>
              Menampilkan monitoring
            </p>

          </div>

          <ArrowRight
            className="about-flow-arrow"
            size={22}
          />

          <div className="about-flow-item">

            <div className="about-flow-icon">
              <Power size={23} />
            </div>

            <span>
              STEP 05
            </span>

            <strong>
              Pump
            </strong>

            <p>
              Menjalankan irigasi
            </p>

          </div>

        </div>

      </section>

      {/* ===================================================
          IRRIGATION LOGIC
          =================================================== */}

      <section className="about-irrigation">

        <div className="about-irrigation-copy">

          <span>
            LOGIKA IRIGASI
          </span>

          <h2>
            Aturan kontrol otomatis
          </h2>

          <p>
            Rain sensor memiliki
            prioritas tertinggi.
            Saat tidak hujan, pompa
            dengan mode AUTO mengikuti
            nilai soil moisture
            masing-masing petak.
          </p>

        </div>

        <div className="about-irrigation-rules">

          <article className="rain">

            <CloudRain size={25} />

            <span>
              HUJAN
            </span>

            <strong>
              Semua Pompa OFF
            </strong>

            <p>
              Rain override aktif.
            </p>

          </article>

          <article className="dry">

            <Droplets size={25} />

            <span>
              CERAH + SOIL &lt; 25%
            </span>

            <strong>
              AUTO Pump ON
            </strong>

            <p>
              Tanah membutuhkan air.
            </p>

          </article>

          <article className="safe">

            <Droplets size={25} />

            <span>
              CERAH + SOIL ≥ 25%
            </span>

            <strong>
              AUTO Pump OFF
            </strong>

            <p>
              Kelembapan tanah mencukupi.
            </p>

          </article>

        </div>

      </section>

      {/* ===================================================
          TECHNOLOGY
          =================================================== */}

      <section className="about-section">

        <div className="about-section-heading">

          <span>
            TECHNOLOGY STACK
          </span>

          <h2>
            Teknologi yang digunakan
          </h2>

          <p>
            Teknologi utama yang
            digunakan untuk membangun
            sistem Smart Farming.
          </p>

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

                  <div className="about-tech-icon">
                    <Icon size={22} />
                  </div>

                  <div>

                    <span>
                      {
                        technology.type
                      }
                    </span>

                    <strong>
                      {
                        technology.name
                      }
                    </strong>

                  </div>

                </article>
              );
            }
          )}

        </div>

      </section>

      {/* ===================================================
          DEVELOPER / CONTACT
          =================================================== */}

      <section className="about-contact">

        <div className="about-contact-profile">

          <div className="about-contact-avatar">
            <Sprout size={32} />
          </div>

          <div>

            <span>
              DEVELOPER & PROJECT
            </span>

            <h2>
              Smart Farming IoT
            </h2>

            <p>
              Informasi developer,
              repository, dan kontak
              project Smart Farming.
            </p>

          </div>

        </div>

        <div className="about-contact-links">

          {/* GITHUB */}

          <a
            href="https://github.com/solternaindonesia-dotcom"
            target="_blank"
            rel="noreferrer"
          >

            <div className="about-contact-link-icon">
              <Code2 size={21} />
            </div>

            <div>

              <span>
                GITHUB PROFILE
              </span>

              <strong>
                github.com/solternaindonesia-dotcom
              </strong>

            </div>

            <ArrowRight size={17} />

          </a>

          {/* REPOSITORY */}

          <a
            href="https://github.com/solternaindonesia-dotcom/MonitoringSmartFarming.git"
            target="_blank"
            rel="noreferrer"
          >

            <div className="about-contact-link-icon">
              <Database size={21} />
            </div>

            <div>

              <span>
                PROJECT REPOSITORY
              </span>

              <strong>
                Smart Farming IoT
              </strong>

            </div>

            <ArrowRight size={17} />

          </a>

          {/* EMAIL */}

          <a
            href="mailto:[solternaindonesia@gmail.com]"
          >

            <div className="about-contact-link-icon">
              <Leaf size={21} />
            </div>

            <div>

              <span>
                EMAIL
              </span>

              <strong>
                solternaindonesia@gmail.com
              </strong>

            </div>

            <ArrowRight size={17} />

          </a>

        </div>

      </section>

      {/* ===================================================
          CLOSING
          =================================================== */}

      <section className="about-closing">

        <div className="about-closing-icon">
          <Leaf size={29} />
        </div>

        <div>

          <span>
            SMART FARMING IoT
          </span>

          <h2>
            Monitoring dan irigasi
            dalam satu sistem.
          </h2>

          <p>
            Menggabungkan teknologi,
            sensor, database, dan
            otomatisasi untuk membantu
            monitoring pertanian
            menjadi lebih terstruktur.
          </p>

        </div>

      </section>

    </main>
  );
}

export default AboutPage;