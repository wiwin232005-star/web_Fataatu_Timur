<?php
/**
 * Mesin CRUD generik untuk seluruh modul admin.
 * URL: crud.php?m=<modul>&aksi=<list|tambah|edit|hapus>&id=<id>
 */

require_once __DIR__ . '/../config/config.php';
require_login();
require_once __DIR__ . '/modules.php';

/*
|--------------------------------------------------------------------------
| MODUL
|--------------------------------------------------------------------------
| Perbaikan:
| Jika parameter ?m= kosong, gunakan galeri sebagai default.
| Jika modul tidak dikenal, kembali ke halaman admin.
|--------------------------------------------------------------------------
*/

$m = isset($_GET['m']) ? trim((string) $_GET['m']) : '';

if ($m === '') {
    $m = 'galeri';
}

if (!isset($MODULES[$m])) {
    header('Location: index.php');
    exit;
}

$cfg    = $MODULES[$m];
$table  = $cfg['table'];
$fields = $cfg['fields'];
/* Whitelist aksi supaya alur kerja tidak bisa dimanipulasi lewat URL. */
$aksi = (string) ($_GET['aksi'] ?? 'list');
if (!in_array($aksi, ['list', 'tambah', 'edit', 'hapus'], true)) {
    $aksi = 'list';
}
if (in_array($aksi, ['tambah', 'edit', 'hapus'], true) && !empty($cfg['admin_only']) && !is_admin()) {
    flash('Modul ' . $cfg['label'] . ' hanya dapat diubah oleh Administrator.', 'danger');
    redirect('admin/crud.php?m=' . $m);
}
$id     = isset($_GET['id']) ? (int) $_GET['id'] : 0;

$adminTitle = $cfg['label'];


/**
 * Ambil opsi select dari tabel referensi.
 */
function opsi_select(array $f): array
{
    global $pdo;

    if (isset($f['options'])) {
        return $f['options'];
    }

    if (isset($f['source'])) {
        $s = $f['source'];
        $out = [];

        foreach (
            $pdo->query(
                'SELECT `' . $s['value'] . '` v, `' . $s['text'] .
                '` t FROM `' . $s['table'] . '` ORDER BY t'
            ) as $r
        ) {
            $out[$r['v']] = $r['t'];
        }

        return $out;
    }

    return [];
}


/*
|--------------------------------------------------------------------------
| HAPUS
|--------------------------------------------------------------------------
*/

if ($aksi === 'hapus' && $id > 0) {

    csrf_check();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        exit('Metode tidak diizinkan.');
    }

    // Hapus file gambar terkait
    foreach ($fields as $name => $f) {

        if (($f['type'] ?? '') === 'image') {

            $st = $pdo->prepare(
                'SELECT `' . $name . '` FROM `' . $table . '` WHERE id = ?'
            );

            $st->execute([$id]);

            $file = $st->fetchColumn();

            if ($file) {

                $path = UPLOAD_PATH . '/' . $f['folder'] . '/' . $file;

                if (is_file($path)) {
                    @unlink($path);
                }
            }
        }
    }

    $pdo
        ->prepare('DELETE FROM `' . $table . '` WHERE id = ?')
        ->execute([$id]);

    flash('Data berhasil dihapus.');

    redirect(
        'admin/crud.php?m=' . urlencode($m)
    );
}


/*
|--------------------------------------------------------------------------
| SIMPAN
|--------------------------------------------------------------------------
*/

$row    = [];
$errors = [];


/*
|--------------------------------------------------------------------------
| EDIT - AMBIL DATA
|--------------------------------------------------------------------------
*/

if ($aksi === 'edit' && $id > 0) {

    $st = $pdo->prepare(
        'SELECT * FROM `' . $table . '` WHERE id = ? LIMIT 1'
    );

    $st->execute([$id]);

    $row = $st->fetch() ?: [];

    if (!$row) {

        flash(
            'Data tidak ditemukan.',
            'danger'
        );

        redirect(
            'admin/crud.php?m=' . urlencode($m)
        );
    }
}


