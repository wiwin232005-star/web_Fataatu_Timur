<?php
require __DIR__.'/config.php'; session_start(); if(empty($_SESSION['admin']))out(['ok'=>false,'message'=>'Belum login'],401);
if($_SERVER['REQUEST_METHOD']==='GET')out(['ok'=>true,'data'=>$pdo->query('SELECT * FROM messages ORDER BY id DESC')->fetchAll()]);
$d=body(); $id=(int)($d['id']??0); $status=$d['status']??'dibaca';
if($id<1||!in_array($status,['baru','dibaca','dibalas'],true))out(['ok'=>false,'message'=>'Data tidak valid'],400);
$st=$pdo->prepare('UPDATE messages SET status=? WHERE id=?');$st->execute([$status,$id]);out(['ok'=>true]);
