<?php
require __DIR__.'/config.php';
session_start(); if(empty($_SESSION['admin'])) out(['ok'=>false,'message'=>'Belum login'],401);
$d=body();
$st=$pdo->prepare("UPDATE settings SET name=?,location=?,email=?,phone=?,address=?,penduduk=?,kk=?,dusun=? WHERE id=1");
$st->execute([$d['name']??'', $d['location']??'', $d['email']??'', $d['phone']??'', $d['address']??'', (int)($d['penduduk']??0),(int)($d['kk']??0),(int)($d['dusun']??0)]);
out(['ok'=>true]);
