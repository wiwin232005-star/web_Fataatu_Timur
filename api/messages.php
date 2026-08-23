<?php
require __DIR__.'/config.php';
$d=body();
$name=trim($d['name']??''); $email=trim($d['email']??''); $subject=trim($d['subject']??''); $message=trim($d['message']??'');
if($name===''||$message==='') out(['ok'=>false,'message'=>'Nama dan pesan wajib diisi'],422);
$st=$pdo->prepare('INSERT INTO messages(name,email,subject,message) VALUES(?,?,?,?)');
$st->execute([$name,$email,$subject,$message]); out(['ok'=>true,'message'=>'Pesan berhasil dikirim.']);
