const STORAGE_KEY = "productCatalog";
const KATEGORI_PRODUK = [
    "Laptop & Komputer",
    "Smartphone & Tablet",
    "Audio & Musik",
    "Kamera & Fotografi",
    "Televisi & Display",
    "Periferal & Aksesoris",
    "Peralatan Rumah Tangga",
    "Komponen Hardware"
];

const DATA_AWAL = [
    { id: 1, name: "Laptop Pro", category: "Laptop & Komputer", price: 15000000, stock: 5 },
    { id: 2, name: "Mechanical Keyboard", category: "Periferal & Aksesoris", price: 850000, stock: 12 }
];

let localProductList = [];

const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(number) || 0);

function loadProducts() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA_AWAL));
            return DATA_AWAL.map(p => ({ ...p }));
        }
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : DATA_AWAL.map(p => ({ ...p }));
    } catch (error) {
        console.error("Gagal membaca data produk:", error);
        return DATA_AWAL.map(p => ({ ...p }));
    }
}

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localProductList));
}

function nextProductId() {
    return localProductList.length
        ? Math.max(...localProductList.map(p => Number(p.id) || 0)) + 1
        : 1;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

function showFeedback(message, type = "success") {
    const feedback = document.getElementById("form-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `feedback-msg ${type}`;
}

function renderManagementTable(products = localProductList) {
    const tbody = document.getElementById("table-body");
    if (!tbody) return;

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Produk tidak ditemukan.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(prod => `
        <tr>
            <td>${prod.id}</td>
            <td>${escapeHTML(prod.name)}</td>
            <td>${escapeHTML(prod.category)}</td>
            <td>${formatRupiah(prod.price)}</td>
            <td>${prod.stock}</td>
            <td class="table-actions">
                <button type="button" class="btn btn-edit" data-action="edit" data-id="${prod.id}">Edit</button>
                <button type="button" class="btn btn-delete" data-action="delete" data-id="${prod.id}">Hapus</button>
            </td>
        </tr>
    `).join("");
}

function renderProductCards(products = localProductList) {
    const container = document.querySelector("#product-container");
    if (!container) return;

    if (!products.length) {
        container.innerHTML = '<p class="empty-state">Produk tidak ditemukan.</p>';
        return;
    }

    container.innerHTML = products.map(prod => `
        <article class="product-card" data-id="${prod.id}">
            <span class="badge">${escapeHTML(prod.category)}</span>
            <h3 class="product-title">${escapeHTML(prod.name)}</h3>
            <p class="product-price">${formatRupiah(prod.price)}</p>
            <p class="product-stock">Sisa Stok: <strong>${prod.stock}</strong></p>
        </article>
    `).join("");
}

function renderAll() {
    const searchInput = document.getElementById("search-input");
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const filtered = localProductList.filter(prod =>
        String(prod.name).toLowerCase().includes(keyword) ||
        String(prod.category).toLowerCase().includes(keyword)
    );
    renderManagementTable(filtered);
    renderProductCards(filtered);
}

function clearForm() {
    const form = document.getElementById("product-form");
    if (!form) return;
    form.reset();
    form.removeAttribute("data-edit-id");
    const button = document.getElementById("form-submit-btn");
    if (button) button.textContent = "Simpan Produk Baru";
    updateLivePreview();
}

function updateLivePreview() {
    const name = document.getElementById("product-name");
    const category = document.getElementById("product-category");
    const price = document.getElementById("product-price");
    const stock = document.getElementById("product-stock");
    const prevName = document.getElementById("prev-name");
    const prevCategory = document.getElementById("prev-category");
    const prevPrice = document.getElementById("prev-price");
    const prevStock = document.getElementById("prev-stock");

    if (prevName) prevName.textContent = name?.value || "...";
    if (prevCategory) prevCategory.textContent = category?.value || "...";
    if (prevPrice) prevPrice.textContent = price?.value ? formatRupiah(price.value) : "Rp 0";
    if (prevStock) prevStock.textContent = stock?.value || "0";
}

function handleEditProduct(productId) {
    const prod = localProductList.find(p => Number(p.id) === Number(productId));
    if (!prod) return;

    const form = document.getElementById("product-form");
    if (!form) {
        alert("Buka halaman Tambah / Edit Produk untuk mengedit data.");
        return;
    }

    document.getElementById("product-name").value = prod.name;
    document.getElementById("product-category").value = prod.category;
    document.getElementById("product-price").value = prod.price;
    document.getElementById("product-stock").value = prod.stock;
    form.setAttribute("data-edit-id", String(prod.id));

    const button = document.getElementById("form-submit-btn");
    if (button) button.textContent = "Perbarui Produk";
    showFeedback(`Produk ID ${prod.id} siap diedit. Ubah data lalu klik Perbarui Produk.`, "success");
    updateLivePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleDeleteProduct(productId) {
    const prod = localProductList.find(p => Number(p.id) === Number(productId));
    if (!prod) return;
    if (!confirm(`Hapus produk "${prod.name}"?`)) return;

    localProductList = localProductList.filter(p => Number(p.id) !== Number(productId));
    saveProducts();
    renderAll();
    showFeedback(`Produk "${prod.name}" berhasil dihapus.`, "success");
    console.log("Produk dihapus:", prod);
}

function tambahProdukConsole(name, category, price, stock) {
    if (arguments.length === 0) {
        name = prompt("Name produk:");
        if (name === null) return;
        category = prompt("Kategori produk (pilih salah satu dari daftar kategori):");
        if (category === null) return;
        price = prompt("Price produk:");
        if (price === null) return;
        stock = prompt("Stock produk:");
        if (stock === null) return;
    }

    name = String(name ?? "").trim();
    category = String(category ?? "").trim();
    price = Number(price);
    stock = Number(stock);

    if (!name) throw new Error("Nama produk wajib diisi.");
    if (!KATEGORI_PRODUK.includes(category)) {
        throw new Error("Kategori tidak valid. Pilih salah satu dari 8 kategori yang tersedia.");
    }
    if (!Number.isFinite(price) || price <= 0) throw new Error("Harga harus berupa angka lebih dari 0.");
    if (!Number.isInteger(stock) || stock < 0) throw new Error("Stok harus berupa bilangan bulat minimal 0.");

    const newProduct = {
        id: nextProductId(),
        name,
        category,
        price,
        stock
    };

    localProductList.push(newProduct);
    saveProducts();
    renderAll();
    console.log("Produk berhasil ditambahkan melalui Console:");
    console.table([newProduct]);
    console.table(localProductList);
    return newProduct;
}

window.tambahProdukConsole = tambahProdukConsole;
window.handleEditProduct = handleEditProduct;
window.handleDeleteProduct = handleDeleteProduct;
window.renderProductCards = renderProductCards;
window.localProductList = localProductList;

document.addEventListener("DOMContentLoaded", () => {
    localProductList = loadProducts();
    window.localProductList = localProductList;
    renderAll();

    const form = document.getElementById("product-form");
    const searchInput = document.getElementById("search-input");
    const tbody = document.getElementById("table-body");
    const cardContainer = document.getElementById("product-container");

    ["product-name", "product-category", "product-price", "product-stock"].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", updateLivePreview);
            input.addEventListener("change", updateLivePreview);
        }
    });

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const name = document.getElementById("product-name").value.trim();
            const category = document.getElementById("product-category").value;
            const price = Number(document.getElementById("product-price").value);
            const stock = Number(document.getElementById("product-stock").value);
            const editId = form.getAttribute("data-edit-id");

            if (!name || !KATEGORI_PRODUK.includes(category) ||
                !Number.isFinite(price) || price <= 0 ||
                !Number.isInteger(stock) || stock < 0) {
                showFeedback("Periksa kembali nama, kategori, harga, dan stok produk.", "error");
                return;
            }

            if (editId) {
                const prod = localProductList.find(p => Number(p.id) === Number(editId));
                if (!prod) {
                    showFeedback("Produk yang akan diedit tidak ditemukan.", "error");
                    return;
                }
                Object.assign(prod, { name, category, price, stock });
                console.log("Produk berhasil diperbarui:", prod);
                showFeedback(`Produk "${name}" berhasil diperbarui.`, "success");
            } else {
                const newProduct = { id: nextProductId(), name, category, price, stock };
                localProductList.push(newProduct);
                console.log("Produk berhasil ditambahkan:", newProduct);
                showFeedback(`Produk "${name}" berhasil ditambahkan.`, "success");
            }

            saveProducts();
            window.localProductList = localProductList;
            clearForm();
            renderAll();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderAll);
    }

    if (tbody) {
        tbody.addEventListener("click", event => {
            const button = event.target.closest("button[data-action]");
            if (!button) return;
            const id = Number(button.dataset.id);
            if (button.dataset.action === "edit") handleEditProduct(id);
            if (button.dataset.action === "delete") handleDeleteProduct(id);
        });
    }

    if (cardContainer) {
        cardContainer.addEventListener("click", event => {
            const button = event.target.closest("button[data-action]");
            if (!button) return;
            const id = Number(button.dataset.id);
            if (button.dataset.action === "edit") handleEditProduct(id);
            if (button.dataset.action === "delete") handleDeleteProduct(id);
        });
    }

    updateLivePreview();
});
