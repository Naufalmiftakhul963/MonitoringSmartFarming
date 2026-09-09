import { useState } from "react";
import { Activity, Database, Cpu, BarChart3, CheckCircle } from "lucide-react";

function SystemPreview() {
  const [activeStep, setActiveStep] = useState("iot");

  const steps = [
    {
      id: "iot",
      title: "IoT Dummy",
      subtitle: "Simulasi sensor",
      icon: Activity,
      desc: "Data suhu, kelembaban tanah, cahaya, dan status pompa dibuat sebagai data dummy sensor IoT.",
      items: ["Temperature", "Soil Moisture", "Light Sensor", "Pump Status"],
    },
    {
      id: "database",
      title: "Supabase",
      subtitle: "Database",
      icon: Database,
      desc: "Data sensor disimpan ke database Supabase PostgreSQL agar bisa diakses oleh backend.",
      items: ["sensor_data", "summary_data", "pump_status", "PostgreSQL"],
    },
    {
      id: "backend",
      title: "Express API",
      subtitle: "Backend",
      icon: Cpu,
      desc: "Backend Node.js Express mengambil data dari Supabase dan menyediakan endpoint API.",
      items: ["/api/sensors", "/api/summary", "/api/pump/:id", "REST API"],
    },
    {
      id: "frontend",
      title: "React Dashboard",
      subtitle: "Frontend",
      icon: BarChart3,
      desc: "Frontend React Vite menampilkan data menjadi card, grafik, tabel, report, dan model farm 3D.",
      items: ["Dashboard", "Chart", "Report", "3D Farm"],
    },
  ];

  const selected = steps.find((step) => step.id === activeStep) || steps[0];
  const SelectedIcon = selected.icon;

  return (
    <div
      className="home-system-preview"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        e.currentTarget.style.setProperty("--mx", x.toFixed(2));
        e.currentTarget.style.setProperty("--my", y.toFixed(2));
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty("--mx", 0);
        e.currentTarget.style.setProperty("--my", 0);
      }}
    >
      <div className="system-orb orb-one"></div>
      <div className="system-orb orb-two"></div>

      <div className="system-preview-top">
        <div>
          <span>Interactive System Flow</span>
          <h3>Alur Kerja SmartFarm</h3>
        </div>

        <div className="system-status">
          <span></span>
          Localhost Ready
        </div>
      </div>

      <div className="system-flow-area">
        <div className="flow-line">
          <i></i>
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <button
              type="button"
              key={step.id}
              className={`flow-step ${activeStep === step.id ? "active" : ""}`}
              onClick={() => setActiveStep(step.id)}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="flow-icon">
                <Icon size={22} />
              </div>

              <div>
                <strong>{step.title}</strong>
                <span>{step.subtitle}</span>
              </div>

              <small className="step-number">0{index + 1}</small>
            </button>
          );
        })}
      </div>

      <div className="system-detail-card">
        <div className="detail-main">
          <div className="detail-icon">
            <SelectedIcon size={30} />
          </div>

          <div>
            <span>Selected Module</span>
            <h4>{selected.title}</h4>
          </div>
        </div>

        <p>{selected.desc}</p>

        <div className="detail-tags">
          {selected.items.map((item) => (
            <span key={item}>
              <CheckCircle size={14} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SystemPreview;