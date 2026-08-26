(function () {

    "use strict";

    console.log("====================================");
    console.log("ADMIN MODULES - DESA FATAATU TIMUR");
    console.log("====================================");


    // =========================================================
    // SUPABASE CLIENT
    // =========================================================

    let sb = null;

    function getSupabase() {

        if (sb) {
            return sb;
        }

        if (!window.SUPABASE_CONFIG) {
            console.error("SUPABASE_CONFIG tidak ditemukan.");
            return null;
        }

        if (!window.SUPABASE_CONFIG.url) {
            console.error("URL Supabase kosong.");
            return null;
        }

        if (!window.SUPABASE_CONFIG.key) {
            console.error("Anon key Supabase kosong.");
            return null;
        }

        if (!window.supabase) {
            console.error("Library Supabase belum dimuat.");
            return null;
        }

        sb = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.key
        );

        return sb;
    }


    // =========================================================
    // HELPER
    // =========================================================

    function esc(value) {

        return String(value ?? "")
            .replace(/[&<>"']/g, function (m) {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                }[m];

            });

    }


    function rupiah(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }
        ).format(Number(value));

    }


    function showAlert(message, type = "success") {

        const container =
            document.getElementById("admin-alert-container");

        if (!container) {

            alert(message);

            return;
        }

        const div =
            document.createElement("div");

        div.className =
            `alert alert-${type} alert-dismissible fade show`;

        div.innerHTML = `
            ${esc(message)}
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>
        `;

        container.appendChild(div);

        setTimeout(function () {

            div.remove();

        }, 5000);

    }


    // =========================================================
    // CEK LOGIN
    // =========================================================

    async function checkAdmin() {

        const client = getSupabase();

        if (!client) {
            return false;
        }

        const {
            data: {
                user
            },
            error
        } =
            await client.auth.getUser();

        if (error || !user) {

            window.location.href = "admin-login.html";

            return false;
        }

        console.log(
            "Admin login:",
            user.email
        );

        return user;

    }


    // =========================================================
    // NAVIGASI MODUL
    // =========================================================

    function initNavigation() {

        document
            .querySelectorAll("[data-admin-section]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function (e) {

                        e.preventDefault();

                        const target =
                            button.dataset.adminSection;

                        openSection(target);

                    }
                );

            });

    }


    async function openSection(section) {

        document
            .querySelectorAll(".admin-module")
            .forEach(function (element) {

                element.classList.add("d-none");

            });


        const target =
            document.getElementById(
                "module-" + section
            );

        if (target) {

            target.classList.remove("d-none");

        }


        document
            .querySelectorAll("[data-admin-section]")
            .forEach(function (element) {

                element.classList.remove("active");

                if (
                    element.dataset.adminSection ===
                    section
                ) {

                    element.classList.add("active");

                }

            });


        if (section === "transparansi") {

            await loadTransparansi();

        }

        if (section === "faq") {

            await loadFAQ();

        }

        if (section === "messages") {

            await loadMessages();

        }

        if (section === "settings") {

            await loadSiteSettingsAdmin();

        }

    }


    // =========================================================
    // ==================== TRANSPARANSI =======================
    // =========================================================

    let transparansiEditingId = null;


    async function loadTransparansi() {

        const client = getSupabase();

        if (!client) return;


        const tbody =
            document.getElementById(
                "transparansi-table-body"
            );

        if (!tbody) return;


        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center py-4">
                    Memuat data...
                </td>
            </tr>
        `;


        const {
            data,
            error
        } = await client
            .from("transparansi")
            .select("*")
            .order(
                "tahun",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Gagal mengambil transparansi:",
                error
            );

            tbody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-danger text-center py-4">
                        ${esc(error.message)}
                    </td>
                </tr>
            `;

            return;
        }


        if (!data || data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center text-muted py-4">
                        Belum ada data transparansi.
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML =
            data.map(function (item) {

                return `
                    <tr>

                        <td>
                            ${esc(item.tahun || "-")}
                        </td>

                        <td>
                            <strong>
                                ${esc(item.judul)}
                            </strong>
                        </td>

                        <td>
                            ${esc(item.kategori || "-")}
                        </td>

                        <td>
                            ${rupiah(item.anggaran)}
                        </td>

                        <td>
                            ${rupiah(item.realisasi)}
                        </td>

                        <td>
                            ${
                                item.dokumen_url
                                ?
                                `<a
                                    href="${esc(item.dokumen_url)}"
                                    target="_blank"
                                    class="btn btn-sm btn-outline-success">
                                    <i class="bi bi-file-earmark"></i>
                                    Lihat
                                </a>`
                                :
                                "-"
                            }
                        </td>

                        <td class="text-end">

                            <button
                                class="btn btn-sm btn-outline-primary"
                                onclick="AdminModules.editTransparansi(${item.id})">

                                <i class="bi bi-pencil"></i>

                            </button>

                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick="AdminModules.deleteTransparansi(${item.id})">

                                <i class="bi bi-trash"></i>

                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    }


    function resetTransparansiForm() {

        transparansiEditingId = null;

        const form =
            document.getElementById(
                "transparansi-form"
            );

        if (form) {

            form.reset();

        }

        const id =
            document.getElementById(
                "transparansi-id"
            );

        if (id) {

            id.value = "";

        }


        const title =
            document.getElementById(
                "transparansi-form-title"
            );

        if (title) {

            title.textContent =
                "Tambah Transparansi";

        }

    }


    async function saveTransparansi() {

        const client = getSupabase();

        if (!client) return;


        const tahun =
            document.getElementById(
                "transparansi-tahun"
            ).value;


        const judul =
            document.getElementById(
                "transparansi-judul"
            ).value.trim();


        const kategori =
            document.getElementById(
                "transparansi-kategori"
            ).value.trim();


        const deskripsi =
            document.getElementById(
                "transparansi-deskripsi"
            ).value.trim();


        const anggaran =
            document.getElementById(
                "transparansi-anggaran"
            ).value;


        const realisasi =
            document.getElementById(
                "transparansi-realisasi"
            ).value;


        const dokumen =
            document.getElementById(
                "transparansi-dokumen"
            ).value.trim();


        if (!judul) {

            showAlert(
                "Judul transparansi wajib diisi.",
                "warning"
            );

            return;
        }


        const payload = {

            tahun:
                tahun
                ? Number(tahun)
                : null,

            judul,

            kategori,

            deskripsi,

            anggaran:
                anggaran
                ? Number(anggaran)
                : null,

            realisasi:
                realisasi
                ? Number(realisasi)
                : null,

            dokumen_url:
                dokumen || null

        };


        let result;


        if (transparansiEditingId) {

            result =
                await client
                    .from("transparansi")
                    .update(payload)
                    .eq(
                        "id",
                        transparansiEditingId
                    );

        } else {

            result =
                await client
                    .from("transparansi")
                    .insert(payload);

        }


        if (result.error) {

            console.error(
                result.error
            );

            showAlert(
                "Gagal menyimpan transparansi: " +
                result.error.message,
                "danger"
            );

            return;
        }


        showAlert(
            "Data transparansi berhasil disimpan."
        );


        resetTransparansiForm();

        await loadTransparansi();

    }


    async function editTransparansi(id) {

        const client = getSupabase();

        if (!client) return;


        const {
            data,
            error
        } = await client
            .from("transparansi")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {

            showAlert(
                error.message,
                "danger"
            );

            return;
        }


        transparansiEditingId =
            data.id;


        document.getElementById(
            "transparansi-tahun"
        ).value =
            data.tahun || "";


        document.getElementById(
            "transparansi-judul"
        ).value =
            data.judul || "";


        document.getElementById(
            "transparansi-kategori"
        ).value =
            data.kategori || "";


        document.getElementById(
            "transparansi-deskripsi"
        ).value =
            data.deskripsi || "";


        document.getElementById(
            "transparansi-anggaran"
        ).value =
            data.anggaran || "";


        document.getElementById(
            "transparansi-realisasi"
        ).value =
            data.realisasi || "";


        document.getElementById(
            "transparansi-dokumen"
        ).value =
            data.dokumen_url || "";


        const title =
            document.getElementById(
                "transparansi-form-title"
            );

        if (title) {

            title.textContent =
                "Edit Transparansi";

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    async function deleteTransparansi(id) {

        if (
            !confirm(
                "Yakin ingin menghapus data transparansi ini?"
            )
        ) {

            return;
        }


        const client = getSupabase();


        const {
            error
        } =
            await client
                .from("transparansi")
                .delete()
                .eq("id", id);


        if (error) {

            showAlert(
                "Gagal menghapus: " +
                error.message,
                "danger"
            );

            return;
        }


        showAlert(
            "Data transparansi berhasil dihapus."
        );


        await loadTransparansi();

    }


    // =========================================================
    // ========================= FAQ ===========================
    // =========================================================

    let faqEditingId = null;


    async function loadFAQ() {

        const client = getSupabase();

        if (!client) return;


        const tbody =
            document.getElementById(
                "faq-table-body"
            );

        if (!tbody) return;


        tbody.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center py-4">
                    Memuat FAQ...
                </td>
            </tr>
        `;


        const {
            data,
            error
        } = await client
            .from("faqs")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );


        if (error) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4"
                        class="text-danger text-center py-4">
                        ${esc(error.message)}
                    </td>
                </tr>
            `;

            return;
        }


        if (!data || data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4"
                        class="text-center text-muted py-4">
                        Belum ada FAQ.
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML =
            data.map(function (item) {

                return `
                    <tr>

                        <td>
                            <strong>
                                ${esc(item.question)}
                            </strong>
                        </td>

                        <td>
                            ${esc(item.answer)}
                        </td>

                        <td>
                            <span class="badge bg-success-subtle text-success">
                                ${esc(item.category || "Umum")}
                            </span>
                        </td>

                        <td class="text-end">

                            <button
                                class="btn btn-sm btn-outline-primary"
                                onclick="AdminModules.editFAQ(${item.id})">
                                <i class="bi bi-pencil"></i>
                            </button>

                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick="AdminModules.deleteFAQ(${item.id})">
                                <i class="bi bi-trash"></i>
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    }


    function resetFAQForm() {

        faqEditingId = null;

        const form =
            document.getElementById(
                "faq-form"
            );

        if (form) {

            form.reset();

        }


        const title =
            document.getElementById(
                "faq-form-title"
            );

        if (title) {

            title.textContent =
                "Tambah FAQ";

        }

    }


    async function saveFAQ() {

        const client = getSupabase();

        if (!client) return;


        const question =
            document.getElementById(
                "faq-question"
            ).value.trim();


        const answer =
            document.getElementById(
                "faq-answer"
            ).value.trim();


        const category =
            document.getElementById(
                "faq-category"
            ).value.trim();


        if (!question || !answer) {

            showAlert(
                "Pertanyaan dan jawaban wajib diisi.",
                "warning"
            );

            return;
        }


        const payload = {

            question,

            answer,

            category:
                category || "Umum",

            updated_at:
                new Date().toISOString()

        };


        let result;


        if (faqEditingId) {

            result =
                await client
                    .from("faqs")
                    .update(payload)
                    .eq(
                        "id",
                        faqEditingId
                    );

        } else {

            result =
                await client
                    .from("faqs")
                    .insert(payload);

        }


        if (result.error) {

            showAlert(
                "Gagal menyimpan FAQ: " +
                result.error.message,
                "danger"
            );

            return;
        }


        showAlert(
            "FAQ berhasil disimpan."
        );


        resetFAQForm();

        await loadFAQ();

    }


    async function editFAQ(id) {

        const client = getSupabase();


        const {
            data,
            error
        } = await client
            .from("faqs")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {

            showAlert(
                error.message,
                "danger"
            );

            return;
        }


        faqEditingId =
            data.id;


        document.getElementById(
            "faq-question"
        ).value =
            data.question || "";


        document.getElementById(
            "faq-answer"
        ).value =
            data.answer || "";


        document.getElementById(
            "faq-category"
        ).value =
            data.category || "Umum";


        const title =
            document.getElementById(
                "faq-form-title"
            );

        if (title) {

            title.textContent =
                "Edit FAQ";

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    async function deleteFAQ(id) {

        if (
            !confirm(
                "Yakin ingin menghapus FAQ ini?"
            )
        ) {

            return;
        }


        const client = getSupabase();


        const {
            error
        } =
            await client
                .from("faqs")
                .delete()
                .eq("id", id);


        if (error) {

            showAlert(
                error.message,
                "danger"
            );

            return;
        }


        showAlert(
            "FAQ berhasil dihapus."
        );


        await loadFAQ();

    }


    // =========================================================
    // ======================= PESAN ===========================
    // =========================================================

    async function loadMessages() {

        const client = getSupabase();

        if (!client) return;


        const tbody =
            document.getElementById(
                "messages-table-body"
            );

        if (!tbody) return;


        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center py-4">
                    Memuat pesan...
                </td>
            </tr>
        `;


        const {
            data,
            error
        } = await client
            .from("messages")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-danger text-center py-4">
                        ${esc(error.message)}
                    </td>
                </tr>
            `;

            return;
        }


        if (!data || data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center text-muted py-4">
                        Belum ada pesan masuk.
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML =
            data.map(function (item) {

                return `
                    <tr
                        class="${
                            item.is_read
                            ? ""
                            : "table-success"
                        }">

                        <td>
                            ${
                                item.is_read
                                ?
                                `<i class="bi bi-envelope-open text-muted"></i>`
                                :
                                `<i class="bi bi-envelope-fill text-success"></i>`
                            }
                        </td>

                        <td>
                            <strong>
                                ${esc(item.name || "-")}
                            </strong>
                            <br>
                            <small class="text-muted">
                                ${esc(item.email || "")}
                            </small>
                        </td>

                        <td>
                            ${esc(item.phone || "-")}
                        </td>

                        <td>
                            ${esc(item.subject || "-")}
                        </td>

                        <td>
                            <div style="max-width:300px">
                                ${esc(item.message || "-")}
                            </div>
                        </td>

                        <td>
                            ${
                                item.created_at
                                ?
                                new Date(
                                    item.created_at
                                ).toLocaleString(
                                    "id-ID"
                                )
                                :
                                "-"
                            }
                        </td>

                        <td class="text-end">

                            ${
                                !item.is_read
                                ?
                                `<button
                                    class="btn btn-sm btn-outline-success"
                                    onclick="AdminModules.markMessageRead(${item.id})">
                                    <i class="bi bi-check2"></i>
                                </button>`
                                :
                                ""
                            }

                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick="AdminModules.deleteMessage(${item.id})">
                                <i class="bi bi-trash"></i>
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    }


    async function markMessageRead(id) {

        const client = getSupabase();


        const {
            error
        } =
            await client
                .from("messages")
                .update({
                    is_read: true
                })
                .eq("id", id);


        if (error) {

            showAlert(
                error.message,
                "danger"
            );

            return;
        }


        await loadMessages();

    }


    async function deleteMessage(id) {

        if (
            !confirm(
                "Yakin ingin menghapus pesan ini?"
            )
        ) {

            return;
        }


        const client = getSupabase();


        const {
            error
        } =
            await client
                .from("messages")
                .delete()
                .eq("id", id);


        if (error) {

            showAlert(
                error.message,
                "danger"
            );

            return;
        }


        showAlert(
            "Pesan berhasil dihapus."
        );


        await loadMessages();

    }


    // =========================================================
    // ================= PENGATURAN WEBSITE ===================
    // =========================================================

    async function loadSiteSettingsAdmin() {

        const client = getSupabase();

        if (!client) return;


        const {
            data,
            error
        } = await client
            .from("site_settings")
            .select("*")
            .limit(1)
            .maybeSingle();


        if (error) {

            showAlert(
                "Gagal membaca pengaturan: " +
                error.message,
                "danger"
            );

            return;
        }


        if (!data) {

            return;
        }


        setValue(
            "setting-name",
            data.name
        );

        setValue(
            "setting-location",
            data.location
        );

        setValue(
            "setting-address",
            data.address
        );

        setValue(
            "setting-phone",
            data.phone
        );

        setValue(
            "setting-email",
            data.email
        );

        setValue(
            "setting-hours",
            data.hours
        );

        setValue(
            "setting-postal",
            data.postal
        );

        setValue(
            "setting-logo",
            data.logo_url
        );

        setValue(
            "setting-map",
            data.map_url
        );

        setValue(
            "setting-facebook",
            data.facebook
        );

        setValue(
            "setting-instagram",
            data.instagram
        );

        setValue(
            "setting-youtube",
            data.youtube
        );

        setValue(
            "setting-whatsapp",
            data.whatsapp
        );

    }


    function setValue(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value =
                value || "";

        }

    }


    async function saveSiteSettings() {

        const client = getSupabase();

        if (!client) return;


        const payload = {

            name:
                getValue("setting-name"),

            location:
                getValue("setting-location"),

            address:
                getValue("setting-address"),

            phone:
                getValue("setting-phone"),

            email:
                getValue("setting-email"),

            hours:
                getValue("setting-hours"),

            postal:
                getValue("setting-postal"),

            logo_url:
                getValue("setting-logo"),

            map_url:
                getValue("setting-map"),

            facebook:
                getValue("setting-facebook"),

            instagram:
                getValue("setting-instagram"),

            youtube:
                getValue("setting-youtube"),

            whatsapp:
                getValue("setting-whatsapp"),

            updated_at:
                new Date().toISOString()

        };


        const {
            data: existing
        } =
            await client
                .from("site_settings")
                .select("id")
                .limit(1)
                .maybeSingle();


        let result;


        if (existing) {

            result =
                await client
                    .from("site_settings")
                    .update(payload)
                    .eq(
                        "id",
                        existing.id
                    );

        } else {

            result =
                await client
                    .from("site_settings")
                    .insert(payload);

        }


        if (result.error) {

            console.error(
                result.error
            );

            showAlert(
                "Pengaturan gagal disimpan: " +
                result.error.message,
                "danger"
            );

            return;
        }


        showAlert(
            "Pengaturan website berhasil disimpan."
        );

    }


    function getValue(id) {

        const element =
            document.getElementById(id);

        return element
            ? element.value.trim()
            : "";

    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    window.AdminModules = {

        loadTransparansi,

        saveTransparansi,

        editTransparansi,

        deleteTransparansi,

        resetTransparansiForm,

        loadFAQ,

        saveFAQ,

        editFAQ,

        deleteFAQ,

        resetFAQForm,

        loadMessages,

        markMessageRead,

        deleteMessage,

        loadSiteSettingsAdmin,

        saveSiteSettings,

        openSection

    };


    // =========================================================
    // START
    // =========================================================

    async function boot() {

        const user =
            await checkAdmin();

        if (!user) return;


        initNavigation();


        await openSection(
            "transparansi"
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot
        );

    } else {

        boot();

    }


})();