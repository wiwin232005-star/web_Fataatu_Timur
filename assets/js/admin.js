(function () {

    'use strict';


    // ============================================================
    // SUPABASE CONFIG
    // ============================================================

    const cfg =
        window.SUPABASE_CONFIG || {};


    const ready = () => {

        return (

            window.supabase &&

            cfg.url &&

            !String(cfg.url).includes('MASUKKAN-') &&

            cfg.key &&

            !String(cfg.key).includes('MASUKKAN-')

        );

    };


    // ============================================================
    // GLOBAL
    // ============================================================

    let sb = null;

    let cache = {

        site_settings: [],

        page_content: [],

        news: [],

        agenda: [],

        gallery: [],

        potentials: [],

        wisata: [],

        services: [],

        faqs: [],

        documents: [],

        messages: [],

        admin_users: []

    };


    let current = {

        type: null,

        id: null

    };


    // ============================================================
    // SHORTCUT
    // ============================================================

    const $ =
        selector =>
            document.querySelector(selector);


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    const esc =
        value =>

            String(value ?? '')

                .replace(
                    /[&<>"']/g,

                    m => ({

                        '&': '&amp;',

                        '<': '&lt;',

                        '>': '&gt;',

                        '"': '&quot;',

                        "'": '&#039;'

                    }[m])

                );


    // ============================================================
    // TOAST
    // ============================================================

    function toast(
        msg,
        type = 'success'
    ) {

        const color =
            type === 'success'
                ? 'alert-success'
                : 'alert-danger';


        $('#toast').innerHTML = `

            <div class="alert ${color} shadow-sm">

                ${esc(msg)}

            </div>

        `;


        setTimeout(
            () => {

                $('#toast').innerHTML = '';

            },
            3500
        );

    }


    // ============================================================
    // CLIENT
    // ============================================================

    async function client() {

        if (!ready()) {

            throw new Error(
                'Supabase belum dikonfigurasi.'
            );

        }


        if (!sb) {

            sb =
                window.supabase.createClient(
                    cfg.url,
                    cfg.key
                );

        }


        return sb;

    }


    // ============================================================
    // CURRENT USER
    // ============================================================

    async function user() {

        const {
            data,
            error
        } =
            await (
                await client()
            )
                .auth
                .getUser();


        if (error) {

            throw error;

        }


        return data.user;

    }


    // ============================================================
    // CEK ADMIN
    // ============================================================

    async function ensureAdmin() {

        const u =
            await user();


        if (!u) {

            return false;

        }


        const result =
            await sb

                .from('admin_users')

                .select(
                    'user_id,role,name,email'
                )

                .eq(
                    'user_id',
                    u.id
                )

                .maybeSingle();


        if (result.error) {

            throw result.error;

        }


        if (!result.data) {

            await sb.auth.signOut();

            showLogin();

            alert(
                'Akun ini belum terdaftar sebagai Admin.'
            );

            return false;

        }


        showApp(u);

        return true;

    }


    // ============================================================
    // SHOW LOGIN
    // ============================================================

    function showLogin() {

        $('#login')
            .classList
            .remove('hidden');


        $('#app')
            .classList
            .add('hidden');


        $('#status').className =
            'badge text-bg-secondary';


        $('#status').textContent =
            'Belum login';

    }


    // ============================================================
    // SHOW APP
    // ============================================================

    function showApp(u) {

        $('#login')
            .classList
            .add('hidden');


        $('#app')
            .classList
            .remove('hidden');


        $('#status').className =
            'badge text-bg-success';


        $('#status').textContent =
            'Admin: ' +
            (u.email || '');

    }


    // ============================================================
    // TABLE
    // ============================================================

    async function table(
        name,
        order = 'created_at'
    ) {

        let query =
            sb
                .from(name)
                .select('*');


        if (order) {

            query =
                query.order(
                    order,
                    {
                        ascending: false
                    }
                );

        }


        const result =
            await query;


        if (result.error) {

            throw result.error;

        }


        return result.data || [];

    }


    // ============================================================
    // LOAD SEMUA DATA
    // ============================================================

    async function loadAll() {

        if (!ready()) {

            $('#configWarn')
                .classList
                .remove('hidden');

            return;

        }


        $('#configWarn')
            .classList
            .add('hidden');


        await client();


        if (
            !(await ensureAdmin())
        ) {

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

                wisata,

                services,

                faqs,

                documents,

                messages,

                admins

            ] =

                await Promise.all([

                    table(
                        'site_settings',
                        null
                    ),

                    table(
                        'page_content',
                        'updated_at'
                    ),

                    table(
                        'news'
                    ),

                    table(
                        'agenda'
                    ),

                    table(
                        'gallery'
                    ),

                    table(
                        'potentials'
                    ),

                    table(
                        'wisata'
                    ),

                    table(
                        'services'
                    ),

                    table(
                        'faqs'
                    ),

                    table(
                        'documents'
                    ),

                    table(
                        'messages'
                    ),

                    table(
                        'admin_users'
                    )

                ]);


            cache = {

                site_settings:
                    site,

                page_content:
                    pages,

                news:
                    news,

                agenda:
                    agenda,

                gallery:
                    gallery,

                potentials:
                    potentials,

                wisata:
                    wisata,

                services:
                    services,

                faqs:
                    faqs,

                documents:
                    documents,

                messages:
                    messages,

                admin_users:
                    admins

            };


            render();


        } catch (error) {

            console.error(error);

            toast(
                error.message ||
                'Gagal memuat data.',
                'error'
            );

        }

    }


    // ============================================================
    // RENDER
    // ============================================================

    function render() {

        const site =
            cache.site_settings?.[0] ||
            {};


        $('#mPop').textContent =
            Number(
                site.population || 0
            )
                .toLocaleString('id-ID');


        $('#mNews').textContent =
            cache.news.length;


        $('#mAgenda').textContent =
            cache.agenda.length;


        $('#mGallery').textContent =
            cache.gallery.length;


        $('#mPot').textContent =
            cache.potentials.length;


        $('#mWisata').textContent =
            cache.wisata.length;


        $('#mDocs').textContent =
            cache.documents.length;


        $('#mMsg').textContent =
            cache.messages
                .filter(
                    x =>
                        x.status === 'baru'
                )
                .length;


        renderPages();


        renderTable(
            'news',
            'newsList',
            [
                'title',
                'cat',
                'date',
                'summary'
            ]
        );


        renderTable(
            'agenda',
            'agendaList',
            [
                'title',
                'date',
                'time',
                'place'
            ]
        );


        renderPotentials();


        renderWisata();


        renderTable(
            'faqs',
            'faqListAdmin',
            [
                'q',
                'a'
            ]
        );


        renderTable(
            'services',
            'serviceList',
            [
                'name',
                'description'
            ]
        );


        renderDocs();


        renderGallery();


        renderMessages();


        renderAdmins();


        fillSettings(site);

    }


    // ============================================================
    // PAGE CONTENT
    // ============================================================

    function renderPages() {

        const slugs = [

            'profil',

            'sejarah',

            'visi-misi',

            'struktur',

            'sambutan'

        ];


        const names = {

            profil:
                'Profil Desa',

            sejarah:
                'Sejarah',

            'visi-misi':
                'Visi & Misi',

            struktur:
                'Pemerintahan / Struktur',

            sambutan:
                'Sambutan Kepala Desa'

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


        $('#pageForms').innerHTML =

            slugs
                .map(
                    slug => {

                        const page =
                            map[slug] ||
                            {

                                title:
                                    names[slug],

                                subtitle:
                                    '',

                                content:
                                    ''

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
                                        value="${esc(page.title)}"
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
                                        value="${esc(page.subtitle)}"
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
                                    >${esc(page.content)}</textarea>

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

                    }
                )
                .join('');

    }


    // ============================================================
    // GENERIC TABLE
    // ============================================================

    function renderTable(
        tableName,
        elementId,
        columns
    ) {

        const rows =
            cache[tableName] ||
            [];


        const element =
            $('#' + elementId);


        if (!element) {

            return;

        }


        element.innerHTML = `

            <table
                class="table table-hover align-middle"
            >

                <thead>

                    <tr>

                        ${

                            columns

                                .map(
                                    column =>
                                        `<th>${esc(column)}</th>`
                                )

                                .join('')

                        }

                        <th class="text-end">
                            Aksi
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${

                        rows

                            .map(
                                row => `

                                <tr>

                                    ${

                                        columns

                                            .map(
                                                column => `

                                                <td>

                                                    <div
                                                        class="${
                                                            [
                                                                'body',
                                                                'description',
                                                                'summary',
                                                                'a'
                                                            ].includes(
                                                                column
                                                            )
                                                                ? 'truncate'
                                                                : ''
                                                        }"
                                                    >

                                                        ${esc(
                                                            row[column] ??
                                                            ''
                                                        )}

                                                    </div>

                                                </td>

                                                `
                                            )

                                            .join('')

                                    }


                                    <td
                                        class="text-end text-nowrap"
                                    >

                                        <button
                                            class="btn btn-sm btn-outline-secondary"
                                            onclick="openEditor(
                                                '${tableName}',
                                                '${row.id}'
                                            )"
                                        >

                                            Edit

                                        </button>


                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            onclick="delRow(
                                                '${tableName}',
                                                '${row.id}'
                                            )"
                                        >

                                            Hapus

                                        </button>

                                    </td>


                                </tr>

                                `
                            )

                            .join('')

                        ||

                        `

                        <tr>

                            <td
                                colspan="${columns.length + 1}"
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


    // ============================================================
    // RENDER POTENSI
    // ============================================================

    function renderPotentials() {

        const rows =
            cache.potentials || [];


        $('#potList').innerHTML =

            rows.length

                ?

                `

                ${

                    rows

                        .map(
                            row => `

                            <div
                                class="col-md-6 col-lg-4"
                            >

                                <div
                                    class="potensi-card"
                                >


                                    ${
                                        row.image_url

                                            ?

                                            `

                                            <img
                                                src="${esc(row.image_url)}"
                                                alt="${esc(row.name)}"
                                            >

                                            `

                                            :

                                            `

                                            <div
                                                class="d-flex align-items-center justify-content-center bg-light"
                                                style="height:210px"
                                            >

                                                <span class="text-muted">

                                                    Belum ada foto

                                                </span>

                                            </div>

                                            `
                                    }


                                    <div
                                        class="potensi-body"
                                    >


                                        <div
                                            class="potensi-title mb-1"
                                        >

                                            ${esc(
                                                row.name
                                            )}

                                        </div>


                                        <span
                                            class="badge text-bg-light mb-2"
                                        >

                                            ${esc(
                                                row.cat ||
                                                'Potensi Desa'
                                            )}

                                        </span>


                                        <div
                                            class="potensi-description mb-3"
                                        >

                                            ${esc(
                                                row.description ||
                                                ''
                                            )}

                                        </div>


                                        <div
                                            class="d-flex gap-2"
                                        >


                                            <button
                                                class="btn btn-sm btn-outline-secondary"
                                                onclick="openEditor(
                                                    'potentials',
                                                    '${row.id}'
                                                )"
                                            >

                                                <i class="bi bi-pencil me-1"></i>

                                                Edit

                                            </button>


                                            <button
                                                class="btn btn-sm btn-outline-danger"
                                                onclick="delRow(
                                                    'potentials',
                                                    '${row.id}'
                                                )"
                                            >

                                                <i class="bi bi-trash me-1"></i>

                                                Hapus

                                            </button>


                                        </div>


                                    </div>


                                </div>

                            </div>

                            `
                        )

                        .join('')

                }

                `

                :

                `

                <div class="col-12">

                    <div class="empty-box">

                        Belum ada data potensi.

                        <br>

                        Klik
                        <b>Tambah Potensi</b>
                        untuk menambahkan data.

                    </div>

                </div>

                `;

    }


    // ============================================================
    // RENDER WISATA
    // ============================================================

    function renderWisata() {

        const rows =
            cache.wisata || [];


        $('#wisataList').innerHTML =

            rows.length

                ?

                `

                ${

                    rows

                        .map(
                            row => `

                            <div
                                class="col-md-6 col-lg-4"
                            >

                                <div
                                    class="potensi-card"
                                >


                                    ${
                                        row.image_url

                                            ?

                                            `

                                            <img
                                                src="${esc(row.image_url)}"
                                                alt="${esc(row.name)}"
                                            >

                                            `

                                            :

                                            `

                                            <div
                                                class="d-flex align-items-center justify-content-center bg-light"
                                                style="height:210px"
                                            >

                                                <span class="text-muted">

                                                    Belum ada foto

                                                </span>

                                            </div>

                                            `
                                    }


                                    <div
                                        class="potensi-body"
                                    >


                                        <div
                                            class="potensi-title mb-2"
                                        >

                                            ${esc(
                                                row.name
                                            )}

                                        </div>


                                        <div
                                            class="potensi-description mb-3"
                                        >

                                            ${esc(
                                                row.description ||
                                                ''
                                            )}

                                        </div>


                                        <div
                                            class="d-flex gap-2"
                                        >


                                            <button
                                                class="btn btn-sm btn-outline-secondary"
                                                onclick="openEditor(
                                                    'wisata',
                                                    '${row.id}'
                                                )"
                                            >

                                                <i class="bi bi-pencil me-1"></i>

                                                Edit

                                            </button>


                                            <button
                                                class="btn btn-sm btn-outline-danger"
                                                onclick="delRow(
                                                    'wisata',
                                                    '${row.id}'
                                                )"
                                            >

                                                <i class="bi bi-trash me-1"></i>

                                                Hapus

                                            </button>


                                        </div>


                                    </div>


                                </div>

                            </div>

                            `
                        )

                        .join('')

                }

                `

                :

                `

                <div class="col-12">

                    <div class="empty-box">

                        Belum ada data wisata.

                        <br>

                        Klik
                        <b>Tambah Wisata</b>
                        untuk menambahkan data.

                    </div>

                </div>

                `;

    }


    // ============================================================
    // GALLERY
    // ============================================================

    function renderGallery() {

        $('#galleryList').innerHTML =

            cache.gallery

                .map(
                    row => `

                    <div
                        class="col-6 col-md-4 col-lg-3"
                    >

                        <div
                            class="cardx p-2 h-100"
                        >


                            <img
                                src="${esc(row.image_url)}"
                                class="img-preview"
                                alt="${esc(row.title)}"
                            >


                            <b
                                class="small d-block p-2"
                            >

                                ${esc(row.title)}

                            </b>


                            <div
                                class="px-2 pb-2 small text-muted truncate"
                            >

                                ${esc(
                                    row.description
                                )}

                            </div>


                            <div class="p-2">


                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    onclick="openEditor(
                                        'gallery',
                                        '${row.id}'
                                    )"
                                >

                                    Edit

                                </button>


                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    onclick="delRow(
                                        'gallery',
                                        '${row.id}'
                                    )"
                                >

                                    Hapus

                                </button>


                            </div>


                        </div>

                    </div>

                    `
                )

                .join('')

            ||

            `

            <div class="col-12 text-muted">

                Belum ada foto.

            </div>

            `;

    }


    // ============================================================
    // DOCUMENTS
    // ============================================================

    function renderDocs() {

        $('#docList').innerHTML = `

            <table
                class="table table-hover align-middle"
            >

                <thead>

                    <tr>

                        <th>Dokumen</th>

                        <th>Kategori</th>

                        <th>Tahun</th>

                        <th>File</th>

                        <th class="text-end">
                            Aksi
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${

                        cache.documents

                            .map(
                                row => `

                                <tr>

                                    <td>

                                        <b>
                                            ${esc(row.title)}
                                        </b>

                                        <br>

                                        <small
                                            class="text-muted"
                                        >

                                            ${esc(
                                                row.description
                                            )}

                                        </small>

                                    </td>


                                    <td>
                                        ${esc(row.category)}
                                    </td>


                                    <td>
                                        ${esc(row.year || '')}
                                    </td>


                                    <td>

                                        <a
                                            href="${esc(row.file_url)}"
                                            target="_blank"
                                            rel="noopener"
                                        >

                                            Buka

                                        </a>

                                    </td>


                                    <td
                                        class="text-end text-nowrap"
                                    >

                                        <button
                                            class="btn btn-sm btn-outline-secondary"
                                            onclick="openEditor(
                                                'documents',
                                                '${row.id}'
                                            )"
                                        >
                                            Edit
                                        </button>


                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            onclick="delRow(
                                                'documents',
                                                '${row.id}'
                                            )"
                                        >
                                            Hapus
                                        </button>

                                    </td>

                                </tr>

                                `
                            )

                            .join('')

                        ||

                        `

                        <tr>

                            <td
                                colspan="5"
                                class="text-muted"
                            >

                                Belum ada dokumen.

                            </td>

                        </tr>

                        `

                    }

                </tbody>

            </table>

        `;

    }


    // ============================================================
    // MESSAGES
    // ============================================================

    function renderMessages() {

        $('#messageList').innerHTML = `

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

                        cache.messages

                            .map(
                                row => `

                                <tr>

                                    <td>

                                        <b>
                                            ${esc(row.name)}
                                        </b>

                                        <br>

                                        <small>
                                            ${esc(row.email)}
                                        </small>

                                    </td>


                                    <td>
                                        ${esc(row.subject)}
                                    </td>


                                    <td>

                                        <div class="truncate">

                                            ${esc(row.message)}

                                        </div>

                                    </td>


                                    <td>

                                        <span
                                            class="badge ${
                                                row.status === 'baru'

                                                    ? 'text-bg-danger'

                                                    :

                                                row.status === 'dibaca'

                                                    ? 'text-bg-warning'

                                                    :

                                                    'text-bg-success'
                                            }"
                                        >

                                            ${esc(row.status)}

                                        </span>

                                    </td>


                                    <td
                                        class="text-end text-nowrap"
                                    >

                                        <select
                                            class="form-select form-select-sm d-inline-block"
                                            style="width:auto"
                                            onchange="msgStatus(
                                                '${row.id}',
                                                this.value
                                            )"
                                        >

                                            <option
                                                value="baru"
                                                ${
                                                    row.status === 'baru'
                                                        ? 'selected'
                                                        : ''
                                                }
                                            >
                                                Baru
                                            </option>


                                            <option
                                                value="dibaca"
                                                ${
                                                    row.status === 'dibaca'
                                                        ? 'selected'
                                                        : ''
                                                }
                                            >
                                                Dibaca
                                            </option>


                                            <option
                                                value="dibalas"
                                                ${
                                                    row.status === 'dibalas'
                                                        ? 'selected'
                                                        : ''
                                                }
                                            >
                                                Dibalas
                                            </option>

                                        </select>


                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            onclick="delRow(
                                                'messages',
                                                '${row.id}'
                                            )"
                                        >

                                            Hapus

                                        </button>

                                    </td>

                                </tr>

                                `
                            )

                            .join('')

                        ||

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


    // ============================================================
    // ADMINS
    // ============================================================

    function renderAdmins() {

        $('#adminList').innerHTML = `

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

                        cache.admin_users

                            .map(
                                row => `

                                <tr>

                                    <td>
                                        ${esc(row.name || '-')}
                                    </td>

                                    <td>
                                        ${esc(row.email)}
                                    </td>

                                    <td>

                                        <span
                                            class="badge text-bg-light"
                                        >

                                            ${esc(row.role)}

                                        </span>

                                    </td>


                                    <td>

                                        ${
                                            row.created_at

                                                ?

                                                new Date(
                                                    row.created_at
                                                )
                                                    .toLocaleDateString(
                                                        'id-ID'
                                                    )

                                                :

                                                '-'
                                        }

                                    </td>


                                    <td
                                        class="text-end"
                                    >

                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            onclick="removeAdmin(
                                                '${esc(row.email)}'
                                            )"
                                        >

                                            Hapus Admin

                                        </button>

                                    </td>

                                </tr>

                                `
                            )

                            .join('')

                        ||

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


    // ============================================================
    // SETTINGS
    // ============================================================

    function fillSettings(site) {

        const values = [

            ['sname', site.name],

            ['sloc', site.location],

            ['shead', site.head_village],

            ['sarea', site.area],

            ['spop', site.population],

            ['skk', site.kk],

            ['sdusun', site.dusun],

            ['sap', site.aparatur],

            ['semail', site.email],

            ['sphone', site.phone],

            ['saddress', site.address],

            ['spostal', site.postal_code],

            ['shours', site.office_hours]

        ];


        values.forEach(
            ([id, value]) => {

                const element =
                    $('#' + id);


                if (element) {

                    element.value =
                        value ?? '';

                }

            }
        );

    }


    // ============================================================
    // TITLES
    // ============================================================

    const titles = {

        news:
            'Berita',

        agenda:
            'Agenda',

        gallery:
            'Galeri',

        potentials:
            'Potensi',

        wisata:
            'Wisata',

        services:
            'Layanan',

        faqs:
            'FAQ',

        documents:
            'Dokumen Transparansi'

    };


    // ============================================================
    // OPEN EDITOR
    // ============================================================

    function openEditor(
        type,
        id = null
    ) {

        current = {

            type:
                type,

            id:
                id

        };


        const item =

            id

                ?

                (
                    cache[type] || []
                )
                    .find(
                        x =>
                            x.id === id
                    )

                ||

                {}

                :

                {};


        $('#editorTitle').textContent =

            (
                id
                    ? 'Edit '
                    : 'Tambah '
            )

            +

            titles[type];


        let html = '';


        // ========================================================
        // BERITA
        // ========================================================

        if (type === 'news') {

            html = `

                <input
                    name="title"
                    class="form-control mb-2"
                    placeholder="Judul berita"
                    required
                    value="${esc(item.title)}"
                >


                <input
                    name="cat"
                    class="form-control mb-2"
                    placeholder="Kategori"
                    value="${esc(item.cat)}"
                >


                <input
                    name="date"
                    type="date"
                    class="form-control mb-2"
                    value="${item.date || ''}"
                >


                <textarea
                    name="summary"
                    class="form-control mb-2"
                    placeholder="Ringkasan"
                >${esc(item.summary)}</textarea>


                <textarea
                    name="body"
                    rows="8"
                    class="form-control"
                    placeholder="Isi berita"
                >${esc(item.body)}</textarea>

            `;

        }


        // ========================================================
        // AGENDA
        // ========================================================

        if (type === 'agenda') {

            html = `

                <input
                    name="title"
                    class="form-control mb-2"
                    placeholder="Nama kegiatan"
                    required
                    value="${esc(item.title)}"
                >


                <input
                    name="date"
                    type="date"
                    class="form-control mb-2"
                    value="${item.date || ''}"
                >


                <input
                    name="time"
                    class="form-control mb-2"
                    placeholder="Jam"
                    value="${esc(item.time)}"
                >


                <input
                    name="place"
                    class="form-control mb-2"
                    placeholder="Lokasi"
                    value="${esc(item.place)}"
                >


                <textarea
                    name="description"
                    class="form-control"
                    placeholder="Deskripsi"
                >${esc(item.description)}</textarea>

            `;

        }


        // ========================================================
        // GALLERY
        // ========================================================

        if (type === 'gallery') {

            html = `

                <input
                    name="title"
                    class="form-control mb-2"
                    placeholder="Judul foto"
                    required
                    value="${esc(item.title)}"
                >


                <textarea
                    name="description"
                    class="form-control mb-2"
                    placeholder="Keterangan"
                >${esc(item.description)}</textarea>


                ${
                    item.image_url

                        ?

                        `

                        <img
                            src="${esc(item.image_url)}"
                            class="preview-large mb-3"
                            alt="${esc(item.title)}"
                        >

                        `

                        :

                        ''
                }


                <label
                    class="form-label"
                >

                    Foto

                </label>


                <input
                    name="file"
                    type="file"
                    accept="image/*"
                    class="form-control"
                >


                <small
                    class="text-muted"
                >

                    Saat edit, foto boleh dikosongkan
                    untuk mempertahankan foto lama.

                </small>

            `;

        }


        // ========================================================
        // POTENSI
        // ========================================================

        if (type === 'potentials') {

            html = `

                <label
                    class="form-label"
                >

                    Nama Hasil Bumi / Potensi

                </label>


                <input
                    name="name"
                    class="form-control mb-3"
                    placeholder="Contoh: Padi"
                    required
                    value="${esc(item.name)}"
                >


                <label
                    class="form-label"
                >

                    Kategori

                </label>


                <select
                    name="cat"
                    class="form-select mb-3"
                >

                    <option value="">
                        Pilih kategori
                    </option>


                    <option
                        value="Hasil Bumi"
                        ${
                            item.cat === 'Hasil Bumi'
                                ? 'selected'
                                : ''
                        }
                    >
                        Hasil Bumi
                    </option>


                    <option
                        value="Pertanian"
                        ${
                            item.cat === 'Pertanian'
                                ? 'selected'
                                : ''
                        }
                    >
                        Pertanian
                    </option>


                    <option
                        value="Perkebunan"
                        ${
                            item.cat === 'Perkebunan'
                                ? 'selected'
                                : ''
                        }
                    >
                        Perkebunan
                    </option>


                    <option
                        value="Peternakan"
                        ${
                            item.cat === 'Peternakan'
                                ? 'selected'
                                : ''
                        }
                    >
                        Peternakan
                    </option>


                    <option
                        value="UMKM"
                        ${
                            item.cat === 'UMKM'
                                ? 'selected'
                                : ''
                        }
                    >
                        UMKM
                    </option>

                </select>


                <label
                    class="form-label"
                >

                    Foto

                </label>


                ${
                    item.image_url

                        ?

                        `

                        <img
                            src="${esc(item.image_url)}"
                            class="preview-large mb-3"
                            alt="${esc(item.name)}"
                        >

                        `

                        :

                        ''
                }


                <input
                    name="file"
                    type="file"
                    accept="image/*"
                    class="form-control mb-2"
                >


                <small
                    class="text-muted d-block mb-3"
                >

                    Pilih foto Padi, Jagung, Ubi,
                    Kelapa, Kopi, Kakao, Kemiri,
                    Pisang, dan hasil bumi lainnya.

                </small>


                <label
                    class="form-label"
                >

                    Deskripsi

                </label>


                <textarea
                    name="description"
                    rows="7"
                    class="form-control"
                    placeholder="Tuliskan deskripsi hasil bumi..."
                >${esc(item.description)}</textarea>

            `;

        }


        // ========================================================
        // WISATA
        // ========================================================

        if (type === 'wisata') {

            html = `

                <label
                    class="form-label"
                >

                    Nama Tempat Wisata

                </label>


                <input
                    name="name"
                    class="form-control mb-3"
                    placeholder="Contoh: Pantai ..."
                    required
                    value="${esc(item.name)}"
                >


                <label
                    class="form-label"
                >

                    Foto Wisata

                </label>


                ${
                    item.image_url

                        ?

                        `

                        <img
                            src="${esc(item.image_url)}"
                            class="preview-large mb-3"
                            alt="${esc(item.name)}"
                        >

                        `

                        :

                        ''
                }


                <input
                    name="file"
                    type="file"
                    accept="image/*"
                    class="form-control mb-2"
                >


                <small
                    class="text-muted d-block mb-3"
                >

                    Gunakan foto tempat wisata
                    yang jelas.

                </small>


                <label
                    class="form-label"
                >

                    Deskripsi Lengkap

                </label>


                <textarea
                    name="description"
                    rows="9"
                    class="form-control"
                    placeholder="Tuliskan deskripsi lengkap tempat wisata..."
                >${esc(item.description)}</textarea>

            `;

        }


        // ========================================================
        // SERVICES
        // ========================================================

        if (type === 'services') {

            html = `

                <input
                    name="name"
                    class="form-control mb-2"
                    placeholder="Nama layanan"
                    required
                    value="${esc(item.name)}"
                >


                <textarea
                    name="description"
                    rows="6"
                    class="form-control"
                    placeholder="Deskripsi layanan"
                >${esc(item.description)}</textarea>

            `;

        }


        // ========================================================
        // FAQ
        // ========================================================

        if (type === 'faqs') {

            html = `

                <input
                    name="q"
                    class="form-control mb-2"
                    placeholder="Pertanyaan"
                    required
                    value="${esc(item.q)}"
                >


                <textarea
                    name="a"
                    rows="6"
                    class="form-control"
                    placeholder="Jawaban"
                >${esc(item.a)}</textarea>

            `;

        }


        // ========================================================
        // DOCUMENTS
        // ========================================================

        if (type === 'documents') {

            html = `

                <input
                    name="title"
                    class="form-control mb-2"
                    placeholder="Nama dokumen"
                    required
                    value="${esc(item.title)}"
                >


                <div class="row g-2">

                    <div class="col-md-5">

                        <input
                            name="category"
                            class="form-control"
                            placeholder="Kategori"
                            value="${esc(
                                item.category ||
                                'Transparansi'
                            )}"
                        >

                    </div>


                    <div class="col-md-3">

                        <input
                            name="year"
                            type="number"
                            class="form-control"
                            placeholder="Tahun"
                            value="${esc(
                                item.year ||
                                ''
                            )}"
                        >

                    </div>

                </div>


                <textarea
                    name="description"
                    class="form-control mt-2"
                    placeholder="Keterangan"
                >${esc(item.description)}</textarea>


                <input
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    class="form-control mt-2"
                >


                <small
                    class="text-muted"
                >

                    Saat edit, file boleh dikosongkan
                    untuk mempertahankan file lama.

                </small>

            `;

        }


        $('#editorBody').innerHTML =
            html;


        bootstrap.Modal
            .getOrCreateInstance(
                $('#editorModal')
            )
            .show();

    }


    // ============================================================
    // UPLOAD FOTO
    // ============================================================

    async function uploadImage(
        file,
        folder
    ) {

        const safeName =
            file.name
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    '-'
                );


        const path =

            folder +

            '/' +

            Date.now() +

            '-' +

            safeName;


        const result =

            await sb

                .storage

                .from('gallery')

                .upload(
                    path,
                    file,
                    {
                        upsert: false,

                        cacheControl:
                            '3600'
                    }
                );


        if (result.error) {

            throw result.error;

        }


        const publicData =

            sb

                .storage

                .from('gallery')

                .getPublicUrl(
                    path
                );


        return {

            path:
                path,

            url:
                publicData
                    .data
                    .publicUrl

        };

    }


    // ============================================================
    // SAVE EDITOR
    // ============================================================

    async function saveEditor(e) {

        e.preventDefault();


        const form =
            new FormData(
                e.target
            );


        const type =
            current.type;


        try {


            const data = {};


            for (
                const [
                    key,
                    value
                ]
                of form.entries()
            ) {

                if (
                    key !== 'file'
                ) {

                    data[key] =
                        value;

                }

            }


            let newStoragePath =
                null;


            let oldStoragePath =
                null;


            // ====================================================
            // POTENSI
            // ====================================================

            if (
                type ===
                'potentials'
            ) {

                const file =
                    form.get('file');


                const old =

                    current.id

                        ?

                        cache.potentials
                            .find(
                                x =>
                                    x.id ===
                                    current.id
                            )

                        :

                        null;


                oldStoragePath =
                    old?.storage_path ||
                    null;


                if (
                    file &&
                    file.size
                ) {

                    const uploaded =
                        await uploadImage(
                            file,
                            'potentials'
                        );


                    data.image_url =
                        uploaded.url;


                    data.storage_path =
                        uploaded.path;


                    newStoragePath =
                        uploaded.path;

                }


                else if (current.id) {

                    data.image_url =
                        old?.image_url ||
                        '';


                    data.storage_path =
                        old?.storage_path ||
                        '';

                }


                else {

                    throw new Error(
                        'Silakan pilih foto potensi.'
                    );

                }

            }


            // ====================================================
            // WISATA
            // ====================================================

            if (
                type ===
                'wisata'
            ) {

                const file =
                    form.get('file');


                const old =

                    current.id

                        ?

                        cache.wisata
                            .find(
                                x =>
                                    x.id ===
                                    current.id
                            )

                        :

                        null;


                oldStoragePath =
                    old?.storage_path ||
                    null;


                if (
                    file &&
                    file.size
                ) {

                    const uploaded =
                        await uploadImage(
                            file,
                            'wisata'
                        );


                    data.image_url =
                        uploaded.url;


                    data.storage_path =
                        uploaded.path;


                    newStoragePath =
                        uploaded.path;

                }


                else if (current.id) {

                    data.image_url =
                        old?.image_url ||
                        '';


                    data.storage_path =
                        old?.storage_path ||
                        '';

                }


                else {

                    throw new Error(
                        'Silakan pilih foto wisata.'
                    );

                }

            }


            // ====================================================
            // GALLERY
            // ====================================================

            if (
                type ===
                'gallery'
            ) {

                const file =
                    form.get('file');


                if (
                    file &&
                    file.size
                ) {

                    const uploaded =
                        await uploadImage(
                            file,
                            'gallery'
                        );


                    data.image_url =
                        uploaded.url;


                    data.storage_path =
                        uploaded.path;


                    newStoragePath =
                        uploaded.path;

                }


                else if (
                    current.id
                ) {

                    const old =
                        cache.gallery
                            .find(
                                x =>
                                    x.id ===
                                    current.id
                            );


                    data.image_url =
                        old?.image_url ||
                        '';


                    data.storage_path =
                        old?.storage_path ||
                        '';

                }


                else {

                    throw new Error(
                        'Pilih foto.'
                    );

                }

            }


            // ====================================================
            // DOCUMENTS
            // ====================================================

            if (
                type ===
                'documents'
            ) {

                const file =
                    form.get('file');


                if (
                    file &&
                    file.size
                ) {

                    const safeName =
                        file.name
                            .replace(
                                /[^a-zA-Z0-9._-]/g,
                                '-'
                            );


                    const path =

                        'documents/' +

                        Date.now() +

                        '-' +

                        safeName;


                    const upload =
                        await sb

                            .storage

                            .from('documents')

                            .upload(
                                path,
                                file,
                                {
                                    upsert:false
                                }
                            );


                    if (
                        upload.error
                    ) {

                        throw upload.error;

                    }


                    data.file_url =

                        sb

                            .storage

                            .from(
                                'documents'
                            )

                            .getPublicUrl(
                                path
                            )
                            .data
                            .publicUrl;


                    data.storage_path =
                        path;

                }


                else if (
                    current.id
                ) {

                    const old =
                        cache.documents
                            .find(
                                x =>
                                    x.id ===
                                    current.id
                            );


                    data.file_url =
                        old?.file_url ||
                        '';


                    data.storage_path =
                        old?.storage_path ||
                        '';

                }


                else {

                    throw new Error(
                        'Pilih file dokumen.'
                    );

                }


                data.year =
                    data.year
                        ? Number(
                            data.year
                        )
                        : null;

            }


            // ====================================================
            // INSERT / UPDATE
            // ====================================================

            if (
                current.id
            ) {

                const result =

                    await sb

                        .from(type)

                        .update(data)

                        .eq(
                            'id',
                            current.id
                        );


                if (
                    result.error
                ) {

                    throw result.error;

                }

            }

            else {

                const result =

                    await sb

                        .from(type)

                        .insert(
                            data
                        );


                if (
                    result.error
                ) {

                    throw result.error;

                }

            }


            // ====================================================
            // HAPUS FOTO LAMA
            // ====================================================

            if (
                oldStoragePath &&
                newStoragePath &&
                oldStoragePath !==
                    newStoragePath
            ) {

                if (
                    type ===
                    'potentials'
                    ||
                    type ===
                    'wisata'
                    ||
                    type ===
                    'gallery'
                ) {

                    await sb

                        .storage

                        .from('gallery')

                        .remove([
                            oldStoragePath
                        ]);

                }

            }


            bootstrap.Modal
                .getOrCreateInstance(
                    $('#editorModal')
                )
                .hide();


            toast(
                'Data berhasil disimpan.'
            );


            await loadAll();


        }

        catch (error) {

            console.error(error);

            toast(
                error.message ||
                'Gagal menyimpan data.',
                'error'
            );

        }

    }


    // ============================================================
    // DELETE
    // ============================================================

    async function delRow(
        type,
        id
    ) {

        if (
            !confirm(
                'Yakin ingin menghapus data ini?'
            )
        ) {

            return;

        }


        try {


            // ====================================================
            // DELETE FOTO POTENSI
            // ====================================================

            if (
                type ===
                'potentials'
            ) {

                const item =
                    cache.potentials
                        .find(
                            x =>
                                x.id ===
                                id
                        );


                if (
                    item?.storage_path
                ) {

                    await sb

                        .storage

                        .from('gallery')

                        .remove([
                            item.storage_path
                        ]);

                }

            }


            // ====================================================
            // DELETE FOTO WISATA
            // ====================================================

            if (
                type ===
                'wisata'
            ) {

                const item =
                    cache.wisata
                        .find(
                            x =>
                                x.id ===
                                id
                        );


                if (
                    item?.storage_path
                ) {

                    await sb

                        .storage

                        .from('gallery')

                        .remove([
                            item.storage_path
                        ]);

                }

            }


            // ====================================================
            // DELETE GALLERY
            // ====================================================

            if (
                type ===
                'gallery'
            ) {

                const item =
                    cache.gallery
                        .find(
                            x =>
                                x.id ===
                                id
                        );


                if (
                    item?.storage_path
                ) {

                    await sb

                        .storage

                        .from('gallery')

                        .remove([
                            item.storage_path
                        ]);

                }

            }


            // ====================================================
            // DELETE DOCUMENT
            // ====================================================

            if (
                type ===
                'documents'
            ) {

                const item =
                    cache.documents
                        .find(
                            x =>
                                x.id ===
                                id
                        );


                if (
                    item?.storage_path
                ) {

                    await sb

                        .storage

                        .from('documents')

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
                        'id',
                        id
                    );


            if (
                result.error
            ) {

                throw result.error;

            }


            toast(
                'Data berhasil dihapus.'
            );


            await loadAll();


        }

        catch (error) {

            console.error(error);

            toast(
                error.message ||
                'Gagal menghapus data.',
                'error'
            );

        }

    }


    // ============================================================
    // SAVE PAGE
    // ============================================================

    async function savePage(
        slug
    ) {

        try {


            const data = {

                slug:
                    slug,

                title:
                    $('#pt-' + slug)
                        .value,

                subtitle:
                    $('#ps-' + slug)
                        .value,

                content:
                    $('#pc-' + slug)
                        .value,

                updated_at:
                    new Date()
                        .toISOString()

            };


            const result =

                await sb

                    .from('page_content')

                    .upsert(
                        data,
                        {
                            onConflict:
                                'slug'
                        }
                    );


            if (
                result.error
            ) {

                throw result.error;

            }


            toast(
                'Konten berhasil disimpan.'
            );


            await loadAll();


        }

        catch (error) {

            toast(
                error.message,
                'error'
            );

        }

    }


    // ============================================================
    // MESSAGE STATUS
    // ============================================================

    async function msgStatus(
        id,
        status
    ) {

        const result =

            await sb

                .from('messages')

                .update({
                    status:
                        status
                })

                .eq(
                    'id',
                    id
                );


        if (
            result.error
        ) {

            toast(
                result.error.message,
                'error'
            );

        }

        else {

            toast(
                'Status pesan diperbarui.'
            );


            await loadAll();

        }

    }


    // ============================================================
    // SAVE SETTINGS
    // ============================================================

    async function saveSettings(
        e
    ) {

        e.preventDefault();


        try {


            const data = {

                id:1,

                name:
                    $('#sname').value,

                location:
                    $('#sloc').value,

                head_village:
                    $('#shead').value,

                area:
                    $('#sarea').value,

                population:
                    Number(
                        $('#spop').value ||
                        0
                    ),

                kk:
                    Number(
                        $('#skk').value ||
                        0
                    ),

                dusun:
                    Number(
                        $('#sdusun').value ||
                        0
                    ),

                aparatur:
                    Number(
                        $('#sap').value ||
                        0
                    ),

                email:
                    $('#semail').value,

                phone:
                    $('#sphone').value,

                address:
                    $('#saddress').value,

                postal_code:
                    $('#spostal').value,

                office_hours:
                    $('#shours').value,

                updated_at:
                    new Date()
                        .toISOString()

            };


            const result =

                await sb

                    .from(
                        'site_settings'
                    )

                    .upsert(
                        data,
                        {
                            onConflict:
                                'id'
                        }
                    );


            if (
                result.error
            ) {

                throw result.error;

            }


            toast(
                'Pengaturan berhasil disimpan.'
            );


            await loadAll();


        }

        catch (error) {

            toast(
                error.message,
                'error'
            );

        }

    }


    // ============================================================
    // ADD ADMIN
    // ============================================================

    async function addAdmin(
        e
    ) {

        e.preventDefault();


        try {


            const {
                data,
                error
            } =

                await sb.rpc(
                    'admin_add_by_email',
                    {

                        p_email:
                            $('#aemail').value,

                        p_name:
                            $('#aname').value,

                        p_role:
                            $('#arole').value

                    }
                );


            if (error) {

                throw error;

            }


            toast(
                'Admin berhasil ditambahkan.'
            );


            $('#adminAddForm')
                .reset();


            await loadAll();


        }

        catch (error) {

            toast(
                error.message,
                'error'
            );

        }

    }


    // ============================================================
    // REMOVE ADMIN
    // ============================================================

    async function removeAdmin(
        email
    ) {

        if (
            !confirm(
                'Hapus hak Admin untuk ' +
                email +
                '?'
            )
        ) {

            return;

        }


        try {


            const {
                error
            } =

                await sb.rpc(
                    'admin_remove_by_email',
                    {
                        p_email:
                            email
                    }
                );


            if (error) {

                throw error;

            }


            toast(
                'Hak Admin dihapus.'
            );


            await loadAll();


        }

        catch (error) {

            toast(
                error.message,
                'error'
            );

        }

    }


    // ============================================================
    // NAVIGASI ADMIN
    // ============================================================

    document
        .querySelectorAll(
            '#nav a[data-target]'
        )
        .forEach(
            link => {

                link.addEventListener(
                    'click',
                    function (event) {

                        event.preventDefault();


                        const target =
                            link.dataset.target;


                        // Hapus active
                        document
                            .querySelectorAll(
                                '#nav a'
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            'active'
                                        )
                            );


                        // Active menu
                        link.classList.add(
                            'active'
                        );


                        // Sembunyikan SEMUA section
                        document
                            .querySelectorAll(
                                '.admin-section'
                            )
                            .forEach(
                                section => {

                                    section.classList
                                        .remove(
                                            'active'
                                        );

                                }
                            );


                        // Tampilkan section yang dipilih
                        const section =
                            document.getElementById(
                                target
                            );


                        if (section) {

                            section.classList.add(
                                'active'
                            );


                            window.scrollTo(
                                {
                                    top:0,

                                    behavior:
                                        'smooth'
                                }
                            );

                        }


                        // Mobile
                        if (
                            innerWidth < 901
                        ) {

                            $('#side')
                                .classList
                                .remove(
                                    'open'
                                );


                            $('#overlay')
                                .style
                                .display =
                                    'none';

                        }

                    }
                );

            }
        );


    // ============================================================
    // LOGIN
    // ============================================================

    $('#loginForm')
        .addEventListener(
            'submit',
            async e => {

                e.preventDefault();


                $('#loginErr')
                    .textContent =
                    '';


                try {


                    await client();


                    const {
                        error
                    } =

                        await sb.auth
                            .signInWithPassword(
                                {

                                    email:
                                        $('#email')
                                            .value
                                            .trim(),

                                    password:
                                        $('#password')
                                            .value

                                }
                            );


                    if (error) {

                        throw error;

                    }


                    await loadAll();


                }

                catch (error) {

                    $('#loginErr')
                        .textContent =
                        error.message;

                }

            }
        );


    // ============================================================
    // LOGOUT
    // ============================================================

    $('#logout')
        .addEventListener(
            'click',
            async e => {

                e.preventDefault();


                if (sb) {

                    await sb
                        .auth
                        .signOut();

                }


                showLogin();

            }
        );


    // ============================================================
    // SETTINGS EVENT
    // ============================================================

    $('#settingsForm')
        .addEventListener(
            'submit',
            saveSettings
        );


    // ============================================================
    // ADMIN EVENT
    // ============================================================

    $('#adminAddForm')
        .addEventListener(
            'submit',
            addAdmin
        );


    // ============================================================
    // EDITOR EVENT
    // ============================================================

    $('#editorForm')
        .addEventListener(
            'submit',
            saveEditor
        );


    // ============================================================
    // REFRESH
    // ============================================================

    $('#refresh')
        .addEventListener(
            'click',
            loadAll
        );


    $('#reloadMessages')
        .addEventListener(
            'click',
            loadAll
        );


    // ============================================================
    // MOBILE MENU
    // ============================================================

    $('#menu')
        .addEventListener(
            'click',
            () => {

                $('#side')
                    .classList
                    .toggle(
                        'open'
                    );


                $('#overlay')
                    .style
                    .display =
                    'block';

            }
        );


    $('#overlay')
        .addEventListener(
            'click',
            () => {

                $('#side')
                    .classList
                    .remove(
                        'open'
                    );


                $('#overlay')
                    .style
                    .display =
                    'none';

            }
        );


    // ============================================================
    // PUBLIC API
    // ============================================================

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


    // ============================================================
    // AUTO LOGIN
    // ============================================================

    (async function () {

        if (!ready()) {

            $('#configWarn')
                .classList
                .remove(
                    'hidden'
                );

            return;

        }


        try {


            await client();


            const {
                data
            } =
                await sb.auth
                    .getSession();


            if (
                data.session
            ) {

                await loadAll();

            }


        }

        catch (error) {

            console.error(
                error
            );

        }

    })();


})();