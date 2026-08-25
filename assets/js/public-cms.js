(function () {

    'use strict';

    console.log('================================');
    console.log('PUBLIC CMS DESA FATAATU TIMUR');
    console.log('================================');


    const cfg =
        window.SUPABASE_CONFIG || {};


    let client = null;


    /* =====================================================
       SUPABASE
    ===================================================== */

    function getClient() {

        if (!window.supabase) {

            throw new Error(
                'Library Supabase belum dimuat.'
            );

        }


        if (
            !cfg.url ||
            !cfg.key
        ) {

            throw new Error(
                'Supabase config belum tersedia.'
            );

        }


        if (!client) {

            client =
                window.supabase.createClient(
                    cfg.url,
                    cfg.key
                );

        }


        return client;

    }


    /* =====================================================
       ESCAPE
    ===================================================== */

    function esc(value) {

        return String(value ?? '')
            .replace(
                /[&<>"']/g,
                function (m) {

                    return {

                        '&':
                            '&amp;',

                        '<':
                            '&lt;',

                        '>':
                            '&gt;',

                        '"':
                            '&quot;',

                        "'":
                            '&#039;'

                    }[m];

                }
            );

    }


    /* =====================================================
       BERITA
    ===================================================== */

    async function loadNews() {

        const container =
            document.querySelector(
                '#news-container'
            );


        if (!container) return;


        try {

            const sb =
                getClient();


            const {
                data,
                error
            } =
                await sb
                    .from('news')
                    .select('*')
                    .order(
                        'date',
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                throw error;

            }


            if (
                !data ||
                !data.length
            ) {

                container.innerHTML = `

                    <div class="empty-box">

                        Belum ada berita.

                    </div>

                `;

                return;

            }


            container.innerHTML =
                data.map(function (item) {

                    return `

                        <article
                            class="cms-card"
                        >

                            <div
                                class="cms-card-body"
                            >

                                ${
                                    item.date
                                        ?

                                        `
                                        <small>
                                            ${esc(item.date)}
                                        </small>
                                        `

                                        :

                                        ''
                                }


                                <h3>

                                    ${esc(item.title)}

                                </h3>


                                ${
                                    item.cat
                                        ?

                                        `
                                        <span
                                            class="cms-category"
                                        >
                                            ${esc(item.cat)}
                                        </span>
                                        `

                                        :

                                        ''
                                }


                                <p>

                                    ${esc(
                                        item.summary ||
                                        item.body ||
                                        ''
                                    )}

                                </p>


                                ${
                                    item.body
                                        ?

                                        `
                                        <details>

                                            <summary>
                                                Baca selengkapnya
                                            </summary>

                                            <p>
                                                ${esc(item.body)}
                                            </p>

                                        </details>
                                        `

                                        :

                                        ''
                                }

                            </div>

                        </article>

                    `;

                }).join('');


        } catch (error) {

            console.error(
                'NEWS ERROR:',
                error
            );


            container.innerHTML = `

                <div class="cms-error">

                    Gagal memuat berita.

                </div>

            `;

        }

    }


    /* =====================================================
       AGENDA
    ===================================================== */

    async function loadAgenda() {

        const container =
            document.querySelector(
                '#agenda-container'
            );


        if (!container) return;


        try {

            const sb =
                getClient();


            const {
                data,
                error
            } =
                await sb
                    .from('agenda')
                    .select('*')
                    .order(
                        'date',
                        {
                            ascending:
                                true
                        }
                    );


            if (error) {

                throw error;

            }


            if (
                !data ||
                !data.length
            ) {

                container.innerHTML = `

                    <div class="empty-box">

                        Belum ada agenda.

                    </div>

                `;

                return;

            }


            container.innerHTML =
                data.map(function (item) {

                    return `

                        <article
                            class="cms-card"
                        >

                            <div
                                class="cms-card-body"
                            >

                                <h3>

                                    ${esc(item.title)}

                                </h3>


                                <p>

                                    <strong>
                                        Tanggal:
                                    </strong>

                                    ${esc(item.date || '-')}

                                </p>


                                <p>

                                    <strong>
                                        Waktu:
                                    </strong>

                                    ${esc(item.time || '-')}

                                </p>


                                <p>

                                    <strong>
                                        Lokasi:
                                    </strong>

                                    ${esc(item.place || '-')}

                                </p>


                                <p>

                                    ${esc(
                                        item.description ||
                                        ''
                                    )}

                                </p>

                            </div>

                        </article>

                    `;

                }).join('');


        } catch (error) {

            console.error(
                'AGENDA ERROR:',
                error
            );


            container.innerHTML = `

                <div class="cms-error">

                    Gagal memuat agenda.

                </div>

            `;

        }

    }


    /* =====================================================
       GALERI
    ===================================================== */

    async function loadGallery() {

        const container =
            document.querySelector(
                '#gallery-container'
            );


        if (!container) return;


        try {

            const sb =
                getClient();


            const {
                data,
                error
            } =
                await sb
                    .from('gallery')
                    .select('*')
                    .order(
                        'created_at',
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                throw error;

            }


            if (
                !data ||
                !data.length
            ) {

                container.innerHTML = `

                    <div class="empty-box">

                        Belum ada foto galeri.

                    </div>

                `;

                return;

            }


            container.innerHTML =
                data.map(function (item) {

                    return `

                        <article
                            class="cms-gallery-card"
                        >

                            <img
                                src="${esc(item.image_url)}"
                                alt="${esc(item.title)}"
                                loading="lazy"
                            >


                            <div>

                                <h3>

                                    ${esc(item.title)}

                                </h3>


                                <p>

                                    ${esc(
                                        item.description ||
                                        ''
                                    )}

                                </p>

                            </div>

                        </article>

                    `;

                }).join('');


        } catch (error) {

            console.error(
                'GALLERY ERROR:',
                error
            );


            container.innerHTML = `

                <div class="cms-error">

                    Gagal memuat galeri.

                </div>

            `;

        }

    }


    /* =====================================================
       LAYANAN
    ===================================================== */

    async function loadServices() {

        const container =
            document.querySelector(
                '#services-container'
            );


        if (!container) return;


        try {

            const sb =
                getClient();


            const {
                data,
                error
            } =
                await sb
                    .from('services')
                    .select('*')
                    .order(
                        'created_at',
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                throw error;

            }


            if (
                !data ||
                !data.length
            ) {

                container.innerHTML = `

                    <div class="empty-box">

                        Belum ada layanan.

                    </div>

                `;

                return;

            }


            container.innerHTML =
                data.map(function (item) {

                    return `

                        <article
                            class="cms-card"
                        >

                            <div
                                class="cms-card-body"
                            >

                                <h3>

                                    ${esc(item.name)}

                                </h3>


                                <p>

                                    ${esc(
                                        item.description ||
                                        ''
                                    )}

                                </p>

                            </div>

                        </article>

                    `;

                }).join('');


        } catch (error) {

            console.error(
                'SERVICES ERROR:',
                error
            );


            container.innerHTML = `

                <div class="cms-error">

                    Gagal memuat layanan.

                </div>

            `;

        }

    }


    /* =====================================================
       FAQ
    ===================================================== */

    async function loadFAQs() {

        const container =
            document.querySelector(
                '#faq-container'
            );


        if (!container) return;


        try {

            const sb =
                getClient();


            const {
                data,
                error
            } =
                await sb
                    .from('faqs')
                    .select('*')
                    .order(
                        'created_at',
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                throw error;

            }


            if (
                !data ||
                !data.length
            ) {

                container.innerHTML = `

                    <div class="empty-box">

                        Belum ada FAQ.

                    </div>

                `;

                return;

            }


            container.innerHTML =
                data.map(function (item) {

                    return `

                        <details
                            class="faq-item"
                        >

                            <summary>

                                ${esc(item.q)}

                            </summary>


                            <div>

                                ${esc(item.a)}

                            </div>

                        </details>

                    `;

                }).join('');


        } catch (error) {

            console.error(
                'FAQ ERROR:',
                error
            );


            container.innerHTML = `

                <div class="cms-error">

                    Gagal memuat FAQ.

                </div>

            `;

        }

    }


    /* =====================================================
       TRANSPARANSI / DOKUMEN
    ===================================================== */

    async function loadDocuments() {

        const container =
            document.querySelector(
                '#documents-container'
            );


        if (!container) return;


        try {

            const sb =
                getClient();


            const {
                data,
                error
            } =
                await sb
                    .from('documents')
                    .select('*')
                    .order(
                        'year',
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                throw error;

            }


            if (
                !data ||
                !data.length
            ) {

                container.innerHTML = `

                    <div class="empty-box">

                        Belum ada dokumen transparansi.

                    </div>

                `;

                return;

            }


            container.innerHTML =
                data.map(function (item) {

                    return `

                        <article
                            class="cms-document"
                        >

                            <div>

                                <h3>

                                    ${esc(item.title)}

                                </h3>


                                <p>

                                    ${esc(
                                        item.description ||
                                        ''
                                    )}

                                </p>


                                <small>

                                    Kategori:
                                    ${esc(
                                        item.category ||
                                        'Transparansi'
                                    )}

                                    ${
                                        item.year
                                            ? ' · ' +
                                              esc(item.year)
                                            : ''
                                    }

                                </small>

                            </div>


                            ${
                                item.file_url

                                    ?

                                    `
                                    <a
                                        href="${esc(item.file_url)}"
                                        target="_blank"
                                        rel="noopener"
                                        class="btn btn-success"
                                    >

                                        Lihat Dokumen

                                    </a>
                                    `

                                    :

                                    ''
                            }

                        </article>

                    `;

                }).join('');


        } catch (error) {

            console.error(
                'DOCUMENT ERROR:',
                error
            );


            container.innerHTML = `

                <div class="cms-error">

                    Gagal memuat dokumen.

                </div>

            `;

        }

    }


    /* =====================================================
       PESAN KONTAK
    ===================================================== */

    async function submitMessage(event) {

        event.preventDefault();


        const form =
            event.target;


        const name =
            form.querySelector(
                '[name="name"]'
            )?.value.trim();


        const email =
            form.querySelector(
                '[name="email"]'
            )?.value.trim();


        const subject =
            form.querySelector(
                '[name="subject"]'
            )?.value.trim();


        const message =
            form.querySelector(
                '[name="message"]'
            )?.value.trim();


        if (
            !name ||
            !email ||
            !message
        ) {

            alert(
                'Nama, email dan pesan wajib diisi.'
            );

            return;

        }


        try {

            const sb =
                getClient();


            const {
                error
            } =
                await sb
                    .from('messages')
                    .insert({

                        name:
                            name,

                        email:
                            email,

                        subject:
                            subject || '',

                        message:
                            message,

                        status:
                            'baru'

                    });


            if (error) {

                throw error;

            }


            alert(
                'Pesan berhasil dikirim ke Pemerintah Desa Fataatu Timur.'
            );


            form.reset();


        } catch (error) {

            console.error(
                'MESSAGE ERROR:',
                error
            );


            alert(
                'Pesan gagal dikirim: ' +
                error.message
            );

        }

    }


    /* =====================================================
       JALANKAN
    ===================================================== */

    document.addEventListener(
        'DOMContentLoaded',
        function () {

            loadNews();

            loadAgenda();

            loadGallery();

            loadServices();

            loadFAQs();

            loadDocuments();


            const contactForm =
                document.querySelector(
                    '#contactForm'
                );


            if (contactForm) {

                contactForm.addEventListener(
                    'submit',
                    submitMessage
                );

            }

        }
    );


})();