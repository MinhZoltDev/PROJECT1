const rowsContainer = document.getElementById("rowsContainer");
const previewList = document.getElementById("previewList");
const statusText = document.getElementById("statusText");
const addRowBtn = document.getElementById("addRowBtn");
const renderBtn = document.getElementById("renderBtn");
const ocrBtn = document.getElementById("ocrBtn");
const ocrImageInput = document.getElementById("ocrImageInput");

let rowCounter = 0;

function setStatus(message, isError = false) {
  if (!statusText) {
    return;
  }
  statusText.textContent = message;
  statusText.style.color = isError ? "#c82121" : "";
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
        <input type="text" class="term-input" placeholder="Enter term (mặt trước)" value="${term}" />
        <small>TERM · Mặt trước</small>
      </div>
      <div class="field">
        <input type="text" class="definition-input" placeholder="Enter definition (mặt sau)" value="${definition}" />
        <small>DEFINITION · Mặt sau</small>
      </div>
      <button class="btn secondary delete-btn" type="button" data-action="delete-row"><i class="bi bi-x-circle"></i> Xóa</button>
    </div>
  `;

  rowsContainer?.append(row);
}

function getRowsData() {
  if (!rowsContainer) {
    return [];
  }

  const rows = [...rowsContainer.querySelectorAll(".card-row")];
  return rows
    .map((row) => {
      const term = row.querySelector(".term-input")?.value.trim() || "";
      const definition = row.querySelector(".definition-input")?.value.trim() || "";
      return { term, definition };
    })
    .filter((item) => item.term && item.definition);
}

function renderPreview() {
  const cards = getRowsData();

  if (!previewList) {
    return;
  }

  if (!cards.length) {
    previewList.innerHTML = "<p class='empty'>Chưa có flashcard để xem trước.</p>";
    return;
  }

  previewList.innerHTML = cards
    .map(
      (card) => `
        <article class="preview-item">
          <div class="top"><span><i class="bi bi-front"></i> Term</span><span><i class="bi bi-back"></i> Definition</span></div>
          <p class="content">${card.term}</p>
          <p class="content" style="font-size:1.2rem;color:#4e5c7f">${card.definition}</p>
        </article>
      `
    )
    .join("");

  setStatus(`Đã render ${cards.length} flashcard theo layout ngang.`);
}

function parseTextToCards(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

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

    if (!pendingTerm) {
      pendingTerm = line;
    } else {
      cards.push({ term: pendingTerm, definition: line });
      pendingTerm = "";
    }
  }

  return cards;
}

async function handleOcr() {
  const file = ocrImageInput?.files?.[0];
  if (!file) {
    setStatus("Bạn chưa chọn ảnh để OCR.", true);
    return;
  }

  if (!window.Tesseract) {
    setStatus("Không tải được Tesseract OCR.", true);
    return;
  }

  setStatus("Đang OCR ảnh và trích xuất term/definition...");

  try {
    const result = await window.Tesseract.recognize(file, "vie+eng");
    const text = result?.data?.text?.trim() || "";
    const cards = parseTextToCards(text);

    if (!cards.length) {
      setStatus("OCR xong nhưng chưa tách được flashcard. Hãy chỉnh tay trong các ô bên dưới.", true);
      return;
    }

    cards.slice(0, 10).forEach((card) => createRow(card.term, card.definition));
    setStatus(`OCR thành công và thêm ${Math.min(cards.length, 10)} flashcard.`);
  } catch (error) {
    setStatus("OCR thất bại. Hãy thử ảnh rõ nét hơn.", true);
  }
}

if (addRowBtn) {
  addRowBtn.addEventListener("click", () => createRow());
}

if (renderBtn) {
  renderBtn.addEventListener("click", renderPreview);
}

if (ocrBtn) {
  ocrBtn.addEventListener("click", handleOcr);
}

if (rowsContainer) {
  rowsContainer.addEventListener("click", (event) => {
    const target = event.target.closest('[data-action="delete-row"]');
    if (!target) {
      return;
    }

    const row = target.closest(".card-row");
    row?.remove();
    setStatus("Đã xóa 1 flashcard.");
    renderPreview();
  });
}

createRow();
createRow();
