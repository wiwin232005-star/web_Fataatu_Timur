<?php
require __DIR__.'/config.php';
session_start(); if(empty($_SESSION['admin'])) out(['ok'=>false,'message'=>'Belum login'],401);
$d=body(); $allowed=['news','agenda','gallery','potentials','services','faqs']; $type=$d['type']??''; $id=(int)($d['id']??0);
if(!in_array($type,$allowed,true)||$id<1)out(['ok'=>false,'message'=>'Data tidak valid'],400);
$st=$pdo->prepare("DELETE FROM `$type` WHERE id=?");$st->execute([$id]);out(['ok'=>true]);
