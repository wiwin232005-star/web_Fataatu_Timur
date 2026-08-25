(function () {
    'use strict';

    console.log("======================================");
    console.log("SUPABASE CMS DESA FATAATU TIMUR");
    console.log("======================================");

    let client = null;

    // ==========================================
    // CEK SUPABASE
    // ==========================================

    function getClient() {

        if (client) {
            return client;
        }

        if (
            !window.SUPABASE_CONFIG ||
            !window.SUPABASE_CONFIG.url ||
            !window.SUPABASE_CONFIG.key
        ) {
            console.error("SUPABASE CONFIG TIDAK DITEMUKAN");
            return null;
        }

        if (!window.supabase) {
            console.error("LIBRARY SUPABASE BELUM DIMUAT");
            return null;
        }

        client = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.key
        );

        console.log("Supabase Client berhasil dibuat");

        return client;
    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

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


    // ==========================================
    // FORMAT CONTENT
    // ==========================================

    function formatContent(value) {

        if (!value) {
            return "";
        }

        return esc(value)
            .replace(/\r\n/g, "\n")
            .replace(/\n\n+/g, "</p><p>")
            .replace(/\n/g, "<br>");
    }


    // ==========================================
    // AMBIL HALAMAN BERDASARKAN SLUG
    // ==========================================

    async function loadCurrentPage() {

        const sb = getClient();

        if (!sb) {
            return null;
        }

        const slug = document.body.dataset.page;

        console.log("PAGE SAAT INI:", slug);

        if (!slug) {

            console.error(
                "data-page tidak ditemukan pada <body>"
            );

            return null;
        }

        console.log(
            "Mengambil data dari page_content untuk:",
            slug
        );


        const {
            data,
            error
        } = await sb
            .from("page_content")
            .select("slug,title,subtitle,content,updated_at")
            .eq("slug", slug)
            .maybeSingle();


        if (error) {

            console.error(
                "GAGAL MEMBACA page_content:",
                error
            );

            return null;
        }


        if (!data) {

            console.warn(
                "DATA TIDAK DITEMUKAN UNTUK SLUG:",
                slug
            );

            return null;
        }


        console.log(
            "DATA DARI ADMIN BERHASIL DIAMBIL:",
            data
        );

        return data;
    }


    // ==========================================
    // TAMPILKAN DATA KE WEBSITE
    // ==========================================

    function renderPage(page) {

        if (!page) {
            return;
        }


        const title =
            document.querySelector(
                "[data-page-title]"
            );


        const subtitle =
            document.querySelector(
                "[data-page-subtitle]"
            );


        const content =
            document.querySelector(
                "[data-page-content]"
            );


        // ===============================
        // JUDUL
        // ===============================

        if (title) {

            title.textContent =
                page.title || "";

        }


        // ===============================
        // SUBJUDUL
        // ===============================

        if (subtitle) {

            subtitle.textContent =
                page.subtitle || "";

        }


        // ===============================
        // ISI KONTEN
        // ===============================

        if (content) {

            if (page.content) {

                content.innerHTML =
                    "<p>" +
                    formatContent(page.content) +
                    "</p>";

            } else {

                content.innerHTML =
                    "<p>Belum ada informasi.</p>";

            }

        }


        console.log(
            "DATA BERHASIL DITAMPILKAN DI WEBSITE"
        );
    }


    // ==========================================
    // SITE SETTINGS
    // ==========================================

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

            console.warn(
                "site_settings tidak tersedia:",
                error
            );

            return null;
        }


        return data;
    }


    // ==========================================
    // TAMPILKAN SITE SETTINGS
    // ==========================================

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

                if (site.name) {
                    element.textContent =
                        site.name;
                }

            });


        // LOKASI
        document
            .querySelectorAll(
                "[data-cms-location]"
            )
            .forEach(function (element) {

                if (site.location) {
                    element.textContent =
                        site.location;
                }

            });


        // ALAMAT
        document
            .querySelectorAll(
                '[data-contact="address"]'
            )
            .forEach(function (element) {

                if (site.address) {
                    element.textContent =
                        site.address;
                }

            });


        // TELEPON
        document
            .querySelectorAll(
                '[data-contact="phone"]'
            )
            .forEach(function (element) {

                if (site.phone) {
                    element.textContent =
                        site.phone;
                }

            });


        // EMAIL
        document
            .querySelectorAll(
                '[data-contact="email"]'
            )
            .forEach(function (element) {

                if (site.email) {
                    element.textContent =
                        site.email;
                }

            });


        // JAM KERJA
        document
            .querySelectorAll(
                '[data-contact="hours"]'
            )
            .forEach(function (element) {

                if (site.hours) {
                    element.textContent =
                        site.hours;
                }

            });


        // KODE POS
        document
            .querySelectorAll(
                '[data-contact="postal"]'
            )
            .forEach(function (element) {

                if (site.postal) {
                    element.textContent =
                        site.postal;
                }

            });

    }


    // ==========================================
    // JALANKAN CMS
    // ==========================================

    async function boot() {

        console.log("CMS DIMULAI...");


        const page =
            await loadCurrentPage();


        if (page) {

            renderPage(page);

        } else {

            console.warn(
                "Tidak ada data halaman yang dapat ditampilkan."
            );

        }


        // SITE SETTINGS

        const site =
            await loadSiteSettings();


        if (site) {

            renderSiteSettings(site);

        }


        console.log("CMS SELESAI");
    }


    // ==========================================
    // PUBLIC API
    // ==========================================

    window.SupabaseCMS = {

        boot: boot,

        getClient: getClient,

        loadCurrentPage: loadCurrentPage

    };


    // ==========================================
    // JALANKAN SAAT HALAMAN SIAP
    // ==========================================

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