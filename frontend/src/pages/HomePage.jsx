import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Droplets,
  Thermometer,
  Power,
  Database,
  ArrowRight,
  Layers3,
  Sparkles,
  Activity,
  Bot,
  CloudRain,
  Sun,
} from "lucide-react";
import SystemPreview from "../components/SystemPreview";
import { isRaining, getWeatherStatus } from "../utils/farmUtils";

function HomePage({ sensors = [], environment }) {
  const raining = isRaining(environment);
  const rawWeather = getWeatherStatus(environment);
  const weatherStatus =
    rawWeather.toLowerCase() === "cerah"
      ? "Cerah"
      : rawWeather.toLowerCase() === "hujan"
      ? "Hujan"
      : rawWeather;
  const WeatherIcon = raining ? CloudRain : Sun;

  // 3D Card Mouse & Tilt Interaction across the entire Hero section
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0, active: false });

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / centerX; // -1 to +1
    const normY = (y - centerY) / centerY; // -1 to +1

    // Rotation degrees (tilts right when mouse goes right)
    const ry = normX * 28;
    const rx = -normY * 20;

    // Translation movement (shifts right/left/up/down towards mouse)
    const tx = normX * 36;
    const ty = normY * 24;

    setCardTilt({ rx, ry, tx, ty, active: true });
  };

  const handleHeroMouseLeave = () => {
    setCardTilt({ rx: 0, ry: 0, tx: 0, ty: 0, active: false });
  };

  return (
    <div className="page home-page">
      {/* ===================================================
          HERO SECTION
          =================================================== */}
      <section 
        className="home-hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <div className="hero-left">
          <div className="hero-label">
            <Sprout size={18} />
            <span>Smart Farming IoT Platform</span>
            <Sparkles size={14} className="hero-sparkle" />
          </div>

          <h1>
            Monitoring Lahan Pertanian <br />
            <span className="gradient-text">Berbasis 3D & IoT</span>
          </h1>

          <p>
            Sistem cerdas pemantauan lahan pertanian secara real-time. Kelola 11 petak tanah, 
            kontrol pompa irigasi otomatis, ketahui kondisi cuaca global, dan interaksi dengan 
            visualisasi Three.js 3D interaktif.
          </p>

          <div className="home-actions">
            <Link to="/dashboard" className="primary-link">
              <span>Buka Dashboard 3D</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/control" className="secondary-link">
              <Power size={18} />
              <span>Control Panel</span>
            </Link>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-pill">
              <div className="stat-icon-glow green">
                <Sprout size={18} />
              </div>
              <div>
                <strong>11 Petak</strong>
                <span>Lahan Pertanian</span>
              </div>
            </div>

            <div className="hero-stat-pill">
              <div className="stat-icon-glow blue">
                <WeatherIcon size={18} />
              </div>
              <div>
                <strong>{weatherStatus}</strong>
                <span>Rain Sensor</span>
              </div>
            </div>

            <div className="hero-stat-pill">
              <div className="stat-icon-glow lime">
                <Bot size={18} />
              </div>
              <div>
                <strong>Smart Pump</strong>
                <span>Auto Irrigation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-visual">
          <div 
            className="three-d-floating-card main-card"
            style={{
              transform: cardTilt.active
                ? `perspective(1000px) translateX(${cardTilt.tx}px) translateY(${cardTilt.ty}px) rotateX(${cardTilt.rx}deg) rotateY(${cardTilt.ry}deg) scale3d(1.08, 1.08, 1.08)`
                : "perspective(1000px) translateX(0px) translateY(0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
              transition: cardTilt.active
                ? "transform 0.08s ease-out"
                : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="card-glow-ring" />
            <div className="card-icon-badge">
              <Layers3 size={48} />
            </div>
            <strong>Smart Farm IoT</strong>
            <span>Simulasi & Visual Cerdas</span>

            <div 
              className="card-mini-tag plot-tag"
              style={{
                transform: cardTilt.active
                  ? `translateZ(65px) translateX(${cardTilt.tx * 1.3}px) translateY(${cardTilt.ty * 1.3}px)`
                  : undefined
              }}
            >
              <Droplets size={14} />
              <span>Soil Sensor</span>
            </div>

            <div 
              className="card-mini-tag pump-tag"
              style={{
                transform: cardTilt.active
                  ? `translateZ(85px) translateX(${cardTilt.tx * 1.7}px) translateY(${cardTilt.ty * 1.7}px)`
                  : undefined
              }}
            >
              <Power size={14} />
              <span>Auto Pump</span>
            </div>

            <div 
              className="card-mini-tag rain-tag"
              style={{
                transform: cardTilt.active
                  ? `translateZ(45px) translateX(${cardTilt.tx * 0.9}px) translateY(${cardTilt.ty * 0.9}px)`
                  : undefined
              }}
            >
              <WeatherIcon size={14} />
              <span>{weatherStatus}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SHOWCASE & ARCHITECTURE SECTION
          =================================================== */}
      <section className="home-showcase">
        <div className="showcase-left">
          <div className="showcase-badge">
            <Activity size={15} />
            SYSTEM ARCHITECTURE
          </div>

          <h2>Visualisasi & Alur Kerja Smart Farming</h2>

          <p>
            Alur data terintegrasi dari sensor IoT tanah per-petak dan rain sensor global, 
            disimpan di database Supabase PostgreSQL, diproses backend Express Node.js, 
            dan divisualisasikan secara visual di React.
          </p>

          <div className="showcase-stats">
            <div className="showcase-stat-box">
              <div className="box-icon green">
                <Droplets size={22} />
              </div>
              <strong>IoT</strong>
              <span>Sensor Tanah & Hujan</span>
            </div>

            <div className="showcase-stat-box">
              <div className="box-icon blue">
                <Database size={22} />
              </div>
              <strong>DB</strong>
              <span>Supabase Postgres</span>
            </div>

            <div className="showcase-stat-box">
              <div className="box-icon purple">
                <Layers3 size={22} />
              </div>
              <strong>3D</strong>
              <span>Three.js Visual</span>
            </div>
          </div>

          <Link to="/control" className="showcase-btn">
            <span>Buka Control Panel</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="showcase-preview-wrap">
          <SystemPreview />
        </div>
      </section>

      {/* ===================================================
          FEATURE GRID (3D TILT CARDS)
          =================================================== */}
      <section className="feature-grid">
        <div className="feature-card three-d-card">
          <div className="feature-icon-wrap green">
            <Droplets size={26} />
          </div>
          <h3>Monitoring Kelembaban Tanah</h3>
          <p>
            Memantau kelembapan tanah per petak secara presisi dengan ambang batas 
            Normal, Waspada, dan Kritis.
          </p>
        </div>

        <div className="feature-card three-d-card">
          <div className="feature-icon-wrap sky">
            <Thermometer size={26} />
          </div>
          <h3>Monitoring Lingkungan Global</h3>
          <p>
            Rain sensor dan kelembapan udara memantau cuaca global seluruh area lahan pertanian.
          </p>
        </div>

        <div className="feature-card three-d-card">
          <div className="feature-icon-wrap purple">
            <Power size={26} />
          </div>
          <h3>Smart Pump & Rain Override</h3>
          <p>
            Kontrol pompa AUTO/MANUAL. Saat hujan terdeteksi, seluruh pompa otomatis dipaksa OFF.
          </p>
        </div>

        <div className="feature-card three-d-card">
          <div className="feature-icon-wrap lime">
            <Database size={26} />
          </div>
          <h3>Supabase Database & Report</h3>
          <p>
            Seluruh log dan riwayat sensor tersimpan aman di database dan dapat di-export ke CSV.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;