const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element && value !== undefined && value !== null) element.textContent = String(value);
}

function renderGallery(items = []) {
  const gallery = document.querySelector("#galleryGrid");
  gallery.replaceChildren();
  items.forEach((item, index) => {
    const frame = document.createElement("div");
    frame.className = `gallery-frame${index === 0 ? " gallery-tall" : ""}${index === 2 ? " gallery-offset" : ""}`;
    if (item.url) {
      const image = document.createElement("img");
      image.src = item.url;
      image.alt = item.alt || `Ảnh cưới ${index + 1}`;
      image.loading = "lazy";
      frame.append(image);
    }
    const number = document.createElement("span");
    number.className = "frame-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const cross = document.createElement("span");
    cross.className = "photo-cross";
    cross.textContent = "+";
    const caption = document.createElement("span");
    caption.className = "frame-caption";
    caption.textContent = item.url ? (item.alt || "") : "ẢNH CƯỚI · THAY ẢNH TẠI ĐÂY";
    if (item.url) cross.hidden = true;
    frame.append(number, cross, caption);
    gallery.append(frame);
  });
}

function renderGuestbook(items = []) {
  const list = document.querySelector("#guestbookList");
  list.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "guestbook-empty";
    empty.textContent = "Lời chúc sẽ được thêm vào đây sau khi được duyệt.";
    list.append(empty);
    return;
  }
  [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach((item) => {
    const article = document.createElement("article");
    article.className = "wish-card";
    const heading = document.createElement("div");
    heading.className = "wish-card-heading";
    const name = document.createElement("strong");
    name.textContent = item.name || "Một người bạn";
    const time = document.createElement("time");
    const date = new Date(item.createdAt);
    time.dateTime = Number.isNaN(date.getTime()) ? "" : date.toISOString();
    time.textContent = Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
    heading.append(name, time);
    const message = document.createElement("p");
    message.textContent = item.message || "";
    article.append(heading, message);
    list.append(article);
  });
}

