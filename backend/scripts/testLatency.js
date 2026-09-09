const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const supabase = require("../supabaseClient");

// ========================================
// KONFIGURASI PENGUJIAN
// ========================================

// Jumlah data diambil dari terminal.
// Contoh: node scripts/testLatency.js 100
const totalData = Number(process.argv[2]) || 100;

// Batch dibuat unik agar hasil setiap tes tidak tercampur.
const batchName = `TEST-${totalData}-DATA-${Date.now()}`;

// ========================================
// FUNGSI BANTUAN
// ========================================

function randomNumber(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function calculateAverage(numbers) {
  if (!numbers.length) return 0;

  const total = numbers.reduce((sum, value) => sum + value, 0);

  return total / numbers.length;
}

function formatNumber(value) {
  return Number(value).toFixed(2);
}

// ========================================
// PENGUJIAN LATENSI
// ========================================

async function runLatencyTest() {
  console.log("");
  console.log("==============================================");
  console.log(" PENGUJIAN LATENSI PENYIMPANAN DATA SENSOR");
  console.log("==============================================");
  console.log(`Batch pengujian : ${batchName}`);
  console.log(`Jumlah data     : ${totalData}`);
  console.log("==============================================");
  console.log("");

  const results = [];

  let successCount = 0;
  let failedCount = 0;

  for (let index = 1; index <= totalData; index++) {
    // Waktu ketika data dummy dianggap dibaca oleh sensor.
    const acquisitionTime = new Date().toISOString();
    
    const dummySensor = {
      test_batch: batchName,
      sequence_number: index,
      area: `Petak ${(index % 8) + 1}`,
      temperature: randomNumber(24, 36),
      soil_moisture: randomNumber(15, 70),
      humidity: randomNumber(50, 90),
      light: randomNumber(200, 1000),
      acquisition_time: acquisitionTime,
    };

    // Dipakai sebagai informasi tambahan:
    // waktu request insert sampai respons diterima kembali.
    const requestStart = performance.now();

    const { data, error } = await supabase
      .from("sensor_latency_test")
      .insert(dummySensor)
      .select()
      .single();

    const requestEnd = performance.now();

    if (error) {
      failedCount++;

      console.log(
        `[GAGAL] Data ${index}/${totalData}: ${error.message}`
      );

      continue;
    }

    successCount++;

    const acquisitionDate = new Date(data.acquisition_time);
    const storageDate = new Date(data.storage_time);

    // Latensi sesuai materi dosen:
    // waktu database menyimpan - waktu data diakuisisi.
    const storageLatencyMs =
      storageDate.getTime() - acquisitionDate.getTime();

    // Tambahan informasi waktu pulang-pergi request.
    const roundTripMs = requestEnd - requestStart;

    results.push({
      sequence_number: data.sequence_number,
      area: data.area,
      acquisition_time: data.acquisition_time,
      storage_time: data.storage_time,
      storage_latency_ms: storageLatencyMs,
      round_trip_ms: roundTripMs,
    });

    console.log(
      `[BERHASIL] Data ${index}/${totalData} | ` +
        `Latensi DB: ${formatNumber(storageLatencyMs)} ms | ` +
        `Round trip: ${formatNumber(roundTripMs)} ms`
    );
  }

  // ========================================
  // PERHITUNGAN HASIL AKHIR
  // ========================================

  const storageLatencies = results.map(
    (item) => item.storage_latency_ms
  );

  const roundTripLatencies = results.map(
    (item) => item.round_trip_ms
  );

  const minimumLatency = storageLatencies.length
    ? Math.min(...storageLatencies)
    : 0;

  const maximumLatency = storageLatencies.length
    ? Math.max(...storageLatencies)
    : 0;

  const averageLatency = calculateAverage(storageLatencies);

  const averageRoundTrip = calculateAverage(roundTripLatencies);

  const successPercentage =
    totalData === 0 ? 0 : (successCount / totalData) * 100;

  console.log("");
  console.log("==============================================");
  console.log(" HASIL PENGUJIAN LATENSI");
  console.log("==============================================");
  console.log(`Batch                : ${batchName}`);
  console.log(`Data dikirim         : ${totalData}`);
  console.log(`Data berhasil masuk  : ${successCount}`);
  console.log(`Data gagal masuk     : ${failedCount}`);
  console.log(
    `Persentase berhasil : ${formatNumber(successPercentage)}%`
  );
  console.log(
    `Latensi minimum     : ${formatNumber(minimumLatency)} ms`
  );
  console.log(
    `Latensi maksimum    : ${formatNumber(maximumLatency)} ms`
  );
  console.log(
    `Rata-rata latensi   : ${formatNumber(averageLatency)} ms`
  );
  console.log(
    `Rata-rata round trip: ${formatNumber(averageRoundTrip)} ms`
  );
  console.log("==============================================");

  // ========================================
  // SIMPAN HASIL DETAIL KE CSV
  // ========================================

  const outputFolder = path.join(__dirname, "results");

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, {
      recursive: true,
    });
  }

  const csvHeader = [
    "sequence_number",
    "area",
    "acquisition_time",
    "storage_time",
    "storage_latency_ms",
    "round_trip_ms",
  ].join(",");

  const csvRows = results.map((item) =>
    [
      item.sequence_number,
      item.area,
      item.acquisition_time,
      item.storage_time,
      formatNumber(item.storage_latency_ms),
      formatNumber(item.round_trip_ms),
    ].join(",")
  );

  const csvContent = [csvHeader, ...csvRows].join("\n");

  const csvFileName = `${batchName}.csv`;

  const csvFilePath = path.join(outputFolder, csvFileName);

  fs.writeFileSync(csvFilePath, csvContent, "utf8");

  // ========================================
  // SIMPAN RINGKASAN KE FILE TXT
  // ========================================

  const summaryContent = `
PENGUJIAN LATENSI PENYIMPANAN DATA SENSOR
=========================================
Batch                : ${batchName}
Data dikirim         : ${totalData}
Data berhasil masuk  : ${successCount}
Data gagal masuk     : ${failedCount}
Persentase berhasil  : ${formatNumber(successPercentage)}%
Latensi minimum      : ${formatNumber(minimumLatency)} ms
Latensi maksimum     : ${formatNumber(maximumLatency)} ms
Rata-rata latensi    : ${formatNumber(averageLatency)} ms
Rata-rata round trip : ${formatNumber(averageRoundTrip)} ms
`;

  const summaryFilePath = path.join(
    outputFolder,
    `${batchName}-SUMMARY.txt`
  );

  fs.writeFileSync(summaryFilePath, summaryContent, "utf8");

  console.log("");
  console.log("File hasil berhasil disimpan:");
  console.log(csvFilePath);
  console.log(summaryFilePath);
  console.log("");
}

runLatencyTest()
  .then(() => {
    console.log("Pengujian selesai.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Terjadi error:", error);
    process.exit(1);
  });