/*
|--------------------------------------------------------------------------
| TAMBAH / EDIT - PROSES FORM
|--------------------------------------------------------------------------
*/

if (
    $_SERVER['REQUEST_METHOD'] === 'POST'
    &&
    in_array($aksi, ['tambah', 'edit'], true)
) {

    csrf_check();

    $data = [];


    foreach ($fields as $name => $f) {

        $type = $f['type'] ?? 'text';


        /*
        |--------------------------------------------------------------------------
        | UPLOAD GAMBAR
        |--------------------------------------------------------------------------
        */

        if ($type === 'image') {

            $data[$name] = upload_image(
                $name,
                $f['folder'],
                $row[$name] ?? null
            );


            // Hapus gambar lama jika dicentang
            if (
                !empty($_POST['hapus_' . $name])
                &&
                !empty($row[$name])
            ) {

                $p =
                    UPLOAD_PATH .
                    '/' .
                    $f['folder'] .
                    '/' .
                    $row[$name];

                if (is_file($p)) {
                    @unlink($p);
                }

                $data[$name] = null;
            }

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | AMBIL NILAI INPUT
        |--------------------------------------------------------------------------
        */

        $val = trim(
            (string) ($_POST[$name] ?? '')
        );


        /*
        |--------------------------------------------------------------------------
        | SLUG
        |--------------------------------------------------------------------------
        */

        if ($type === 'slug') {

            $src = trim(
                (string) ($_POST[$f['from']] ?? '')
            );

            $val =
                $val !== ''
                ? slugify($val)
                : slugify($src);


            // Pastikan slug unik
            $base = $val;
            $n = 1;

            while (true) {

                $q = $pdo->prepare(
                    'SELECT COUNT(*) FROM `' .
                    $table .
                    '` WHERE `' .
                    $name .
                    '` = ? AND id <> ?'
                );

                $q->execute([
                    $val,
                    $id
                ]);

                if (!$q->fetchColumn()) {
                    break;
                }

                $val =
                    $base .
                    '-' .
                    (++$n);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDASI WAJIB
        |--------------------------------------------------------------------------
        */

        if (
            !empty($f['required'])
            &&
            $val === ''
        ) {

            $errors[] =
                'Kolom "' .
                $f['label'] .
                '" wajib diisi.';
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDASI PANJANG
        |--------------------------------------------------------------------------
        */

        if (
            !empty($f['max'])
            &&
            mb_strlen($val) > (int) $f['max']
        ) {

            $errors[] =
                'Kolom "' .
                $f['label'] .
                '" maksimal ' .
                (int) $f['max'] .
                ' karakter.';
        }


        /*
        |--------------------------------------------------------------------------
        | NUMBER
        |--------------------------------------------------------------------------
        */

        if ($type === 'number') {

            $val =
                ($val === '')
                ? 0
                : $val + 0;
        }


        /*
        |--------------------------------------------------------------------------
        | DATE
        |--------------------------------------------------------------------------
        */

        if (
            $type === 'date'
            &&
            $val === ''
        ) {

            $val = null;
        }


        /*
        |--------------------------------------------------------------------------
        | SELECT
        |--------------------------------------------------------------------------
        */

        if (
            $type === 'select'
            &&
            $val === ''
        ) {

            $val = null;
        }


        $data[$name] = $val;
    }


    /*
    |--------------------------------------------------------------------------
    | SIMPAN KE DATABASE
    |--------------------------------------------------------------------------
    */

    if (!$errors) {

        $cols = array_keys($data);


        /*
        |--------------------------------------------------------------------------
        | TAMBAH DATA
        |--------------------------------------------------------------------------
        */

        if ($aksi === 'tambah') {

            $sql =
                'INSERT INTO `' .
                $table .
                '` (`' .
                implode('`,`', $cols) .
                '`) VALUES (' .
                implode(
                    ',',
                    array_fill(
                        0,
                        count($cols),
                        '?'
                    )
                ) .
                ')';

            $pdo
                ->prepare($sql)
                ->execute(
                    array_values($data)
                );

            flash(
                'Data baru berhasil disimpan.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | EDIT DATA
        |--------------------------------------------------------------------------
        */

        else {

            $set = implode(
                ', ',
                array_map(
                    fn($c) =>
                        '`' . $c . '` = ?',
                    $cols
                )
            );

            $pdo
                ->prepare(
                    'UPDATE `' .
                    $table .
                    '` SET ' .
                    $set .
                    ' WHERE id = ?'
                )
                ->execute([
                    ...array_values($data),
                    $id
                ]);

            flash(
                'Perubahan berhasil disimpan.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | KEMBALI KE DAFTAR
        |--------------------------------------------------------------------------
        */

        redirect(
            'admin/crud.php?m=' .
            urlencode($m)
        );
    }


    $row = array_merge(
        $row,
        $data
    );
}


/*
|--------------------------------------------------------------------------
| DAFTAR DATA
|--------------------------------------------------------------------------
*/

if ($aksi === 'list') {

    $q =
        isset($_GET['q'])
        ? trim((string) $_GET['q'])
        : '';

    $page =
        max(
            1,
            (int) ($_GET['page'] ?? 1)
        );

    $per = 15;

    $where = '1=1';

    $par = [];


    /*
    |--------------------------------------------------------------------------
    | PENCARIAN
    |--------------------------------------------------------------------------
    */

    if (
        $q !== ''
        &&
        !empty($cfg['search'])
    ) {

        $parts = [];

        foreach (
            $cfg['search']
            as $i => $c
        ) {

            $parts[] =
                '`' .
                $c .
                '` LIKE :s' .
                $i;

            $par[':s' . $i] =
                '%' .
                $q .
                '%';
        }

        $where =
            '(' .
            implode(
                ' OR ',
                $parts
            ) .
            ')';
    }


    /*
    |--------------------------------------------------------------------------
    | TOTAL DATA
    |--------------------------------------------------------------------------
    */

    $cs = $pdo->prepare(
        'SELECT COUNT(*) FROM `' .
        $table .
        '` WHERE ' .
        $where
    );

    $cs->execute($par);

    $totalRow =
        (int) $cs->fetchColumn();

    $totalPage =
        max(
            1,
            (int) ceil(
                $totalRow / $per
            )
        );

    $page =
        min(
            $page,
            $totalPage
        );

    $off =
        ($page - 1) *
        $per;


    /*
    |--------------------------------------------------------------------------
    | AMBIL DATA
    |--------------------------------------------------------------------------
    */

    $st = $pdo->prepare(
        'SELECT * FROM `' .
        $table .
        '` WHERE ' .
        $where .
        ' ORDER BY ' .
        $cfg['order'] .
        ' LIMIT ' .
        $per .
        ' OFFSET ' .
        $off
    );

    $st->execute($par);

    $rows =
        $st->fetchAll();


    /*
    |--------------------------------------------------------------------------
    | LABEL RELASI
    |--------------------------------------------------------------------------
    */

    $relLabels = [];

    foreach (
        $fields
        as $name => $f
    ) {

        if (
            ($f['type'] ?? '') === 'select'
        ) {

            $relLabels[$name] =
                opsi_select($f);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    require __DIR__ . '/includes/header.php';

    ?>


    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">

        <form
            class="d-flex gap-2"
            method="get"
        >

            <input
                type="hidden"
                name="m"
                value="<?= e($m) ?>"
            >

            <input
                class="form-control form-control-sm"
                style="min-width:220px"
                type="search"
                name="q"
                value="<?= e($q) ?>"
                placeholder="Cari <?= e($cfg['label']) ?>..."
            >

            <button
                class="btn btn-sm btn-brand"
            >
                Cari
            </button>


            <?php if ($q !== ''): ?>

                <a
                    class="btn btn-sm btn-light-krem"
                    href="?m=<?= e($m) ?>"
                >
                    Reset
                </a>

            <?php endif; ?>

        </form>


        <a
            class="btn btn-sm btn-brand"
            href="?m=<?= e($m) ?>&aksi=tambah"
        >
            <i class="bi bi-plus-lg me-1"></i>
            Tambah <?= e($cfg['label']) ?>
        </a>

    </div>


    <div class="admin-card">

        <div class="table-responsive">

            <table class="table table-hover align-middle mb-0">

                <thead class="table-light">

                    <tr>

                        <th style="width:52px">
                            #
                        </th>


                        <?php foreach ($cfg['list'] as $col): ?>

                            <th>
                                <?= e($col['label']) ?>
                            </th>

                        <?php endforeach; ?>


                        <th
                            class="text-end"
                            style="width:150px"
                        >
                            Aksi
                        </th>

                    </tr>

                </thead>


                <tbody>


                    <?php if (!$rows): ?>

                        <tr>

                            <td
                                colspan="<?= count($cfg['list']) + 2 ?>"
                                class="text-center text-muted py-4"
                            >
                                Belum ada data.
                            </td>

                        </tr>

                    <?php endif; ?>


                    <?php foreach ($rows as $i => $r): ?>

                        <tr>

                            <td class="text-muted small">
                                <?= $off + $i + 1 ?>
                            </td>


                            <?php foreach ($cfg['list'] as $name => $col): ?>

                                <?php

                                $type =
                                    $col['type'] ?? 'text';

                                $val =
                                    $r[$name] ?? '';

                                ?>


                                <td>


                                    <?php if ($type === 'image'): ?>

                                        <img
                                            src="<?= img_src(
                                                $val,
                                                $col['folder'],
                                                $col['folder'] === 'aparatur'
                                                    ? 'avatar.svg'
                                                    : 'placeholder.svg'
                                            ) ?>"
                                            width="56"
                                            height="42"
                                            style="object-fit:cover;border-radius:6px"
                                            alt="Pratinjau"
                                        >


                                    <?php elseif ($type === 'date'): ?>

                                        <span class="small">
                                            <?= tanggal_id($val) ?>
                                        </span>


                                    <?php elseif ($type === 'money'): ?>

                                        <span class="small fw-semibold">
                                            <?= rupiah($val) ?>
                                        </span>


                                    <?php elseif ($type === 'badge'): ?>

                                        <span class="badge-cat text-capitalize">
                                            <?= e($val) ?>
                                        </span>


                                    <?php elseif (isset($relLabels[$name])): ?>

                                        <span class="small">
                                            <?= e(
                                                $relLabels[$name][$val] ?? '-'
                                            ) ?>
                                        </span>


                                    <?php else: ?>

                                        <span class="small">
                                            <?= e(
                                                excerpt(
                                                    (string) $val,
                                                    70
                                                )
                                            ) ?>
                                        </span>

                                    <?php endif; ?>


                                </td>


                            <?php endforeach; ?>


                            <td class="text-end">


                                <!-- TOMBOL EDIT -->

                                <a
                                    class="btn btn-sm btn-light-krem"
                                    href="?m=<?= e($m) ?>&aksi=edit&id=<?= (int) $r['id'] ?>"
                                    title="Edit"
                                >
                                    <i class="bi bi-pencil"></i>
                                </a>


                                <!-- TOMBOL HAPUS -->

                                <form
                                    class="d-inline"
                                    method="post"
                                    action="?m=<?= e($m) ?>&aksi=hapus&id=<?= (int) $r['id'] ?>"
                                >

                                    <?= csrf_field() ?>

                                    <button
                                        type="submit"
                                        class="btn btn-sm btn-outline-danger"
                                        data-confirm="Yakin ingin menghapus data ini? Tindakan tidak dapat dibatalkan."
                                        title="Hapus"
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>

                                </form>


                            </td>

                        </tr>


                    <?php endforeach; ?>


                </tbody>

            </table>

        </div>


        <?php if ($totalPage > 1): ?>

            <div class="p-3 border-top">

                <nav>

                    <ul class="pagination pagination-sm mb-0">


                        <?php for ($i = 1; $i <= $totalPage; $i++): ?>

                            <li
                                class="page-item <?= $i === $page ? 'active' : '' ?>"
                            >

                                <a
                                    class="page-link"
                                    href="?<?= e(
                                        http_build_query(
                                            array_filter([
                                                'm' => $m,
                                                'q' => $q,
                                                'page' => $i
                                            ])
                                        )
                                    ) ?>"
                                >
                                    <?= $i ?>
                                </a>

                            </li>

                        <?php endfor; ?>


                    </ul>

                </nav>

            </div>

        <?php endif; ?>


    </div>


    <p class="text-muted small mt-3 mb-0">

        Total
        <?= $totalRow ?>
        data pada modul
        <?= e($cfg['label']) ?>.

    </p>


    <?php

    require __DIR__ . '/includes/footer.php';

    exit;
}


/*
|--------------------------------------------------------------------------
| FORM TAMBAH / EDIT
|--------------------------------------------------------------------------
*/

$adminTitle =
    ($aksi === 'edit' ? 'Edit ' : 'Tambah ')
    .
    $cfg['label'];

require __DIR__ . '/includes/header.php';

?>


<a
    class="btn btn-sm btn-light-krem mb-3"
    href="?m=<?= e($m) ?>"
>
    <i class="bi bi-arrow-left me-1"></i>
    Kembali ke daftar
</a>


<?php if ($errors): ?>

    <div class="alert alert-danger">

        <ul class="mb-0 ps-3">

            <?php foreach ($errors as $x): ?>

                <li>
                    <?= e($x) ?>
                </li>

            <?php endforeach; ?>

        </ul>

    </div>

<?php endif; ?>


<div class="admin-card p-4">


    <form
        method="post"
        enctype="multipart/form-data"
        class="row g-3 needs-validation"
        novalidate
    >


        <?= csrf_field() ?>


        <?php foreach ($fields as $name => $f): ?>

            <?php

            $type =
                $f['type'] ?? 'text';

            $val =
                $row[$name] ?? '';


            if (
                $val === ''
                &&
                isset($f['default'])
            ) {

                $val =
                    $f['default'] === 'today'
                    ? date('Y-m-d')
                    : (
                        $f['default'] === 'year'
                        ? date('Y')
                        : $f['default']
                    );
            }


            $wide =
                in_array(
                    $type,
                    ['textarea'],
                    true
                );

            ?>


            <div
                class="col-12 <?= $wide ? '' : 'col-md-6' ?>"
            >


                <label
                    class="form-label"
                    for="f_<?= e($name) ?>"
                >

                    <?= e($f['label']) ?>

                    <?= !empty($f['required'])
                        ? ' <span class="text-danger">*</span>'
                        : ''
                    ?>

                </label>


                <?php if ($type === 'textarea'): ?>


                    <textarea
                        class="form-control"
                        id="f_<?= e($name) ?>"
                        name="<?= e($name) ?>"
                        rows="<?= (int) ($f['rows'] ?? 4) ?>"
                        <?= !empty($f['required']) ? 'required' : '' ?>
                    ><?= e((string) $val) ?></textarea>


                <?php elseif ($type === 'select'): ?>


                    <select
                        class="form-select"
                        id="f_<?= e($name) ?>"
                        name="<?= e($name) ?>"
                    >

                        <option value="">
                            -- Pilih --
                        </option>


                        <?php foreach (opsi_select($f) as $k => $lbl): ?>

                            <option
                                value="<?= e((string) $k) ?>"
                                <?= (string) $val === (string) $k
                                    ? 'selected'
                                    : ''
                                ?>
                            >
                                <?= e($lbl) ?>
                            </option>

                        <?php endforeach; ?>


                    </select>


                <?php elseif ($type === 'image'): ?>


                    <input
                        type="file"
                        class="form-control"
                        id="f_<?= e($name) ?>"
                        name="<?= e($name) ?>"
                        accept="image/*"
                        data-preview="#prev_<?= e($name) ?>"
                    >


                    <div class="form-text">

                        Format JPG/PNG/WEBP/GIF,
                        maksimal 3 MB.

                    </div>


                    <img
                        id="prev_<?= e($name) ?>"
                        src="<?= img_src(
                            (string) $val,
                            $f['folder'],
                            $f['folder'] === 'aparatur'
                                ? 'avatar.svg'
                                : 'placeholder.svg'
                        ) ?>"
                        class="mt-2 rounded"
                        style="max-height:110px"
                        alt="Pratinjau gambar"
                    >


                    <?php if ($val): ?>

                        <div class="form-check mt-2">

                            <input
                                class="form-check-input"
                                type="checkbox"
                                name="hapus_<?= e($name) ?>"
                                id="del_<?= e($name) ?>"
                                value="1"
                            >

                            <label
                                class="form-check-label small"
                                for="del_<?= e($name) ?>"
                            >
                                Hapus gambar saat ini
                            </label>

                        </div>

                    <?php endif; ?>


                <?php elseif ($type === 'number'): ?>


                    <input
                        type="number"
                        step="<?= e($f['step'] ?? '1') ?>"
                        class="form-control"
                        id="f_<?= e($name) ?>"
                        name="<?= e($name) ?>"
                        value="<?= e((string) $val) ?>"
                        <?= !empty($f['required'])
                            ? 'required'
                            : ''
                        ?>
                    >


                <?php elseif ($type === 'date'): ?>


                    <input
                        type="date"
                        class="form-control"
                        id="f_<?= e($name) ?>"
                        name="<?= e($name) ?>"
                        value="<?= e((string) $val) ?>"
                        <?= !empty($f['required'])
                            ? 'required'
                            : ''
                        ?>
                    >


                <?php elseif ($type === 'slug'): ?>


                    <input
                        class="form-control"
                        id="f_<?= e($name) ?>"
                        name="<?= e($name) ?>"
                        value="<?= e((string) $val) ?>"
                        maxlength="220"
                    >


                    <div class="form-text">

                        Kosongkan untuk dibuat otomatis dari
                        <?= e(
                            $fields[$f['from']]['label']
                            ?? $f['from']
                        ) ?>.

                    </div>


                <?php else: ?>


                    <input
                        class="form-control"
                        id="f_<?= e($name) ?>"
                        name="<?= e($name) ?>"
                        value="<?= e((string) $val) ?>"
                        <?= !empty($f['max'])
                            ? 'maxlength="' .
                              (int) $f['max'] .
                              '"'
                            : ''
                        ?>
                        <?= !empty($f['required'])
                            ? 'required'
                            : ''
                        ?>
                    >


                <?php endif; ?>


                <?php if (!empty($f['help'])): ?>

                    <div class="form-text">
                        <?= e($f['help']) ?>
                    </div>

                <?php endif; ?>


                <div class="invalid-feedback">
                    Kolom ini wajib diisi dengan benar.
                </div>


            </div>


        <?php endforeach; ?>


        <div class="col-12 border-top pt-3">


            <button
                type="submit"
                class="btn btn-brand px-4"
            >

                <i class="bi bi-save me-1"></i>
                Simpan

            </button>


            <a
                class="btn btn-light-krem"
                href="?m=<?= e($m) ?>"
            >
                Batal
            </a>


        </div>


    </form>


</div>


<?php

require __DIR__ . '/includes/footer.php';

?>