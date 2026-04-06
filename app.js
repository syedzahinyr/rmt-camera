const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzC-Nza9M4A-XrY1hsVTR_bCR-jpMXF6dGnVohJohi5HMyFEjuEm2P8zu4EZYYQ2XFA/exec";

const video = document.getElementById("video");
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnAttendance = document.getElementById("btnAttendance");
const btnPause = document.getElementById("btnPause");
const studentIdInput = document.getElementById("studentId");
const statusEl = document.getElementById("status");

let stream = null;
let paused = false;

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = "status";
  if (type) statusEl.classList.add(type);
}

async function startCamera() {
  try {
    setStatus("Membuka kamera...");
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
    setStatus("Kamera berjaya dibuka.", "ok");
  } catch (err) {
    setStatus(`Camera error: ${err.name}: ${err.message}`, "err");
    console.error(err);
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    stream = null;
    setStatus("Kamera dihentikan.", "warn");
  }
}

function togglePause() {
  paused = !paused;
  if (paused) {
    setStatus("Mode pause aktif.", "warn");
    btnPause.textContent = "Resume";
  } else {
    setStatus("Mode pause dimatikan.", "ok");
    btnPause.textContent = "Pause";
  }
}

async function sendAttendance() {
  const studentId = studentIdInput.value.trim();
  if (!studentId) {
    setStatus("Sila masukkan ID murid / kod terlebih dahulu.", "err");
    return;
  }

  if (!WEB_APP_URL || WEB_APP_URL.includes("PASTE_APPS_SCRIPT")) {
    setStatus("WEB_APP_URL belum ditetapkan dalam app.js", "err");
    return;
  }

  try {
    setStatus("Menghantar kehadiran...");

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "attendance",
        id: studentId
      })
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Respons backend bukan JSON yang sah: " + text);
    }

    if (data.ok) {
      setStatus(data.msg || "Kehadiran berjaya direkod.", "ok");
    } else {
      setStatus(data.msg || data.error || "Gagal rekod kehadiran.", "err");
    }
  } catch (err) {
    console.error(err);
    setStatus("Ralat hantar kehadiran: " + err.message, "err");
  }
}

btnStart.addEventListener("click", startCamera);
btnStop.addEventListener("click", stopCamera);
btnPause.addEventListener("click", togglePause);
btnAttendance.addEventListener("click", sendAttendance);
