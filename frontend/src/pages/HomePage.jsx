import { Link } from "react-router-dom";
import { Sprout, Droplets, Thermometer, Power, Database } from "lucide-react";
import SystemPreview from "../components/SystemPreview";

function HomePage() {
  return (
    <div className="page">
      <section className="home-hero">
        <div>
          <div className="hero-label">
            <Sprout size={18} />
            Smart Farming Monitoring System
          </div>

          <h1>Monitoring Lahan Pertanian Berbasis IoT</h1>

          <p>
            Sistem ini digunakan untuk memantau kondisi lahan pertanian melalui
            data dummy sensor IoT yang disimpan di Supabase, diproses oleh
            backend Node.js Express, dan ditampilkan menggunakan React Vite.
          </p>

          <div className="home-actions">
            <Link to="/dashboard" className="primary-link">
              Masuk Dashboard
            </Link>
          </div>
        </div>

        <div className="home-visual">
          <div className="circle-card big">
            <Sprout size={52} />
            <strong>Smart Farming</strong>
            <span>IoT Dashboard</span>
          </div>

          <div className="mini-card one">Soil Moisture</div>
          <div className="mini-card two">Pump Control</div>
          <div className="mini-card three">Supabase</div>
        </div>
      </section>

      <section className="home-showcase">
        <div className="showcase-left">
          <div className="showcase-badge">Project Overview</div>

          <h2>Visualisasi Sistem Smart Farming</h2>

          <p>
            Halaman ini menjelaskan alur kerja sistem, mulai dari data dummy IoT,
            penyimpanan Supabase, backend Express, sampai visualisasi dashboard
            React.
          </p>

          <div className="showcase-stats">
            <div>
              <strong>IoT</strong>
              <span>Dummy Sensor</span>
            </div>

            <div>
              <strong>API</strong>
              <span>Express</span>
            </div>

            <div>
              <strong>DB</strong>
              <span>Supabase</span>
            </div>
          </div>

          <Link to="/dashboard" className="showcase-btn">
            Buka Dashboard 3D
          </Link>
        </div>

        <SystemPreview />
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <Droplets size={28} />
          <h3>Monitoring Kelembaban</h3>
          <p>Menampilkan kelembaban tanah tiap petak lahan secara visual.</p>
        </div>

        <div className="feature-card">
          <Thermometer size={28} />
          <h3>Monitoring Suhu</h3>
          <p>Memantau suhu area lahan berdasarkan data sensor dummy.</p>
        </div>

        <div className="feature-card">
          <Power size={28} />
          <h3>Kontrol Pompa</h3>
          <p>Simulasi menyalakan dan mematikan pompa pada setiap petak.</p>
        </div>

        <div className="feature-card">
          <Database size={28} />
          <h3>Database Supabase</h3>
          <p>Data dummy sensor disimpan di database Supabase PostgreSQL.</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;