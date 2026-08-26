(function () {
    "use strict";

    const cfg = window.SUPABASE_CONFIG || {};

    const ready = () =>
        window.supabase &&
        cfg.url &&
        !String(cfg.url).includes("MASUKKAN-") &&
        cfg.key &&
        !String(cfg.key).includes("MASUKKAN-");

    let sb = null;

    let cache = {
        site_settings: [],
        page_content: [],
        news: [],
        agenda: [],
        gallery: [],
        potentials: [],
        services: [],
        transparansi: [],
        faqs: [],
        messages: [],
        admin_users: []
    };

    let current = {
        type: null,
        id: null
    };

    const $ = (selector) => document.querySelector(selector);

    function esc(value) {
        return String(value ?? "").replace(
            /[&<>"']/g,
            (m) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[m])
        );
    }

    function toast(message, type = "success") {
        const toast = $("#toast");

        if (!toast) return;

        const cls =
            type === "success"
                ? "alert-success"
                : "alert-danger";

        toast.innerHTML = `
            <div class="alert ${cls} shadow-sm">
                ${esc(message)}
            </div>
        `;

        setTimeout(() => {
            toast.innerHTML = "";
        }, 3500);
    }

    async function client() {
        if (!ready()) {
            throw new Error(
                "Supabase belum dikonfigurasi."
            );
        }

        if (!sb) {
            sb = window.supabase.createClient(
                cfg.url,
                cfg.key
            );
        }

        return sb;
    }

    async function getUser() {
        const { data, error } =
            await (await client()).auth.getUser();

        if (error) {
            throw error;
        }

        return data.user;
    }

    async function ensureAdmin() {

        const u = await getUser();

        if (!u) {
            showLogin();
            return false;
        }

        const result = await sb
            .from("admin_users")
            .select(
                "user_id,role,name,email"
            )
            .eq("user_id", u.id)
            .maybeSingle();

        if (result.error) {
            throw result.error;
        }

        if (!result.data) {

            await sb.auth.signOut();

            showLogin();

            alert(
                "Akun ini belum terdaftar sebagai Admin."
            );

            return false;
        }

        showApp(u);

        return true;
    }

    function showLogin() {

        $("#login")?.classList.remove("hidden");

        $("#app")?.classList.add("hidden");

        if ($("#status")) {
            $("#status").className =
                "badge text-bg-secondary";

            $("#status").textContent =
                "Belum login";
        }
    }

    function showApp(user) {

        $("#login")?.classList.add("hidden");

        $("#app")?.classList.remove("hidden");

        if ($("#status")) {

            $("#status").className =
                "badge text-bg-success";

            $("#status").textContent =
                "Admin: " +
                (user.email || "");
        }
    }

    async function table(
        name,
        order = "created_at"
    ) {

        let query = sb
            .from(name)
            .select("*");

        if (order) {

            query = query.order(
                order,
                {
                    ascending: false
                }
            );
        }

        const result = await query;

        if (result.error) {
            throw result.error;
        }

        return result.data || [];
    }

    async function loadAll() {

        if (!ready()) {

            $("#configWarn")
                ?.classList
                .remove("hidden");

            return;
        }

        $("#configWarn")
            ?.classList
            .add("hidden");

        await client();

        const adminOK =
            await ensureAdmin();

        if (!adminOK) {
            return;
        }

        try {

            const [
                site,
                pages,
                news,
                agenda,
                gallery,
                potentials,
                services,
                transparansi,
                faqs,
                messages,
                admins
            ] = await Promise.all([

                table(
                    "site_settings",
                    null
                ),

                table(
                    "page_content",
                    "updated_at"
                ),

                table(
                    "news"
                ),

                table(
                    "agenda"
                ),

                table(
                    "gallery"
                ),

                table(
                    "potentials"
                ),

                table(
                    "services"
                ),

                table(
                    "transparansi",
                    "id"
                ),

                table(
                    "faqs",
                    "id"
                ),

                table(
                    "messages",
                    "id"
                ),

                table(
                    "admin_users",
                    "created_at"
                )
            ]);

            cache = {
                site_settings: site,
                page_content: pages,
                news,
                agenda,
                gallery,
                potentials,
                services,
                transparansi,
                faqs,
                messages,
                admin_users: admins
            };

            render();

        } catch (error) {

            console.error(error);

            toast(
                error.message ||
                "Gagal memuat data.",
                "error"
            );
        }
    }

    function render() {

        const site =
            cache.site_settings?.[0] || {};

        if ($("#mPop")) {
            $("#mPop").textContent =
                Number(
                    site.population || 0
                ).toLocaleString("id-ID");
        }

        if ($("#mNews")) {
            $("#mNews").textContent =
                cache.news.length;
        }

        if ($("#mAgenda")) {
            $("#mAgenda").textContent =
                cache.agenda.length;
        }

        if ($("#mGallery")) {
            $("#mGallery").textContent =
                cache.gallery.length;
        }

        if ($("#mPot")) {
            $("#mPot").textContent =
                cache.potentials.length;
        }

        if ($("#mDocs")) {
            $("#mDocs").textContent =
                cache.transparansi.length;
        }

        if ($("#mMsg")) {
            $("#mMsg").textContent =
                cache.messages.filter(
                    x => x.status === "baru"
                ).length;
        }

        if ($("#mFaq")) {
            $("#mFaq").textContent =
                cache.faqs.length;
        }

        renderPages();

        renderTable(
            "news",
            "newsList",
            [
                "title",
                "cat",
                "date",
                "summary"
            ]
        );

        renderTable(
            "agenda",
            "agendaList",
            [
                "title",
                "date",
                "time",
                "place"
            ]
        );

        renderTable(
            "potentials",
            "potList",
            [
                "name",
                "cat",
                "description"
            ]
        );

        renderTable(
            "services",
            "serviceList",
            [
                "name",
                "description"
            ]
        );

        renderTable(
            "faqs",
            "faqListAdmin",
            [
                "q",
                "a"
            ]
        );

        renderTransparansi();

        renderGallery();

        renderMessages();

        renderAdmins();

        fillSettings(site);
    }

    // =========================================================
    // PAGE CONTENT
    // =========================================================

    function renderPages() {

        const slugs = [
            "profil",
            "sejarah",
            "visi-misi",
            "struktur",
            "hasil-bumi",
            "wisata",
            "sambutan"
        ];

        const names = {
            profil:
                "Profil Desa",

            sejarah:
                "Sejarah",

            "visi-misi":
                "Visi & Misi",

            struktur:
                "Pemerintahan / Struktur",

            "hasil-bumi":
                "Hasil Bumi",

            wisata:
                "Wisata",

            sambutan:
                "Sambutan Kepala Desa"
        };

        const map =
            Object.fromEntries(
                cache.page_content.map(
                    x => [
                        x.slug,
                        x
                    ]
                )
            );

        if (!$("#pageForms")) {
            return;
        }

        $("#pageForms").innerHTML =
            slugs.map(slug => {

                const p =
                    map[slug] || {
                        title:
                            names[slug],

                        subtitle: "",

                        content: ""
                    };

                return `
                    <div
                        class="border rounded-3 p-3 mb-3"
                    >

                        <div class="row g-2">

                            <div class="col-md-4">

                                <label
                                    class="form-label small"
                                >
                                    Judul
                                </label>

                                <input
                                    id="pt-${slug}"
                                    class="form-control"
                                    value="${esc(p.title)}"
                                >

                            </div>

                            <div class="col-md-8">

                                <label
                                    class="form-label small"
                                >
                                    Subjudul
                                </label>

                                <input
                                    id="ps-${slug}"
                                    class="form-control"
                                    value="${esc(p.subtitle)}"
                                >

                            </div>

                            <div class="col-12">

                                <label
                                    class="form-label small"
                                >
                                    Isi halaman
                                </label>

                                <textarea
                                    id="pc-${slug}"
                                    rows="6"
                                    class="form-control"
                                >${esc(p.content)}</textarea>

                            </div>

                            <div class="col-12">

                                <button
                                    class="btn btn-success btn-sm"
                                    onclick="savePage('${slug}')"
                                >
                                    Simpan
                                    ${esc(names[slug])}
                                </button>

                            </div>

                        </div>

                    </div>
                `;

            }).join("");
    }

    // =========================================================
    // TABLE RENDER
    // =========================================================

    function renderTable(
        type,
        elementId,
        columns
    ) {

        const container =
            $("#" + elementId);

        if (!container) {
            return;
        }

        const rows =
            cache[type] || [];

        container.innerHTML = `

            <table
                class="table table-hover align-middle"
            >

                <thead>

                    <tr>

                        ${columns
                            .map(
                                c =>
                                    `<th>${esc(c)}</th>`
                            )
                            .join("")
                        }

                        <th class="text-end">
                            Aksi
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        rows.map(row => `

                            <tr>

                                ${
                                    columns
                                        .map(
                                            c => `
                                                <td>
                                                    <div
                                                        class="${
                                                            [
                                                                "body",
                                                                "description",
                                                                "summary",
                                                                "a"
                                                            ].includes(c)
                                                                ? "truncate"
                                                                : ""
                                                        }"
                                                    >
                                                        ${esc(
                                                            row[c] ??
                                                            ""
                                                        )}
                                                    </div>
                                                </td>
                                            `
                                        )
                                        .join("")
                                }

                                <td
                                    class="text-end text-nowrap"
                                >

                                    <button
                                        class="btn btn-sm btn-outline-secondary"
                                        onclick="openEditor(
                                            '${type}',
                                            '${row.id}'
                                        )"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        onclick="delRow(
                                            '${type}',
                                            '${row.id}'
                                        )"
                                    >
                                        Hapus
                                    </button>

                                </td>

                            </tr>

                        `).join("") ||

                        `
                            <tr>
                                <td
                                    colspan="${
                                        columns.length + 1
                                    }"
                                    class="text-muted"
                                >
                                    Belum ada data.
                                </td>
                            </tr>
                        `
                    }

                </tbody>

            </table>
        `;
    }

    // =========================================================
    // TRANSPARANSI
    // =========================================================

    function renderTransparansi() {

        const container =
            $("#docList");

        if (!container) {
            return;
        }

        const rows =
            cache.transparansi || [];

        container.innerHTML = `

            <table
                class="table table-hover align-middle"
            >

                <thead>

                    <tr>

                        <th>Tahun</th>

                        <th>Judul</th>

                        <th>Kategori</th>

                        <th>Deskripsi</th>

                        <th class="text-end">
                            Aksi
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        rows.map(row => `

                            <tr>

                                <td>
                                    ${esc(
                                        row.tahun ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    <b>
                                        ${esc(
                                            row.judul ||
                                            ""
                                        )}
                                    </b>
                                </td>

                                <td>
                                    ${esc(
                                        row.kategori ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    <div class="truncate">
                                        ${esc(
                                            row.deskripsi ||
                                            ""
                                        )}
                                    </div>
                                </td>

                                <td
                                    class="text-end text-nowrap"
                                >

                                    <button
                                        class="btn btn-sm btn-outline-secondary"
                                        onclick="openEditor(
                                            'transparansi',
                                            '${row.id}'
                                        )"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        onclick="delRow(
                                            'transparansi',
                                            '${row.id}'
                                        )"
                                    >
                                        Hapus
                                    </button>

                                </td>

                            </tr>

                        `).join("") ||

                        `
                            <tr>

                                <td
                                    colspan="5"
                                    class="text-muted"
                                >
                                    Belum ada informasi
                                    transparansi.
                                </td>

                            </tr>
                        `
                    }

                </tbody>

            </table>
        `;
    }

    // =========================================================
    // GALLERY
    // =========================================================

    function renderGallery() {

        const container =
            $("#galleryList");

        if (!container) {
            return;
        }

        container.innerHTML =
            cache.gallery.map(
                x => `

                    <div
                        class="col-6 col-md-4 col-lg-3"
                    >

                        <div
                            class="cardx p-2 h-100"
                        >

                            <img
                                src="${esc(
                                    x.image_url
                                )}"
                                class="img-preview"
                                alt="${esc(
                                    x.title
                                )}"
                            >

                            <b
                                class="small d-block p-2"
                            >
                                ${esc(
                                    x.title
                                )}
                            </b>

                            <div
                                class="px-2 pb-2 small text-muted truncate"
                            >
                                ${esc(
                                    x.description
                                )}
                            </div>

                            <div class="p-2">

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    onclick="openEditor(
                                        'gallery',
                                        '${x.id}'
                                    )"
                                >
                                    Edit
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    onclick="delRow(
                                        'gallery',
                                        '${x.id}'
                                    )"
                                >
                                    Hapus
                                </button>

                            </div>

                        </div>

                    </div>
                `
            ).join("") ||

            `
                <div class="col-12 text-muted">
                    Belum ada foto.
                </div>
            `;
    }

    // =========================================================
    // PESAN
    // =========================================================

    function renderMessages() {

        const container =
            $("#messageList");

        if (!container) {
            return;
        }

        const rows =
            cache.messages || [];

        container.innerHTML = `

            <table
                class="table table-hover align-middle"
            >

                <thead>

                    <tr>

                        <th>Pengirim</th>

                        <th>Subjek</th>

                        <th>Pesan</th>

                        <th>Status</th>

                        <th class="text-end">
                            Aksi
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        rows.map(x => `

                            <tr>

                                <td>

                                    <b>
                                        ${esc(
                                            x.name ||
                                            ""
                                        )}
                                    </b>

                                    <br>

                                    <small>
                                        ${esc(
                                            x.email ||
                                            ""
                                        )}
                                    </small>

                                </td>

                                <td>
                                    ${esc(
                                        x.subject ||
                                        ""
                                    )}
                                </td>

                                <td>

                                    <div
                                        class="truncate"
                                    >
                                        ${esc(
                                            x.message ||
                                            ""
                                        )}
                                    </div>

                                </td>

                                <td>

                                    <span
                                        class="badge ${
                                            x.status ===
                                            "baru"

                                                ? "text-bg-danger"

                                                : x.status ===
                                                  "dibaca"

                                                ? "text-bg-warning"

                                                : "text-bg-success"
                                        }"
                                    >
                                        ${esc(
                                            x.status ||
                                            "baru"
                                        )}
                                    </span>

                                </td>

                                <td
                                    class="text-end text-nowrap"
                                >

                                    <select
                                        class="form-select form-select-sm d-inline-block"
                                        style="width:auto"
                                        onchange="
                                            msgStatus(
                                                '${x.id}',
                                                this.value
                                            )
                                        "
                                    >

                                        <option
                                            value="baru"
                                            ${
                                                x.status ===
                                                "baru"
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            Baru
                                        </option>

                                        <option
                                            value="dibaca"
                                            ${
                                                x.status ===
                                                "dibaca"
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            Dibaca
                                        </option>

                                        <option
                                            value="dibalas"
                                            ${
                                                x.status ===
                                                "dibalas"
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            Dibalas
                                        </option>

                                    </select>

                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        onclick="
                                            delRow(
                                                'messages',
                                                '${x.id}'
                                            )
                                        "
                                    >
                                        Hapus
                                    </button>

                                </td>

                            </tr>

                        `).join("") ||

                        `
                            <tr>

                                <td
                                    colspan="5"
                                    class="text-muted"
                                >
                                    Belum ada pesan.
                                </td>

                            </tr>
                        `
                    }

                </tbody>

            </table>
        `;
    }

    // =========================================================
    // ADMIN
    // =========================================================

    function renderAdmins() {

        const container =
            $("#adminList");

        if (!container) {
            return;
        }

        container.innerHTML = `

            <table
                class="table table-hover align-middle"
            >

                <thead>

                    <tr>

                        <th>Nama</th>
                        <th>Email</th>
                        <th>Peran</th>
                        <th>Dibuat</th>
                        <th class="text-end">
                            Aksi
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        cache.admin_users.map(
                            x => `

                                <tr>

                                    <td>
                                        ${esc(
                                            x.name ||
                                            "-"
                                        )}
                                    </td>

                                    <td>
                                        ${esc(
                                            x.email ||
                                            ""
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            class="badge text-bg-light"
                                        >
                                            ${esc(
                                                x.role ||
                                                ""
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        ${
                                            x.created_at
                                                ? new Date(
                                                    x.created_at
                                                ).toLocaleDateString(
                                                    "id-ID"
                                                )
                                                : ""
                                        }
                                    </td>

                                    <td
                                        class="text-end"
                                    >

                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            onclick="
                                                removeAdmin(
                                                    '${esc(
                                                        x.email
                                                    )}'
                                                )
                                            "
                                        >
                                            Hapus Admin
                                        </button>

                                    </td>

                                </tr>
                            `
                        ).join("") ||

                        `
                            <tr>

                                <td
                                    colspan="5"
                                    class="text-muted"
                                >
                                    Belum ada Admin.
                                </td>

                            </tr>
                        `
                    }

                </tbody>

            </table>
        `;
    }

    // =========================================================
    // SETTINGS
    // =========================================================

    function fillSettings(site) {

        const fields = [

            ["sname", site.name],

            ["sloc", site.location],

            ["shead", site.head_village],

            ["sarea", site.area],

            ["spop", site.population],

            ["skk", site.kk],

            ["sdusun", site.dusun],

            ["sap", site.aparatur],

            ["semail", site.email],

            ["sphone", site.phone],

            ["saddress", site.address],

            ["spostal", site.postal_code],

            [
                "shours",
                site.office_hours
            ]

        ];

        fields.forEach(
            ([id, value]) => {

                const element =
                    $("#" + id);

                if (element) {
                    element.value =
                        value ?? "";
                }

            }
        );
    }

    // =========================================================
    // EDITOR
    // =========================================================

    const titles = {

        news:
            "Berita",

        agenda:
            "Agenda",

        gallery:
            "Galeri",

        potentials:
            "Potensi",

        services:
            "Layanan",

        transparansi:
            "Transparansi",

        faqs:
            "FAQ"
    };

    function openEditor(
        type,
        id = null
    ) {

        current = {
            type,
            id
        };

        const data =
            id
                ? (
                    cache[type] || []
                ).find(
                    x =>
                        String(x.id) ===
                        String(id)
                ) || {}
                : {};

        $("#editorTitle").textContent =
            (id ? "Edit " : "Tambah ") +
            titles[type];

        let html = "";

        // BERITA

        if (type === "news") {

            html = `

                <input
                    name="title"
                    class="form-control mb-2"
                    placeholder="Judul berita"
                    required
                    value="${esc(
                        data.title
                    )}"
                >

                <input
                    name="cat"
                    class="form-control mb-2"
                    placeholder="Kategori"
                    value="${esc(
                        data.cat
                    )}"
                >

                <input
                    name="date"
                    type="date"
                    class="form-control mb-2"
                    value="${
                        data.date || ""
                    }"
                >

                <textarea
                    name="summary"
                    class="form-control mb-2"
                    placeholder="Ringkasan"
                >${esc(
                    data.summary
                )}</textarea>

                <textarea
                    name="body"
                    rows="8"
                    class="form-control"
                    placeholder="Isi berita"
                >${esc(
                    data.body
                )}</textarea>
            `;
        }

        // AGENDA

        if (type === "agenda") {

            html = `

                <input
                    name="title"
                    class="form-control mb-2"
                    placeholder="Nama kegiatan"
                    required
                    value="${esc(
                        data.title
                    )}"
                >

                <input
                    name="date"
                    type="date"
                    class="form-control mb-2"
                    value="${
                        data.date || ""
                    }"
                >

                <input
                    name="time"
                    class="form-control mb-2"
                    placeholder="Jam"
                    value="${esc(
                        data.time
                    )}"
                >

                <input
                    name="place"
                    class="form-control mb-2"
                    placeholder="Lokasi"
                    value="${esc(
                        data.place
                    )}"
                >

                <textarea
                    name="description"
                    class="form-control"
                    placeholder="Deskripsi"
                >${esc(
                    data.description
                )}</textarea>
            `;
        }

        // POTENSI

        if (type === "potentials") {

            html = `

                <input
                    name="name"
                    class="form-control mb-2"
                    placeholder="Nama potensi"
                    required
                    value="${esc(
                        data.name
                    )}"
                >

                <input
                    name="cat"
                    class="form-control mb-2"
                    placeholder="Kategori"
                    value="${esc(
                        data.cat
                    )}"
                >

                <textarea
                    name="description"
                    rows="6"
                    class="form-control"
                    placeholder="Deskripsi"
                >${esc(
                    data.description
                )}</textarea>
            `;
        }

        // LAYANAN

        if (type === "services") {

            html = `

                <input
                    name="name"
                    class="form-control mb-2"
                    placeholder="Nama layanan"
                    required
                    value="${esc(
                        data.name
                    )}"
                >

                <textarea
                    name="description"
                    rows="6"
                    class="form-control"
                    placeholder="Deskripsi layanan"
                >${esc(
                    data.description
                )}</textarea>
            `;
        }

        // FAQ
        // PENTING:
        // menggunakan q dan a

        if (type === "faqs") {

            html = `

                <div class="mb-3">

                    <label
                        class="form-label fw-semibold"
                    >
                        Pertanyaan
                    </label>

                    <input
                        name="q"
                        class="form-control"
                        placeholder="Contoh: Bagaimana cara mengurus surat?"
                        required
                        value="${esc(
                            data.q
                        )}"
                    >

                </div>

                <div>

                    <label
                        class="form-label fw-semibold"
                    >
                        Jawaban
                    </label>

                    <textarea
                        name="a"
                        rows="7"
                        class="form-control"
                        placeholder="Tuliskan jawaban..."
                        required
                    >${esc(
                        data.a
                    )}</textarea>

                </div>
            `;
        }

        // TRANSPARANSI
        // menggunakan tabel transparansi

        if (type === "transparansi") {

            html = `

                <div class="row g-3">

                    <div class="col-md-4">

                        <label
                            class="form-label fw-semibold"
                        >
                            Tahun
                        </label>

                        <input
                            name="tahun"
                            type="number"
                            class="form-control"
                            placeholder="2026"
                            required
                            value="${esc(
                                data.tahun
                            )}"
                        >

                    </div>

                    <div class="col-md-8">

                        <label
                            class="form-label fw-semibold"
                        >
                            Judul
                        </label>

                        <input
                            name="judul"
                            class="form-control"
                            placeholder="Contoh: APBDes Desa Fataatu Timur Tahun 2026"
                            required
                            value="${esc(
                                data.judul
                            )}"
                        >

                    </div>

                    <div class="col-12">

                        <label
                            class="form-label fw-semibold"
                        >
                            Kategori
                        </label>

                        <input
                            name="kategori"
                            class="form-control"
                            placeholder="APBDes / Realisasi / Dana Desa / Laporan"
                            value="${esc(
                                data.kategori
                            )}"
                        >

                    </div>

                    <div class="col-12">

                        <label
                            class="form-label fw-semibold"
                        >
                            Deskripsi
                        </label>

                        <textarea
                            name="deskripsi"
                            rows="6"
                            class="form-control"
                            placeholder="Keterangan dokumen atau informasi transparansi"
                        >${esc(
                            data.deskripsi
                        )}</textarea>

                    </div>

                </div>

            `;
        }

        // GALERI

        if (type === "gallery") {

            html = `

                <input
                    name="title"
                    class="form-control mb-2"
                    placeholder="Judul foto"
                    required
                    value="${esc(
                        data.title
                    )}"
                >

                <textarea
                    name="description"
                    class="form-control mb-2"
                    placeholder="Keterangan foto"
                >${esc(
                    data.description
                )}</textarea>

                ${
                    data.image_url
                        ? `
                            <img
                                src="${esc(
                                    data.image_url
                                )}"
                                class="img-preview mb-2"
                            >
                        `
                        : ""
                }

                <input
                    name="file"
                    type="file"
                    accept="image/*"
                    class="form-control"
                >

                <small
                    class="text-muted"
                >
                    Saat edit, file boleh dikosongkan.
                </small>
            `;
        }

        $("#editorBody").innerHTML =
            html;

        bootstrap.Modal
            .getOrCreateInstance(
                $("#editorModal")
            )
            .show();
    }

    // =========================================================
    // SAVE EDITOR
    // =========================================================

    async function saveEditor(event) {

        event.preventDefault();

        const form =
            event.target;

        const formData =
            new FormData(form);

        const type =
            current.type;

        try {

            const data = {};

            for (
                const [key, value]
                of formData.entries()
            ) {

                if (
                    key !== "file"
                ) {

                    data[key] =
                        value;
                }
            }

            // ==============================================
            // GALERI
            // ==============================================

            if (type === "gallery") {

                const file =
                    formData.get("file");

                if (
                    file &&
                    file.size
                ) {

                    const path =
                        "gallery/" +
                        Date.now() +
                        "-" +
                        file.name.replace(
                            /[^a-zA-Z0-9._-]/g,
                            "-"
                        );

                    const upload =
                        await sb.storage
                            .from("gallery")
                            .upload(
                                path,
                                file,
                                {
                                    upsert:
                                        false
                                }
                            );

                    if (upload.error) {
                        throw upload.error;
                    }

                    data.image_url =
                        sb.storage
                            .from("gallery")
                            .getPublicUrl(
                                path
                            )
                            .data
                            .publicUrl;

                    data.storage_path =
                        path;

                } else if (
                    current.id
                ) {

                    const old =
                        cache.gallery.find(
                            x =>
                                String(x.id) ===
                                String(
                                    current.id
                                )
                        );

                    data.image_url =
                        old?.image_url ||
                        "";

                    data.storage_path =
                        old?.storage_path ||
                        "";

                } else {

                    throw new Error(
                        "Pilih foto terlebih dahulu."
                    );
                }
            }

            // ==============================================
            // TRANSPARANSI
            // ==============================================

            if (
                type ===
                "transparansi"
            ) {

                data.tahun =
                    data.tahun
                        ? Number(
                            data.tahun
                        )
                        : null;

                data.judul =
                    String(
                        data.judul ||
                        ""
                    ).trim();

                data.kategori =
                    String(
                        data.kategori ||
                        ""
                    ).trim();

                data.deskripsi =
                    String(
                        data.deskripsi ||
                        ""
                    ).trim();
            }

            // ==============================================
            // FAQ
            // ==============================================

            if (
                type === "faqs"
            ) {

                data.q =
                    String(
                        data.q || ""
                    ).trim();

                data.a =
                    String(
                        data.a || ""
                    ).trim();

                if (
                    !data.q ||
                    !data.a
                ) {

                    throw new Error(
                        "Pertanyaan dan jawaban wajib diisi."
                    );
                }
            }

            // ==============================================
            // UPDATE / INSERT
            // ==============================================

            let result;

            if (
                current.id
            ) {

                result =
                    await sb
                        .from(type)
                        .update(data)
                        .eq(
                            "id",
                            current.id
                        );

            } else {

                result =
                    await sb
                        .from(type)
                        .insert(data);
            }

            if (
                result.error
            ) {

                throw result.error;
            }

            bootstrap.Modal
                .getOrCreateInstance(
                    $("#editorModal")
                )
                .hide();

            toast(
                "Data berhasil disimpan."
            );

            await loadAll();

        } catch (error) {

            console.error(
                error
            );

            toast(
                error.message ||
                "Gagal menyimpan data.",
                "error"
            );
        }
    }

    // =========================================================
    // DELETE
    // =========================================================

    async function delRow(
        type,
        id
    ) {

        if (
            !confirm(
                "Yakin ingin menghapus data ini?"
            )
        ) {
            return;
        }

        try {

            // Gallery storage

            if (
                type === "gallery"
            ) {

                const item =
                    cache.gallery.find(
                        x =>
                            String(x.id) ===
                            String(id)
                    );

                if (
                    item?.storage_path
                ) {

                    await sb.storage
                        .from("gallery")
                        .remove([
                            item.storage_path
                        ]);
                }
            }

            const result =
                await sb
                    .from(type)
                    .delete()
                    .eq(
                        "id",
                        id
                    );

            if (
                result.error
            ) {

                throw result.error;
            }

            toast(
                "Data berhasil dihapus."
            );

            await loadAll();

        } catch (error) {

            console.error(
                error
            );

            toast(
                error.message ||
                "Gagal menghapus data.",
                "error"
            );
        }
    }

    // =========================================================
    // SAVE PAGE
    // =========================================================

    async function savePage(
        slug
    ) {

        try {

            const data = {

                slug,

                title:
                    $(
                        "#pt-" +
                        slug
                    ).value,

                subtitle:
                    $(
                        "#ps-" +
                        slug
                    ).value,

                content:
                    $(
                        "#pc-" +
                        slug
                    ).value,

                updated_at:
                    new Date()
                        .toISOString()
            };

            const result =
                await sb
                    .from(
                        "page_content"
                    )
                    .upsert(
                        data,
                        {
                            onConflict:
                                "slug"
                        }
                    );

            if (
                result.error
            ) {

                throw result.error;
            }

            toast(
                "Konten halaman berhasil disimpan."
            );

            await loadAll();

        } catch (error) {

            toast(
                error.message,
                "error"
            );
        }
    }

    // =========================================================
    // MESSAGE STATUS
    // =========================================================

    async function msgStatus(
        id,
        status
    ) {

        const result =
            await sb
                .from("messages")
                .update({
                    status
                })
                .eq(
                    "id",
                    id
                );

        if (
            result.error
        ) {

            toast(
                result.error.message,
                "error"
            );

        } else {

            toast(
                "Status pesan diperbarui."
            );

            await loadAll();
        }
    }

    // =========================================================
    // SAVE SETTINGS
    // =========================================================

    async function saveSettings(
        event
    ) {

        event.preventDefault();

        try {

            const data = {

                id: 1,

                name:
                    $("#sname").value,

                location:
                    $("#sloc").value,

                head_village:
                    $("#shead").value,

                area:
                    $("#sarea").value,

                population:
                    Number(
                        $("#spop").value ||
                        0
                    ),

                kk:
                    Number(
                        $("#skk").value ||
                        0
                    ),

                dusun:
                    Number(
                        $("#sdusun").value ||
                        0
                    ),

                aparatur:
                    Number(
                        $("#sap").value ||
                        0
                    ),

                email:
                    $("#semail").value,

                phone:
                    $("#sphone").value,

                address:
                    $("#saddress").value,

                postal_code:
                    $("#spostal").value,

                office_hours:
                    $("#shours").value,

                updated_at:
                    new Date()
                        .toISOString()
            };

            const result =
                await sb
                    .from(
                        "site_settings"
                    )
                    .upsert(
                        data,
                        {
                            onConflict:
                                "id"
                        }
                    );

            if (
                result.error
            ) {

                throw result.error;
            }

            toast(
                "Pengaturan website berhasil disimpan."
            );

            await loadAll();

        } catch (error) {

            toast(
                error.message,
                "error"
            );
        }
    }

    // =========================================================
    // ADMIN MANAGEMENT
    // =========================================================

    async function addAdmin(
        event
    ) {

        event.preventDefault();

        try {

            const result =
                await sb.rpc(
                    "admin_add_by_email",
                    {
                        p_email:
                            $("#aemail").value,

                        p_name:
                            $("#aname").value,

                        p_role:
                            $("#arole").value
                    }
                );

            if (
                result.error
            ) {

                throw result.error;
            }

            toast(
                "Admin berhasil ditambahkan."
            );

            $("#adminAddForm")
                .reset();

            await loadAll();

        } catch (error) {

            toast(
                error.message,
                "error"
            );
        }
    }

    async function removeAdmin(
        email
    ) {

        if (
            !confirm(
                "Hapus hak Admin untuk " +
                email +
                "?"
            )
        ) {
            return;
        }

        try {

            const result =
                await sb.rpc(
                    "admin_remove_by_email",
                    {
                        p_email:
                            email
                    }
                );

            if (
                result.error
            ) {

                throw result.error;
            }

            toast(
                "Hak Admin berhasil dihapus."
            );

            await loadAll();

        } catch (error) {

            toast(
                error.message,
                "error"
            );
        }
    }

    // =========================================================
    // EVENTS
    // =========================================================

    $("#loginForm")
        ?.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                $("#loginErr").textContent =
                    "";

                try {

                    await client();

                    const result =
                        await sb.auth
                            .signInWithPassword({
                                email:
                                    $("#email")
                                        .value
                                        .trim(),

                                password:
                                    $("#password")
                                        .value
                            });

                    if (
                        result.error
                    ) {

                        throw result.error;
                    }

                    await loadAll();

                } catch (error) {

                    $("#loginErr")
                        .textContent =
                        error.message;
                }
            }
        );

    $("#logout")
        ?.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                if (sb) {
                    await sb.auth.signOut();
                }

                showLogin();
            }
        );

    $("#settingsForm")
        ?.addEventListener(
            "submit",
            saveSettings
        );

    $("#adminAddForm")
        ?.addEventListener(
            "submit",
            addAdmin
        );

    $("#editorForm")
        ?.addEventListener(
            "submit",
            saveEditor
        );

    $("#refresh")
        ?.addEventListener(
            "click",
            loadAll
        );

    $("#reloadMessages")
        ?.addEventListener(
            "click",
            loadAll
        );

    $("#menu")
        ?.addEventListener(
            "click",
            () => {

                $("#side")
                    ?.classList
                    .toggle("open");

                if ($("#overlay")) {
                    $("#overlay")
                        .style
                        .display = "block";
                }
            }
        );

    $("#overlay")
        ?.addEventListener(
            "click",
            () => {

                $("#side")
                    ?.classList
                    .remove("open");

                $("#overlay")
                    .style
                    .display = "none";
            }
        );

    document
        .querySelectorAll(
            "#nav a[data-target]"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "#nav a"
                            )
                            .forEach(
                                x =>
                                    x.classList
                                        .remove(
                                            "active"
                                        )
                            );

                        link.classList
                            .add("active");

                        if (
                            innerWidth < 901
                        ) {

                            $("#side")
                                ?.classList
                                .remove(
                                    "open"
                                );

                            $("#overlay")
                                .style
                                .display =
                                "none";
                        }
                    }
                );
            }
        );

    // =========================================================
    // GLOBAL
    // =========================================================

    window.openEditor =
        openEditor;

    window.delRow =
        delRow;

    window.savePage =
        savePage;

    window.msgStatus =
        msgStatus;

    window.removeAdmin =
        removeAdmin;

    // =========================================================
    // START
    // =========================================================

    (async function () {

        if (!ready()) {

            $("#configWarn")
                ?.classList
                .remove("hidden");

            return;
        }

        try {

            await client();

            const session =
                await sb.auth
                    .getSession();

            if (
                session.data.session
            ) {

                await loadAll();
            }

        } catch (error) {

            console.error(
                error
            );
        }

    })();

})();