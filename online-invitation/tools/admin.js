(() => {
  const contentForm = document.querySelector("#contentForm");
  const editorStatus = document.querySelector("#editorStatus");
  const galleryEditor = document.querySelector("#galleryEditor");
  const guestbookAdmin = document.querySelector("#guestbookAdmin");
  const previewDraft = document.querySelector("#previewDraft");
  const saveButton = document.querySelector("#saveDraftButton");
  let content = null;
  let saved = false;
  let busy = false;

  function setStatus(message, isError = false) {
    editorStatus.textContent = message;
    editorStatus.classList.toggle("error", isError);
  }

  function getPath(object, path) {
    return path.split(".").reduce((current, part) => current?.[/^\d+$/.test(part) ? Number(part) : part], object);
  }

  function setPath(object, path, value) {
    const parts = path.split(".");
    const last = parts.pop();
    const target = parts.reduce((current, part) => current[/^\d+$/.test(part) ? Number(part) : part], object);
    target[/^\d+$/.test(last) ? Number(last) : last] = value;
  }

  function fillForm(value) {
    content = structuredClone(value);
    content.comments ||= [];
    contentForm.querySelectorAll("[data-path]").forEach((field) => {
      field.value = getPath(content, field.dataset.path) ?? "";
    });
    renderGallery();
    renderComments();
  }

  function readForm() {
    const next = structuredClone(content);
    contentForm.querySelectorAll("[data-path]").forEach((field) => {
      setPath(next, field.dataset.path, field.value.trim());
    });
    return next;
  }

  function markChanged() {
    saved = false;
    setStatus("Có thay đổi chưa lưu vào project.");
  }

  function localDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function renderComments() {
    guestbookAdmin.replaceChildren();
    const items = content?.comments || [];
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Chưa có lời chúc trong sổ.";
      guestbookAdmin.append(empty);
    }
    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "comment-editor";
      const fields = document.createElement("div");
      fields.className = "field-grid two";
      const makeField = (labelText, value, type, onInput) => {
        const label = document.createElement("label");
        label.textContent = labelText;
        const input = document.createElement(type === "textarea" ? "textarea" : "input");
        if (type !== "textarea") input.type = type;
        if (type === "textarea") input.rows = 3;
        input.value = value || "";
        input.addEventListener("input", () => { onInput(input.value); markChanged(); });
        label.append(input);
        return label;
      };
      fields.append(
        makeField("Tên người gửi", item.name, "text", (value) => { item.name = value; }),
        makeField("Thời gian", localDateTime(item.createdAt), "datetime-local", (value) => { item.createdAt = value ? new Date(value).toISOString() : ""; }),
        makeField("Lời chúc", item.message, "textarea", (value) => { item.message = value; })
      );
      fields.lastElementChild.classList.add("wide");
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "quiet-button";
      remove.textContent = "XÓA LỜI CHÚC";
      remove.addEventListener("click", () => {
        content.comments.splice(index, 1);
        markChanged();
        renderComments();
      });
      card.append(fields, remove);
      guestbookAdmin.append(card);
    });
  }

  function renderGallery() {
    galleryEditor.replaceChildren();
    const items = content?.gallery?.items || [];
    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "gallery-item";
      if (item.url) {
        const image = document.createElement("img");
        image.src = item.url;
        image.alt = item.alt || "";
        card.append(image);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "empty-image";
        placeholder.textContent = "Chưa có ảnh";
        card.append(placeholder);
      }

      const alt = document.createElement("input");
      alt.type = "text";
      alt.value = item.alt || "";
      alt.placeholder = "Mô tả ảnh";
      alt.setAttribute("aria-label", `Mô tả ảnh ${index + 1}`);
      alt.addEventListener("input", () => {
        content.gallery.items[index].alt = alt.value;
        markChanged();
      });
      card.append(alt);

      const actions = document.createElement("div");
      actions.className = "gallery-item-actions";
      const move = (direction, label, disabled) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "quiet-button";
        button.textContent = label;
        button.disabled = disabled;
        button.setAttribute("aria-label", `${label === "↑" ? "Đưa lên trước" : "Đưa xuống sau"}: ảnh ${index + 1}`);
        button.addEventListener("click", () => {
          const destination = index + direction;
          [content.gallery.items[index], content.gallery.items[destination]] = [content.gallery.items[destination], content.gallery.items[index]];
          markChanged();
          renderGallery();
        });
        return button;
      };
      actions.append(move(-1, "↑", index === 0), move(1, "↓", index === items.length - 1));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "quiet-button";
      remove.textContent = "Gỡ";
      remove.addEventListener("click", () => {
        content.gallery.items.splice(index, 1);
        markChanged();
        renderGallery();
      });
      actions.append(remove);
      card.append(actions);
      galleryEditor.append(card);
    });
  }

  function fileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Không đọc được tệp."));
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.readAsDataURL(file);
    });
  }

  async function uploadFile(file, folder) {
    if (!file) return null;
    if (file.size > 25 * 1024 * 1024) throw new Error("Mỗi tệp cần nhỏ hơn 25 MB.");
    const allowed = folder === "music"
      ? ["audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav", "audio/mp4"]
      : ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) throw new Error("Định dạng tệp này chưa được hỗ trợ.");
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ folder, name: file.name, type: file.type, data: await fileAsBase64(file) })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không tải được tệp vào project.");
    return result.url;
  }

  async function saveContent() {
    const next = readForm();
    if ((next.comments || []).some((item) => !item.name?.trim() || !item.message?.trim() || !item.createdAt)) {
      throw new Error("Mỗi lời chúc cần có tên, nội dung và thời gian; hoặc xóa lời chúc đang để trống.");
    }
    const response = await fetch("/api/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Không lưu được nội dung.");
    content = next;
    saved = true;
    document.querySelector("#publishStatus").textContent = `Đã lưu vào project · ${new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(new Date(result.savedAt))}`;
    setStatus("Đã lưu vào site/data/default-content.json. Chưa có gì được đẩy lên GitHub.");
  }

  function setBusy(value) {
    busy = value;
    saveButton.disabled = value;
    document.querySelectorAll("[data-upload-button], #addGalleryButton").forEach((button) => { button.disabled = value; });
    if (value) setStatus("Đang cập nhật project...");
  }

  async function initialize() {
    try {
      const response = await fetch("/api/content", { cache: "no-store" });
      const initialContent = await response.json();
      if (!response.ok) throw new Error(initialContent.error || "Hãy chạy tools/admin-server.mjs để mở trình quản lý.");
      fillForm(initialContent);
      saved = true;
      document.querySelector("#localServerStatus").textContent = "Đang sửa đúng project trên máy này";
      document.querySelector("#publishStatus").textContent = "Lưu cục bộ · chưa đẩy lên GitHub";
      setStatus("Đã tải nội dung từ project. Sửa xong thì lưu và xem bản local.");
    } catch (error) {
      contentForm.hidden = true;
      saveButton.disabled = true;
      document.querySelector("#localServerStatus").textContent = "Chưa kết nối tới project local";
      setStatus(`${error.message} Mở terminal tại thư mục project và chạy: node tools/admin-server.mjs`, true);
    }
  }

  contentForm.addEventListener("input", markChanged);
  contentForm.addEventListener("change", markChanged);
  saveButton.addEventListener("click", async () => {
    if (busy) return;
    setBusy(true);
    try { await saveContent(); }
    catch (error) { setStatus(error.message, true); }
    finally { setBusy(false); }
  });

  previewDraft.addEventListener("click", (event) => {
    if (!saved) {
      event.preventDefault();
      setStatus("Lưu thay đổi trước khi mở bản xem trước.");
    }
  });

  document.querySelectorAll("[data-upload-button]").forEach((button) => {
    button.addEventListener("click", () => document.querySelector(`[data-upload='${button.dataset.uploadButton}']`).click());
  });

  document.querySelectorAll("[data-upload]").forEach((input) => {
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file || busy) return;
      setBusy(true);
      try {
        const url = await uploadFile(file, input.dataset.upload);
        const path = input.dataset.upload === "hero-photo" ? "hero.photoUrl" : input.dataset.upload === "gift-qr" ? "gift.qrUrl" : "music.url";
        contentForm.querySelector(`[data-path='${path}']`).value = url;
        markChanged();
        setStatus("Đã thêm tệp vào project. Lưu nội dung để ghi lại đường dẫn.");
      } catch (error) {
        setStatus(error.message, true);
      } finally {
        input.value = "";
        setBusy(false);
      }
    });
  });

  document.querySelector("#addGalleryButton").addEventListener("click", () => document.querySelector("#galleryUpload").click());
  document.querySelector("#addCommentButton").addEventListener("click", () => {
    content.comments.unshift({ name: "", message: "", createdAt: new Date().toISOString() });
    markChanged();
    renderComments();
    guestbookAdmin.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
    guestbookAdmin.querySelector(".comment-editor label input")?.focus();
  });
  document.querySelector("#galleryUpload").addEventListener("change", async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length || busy) return;
    setBusy(true);
    try {
      for (const file of files) {
        const url = await uploadFile(file, "gallery");
        content.gallery.items.push({ url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
      }
      renderGallery();
      markChanged();
      setStatus(`Đã thêm ${files.length} ảnh vào project. Lưu nội dung để ghi lại album.`);
    } catch (error) {
      renderGallery();
      setStatus(error.message, true);
    } finally {
      event.target.value = "";
      setBusy(false);
    }
  });

  initialize();
})();
