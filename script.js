// Điền ngày theo định dạng YYYY-MM-DD khi hai bạn chốt lịch. Để trống khi chưa có.
const weddingDate = "";

const countdown = document.querySelector("#countdown");
if (weddingDate) {
  const target = new Date(`${weddingDate}T00:00:00+07:00`).getTime();
  const fields = [...countdown.querySelectorAll("b")];
  const updateCountdown = () => {
    const diff = Math.max(0, target - Date.now());
    const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
    fields.forEach((field, index) => field.textContent = String(values[index]).padStart(2, "0"));
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

document.querySelector("#rsvpButton").addEventListener("click", () => {
  showToast("Nút demo thôi nhé — thêm số liên hệ hoặc biểu mẫu RSVP để khách xác nhận.");
});

// Tạo một giai điệu rất nhẹ ngay trong trình duyệt, không tải tệp nhạc bên ngoài.
let audioContext;
let musicTimer;
let noteIndex = 0;
const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
const soundButton = document.querySelector("#soundToggle");
soundButton.addEventListener("click", async () => {
  const isPlaying = soundButton.getAttribute("aria-pressed") === "true";
  if (isPlaying) {
    window.clearInterval(musicTimer);
    await audioContext?.suspend();
    soundButton.setAttribute("aria-pressed", "false");
    document.querySelector("#soundLabel").textContent = "Bật nhạc";
    return;
  }
  audioContext ??= new AudioContext();
  await audioContext.resume();
  const playNote = () => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = melody[noteIndex++ % melody.length];
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.8);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.82);
  };
  playNote();
  musicTimer = window.setInterval(playNote, 1050);
  soundButton.setAttribute("aria-pressed", "true");
  document.querySelector("#soundLabel").textContent = "Tắt nhạc";
});

