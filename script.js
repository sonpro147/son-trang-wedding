// Điền ngày theo định dạng YYYY-MM-DD khi hai bạn chốt lịch.
const weddingDate = "";

// Thay địa chỉ và từ khoá bản đồ khi có thông tin hai nhà.
// Có thể dùng địa chỉ đầy đủ hoặc tọa độ trong mapQuery.
const venueLocations = {
  groom: { address: "", mapQuery: "", mapLink: "" },
  bride: { address: "", mapQuery: "", mapLink: "" }
};

// Đặt ảnh QR đã được đồng ý công khai tại assets/qr-chuyen-khoan.png rồi điền đường dẫn dưới đây.
const giftQrImage = "";

const countdown = document.querySelector("#countdown");
if (weddingDate && countdown) {
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

document.querySelectorAll(".map-card[data-venue]").forEach((card) => {
  const venue = venueLocations[card.dataset.venue];
  if (!venue) return;
  const address = card.querySelector(".venue-address");
  const mapSlot = card.querySelector(".map-embed-slot");
  const mapLink = card.querySelector(".map-link");
  if (venue.address.trim()) address.textContent = venue.address;
  const query = venue.mapQuery.trim() || venue.address.trim();
  if (!query) return;

  const iframe = document.createElement("iframe");
  iframe.title = `Bản đồ ${card.dataset.venue === "groom" ? "nhà trai" : "nhà gái"}`;
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.allowFullscreen = true;
  iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  mapSlot.replaceChildren(iframe);
  mapLink.href = venue.mapLink.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  mapLink.hidden = false;
});

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

const giftDialog = document.querySelector("#giftDialog");
document.querySelector("#giftButton").addEventListener("click", () => giftDialog.showModal());
document.querySelector("#giftClose").addEventListener("click", () => giftDialog.close());
giftDialog.addEventListener("click", (event) => {
  if (event.target === giftDialog) giftDialog.close();
});
if (giftQrImage) {
  const image = document.createElement("img");
  image.src = giftQrImage;
  image.alt = "Mã QR chuyển khoản mừng cưới";
  image.className = "gift-qr-image";
  document.querySelector("#qrPlaceholder").replaceChildren(image);
}

// Nhạc nền ambient demo được tạo ngay trong trình duyệt; cần người xem chạm nút bật nhạc.
let audioContext;
let musicTimer;
let chordIndex = 0;
const chords = [
  [261.63, 329.63, 392, 493.88],
  [196, 246.94, 293.66, 392],
  [220, 261.63, 329.63, 392],
  [174.61, 220, 261.63, 349.23]
];
const soundButton = document.querySelector("#soundToggle");
soundButton.addEventListener("click", async () => {
  const isPlaying = soundButton.getAttribute("aria-pressed") === "true";
  if (isPlaying) {
    window.clearInterval(musicTimer);
    await audioContext?.suspend();
    soundButton.setAttribute("aria-pressed", "false");
    document.querySelector("#soundLabel").textContent = "Bật nhạc nền";
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return showToast("Trình duyệt này chưa hỗ trợ phát nhạc nền.");
  audioContext ??= new AudioContextClass();
  await audioContext.resume();
  const playChord = () => {
    const start = audioContext.currentTime;
    const chord = chords[chordIndex++ % chords.length];
    chord.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.004 : 0.0025, start + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.3);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 3.35);
    });
  };
  playChord();
  musicTimer = window.setInterval(playChord, 3400);
  soundButton.setAttribute("aria-pressed", "true");
  document.querySelector("#soundLabel").textContent = "Tắt nhạc nền";
});


