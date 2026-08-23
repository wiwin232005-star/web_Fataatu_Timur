<?php
require __DIR__.'/config.php';
session_start(); if(empty($_SESSION['admin'])) out(['ok'=>false,'message'=>'Belum login'],401);
$d=body(); $type=$d['type']??'';
$allowed=['news','agenda','gallery','potentials','services','faqs'];
if(!in_array($type,$allowed,true)) out(['ok'=>false,'message'=>'Jenis data tidak valid'],400);

$maps=[
'news'=>['title','cat','date','summary','body'],
'agenda'=>['title','date','time','place','desc'],
'gallery'=>['title','src'],
'potentials'=>['name','cat','desc'],
'services'=>['name','desc'],
'faqs'=>['q','a']
];
$fields=$maps[$type]; $id=(int)($d['id']??0);
if($id>0){
 $set=implode(',',array_map(fn($f)=>"`$f`=:$f",$fields));
 $st=$pdo->prepare("UPDATE `$type` SET $set WHERE id=:id");
 foreach($fields as $f)$st->bindValue(':'.$f,$d[$f]??'');
 $st->bindValue(':id',$id,PDO::PARAM_INT); $st->execute();
}else{
 $cols=implode(',',array_map(fn($f)=>"`$f`",$fields));
 $vals=implode(',',array_map(fn($f)=>':'.$f,$fields));
 $st=$pdo->prepare("INSERT INTO `$type` ($cols) VALUES ($vals)");
 foreach($fields as $f)$st->bindValue(':'.$f,$d[$f]??'');
 $st->execute(); $id=(int)$pdo->lastInsertId();
}
out(['ok'=>true,'id'=>$id]);
