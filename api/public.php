<?php
require __DIR__.'/config.php';
$tables=['news','agenda','gallery','potentials','services','faqs'];
$result=[];
foreach($tables as $t){$result[$t]=$pdo->query("SELECT * FROM `$t` ORDER BY id DESC")->fetchAll();}
$result['site']=$pdo->query("SELECT * FROM settings LIMIT 1")->fetch();
out(['ok'=>true,'data'=>$result]);
