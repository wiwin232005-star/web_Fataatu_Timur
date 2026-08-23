<?php
require __DIR__.'/config.php';
$d=body();
if(($d['username']??'')!=='admin' || ($d['password']??'')!=='admin123') out(['ok'=>false,'message'=>'Username atau password salah'],401);
session_start(); $_SESSION['admin']=true;
out(['ok'=>true]);
