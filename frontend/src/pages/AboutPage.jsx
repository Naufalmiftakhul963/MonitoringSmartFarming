import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle,
  CloudSun,
  Code2,
  Cpu,
  Database,
  Droplets,
  ExternalLink,
  FolderGit2,
  Layers3,
  Lightbulb,
  MonitorCog,
  Power,
  Server,
  Sprout,
  Thermometer,
  Wind,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./AboutPage.css";

// ========================================
// ABOUT PAGE
// ========================================

function AboutPage() {
  const features = [
    {
      title: "Monitoring Sensor",
      description:
        "Memantau suhu, kelembaban tanah, kelembaban udara, dan intensitas cahaya pada setiap petak.",
      icon: Activity,
      tone: "green",
    },
    {
      title: "Kontrol Aktuator",
      description:
        "Mengatur pompa irigasi, kipas ventilasi, dan lampu tanaman secara manual atau otomatis.",
      icon: MonitorCog,
      tone: "blue",
    },
    {
      title: "Visualisasi Lahan 3D",
      description:
        "Model interaktif berbasis Three.js yang mengikuti kondisi sensor dan status perangkat secara dinamis.",
      icon: Layers3,
      tone: "purple",
    },
    {
      title: "Analisis dan Laporan",
      description:
        "Menyediakan grafik, rekomendasi, laporan kondisi petak, fitur cetak, dan ekspor CSV.",
      icon: BarChart3,
      tone: "orange",
    },
  ];

  const technologies = [
    {
      title: "React + Vite",
      description:
        "Frontend modern dengan proses development yang cepat.",
      icon: Code2,
    },
    {
      title: "Node.js + Express",
      description:
        "Backend API untuk mengambil data dan mengontrol perangkat.",
      icon: Server,
    },
    {
      title: "Supabase PostgreSQL",
      description:
        "Database cloud untuk menyimpan data sensor dan status aktuator.",
      icon: Database,
    },
    {
      title: "Three.js",
      description:
        "Visualisasi model lahan pertanian tiga dimensi interaktif.",
      icon: Layers3,
    },
  ];

  const automaticRules = [
    {
      label: "Pompa Irigasi",
      condition: "Tanah < 25%",
      result: "Pompa menyala otomatis",
      icon: Droplets,
      tone: "blue",
    },
    {
      label: "Kipas Ventilasi",
      condition: "Suhu > 33°C",
      result: "Kipas menyala otomatis",
      icon: Wind,
      tone: "sky",
    },
    {
      label: "Lampu Tanaman",
      condition: "Cahaya < 300 lux",
      result: "Lampu menyala otomatis",
      icon: Lightbulb,
      tone: "amber",
    },
  ];

  return (
    <main className="about-shell">
      {/* ========================================
          HERO
      ======================================== */}

      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-eyebrow">
            <Sprout size={17} />
            SMART FARMING MONITORING SYSTEM
          </div>

          <h1>
            Teknologi Pertanian yang Lebih
            <span> Cerdas dan Terintegrasi</span>
          </h1>

          <p>
            SmartFarm adalah dashboard IoT untuk memantau kondisi lahan,
            mengendalikan perangkat pertanian, serta membantu pengambilan
            keputusan berdasarkan data sensor secara terpusat.
          </p>

          <div className="about-hero-actions">
            <Link className="about-primary-button" to="/dashboard">
              <BarChart3 size={17} />
              Buka Dashboard
            </Link>

            <Link className="about-secondary-button" to="/control">
              <MonitorCog size={17} />
              Control Panel
            </Link>
          </div>
        </div>

        <div className="about-hero-illustration">
          <div className="about-illustration-glow"></div>

          <div className="about-illustration-card main">
            <Sprout size={44} />

            <h3>SmartFarm</h3>

            <p>IoT Monitoring Dashboard</p>
          </div>

          <div className="about-floating-card sensor">
            <Thermometer size={18} />
            Sensor Aktif
          </div>

          <div className="about-floating-card automation">
            <Bot size={18} />
            Auto Control
          </div>

          <div className="about-floating-card database">
            <Database size={18} />
            Supabase
          </div>
        </div>
      </section>

      {/* ========================================
          OVERVIEW
      ======================================== */}

      <section className="about-overview-grid">
        <article className="about-overview-card">
          <Cpu size={24} />

          <div>
            <strong>IoT Monitoring</strong>
            <p>Sensor lahan terpantau secara terpusat.</p>
          </div>
        </article>

        <article className="about-overview-card">
          <CloudSun size={24} />

          <div>
            <strong>Near Real-Time</strong>
            <p>Data diperbarui secara berkala pada dashboard.</p>
          </div>
        </article>

        <article className="about-overview-card">
          <Bot size={24} />

          <div>
            <strong>Automation</strong>
            <p>Perangkat dapat dikontrol berdasarkan threshold.</p>
          </div>
        </article>

        <article className="about-overview-card">
          <Database size={24} />

          <div>
            <strong>Cloud Database</strong>
            <p>Data tersimpan dalam Supabase PostgreSQL.</p>
          </div>
        </article>
      </section>

      {/* ========================================
          TENTANG SISTEM
      ======================================== */}

      <section className="about-introduction-section">
        <div>
          <span className="about-section-label">
            PROJECT OVERVIEW
          </span>

          <h2>Tentang SmartFarm</h2>

          <p>
            SmartFarm dirancang untuk membantu pengelola lahan pertanian
            melihat kondisi setiap area tanpa harus memeriksa seluruh petak
            secara manual. Data sensor dikumpulkan dan disimpan di database,
            lalu ditampilkan melalui antarmuka dashboard yang mudah dipahami.
          </p>

          <p>
            Sistem juga menyediakan control panel untuk mengatur aktuator.
            Pengguna dapat memilih mode manual untuk mengontrol perangkat
            sendiri atau mode otomatis untuk menjalankan logika berdasarkan
            kondisi lingkungan.
          </p>
        </div>

        <div className="about-flow-card">
          <span className="about-section-label">
            SYSTEM FLOW
          </span>

          <h3>Alur Kerja Sistem</h3>

          <div className="about-flow-list">
            <div>
              <Activity size={18} />
              <span>Sensor membaca kondisi lahan</span>
            </div>

            <div>
              <Database size={18} />
              <span>Data disimpan ke Supabase</span>
            </div>

            <div>
              <Server size={18} />
              <span>Backend Express menyediakan API</span>
            </div>

            <div>
              <BarChart3 size={18} />
              <span>Dashboard React menampilkan data</span>
            </div>

            <div>
              <Power size={18} />
              <span>Control panel mengatur aktuator</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FITUR UTAMA
      ======================================== */}

      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-label">
            MAIN FEATURES
          </span>

          <h2>Fitur Utama Sistem</h2>

          <p>
            Seluruh fitur dirancang untuk membantu proses pemantauan dan
            pengendalian lahan menjadi lebih efektif.
          </p>
        </div>

        <div className="about-feature-grid">
          {features.map(
            ({
              title,
              description,
              icon: Icon,
              tone,
            }) => (
              <article className="about-feature-card" key={title}>
                <div className={`about-feature-icon ${tone}`}>
                  <Icon size={24} />
                </div>

                <h3>{title}</h3>

                <p>{description}</p>
              </article>
            )
          )}
        </div>
      </section>

      {/* ========================================
          MODE OTOMATIS
      ======================================== */}

      <section className="about-automation-section">
        <div className="about-automation-heading">
          <div>
            <span className="about-section-label">
              AUTOMATION RULES
            </span>

            <h2>Logika Kontrol Otomatis</h2>

            <p>
              Threshold digunakan sebagai simulasi sistem dan dapat
              disesuaikan dengan kebutuhan tanaman.
            </p>
          </div>

          <div className="about-auto-badge">
            <Bot size={17} />
            AUTO MODE
          </div>
        </div>

        <div className="about-rule-grid">
          {automaticRules.map(
            ({
              label,
              condition,
              result,
              icon: Icon,
              tone,
            }) => (
              <article className="about-rule-card" key={label}>
                <div className={`about-rule-icon ${tone}`}>
                  <Icon size={22} />
                </div>

                <div>
                  <span>{label}</span>
                  <strong>{condition}</strong>
                  <p>{result}</p>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {/* ========================================
          TEKNOLOGI
      ======================================== */}

      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-label">
            TECHNOLOGY STACK
          </span>

          <h2>Teknologi yang Digunakan</h2>

          <p>
            Arsitektur full-stack yang ringan, modern, dan mudah
            dikembangkan lebih lanjut.
          </p>
        </div>

        <div className="about-tech-grid">
          {technologies.map(
            ({
              title,
              description,
              icon: Icon,
            }) => (
              <article className="about-tech-card" key={title}>
                <div className="about-tech-icon">
                  <Icon size={22} />
                </div>

                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {/* ========================================
          CHECKLIST
      ======================================== */}

      <section className="about-checklist-section">
        <div>
          <span className="about-section-label">
            SYSTEM CAPABILITIES
          </span>

          <h2>Fungsi yang Sudah Tersedia</h2>
        </div>

        <div className="about-checklist-grid">
          {[
            "Dashboard monitoring sensor",
            "Visualisasi lahan Three.js",
            "Kontrol pompa irigasi",
            "Kontrol kipas ventilasi",
            "Kontrol lampu tanaman",
            "Mode AUTO dan MANUAL",
            "Grafik analisis sensor",
            "Laporan dan ekspor CSV",
          ].map((item) => (
            <div className="about-checklist-item" key={item}>
              <CheckCircle size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================
          FOOTER CTA
      ======================================== */}

      <section className="about-cta">
        <div>
          <span className="about-section-label">
            SMART FARMING PLATFORM
          </span>

          <h2>Mulai Pantau Kondisi Lahan</h2>

          <p>
            Buka dashboard untuk melihat kondisi sensor dan visualisasi
            lahan secara langsung.
          </p>
        </div>

        <div className="about-cta-actions">
          <Link className="about-primary-button" to="/dashboard">
            <Activity size={17} />
            Lihat Dashboard
          </Link>

          <a
            className="about-secondary-button"
            href="https://github.com/alfarezalfathir/MonitoringSmartFarming"
            target="_blank"
            rel="noreferrer"
          >
            <FolderGit2 size={17} />
            GitHub Repo
            <ExternalLink size={14} />
          </a>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;