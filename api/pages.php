<?php
require __DIR__.'/config.php';
if($_SERVER['REQUEST_METHOD']==='GET'){ $rows=$pdo->query('SELECT * FROM page_content ORDER BY slug')->fetchAll(); $o=[]; foreach($rows as $r)$o[$r['slug']]=$r; out(['ok'=>true,'data'=>$o]); }
session_start(); if(empty($_SESSION['admin']))out(['ok'=>false,'message'=>'Belum login'],401); $d=body();
$slug=trim($d['slug']??''); if($slug==='')out(['ok'=>false,'message'=>'Slug kosong'],400);
$st=$pdo->prepare('INSERT INTO page_content(slug,title,subtitle,content) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),subtitle=VALUES(subtitle),content=VALUES(content)');
$st->execute([$slug,$d['title']??$slug,$d['subtitle']??'',$d['content']??'']); out(['ok'=>true]);
