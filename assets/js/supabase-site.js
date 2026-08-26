(function () {

    'use strict';

    // =====================================================
    // SUPABASE CMS - WEBSITE DESA FATAATU TIMUR
    // =====================================================

    console.log("======================================");
    console.log("SUPABASE SITE CMS");
    console.log("DESA FATAATU TIMUR");
    console.log("======================================");


    // =====================================================
    // SUPABASE CLIENT
    // =====================================================

    let client = null;


    function getClient() {

        if (client) {
            return client;
        }

        if (
            !window.SUPABASE_CONFIG ||
            !window.SUPABASE_CONFIG.url ||
            !window.SUPABASE_CONFIG.key
        ) {

            console.error(
                "❌ SUPABASE_CONFIG tidak ditemukan."
            );

            return null;
        }


        if (!window.supabase) {

            console.error(
                "❌ Library Supabase belum dimuat."
            );

            return null;
        }


        client = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.key
        );


        console.log(
            "✅ Supabase Client berhasil dibuat."
        );


        return client;
    }



    // =====================================================
    // ESCAPE HTML
    // =====================================================

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



    // =====================================================
    // FORMAT TEKS
    // =====================================================

    function formatContent(value) {

        if (!value) {
            return "";
        }

        return esc(value)
            .replace(/\r\n/g, "\n")
            .replace(/\n\n+/g, "</p><p>")
            .replace(/\n/g, "<br>");

    }



    // =====================================================
    // HELPER NILAI
    // =====================================================

    function firstValue(item, fields, fallback = "") {

        if (!item) {
            return fallback;
        }

        for (let i = 0; i < fields.length; i++) {

            const field = fields[i];

            if (
                item[field] !== undefined &&
                item[field] !== null &&
                String(item[field]).trim() !== ""
            ) {

                return item[field];

            }

        }

        return fallback;
    }



    // =====================================================
    // PAGE CONTENT
    // =====================================================

    async function loadCurrentPage() {

        const sb = getClient();

        if (!sb) {
            return null;
        }


        const slug =
            document.body.dataset.page;


        if (!slug) {

            console.log(
                "ℹ️ Halaman ini tidak menggunakan page_content."
            );

            return null;
        }


        console.log(
            "📄 Mengambil page_content:",
            slug
        );


        const {
            data,
            error
        } = await sb
            .from("page_content")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();


        if (error) {

            console.error(
                "❌ Error page_content:",
                error
            );

            return null;
        }


        if (!data) {

            console.warn(
                "⚠️ Data page_content tidak ditemukan:",
                slug
            );

            return null;
        }


        console.log(
            "✅ Page content:",
            data
        );


        return data;

    }



    // =====================================================
    // RENDER PAGE CONTENT
    // =====================================================

    function renderPage(page) {

        if (!page) {
            return;
        }


        // TITLE

        document
            .querySelectorAll("[data-page-title]")
            .forEach(function (element) {

                element.textContent =
                    page.title || "";

            });



        // SUBTITLE

        document
            .querySelectorAll("[data-page-subtitle]")
            .forEach(function (element) {

                element.textContent =
                    page.subtitle || "";

            });



        // CONTENT

        document
            .querySelectorAll("[data-page-content]")
            .forEach(function (element) {

                if (page.content) {

                    element.innerHTML =
                        formatContent(page.content);

                } else {

                    element.innerHTML =
                        "<p>Belum ada informasi.</p>";

                }

            });


        console.log(
            "✅ Page berhasil ditampilkan."
        );

    }



    // =====================================================
    // SITE SETTINGS
    // =====================================================

    async function loadSiteSettings() {

        const sb = getClient();

        if (!sb) {
            return null;
        }


        const {
            data,
            error
        } = await sb
            .from("site_settings")
            .select("*")
            .limit(1)
            .maybeSingle();


        if (error) {

            console.error(
                "❌ Error site_settings:",
                error
            );

            return null;
        }


        if (!data) {

            console.warn(
                "⚠️ site_settings kosong."
            );

            return null;
        }


        console.log(
            "✅ Site settings:",
            data
        );


        return data;

    }



    // =====================================================
    // RENDER SITE SETTINGS
    // =====================================================

    function renderSiteSettings(site) {

        if (!site) {
            return;
        }


        // NAMA DESA

        document
            .querySelectorAll(
                "[data-cms-site-name]"
            )
            .forEach(function (element) {

                const value =
                    firstValue(
                        site,
                        ["name", "site_name", "nama_desa"]
                    );

                if (value) {
                    element.textContent = value;
                }

            });



        // LOKASI

        document
            .querySelectorAll(
                "[data-cms-location]"
            )
            .forEach(function (element) {

                const value =
                    firstValue(
                        site,
                        [
                            "location",
                            "lokasi",
                            "address"
                        ]
                    );

                if (value) {
                    element.textContent = value;
                }

            });



        // ALAMAT

        document
            .querySelectorAll(
                '[data-contact="address"]'
            )
            .forEach(function (element) {

                const value =
                    firstValue(
                        site,
                        [
                            "address",
                            "alamat"
                        ]
                    );

                if (value) {
                    element.textContent = value;
                }

            });



        // TELEPON

        document
            .querySelectorAll(
                '[data-contact="phone"]'
            )
            .forEach(function (element) {

                const value =
                    firstValue(
                        site,
                        [
                            "phone",
                            "telephone",
                            "telepon",
                            "nomor_hp"
                        ]
                    );

                if (value) {
                    element.textContent = value;
                }

            });



        // EMAIL

        document
            .querySelectorAll(
                '[data-contact="email"]'
            )
            .forEach(function (element) {

                const value =
                    firstValue(
                        site,
                        [
                            "email",
                            "email_address"
                        ]
                    );

                if (value) {
                    element.textContent = value;
                }

            });



        // JAM KERJA

        document
            .querySelectorAll(
                '[data-contact="hours"]'
            )
            .forEach(function (element) {

                const value =
                    firstValue(
                        site,
                        [
                            "hours",
                            "jam_kerja",
                            "working_hours"
                        ]
                    );

                if (value) {
                    element.textContent = value;
                }

            });



        // KODE POS

        document
            .querySelectorAll(
                '[data-contact="postal"]'
            )
            .forEach(function (element) {

                const value =
                    firstValue(
                        site,
                        [
                            "postal",
                            "postal_code",
                            "kode_pos"
                        ]
                    );

                if (value) {
                    element.textContent = value;
                }

            });


    }



    // =====================================================
    // GALERI
    // =====================================================

    async function loadGallery() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const container =
            document.getElementById(
                "gallery-container"
            );


        if (!container) {

            console.log(
                "ℹ️ gallery-container tidak ditemukan."
            );

            return;
        }


        console.log(
            "🖼️ Mengambil data gallery..."
        );


        const {
            data,
            error
        } = await sb
            .from("gallery")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil gallery:",
                error
            );


            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        <strong>
                            Galeri belum dapat dimuat.
                        </strong>

                        <br>

                        Terjadi masalah saat
                        mengambil data galeri dari database.

                    </div>

                </div>

            `;

            return;
        }


        console.log(
            "✅ DATA GALLERY:",
            data
        );


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="empty-state">

                        <i class="bi bi-images fs-1 text-muted"></i>

                        <h5 class="mt-3">
                            Belum ada foto
                        </h5>

                        <p class="text-muted">
                            Foto yang ditambahkan melalui Admin
                            akan tampil di sini.
                        </p>

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(function (item) {


            const title =
                firstValue(
                    item,
                    [
                        "title",
                        "name",
                        "nama",
                        "judul"
                    ],
                    "Dokumentasi Desa"
                );


            const description =
                firstValue(
                    item,
                    [
                        "description",
                        "deskripsi",
                        "content"
                    ],
                    ""
                );


            const category =
                firstValue(
                    item,
                    [
                        "category",
                        "kategori",
                        "jenis"
                    ],
                    "Kegiatan Desa"
                );


            const imageUrl =
                firstValue(
                    item,
                    [
                        "image_url",
                        "image",
                        "foto_url",
                        "foto"
                    ],
                    ""
                );


            const col =
                document.createElement(
                    "div"
                );


            col.className =
                "col-12 col-sm-6 col-lg-4";


            col.innerHTML = `

                <div class="gallery-card card-desa h-100">

                    <div
                        class="gallery-image-wrapper"
                        style="
                            position:relative;
                            overflow:hidden;
                            height:260px;
                        "
                    >

                        ${
                            imageUrl

                            ?

                            `

                            <img
                                src="${esc(imageUrl)}"
                                alt="${esc(title)}"
                                style="
                                    width:100%;
                                    height:100%;
                                    object-fit:cover;
                                    display:block;
                                "
                            >

                            `

                            :

                            `

                            <div
                                class="d-flex
                                       align-items-center
                                       justify-content-center
                                       bg-light"
                                style="
                                    width:100%;
                                    height:100%;
                                "
                            >

                                <i
                                    class="bi bi-image
                                           fs-1 text-muted"
                                ></i>

                            </div>

                            `
                        }

                    </div>


                    <div class="p-4">

                        <span
                            class="badge
                                   bg-success-subtle
                                   text-success
                                   mb-2"
                        >
                            ${esc(category)}
                        </span>


                        <h3
                            class="h5 fw-bold mb-2"
                        >
                            ${esc(title)}
                        </h3>


                        ${
                            description

                            ?

                            `
                            <p
                                class="text-muted
                                       small mb-0"
                            >
                                ${esc(description)}
                            </p>
                            `

                            :

                            ""
                        }

                    </div>

                </div>

            `;


            // KLIK FOTO

            if (imageUrl) {

                const image =
                    col.querySelector("img");


                if (image) {

                    image.style.cursor =
                        "pointer";


                    image.addEventListener(
                        "click",
                        function () {

                            openGalleryModal(
                                imageUrl,
                                title,
                                description
                            );

                        }
                    );

                }

            }


            container.appendChild(
                col
            );


        });


        console.log(
            "✅ Gallery berhasil ditampilkan."
        );

    }



    // =====================================================
    // MODAL GALERI
    // =====================================================

    function openGalleryModal(
        imageUrl,
        title,
        description
    ) {


        const modalElement =
            document.getElementById(
                "galleryModal"
            );


        if (!modalElement) {

            window.open(
                imageUrl,
                "_blank"
            );

            return;
        }


        const modalTitle =
            document.getElementById(
                "galleryModalTitle"
            );


        const modalImage =
            document.getElementById(
                "galleryModalImage"
            );


        const modalDescription =
            document.getElementById(
                "galleryModalDescription"
            );


        if (modalTitle) {

            modalTitle.textContent =
                title || "Dokumentasi Desa";

        }


        if (modalImage) {

            modalImage.src =
                imageUrl;

            modalImage.alt =
                title || "Dokumentasi Desa";

        }


        if (modalDescription) {

            modalDescription.textContent =
                description || "";

        }


        if (
            window.bootstrap &&
            bootstrap.Modal
        ) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();

        }

    }



    // =====================================================
    // LAYANAN
    // =====================================================

    async function loadLayanan() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const container =
            document.getElementById(
                "layanan-container"
            );


        if (!container) {

            console.log(
                "ℹ️ layanan-container tidak ditemukan."
            );

            return;
        }


        console.log(
            "📋 Mengambil data services..."
        );


        const {
            data,
            error
        } = await sb
            .from("services")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil services:",
                error
            );


            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        <strong>
                            Layanan belum dapat dimuat.
                        </strong>

                        <br>

                        Terjadi masalah saat
                        mengambil data layanan.

                    </div>

                </div>

            `;

            return;
        }


        console.log(
            "✅ DATA SERVICES:",
            data
        );


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="empty-state">

                        <i class="
                            bi bi-file-earmark-text
                            fs-1 text-muted
                        "></i>

                        <h5 class="mt-3">
                            Belum ada layanan
                        </h5>

                        <p class="text-muted">
                            Data layanan yang ditambahkan
                            melalui Admin akan tampil di sini.
                        </p>

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(function (item) {


            const name =
                firstValue(
                    item,
                    [
                        "name",
                        "nama",
                        "title",
                        "judul"
                    ],
                    "Layanan Desa"
                );


            const description =
                firstValue(
                    item,
                    [
                        "description",
                        "deskripsi",
                        "content"
                    ],
                    ""
                );


            const col =
                document.createElement(
                    "div"
                );


            col.className =
                "col-12 col-md-6 col-lg-4";


            col.innerHTML = `

                <div
                    class="
                        layanan-card
                        card-desa
                        h-100
                    "
                >

                    <div class="layanan-icon">

                        <i
                            class="
                                bi
                                bi-file-earmark-text
                            "
                        ></i>

                    </div>


                    <div class="layanan-content">

                        <h3>
                            ${esc(name)}
                        </h3>


                        <p>
                            ${
                                esc(
                                    description
                                )
                            }
                        </p>


                        <div
                            class="
                                layanan-footer
                            "
                        >

                            <span>

                                <i
                                    class="
                                        bi
                                        bi-check-circle-fill
                                    "
                                ></i>

                                Layanan Desa

                            </span>

                        </div>

                    </div>

                </div>

            `;


            container.appendChild(
                col
            );

        });


        console.log(
            "✅ Layanan berhasil ditampilkan."
        );

    }



    // =====================================================
    // POTENSI
    // =====================================================

    async function loadPotensi() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const container =
            document.getElementById(
                "potensi-container"
            );


        if (!container) {
            return;
        }


        const {
            data,
            error
        } = await sb
            .from("potentials")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil potentials:",
                error
            );

            return;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="empty-state">

                        <h5>
                            Belum ada potensi desa
                        </h5>

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(function (item) {


            const name =
                firstValue(
                    item,
                    [
                        "name",
                        "nama",
                        "title",
                        "judul"
                    ],
                    "Potensi Desa"
                );


            const category =
                firstValue(
                    item,
                    [
                        "category",
                        "kategori",
                        "jenis"
                    ],
                    "Potensi"
                );


            const description =
                firstValue(
                    item,
                    [
                        "description",
                        "deskripsi",
                        "content"
                    ],
                    ""
                );


            const image =
                firstValue(
                    item,
                    [
                        "image_url",
                        "image",
                        "foto_url",
                        "foto"
                    ],
                    ""
                );


            const col =
                document.createElement(
                    "div"
                );


            col.className =
                "col-md-6 col-lg-4";


            col.innerHTML = `

                <div
                    class="
                        card-desa
                        h-100
                        overflow-hidden
                    "
                >

                    ${
                        image

                        ?

                        `
                        <img
                            src="${esc(image)}"
                            alt="${esc(name)}"
                            style="
                                width:100%;
                                height:230px;
                                object-fit:cover;
                            "
                        >
                        `

                        :

                        `
                        <div
                            class="
                                d-flex
                                align-items-center
                                justify-content-center
                                bg-light
                            "
                            style="
                                height:230px;
                            "
                        >

                            <i
                                class="
                                    bi bi-flower3
                                    fs-1
                                    text-muted
                                "
                            ></i>

                        </div>
                        `
                    }


                    <div class="p-4">

                        <span
                            class="
                                badge
                                bg-success-subtle
                                text-success
                                mb-2
                            "
                        >
                            ${esc(category)}
                        </span>


                        <h3 class="h5 fw-bold">
                            ${esc(name)}
                        </h3>


                        <p class="text-muted">
                            ${esc(description)}
                        </p>

                    </div>

                </div>

            `;


            container.appendChild(
                col
            );

        });

    }



    // =====================================================
    // WISATA
    // =====================================================

    async function loadWisata() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const container =
            document.getElementById(
                "wisata-container"
            );


        if (!container) {
            return;
        }


        const {
            data,
            error
        } = await sb
            .from("wisata")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil wisata:",
                error
            );

            return;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="empty-state">

                        <h5>
                            Belum ada data wisata
                        </h5>

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(function (item) {


            const name =
                firstValue(
                    item,
                    [
                        "name",
                        "nama",
                        "title",
                        "judul"
                    ],
                    "Wisata Desa"
                );


            const description =
                firstValue(
                    item,
                    [
                        "description",
                        "deskripsi",
                        "content"
                    ],
                    ""
                );


            const image =
                firstValue(
                    item,
                    [
                        "image_url",
                        "image",
                        "foto_url",
                        "foto"
                    ],
                    ""
                );


            const col =
                document.createElement(
                    "div"
                );


            col.className =
                "col-md-6 col-lg-4";


            col.innerHTML = `

                <div
                    class="
                        card-desa
                        h-100
                        overflow-hidden
                    "
                >

                    ${
                        image

                        ?

                        `
                        <img
                            src="${esc(image)}"
                            alt="${esc(name)}"
                            style="
                                width:100%;
                                height:230px;
                                object-fit:cover;
                            "
                        >
                        `

                        :

                        ""
                    }


                    <div class="p-4">

                        <h3 class="h5 fw-bold">
                            ${esc(name)}
                        </h3>


                        <p class="text-muted mb-0">
                            ${esc(description)}
                        </p>

                    </div>

                </div>

            `;


            container.appendChild(
                col
            );

        });

    }



    // =====================================================
    // BERITA
    // =====================================================

    async function loadNews() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const containers =
            document.querySelectorAll(
                "[data-home-news]"
            );


        if (!containers.length) {
            return;
        }


        const {
            data,
            error
        } = await sb
            .from("news")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil news:",
                error
            );

            return;
        }


        containers.forEach(
            function (container) {

                if (
                    !data ||
                    data.length === 0
                ) {

                    container.innerHTML = `

                        <div class="col-12">

                            <div class="empty-state">

                                Belum ada berita.

                            </div>

                        </div>

                    `;

                    return;
                }


                container.innerHTML = "";


                data.forEach(
                    function (item) {


                        const title =
                            firstValue(
                                item,
                                [
                                    "title",
                                    "judul",
                                    "name",
                                    "nama"
                                ],
                                "Berita Desa"
                            );


                        const content =
                            firstValue(
                                item,
                                [
                                    "content",
                                    "description",
                                    "deskripsi"
                                ],
                                ""
                            );


                        const image =
                            firstValue(
                                item,
                                [
                                    "image_url",
                                    "image",
                                    "foto_url",
                                    "foto"
                                ],
                                ""
                            );


                        const col =
                            document.createElement(
                                "div"
                            );


                        col.className =
                            "col-md-6 col-lg-4";


                        col.innerHTML = `

                            <div
                                class="
                                    card-desa
                                    h-100
                                    overflow-hidden
                                "
                            >

                                ${
                                    image

                                    ?

                                    `
                                    <img
                                        src="${esc(image)}"
                                        alt="${esc(title)}"
                                        style="
                                            width:100%;
                                            height:220px;
                                            object-fit:cover;
                                        "
                                    >
                                    `

                                    :

                                    ""
                                }


                                <div class="p-4">

                                    <h3
                                        class="h5 fw-bold"
                                    >
                                        ${esc(title)}
                                    </h3>


                                    <p
                                        class="
                                            text-muted
                                        "
                                    >
                                        ${esc(
                                            content
                                        )}
                                    </p>

                                </div>

                            </div>

                        `;


                        container.appendChild(
                            col
                        );

                    }
                );

            }
        );

    }



    // =====================================================
    // AGENDA
    // =====================================================

    async function loadAgenda() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const container =
            document.getElementById(
                "agenda-container"
            );


        if (!container) {
            return;
        }


        const {
            data,
            error
        } = await sb
            .from("agenda")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil agenda:",
                error
            );

            return;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="empty-state">

                        Belum ada agenda.

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(function (item) {


            const title =
                firstValue(
                    item,
                    [
                        "title",
                        "judul",
                        "name",
                        "nama"
                    ],
                    "Agenda Desa"
                );


            const description =
                firstValue(
                    item,
                    [
                        "description",
                        "deskripsi",
                        "content"
                    ],
                    ""
                );


            const date =
                firstValue(
                    item,
                    [
                        "date",
                        "tanggal",
                        "event_date"
                    ],
                    ""
                );


            const col =
                document.createElement(
                    "div"
                );


            col.className =
                "col-md-6";


            col.innerHTML = `

                <div class="card-desa p-4 h-100">

                    <div class="d-flex gap-3">

                        <div
                            class="
                                icon-circle
                                flex-shrink-0
                            "
                        >

                            <i
                                class="
                                    bi
                                    bi-calendar-event
                                "
                            ></i>

                        </div>


                        <div>

                            <h3 class="h5 fw-bold">
                                ${esc(title)}
                            </h3>


                            ${
                                date
                                ?
                                `
                                <div
                                    class="
                                        small
                                        text-success
                                        fw-semibold
                                        mb-2
                                    "
                                >
                                    ${esc(date)}
                                </div>
                                `
                                :
                                ""
                            }


                            <p class="text-muted mb-0">
                                ${esc(description)}
                            </p>

                        </div>

                    </div>

                </div>

            `;


            container.appendChild(
                col
            );

        });

    }



    // =====================================================
    // FAQ
    // =====================================================

    async function loadFAQ() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const container =
            document.getElementById(
                "faq-container"
            );


        if (!container) {
            return;
        }


        const {
            data,
            error
        } = await sb
            .from("faqs")
            .select("*")
            .order("id", {
                ascending: true
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil FAQ:",
                error
            );

            return;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    Belum ada FAQ.

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(
            function (item, index) {


                const question =
                    firstValue(
                        item,
                        [
                            "question",
                            "pertanyaan",
                            "title",
                            "judul"
                        ],
                        "Pertanyaan"
                    );


                const answer =
                    firstValue(
                        item,
                        [
                            "answer",
                            "jawaban",
                            "description",
                            "content"
                        ],
                        ""
                    );


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "accordion-item";


                div.innerHTML = `

                    <h2
                        class="accordion-header"
                    >

                        <button
                            class="
                                accordion-button
                                ${
                                    index !== 0
                                    ? "collapsed"
                                    : ""
                                }
                            "
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#faq${index}"
                        >

                            ${esc(question)}

                        </button>

                    </h2>


                    <div
                        id="faq${index}"
                        class="
                            accordion-collapse
                            collapse
                            ${
                                index === 0
                                ? "show"
                                : ""
                            }
                        "
                        data-bs-parent="#faq-container"
                    >

                        <div class="accordion-body">

                            ${esc(answer)}

                        </div>

                    </div>

                `;


                container.appendChild(
                    div
                );

            }
        );

    }



    // =====================================================
    // TRANSPARANSI / DOCUMENTS
    // =====================================================

    async function loadDocuments() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const container =
            document.getElementById(
                "documents-container"
            );


        if (!container) {
            return;
        }


        const {
            data,
            error
        } = await sb
            .from("documents")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Gagal mengambil documents:",
                error
            );

            return;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    Belum ada dokumen transparansi.

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(function (item) {


            const title =
                firstValue(
                    item,
                    [
                        "title",
                        "name",
                        "judul",
                        "nama"
                    ],
                    "Dokumen Desa"
                );


            const description =
                firstValue(
                    item,
                    [
                        "description",
                        "deskripsi"
                    ],
                    ""
                );


            const url =
                firstValue(
                    item,
                    [
                        "file_url",
                        "url",
                        "document_url"
                    ],
                    ""
                );


            const col =
                document.createElement(
                    "div"
                );


            col.className =
                "col-md-6 col-lg-4";


            col.innerHTML = `

                <div
                    class="
                        card-desa
                        p-4
                        h-100
                    "
                >

                    <i
                        class="
                            bi
                            bi-file-earmark-pdf
                            fs-1
                            text-danger
                            mb-3
                        "
                    ></i>


                    <h3 class="h5 fw-bold">
                        ${esc(title)}
                    </h3>


                    <p class="text-muted">
                        ${esc(description)}
                    </p>


                    ${
                        url

                        ?

                        `
                        <a
                            href="${esc(url)}"
                            target="_blank"
                            rel="noopener"
                            class="
                                btn
                                btn-brand-outline
                            "
                        >

                            <i
                                class="
                                    bi
                                    bi-download
                                "
                            ></i>

                            Lihat Dokumen

                        </a>
                        `

                        :

                        ""
                    }

                </div>

            `;


            container.appendChild(
                col
            );

        });

    }



    // =====================================================
    // STATISTIK DATA DESA
    // =====================================================

    async function loadDataDesa() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        /*
         * Fungsi ini membaca elemen statistik
         * jika tersedia di halaman.
         *
         * Karena struktur tabel data desa Anda
         * belum ditampilkan di percakapan ini,
         * kita tidak melakukan query tabel yang
         * belum pasti namanya.
         */


        const elements =
            document.querySelectorAll(
                "[data-cms-stat]"
            );


        if (!elements.length) {
            return;
        }


        console.log(
            "ℹ️ Elemen statistik ditemukan:",
            elements.length
        );

    }



    // =====================================================
    // SAMBUTAN KEPALA DESA
    // =====================================================

    async function loadSambutan() {

        const sb = getClient();

        if (!sb) {
            return;
        }


        const elements =
            document.querySelectorAll(
                "[data-sambutan]"
            );


        if (!elements.length) {
            return;
        }


        /*
         * Sambutan dapat disimpan pada page_content
         * dengan slug 'sambutan' apabila tersedia.
         */


        const {
            data,
            error
        } = await sb
            .from("page_content")
            .select("*")
            .eq("slug", "sambutan")
            .maybeSingle();


        if (error) {

            console.warn(
                "Sambutan belum tersedia:",
                error
            );

            return;
        }


        if (!data) {
            return;
        }


        elements.forEach(
            function (element) {

                element.innerHTML =
                    formatContent(
                        data.content || ""
                    );

            }
        );

    }



    // =====================================================
    // JALANKAN SEMUA CMS
    // =====================================================

    async function boot() {

        console.log(
            "🚀 CMS WEBSITE DIMULAI..."
        );


        try {

            // PAGE CONTENT

            const page =
                await loadCurrentPage();


            if (page) {

                renderPage(page);

            }



            // SITE SETTINGS

            const site =
                await loadSiteSettings();


            if (site) {

                renderSiteSettings(site);

            }



            // GALERI

            await loadGallery();



            // LAYANAN

            await loadLayanan();



            // POTENSI

            await loadPotensi();



            // WISATA

            await loadWisata();



            // BERITA

            await loadNews();



            // AGENDA

            await loadAgenda();



            // FAQ

            await loadFAQ();



            // TRANSPARANSI

            await loadDocuments();



            // DATA DESA

            await loadDataDesa();



            // SAMBUTAN

            await loadSambutan();



            console.log(
                "======================================"
            );

            console.log(
                "✅ CMS WEBSITE SELESAI"
            );

            console.log(
                "======================================"
            );


        } catch (error) {

            console.error(
                "❌ ERROR CMS:",
                error
            );

        }

    }



    // =====================================================
    // PUBLIC API
    // =====================================================

    window.SupabaseCMS = {

        boot: boot,

        getClient: getClient,

        loadCurrentPage:
            loadCurrentPage,

        loadSiteSettings:
            loadSiteSettings,

        loadGallery:
            loadGallery,

        loadLayanan:
            loadLayanan,

        loadPotensi:
            loadPotensi,

        loadWisata:
            loadWisata,

        loadNews:
            loadNews,

        loadAgenda:
            loadAgenda,

        loadFAQ:
            loadFAQ,

        loadDocuments:
            loadDocuments

    };



    // =====================================================
    // START
    // =====================================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot
        );

    } else {

        boot();

    }


})();