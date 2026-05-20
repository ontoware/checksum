const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme")) {
    var theme = localStorage.getItem("theme");
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";
    themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});

const urlParams = new URLSearchParams(window.location.search);
let originalChecksum = (urlParams.get("checksum") || "");

originalChecksum = originalChecksum.replace(/[\s-]+/g, "").toUpperCase();

const checksumInput = document.getElementById("checksumInput");

// Điền vào input nếu có
if (originalChecksum) {
    checksumInput.value = originalChecksum;
    validateChecksumInput();
}

function validateChecksumInput() {
    const value = checksumInput.value.trim().toUpperCase();

    // SHA-256 phải đúng 64 ký tự hex
    const isValid = /^[a-f0-9]{64}$/.test(value);

    checksumInput.classList.remove("input-valid", "input-invalid");

    if (value.length === 0) return false;

    if (isValid) {
        checksumInput.classList.add("input-valid");
    } else {
        checksumInput.classList.add("input-invalid");
    }

    return isValid;
}

checksumInput.addEventListener("input", validateChecksumInput);

async function computeSHA256(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function showResult(currentHash) {
    const resultBox = document.getElementById("resultBox");
    const result = document.getElementById("hashResult");

    const inputChecksum = checksumInput.value.trim().toUpperCase();
    let compare = "Không có checksum gốc";
    let cssClass = "";
    currentHash = currentHash.toUpperCase();
    if (inputChecksum && /^[A-F0-9]{64}$/.test(inputChecksum)) {
        if (currentHash === inputChecksum) {
            compare = "MATCH - checksum hợp lệ";
            cssClass = "match";
        } else {
            compare = "NOT MATCH - checksum không hợp lệ";
            cssClass = "not-match";
        }
    }

    result.innerHTML =
        '<span class="result-title">Checksum gốc:</span> ' + (inputChecksum || "(none)") + "\n" +
        '<span class="result-title">Checksum của file:</span> ' + currentHash + "\n" +
        '<span class="result-title">Kết quả kiểm tra:</span> ' + `<span class="${cssClass}">${compare}</span>`;

    resultBox.classList.remove("hidden");
}

document.getElementById("calcBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");

    if (!fileInput.files.length) {
        showResult("(no file)");
        return;
    }

    const hash = await computeSHA256(fileInput.files[0]);
    showResult(hash);
});

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", async e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;
    fileSelected();
});

dropZone.addEventListener("change", () => {
    fileSelected();
});

function fileSelected() {
    document.querySelector("#dropZone>span").textContent = fileInput.files[0].name;
    document.querySelector("#calcBtn").click();
}