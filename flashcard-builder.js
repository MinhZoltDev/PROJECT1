const rowsContainer = document.getElementById("rowsContainer");
const previewList = document.getElementById("previewList");
const statusText = document.getElementById("statusText");
const addRowBtn = document.getElementById("addRowBtn");
const previewBtn = document.getElementById("previewBtn");
const createListBtn = document.getElementById("createListBtn");
const ocrBtn = document.getElementById("ocrBtn");
const ocrImageInput = document.getElementById("ocrImageInput");
const setTitle = document.getElementById("setTitle");
const setDescription = document.getElementById("setDescription");

let rowCounter = 0;

function setStatus(message, isError = false) {
  if (!statusText) return;
  statusText.textContent = message;
  statusText.style.color = isError ? "#c82121" : "";
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createRow(term = "", definition = "") {
  rowCounter += 1;
  const row = document.createElement("article");
  row.className = "card-row";
  row.innerHTML = `
    <div class="row-head">
      <span><i class="bi bi-hash"></i> Flashcard ${rowCounter}</span>
      <button class="btn delete-btn" type="button" data-action="delete-row"><i class="bi bi-trash"></i> Xóa flashcard</button>
    </div>
    <div class="row-grid">
      <div class="field">
        <input type="text" class="term-input" placeholder="Nội dung term (mặt trước)" value="${escapeHtml(term)}" />
        <small>TERM · Mặt trước</small>
      </div>
      <div class="field">
        <input type="text" class="definition-input" placeholder="Nội dung definition (mặt sau)" value="${escapeHtml(definition)}" />
        <small>DEFINITION · Mặt sau</small>
      </div>
      <button class="btn secondary delete-btn" type="button" data-action="delete-row"><i class="bi bi-x-circle"></i> Xóa</button>
    </div>
  `;
  rowsContainer?.append(row);
}

function getRowsData() {
  if (!rowsContainer) return [];
  return [...rowsContainer.querySelectorAll(".card-row")]
    .map((row) => ({
      term: row.querySelector(".term-input")?.value.trim() || "",
      definition: row.querySelector(".definition-input")?.value.trim() || ""
    }))
    .filter((item) => item.term && item.definition);
}

function renderPreview() {
  const cards = getRowsData();
  if (!previewList) return;

  if (!cards.length) {
    previewList.innerHTML = "<p class='empty'>Chưa có flashcard để xem trước.</p>";
    setStatus("Bạn cần nhập ít nhất 1 cặp term/definition.", true);
    return cards;
  }

  previewList.innerHTML = cards
    .map(
      (card) => `
        <article class="preview-item">
          <div class="top"><span><i class="bi bi-front"></i> Term</span><span><i class="bi bi-back"></i> Definition</span></div>
          <p class="content">${escapeHtml(card.term)}</p>
          <p class="content" style="font-size:1.2rem;color:#4e5c7f">${escapeHtml(card.definition)}</p>
        </article>
      `
    )
    .join("");

  setStatus(`Preview OK: ${cards.length} flashcard.`);
  return cards;
}

function parseTextToCards(text) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const cards = [];
  let pendingTerm = "";

  for (const line of lines) {
    if (line.includes(":")) {
      const [left, ...rest] = line.split(":");
      const right = rest.join(":").trim();
      if (left.trim() && right) {
        cards.push({ term: left.trim(), definition: right });
        pendingTerm = "";
        continue;
      }
    }

    if (!pendingTerm) pendingTerm = line;
    else {
      cards.push({ term: pendingTerm, definition: line });
      pendingTerm = "";
    }
  }
  return cards;
}

async function handleOcr() {
  const file = ocrImageInput?.files?.[0];
  if (!file) return setStatus("Bạn chưa chọn ảnh để OCR.", true);
  if (!window.Tesseract) return setStatus("Không tải được Tesseract OCR.", true);

  setStatus("Đang OCR ảnh và trích xuất term/definition...");
  try {
    const result = await window.Tesseract.recognize(file, "vie+eng");
    const cards = parseTextToCards(result?.data?.text?.trim() || "");
    if (!cards.length) return setStatus("OCR xong nhưng chưa tách được flashcard. Hãy chỉnh tay.", true);

    cards.slice(0, 10).forEach((card) => createRow(card.term, card.definition));
    setStatus(`OCR thành công và thêm ${Math.min(cards.length, 10)} flashcard.`);
  } catch {
    setStatus("OCR thất bại. Hãy thử ảnh rõ nét hơn.", true);
  }
}

function createList() {
  const cards = renderPreview();
  if (!cards.length) return;

  const payload = {
    title: setTitle?.value.trim() || "Flashcard Set",
    description: setDescription?.value.trim() || "",
    cards
  };

  localStorage.setItem("minhzolt_flashcard_set", JSON.stringify(payload));
  window.location.href = "flashcard-review.html";
}

addRowBtn?.addEventListener("click", () => createRow());
previewBtn?.addEventListener("click", renderPreview);
ocrBtn?.addEventListener("click", handleOcr);
createListBtn?.addEventListener("click", createList);

rowsContainer?.addEventListener("click", (event) => {
  const target = event.target.closest('[data-action="delete-row"]');
  if (!target) return;
  target.closest(".card-row")?.remove();
  setStatus("Đã xóa 1 flashcard.");
});

createRow();