function renderMap(key, location) {
  const venueTitle = document.getElementById(`${key}VenueTitle`);
  const venueAddress = document.getElementById(`${key}VenueAddress`);
  const mapHeading = document.getElementById(`${key}MapHeading`);
  const mapHint = document.getElementById(`${key}MapHint`);
  const card = document.querySelector(`.map-card[data-venue="${key}"]`);
  const mapSlot = card.querySelector(".map-embed-slot");
  const mapLink = card.querySelector(".map-link");
  const address = location?.address || "";
  setText(`${key}VenueTitle`, location?.title || (key === "groom" ? "Nhà chú rể" : "Nhà cô dâu"));
  setText(`${key}VenueAddress`, address || "[Thêm địa chỉ trong phần quản trị]");

  const query = location?.mapQuery?.trim() || address.trim();
  if (!query || query.startsWith("[")) {
    setText(`${key}MapHeading`, key === "groom" ? "CHỜ ĐỊA CHỈ NHÀ TRAI" : "CHỜ ĐỊA CHỈ NHÀ GÁI");
    setText(`${key}MapHint`, "Thêm địa chỉ trong phần quản trị để hiện bản đồ.");
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.title = `Bản đồ ${key === "groom" ? "nhà trai" : "nhà gái"}`;
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.allowFullscreen = true;
  iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  mapSlot.replaceChildren(iframe);
  mapLink.href = location?.mapLink?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  mapLink.hidden = false;
}

function renderCountdown(dateValue) {
  const countdown = document.querySelector("#countdown");
  const fields = [...countdown.querySelectorAll("b")];
  const note = countdown.nextElementSibling;
  if (!dateValue) {
    fields.forEach((field) => { field.textContent = "--"; });
    return;
  }
  const target = new Date(`${dateValue}T00:00:00+07:00`).getTime();
  if (!Number.isFinite(target)) return;
  const update = () => {
    const diff = Math.max(0, target - Date.now());
    const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
    fields.forEach((field, index) => { field.textContent = String(values[index]).padStart(2, "0"); });
  };
  update();
  window.setInterval(update, 1000);
  if (note) note.hidden = true;
}

function applyContent(content) {
  const groom = content.couple?.groom || "Khắc Sơn";
  const bride = content.couple?.bride || "Huyền Trang";
  setText("heroGroom", groom);
  setText("heroBride", bride);
  setText("heroKicker", content.hero?.kicker);
  setText("heroDateLabel", content.hero?.dateLabel);
  setText("storyGroom", groom.toLocaleUpperCase("vi-VN"));
  setText("storyBride", bride.toLocaleUpperCase("vi-VN"));
  setText("invitationGroom", groom);
  setText("invitationBride", bride);
  setText("footerNames", `WITH LOVE, ${groom.toLocaleUpperCase("vi-VN")} & ${bride.toLocaleUpperCase("vi-VN")}`);
  setText("storyEyebrow", content.story?.eyebrow);
  setText("storyTitle", content.story?.title);
  setText("storyAccent", content.story?.accent);
  setText("storyBody", content.story?.body);
  setText("storyClosing", content.story?.closing);
  setText("invitationEyebrow", content.invitation?.eyebrow);
  setText("invitationTitle", content.invitation?.title);
  setText("invitationAccent", content.invitation?.accent);

  setText("groomParent1", content.invitation?.parents?.groom?.[0]);
  setText("groomParent2", content.invitation?.parents?.groom?.[1]);
  setText("brideParent1", content.invitation?.parents?.bride?.[0]);
  setText("brideParent2", content.invitation?.parents?.bride?.[1]);
  (content.invitation?.events || []).slice(0, 2).forEach((event, index) => {
    const number = index + 1;
    setText(`event${number}Label`, event.label);
    setText(`event${number}Date`, event.date);
    setText(`event${number}Venue`, event.venue);
    setText(`event${number}Address`, event.address);
  });

  setText("calendarEyebrow", content.calendar?.eyebrow);
  setText("calendarTitle", content.calendar?.title);
  setText("calendarAccent", content.calendar?.accent);
  setText("calendarDescription", content.calendar?.description);
  setText("calendarFooter", content.calendar?.footer);
  setText("galleryEyebrow", content.gallery?.eyebrow);
  setText("galleryTitle", content.gallery?.title);
  setText("galleryAccent", content.gallery?.accent);
  setText("galleryDescription", content.gallery?.description);
  setText("mapsEyebrow", content.locations?.eyebrow);
  setText("mapsTitle", content.locations?.title);
  setText("mapsAccent", content.locations?.accent);
  setText("mapsDescription", content.locations?.description);
  setText("rsvpEyebrow", content.rsvp?.eyebrow);
  setText("rsvpTitle", content.rsvp?.title);
  setText("rsvpAccent", content.rsvp?.accent);
  setText("rsvpDescription", content.rsvp?.description);
  setText("rsvpThanks", content.rsvp?.thanks);
  setText("giftLabel", content.gift?.label);
  setText("giftDescription", content.gift?.description);
  setText("giftTitle", content.gift?.title);
  setText("giftAccent", content.gift?.accent);
  setText("giftMessage", content.gift?.message);

  const weddingDate = content.invitation?.weddingDate || "";
  renderCountdown(weddingDate);
  if (weddingDate) {
    const date = new Date(`${weddingDate}T12:00:00`);
    setText("calendarMonth", new Intl.DateTimeFormat("vi-VN", { month: "long" }).format(date).toLocaleUpperCase("vi-VN"));
    setText("calendarYear", date.getFullYear());
    setText("calendarDate", date.getDate());
    setText("calendarCaption", "NGÀY CƯỚI CỦA CHÚNG MÌNH");
  } else {
    setText("calendarMonth", content.calendar?.monthLabel);
    setText("calendarYear", content.calendar?.yearLabel);
    setText("calendarDate", content.calendar?.dateLabel);
  }

  const heroPhoto = document.querySelector("#heroPhoto");
  const heroImage = document.querySelector("#heroImage");
  if (content.hero?.photoUrl) {
    heroImage.src = content.hero.photoUrl;
    heroImage.alt = content.hero.photoAlt || `Ảnh cưới của ${groom} và ${bride}`;
    heroImage.hidden = false;
    heroPhoto.classList.add("has-photo");
    heroPhoto.setAttribute("aria-label", heroImage.alt);
  } else {
    heroImage.hidden = true;
    heroImage.removeAttribute("src");
    heroPhoto.classList.remove("has-photo");
  }

  renderGallery(content.gallery?.items || []);
  renderGuestbook(content.comments || []);
  renderMap("groom", content.locations?.groom || {});
  renderMap("bride", content.locations?.bride || {});
  const rsvpUrl = content.rsvp?.url || "";
  const form = document.querySelector("#wishForm");
  const formLink = document.querySelector("#wishFormLink");
  if (rsvpUrl) {
    form.src = `${rsvpUrl}${rsvpUrl.includes("?") ? "&" : "?"}embedded=true`;
    formLink.href = rsvpUrl;
  } else {
    form.hidden = true;
    formLink.hidden = true;
  }

  setText("footerContact", content.contact || "");
  document.querySelector("#giftQrNote").hidden = Boolean(content.gift?.qrUrl);
  const qrPlaceholder = document.querySelector("#qrPlaceholder");
  if (content.gift?.qrUrl) {
    const image = document.createElement("img");
    image.src = content.gift.qrUrl;
    image.alt = "Mã QR chuyển khoản mừng cưới";
    image.className = "gift-qr-image";
    qrPlaceholder.replaceChildren(image);
  }

  const audio = document.querySelector("#backgroundMusic");
  if (content.music?.url) audio.src = content.music.url;
  document.querySelector("#wishForm").title = `Biểu mẫu gửi lời chúc cho ${groom} và ${bride}`;
  document.querySelector('meta[name="description"]').content = `Thiệp cưới online của ${groom} & ${bride} — một ngày thật đẹp đang chờ được viết tiếp.`;
  document.title = `${groom} & ${bride} — Thiệp cưới`;
}

const giftDialog = document.querySelector("#giftDialog");
document.querySelector("#giftButton").addEventListener("click", () => giftDialog.showModal());
document.querySelector("#giftClose").addEventListener("click", () => giftDialog.close());
giftDialog.addEventListener("click", (event) => {
  if (event.target === giftDialog) giftDialog.close();
});

const soundButton = document.querySelector("#soundToggle");
const audioPlayer = document.querySelector("#backgroundMusic");
let audioContext;
let musicTimer;
let chordIndex = 0;
const chords = [
  [261.63, 329.63, 392, 493.88],
  [196, 246.94, 293.66, 392],
  [220, 261.63, 329.63, 392],
  [174.61, 220, 261.63, 349.23]
];

function playDemoChord() {
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
}

soundButton.addEventListener("click", async () => {
  const isPlaying = soundButton.getAttribute("aria-pressed") === "true";
  if (isPlaying) {
    window.clearInterval(musicTimer);
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    await audioContext?.suspend();
    soundButton.setAttribute("aria-pressed", "false");
    document.querySelector("#soundLabel").textContent = "Bật nhạc nền";
    return;
  }

  if (audioPlayer.src) {
    try {
      await audioPlayer.play();
    } catch {
      showToast("Không phát được tệp nhạc. Hãy kiểm tra định dạng và liên kết.");
      return;
    }
  } else {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return showToast("Trình duyệt này chưa hỗ trợ phát nhạc nền.");
    audioContext ??= new AudioContextClass();
    await audioContext.resume();
    playDemoChord();
    musicTimer = window.setInterval(playDemoChord, 3400);
  }
  soundButton.setAttribute("aria-pressed", "true");
  document.querySelector("#soundLabel").textContent = "Tắt nhạc nền";
});

(async () => {
  const wantsLocalPreview = new URLSearchParams(window.location.search).get("preview") === "local"
    && ["localhost", "127.0.0.1"].includes(window.location.hostname);
  try {
    const response = await fetch("data/default-content.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Không tải được nội dung trong project.");
    applyContent(await response.json());
    if (wantsLocalPreview) document.querySelector("#draftPreviewBanner").hidden = false;
  } catch (error) {
    console.error("Không tải được nội dung thiệp:", error);
  }
})();
