import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ControlPanelPage from "./pages/ControlPanelPage";
import ReportPage from "./pages/ReportPage";
import AboutPage from "./pages/AboutPage";

import "./App.css";

const API_URL =
  import.meta.env
    .VITE_API_URL ||
  "http://localhost:5000";

function App() {
  const [
    sensors,
    setSensors,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    environment,
    setEnvironment,
  ] = useState({
    humidity: 0,
    rain_detected: false,
    weather_status: "CERAH",
    updated_at: null,
  });

  const [
    lastUpdate,
    setLastUpdate,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =======================================================
     FETCH
     ======================================================= */

  const fetchData =
    async () => {
      try {
        setLoading(true);

        const [
          sensorResponse,
          summaryResponse,
          environmentResponse,
        ] =
          await Promise.all([
            axios.get(
              `${API_URL}/api/sensors`
            ),

            axios.get(
              `${API_URL}/api/summary`
            ),

            axios.get(
              `${API_URL}/api/environment`
            ),
          ]);

        setSensors(
          sensorResponse.data ||
            []
        );

        setSummary(
          summaryResponse.data ||
            null
        );

        setEnvironment({
          humidity:
            Number(
              environmentResponse
                .data
                ?.humidity ??
                0
            ),

          rain_detected:
            Boolean(
              environmentResponse
                .data
                ?.rain_detected
            ),

          weather_status:
            environmentResponse
              .data
              ?.weather_status ||
            "CERAH",

          updated_at:
            environmentResponse
              .data
              ?.updated_at ||
            null,
        });

        setLastUpdate(
          new Date()
            .toLocaleTimeString(
              "id-ID"
            )
        );
      } catch (error) {
        console.error(
          "Gagal mengambil data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     AUTO REFRESH
     ======================================================= */

  useEffect(() => {
    fetchData();

    const interval =
      setInterval(
        fetchData,
        60000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  /* =======================================================
     MANUAL PUMP
     ======================================================= */

  const togglePump =
    async (
      id,
      currentStatus
    ) => {
      const newStatus =
        currentStatus ===
        "ON"
          ? "OFF"
          : "ON";

      try {
        await axios.put(
          `${API_URL}/api/pump/${id}`,
          {
            pump_status:
              newStatus,
          }
        );

        await fetchData();
      } catch (error) {
        console.error(
          "Gagal mengubah pompa:",
          error
        );

        throw error;
      }
    };

  /* =======================================================
     CONTROL MODE
     ======================================================= */

  const toggleControlMode =
    async (
      id,
      currentMode
    ) => {
      const newMode =
        currentMode ===
        "AUTO"
          ? "MANUAL"
          : "AUTO";

      try {
        await axios.put(
          `${API_URL}/api/control-mode/${id}`,
          {
            control_mode:
              newMode,
          }
        );

        await fetchData();
      } catch (error) {
        console.error(
          "Gagal mengubah mode:",
          error
        );

        throw error;
      }
    };

  /* =======================================================
     AUTO CONTROL
     ======================================================= */

  const runAutoControl =
    async () => {
      try {
        await axios.post(
          `${API_URL}/api/auto-control`
        );

        await fetchData();
      } catch (error) {
        console.error(
          "Gagal menjalankan AUTO:",
          error
        );

        throw error;
      }
    };

  /* =======================================================
     RAIN SENSOR SIMULATION
     ======================================================= */

  const updateRainSensor =
    async (
      rainDetected
    ) => {
      try {
        await axios.put(
          `${API_URL}/api/environment/rain`,
          {
            rain_detected:
              Boolean(
                rainDetected
              ),
          }
        );

        await fetchData();
      } catch (error) {
        console.error(
          "Gagal update rain sensor:",
          error
        );

        throw error;
      }
    };

  /* =======================================================
     HUMIDITY SIMULATION
     ======================================================= */

  const updateHumidity =
    async (
      humidity
    ) => {
      try {
        await axios.put(
          `${API_URL}/api/environment/humidity`,
          {
            humidity:
              Number(
                humidity
              ),
          }
        );

        await fetchData();
      } catch (error) {
        console.error(
          "Gagal update humidity:",
          error
        );

        throw error;
      }
    };

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={
            <HomePage
              sensors={
                sensors
              }
              environment={
                environment
              }
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <DashboardPage
              sensors={
                sensors
              }
              summary={
                summary
              }
              environment={
                environment
              }
              lastUpdate={
                lastUpdate
              }
              fetchData={
                fetchData
              }
              loading={
                loading
              }
            />
          }
        />

        <Route
          path="/control"
          element={
            <ControlPanelPage
              sensors={
                sensors
              }
              summary={
                summary
              }
              environment={
                environment
              }
              togglePump={
                togglePump
              }
              toggleControlMode={
                toggleControlMode
              }
              runAutoControl={
                runAutoControl
              }
              updateRainSensor={
                updateRainSensor
              }
              updateHumidity={
                updateHumidity
              }
            />
          }
        />

        <Route
          path="/report"
          element={
            <ReportPage
              sensors={
                sensors
              }
              summary={
                summary
              }
              environment={
                environment
              }
            />
          }
        />

        <Route
          path="/about"
          element={
            <AboutPage />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;