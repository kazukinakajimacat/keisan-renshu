/*
  シール素材の いちらん
  ------------------------------------------------------------
  あたらしい シールを ふやす ときは：
    1. 画像（PNG・背景は透明・正方形・256px くらい）を この stickers フォルダに 入れる
    2. 下の リストの「いちばん さいご」に 1行 たす
         { id: "ファイル名と同じ英数字", name: "シールの なまえ（ひらがな）", file: "ファイル名.png" },
  ※ id は 一度 きめたら かえない（もらった シールの きろくに つかう ため）
  ※ 行の 順番も かえない・けさない（いちばん さいごに たすだけ）
  ※ まるい シール（背景つきの まる）は round: true を つけると、まる いっぱいに 大きく 表示される
  ※ もう ださない シールは 行を けさずに retired: true を つける（もらった シールは そのまま のこる）
*/
window.STICKERS = [
  { id: "nikukyu",    name: "にくきゅう",   file: "nikukyu.png", round: true, retired: true },
  { id: "hoshi2",     name: "きらきらぼし", file: "hoshi2.png", round: true, retired: true },
  { id: "onpu",       name: "おんぷ",       file: "onpu.png", round: true },
  { id: "heart2",     name: "ハート",       file: "heart2.png", round: true, retired: true },
  { id: "mii",        name: "みー",         file: "mii.png", round: true },
  { id: "koro",       name: "ころ",         file: "koro.png", round: true },
  { id: "enpitsu",    name: "えんぴつ",     file: "enpitsu.png", round: true, retired: true },
  { id: "hon",        name: "ほん",         file: "hon.png", round: true, retired: true },
  { id: "medal",      name: "メダル",       file: "medal.png", round: true, retired: true },
  { id: "niji",       name: "にじ",         file: "niji.png", round: true, retired: true },
  { id: "taiyou2",    name: "おひさま",     file: "taiyou2.png", round: true, retired: true },
  { id: "ouchi",      name: "おうち",       file: "ouchi.png", round: true },
  { id: "yokudekita", name: "よくできたね", file: "yokudekita.png", round: true },
  { id: "nikoboshi",  name: "にこにこぼし", file: "nikoboshi.png", round: true },
  { id: "ashiato",    name: "あしあと",     file: "ashiato.png", round: true },
  { id: "oukan",      name: "おうかん",     file: "oukan.png", round: true, retired: true },
  { id: "futaba",     name: "ふたば",       file: "futaba.png", round: true },
  // ---- 2026-10-03 追加：まるい シール 30まい ----
  { id: "mii_yatta", name: "みー やったー", file: "mii_yatta.png", round: true },
  { id: "koro_nikkori", name: "ころ にっこり", file: "koro_nikkori.png", round: true },
  { id: "nakayoshi", name: "なかよし", file: "nakayoshi.png", round: true },
  { id: "mii_jump", name: "みー ジャンプ", file: "mii_jump.png", round: true },
  { id: "koro_jump", name: "ころ ジャンプ", file: "koro_jump.png", round: true },
  { id: "haitatchi", name: "ハイタッチ", file: "haitatchi.png", round: true },
  { id: "gyu", name: "ぎゅー", file: "gyu.png", round: true },
  { id: "benkyou", name: "いっしょに べんきょう", file: "benkyou.png", round: true },
  { id: "dokusho", name: "いっしょに どくしょ", file: "dokusho.png", round: true },
  { id: "banzai", name: "ばんざい", file: "banzai.png", round: true },
  { id: "hoshi3", name: "おおきな ほし", file: "hoshi3.png", round: true },
  { id: "kirakira", name: "きらきら", file: "kirakira.png", round: true },
  { id: "niji2", name: "にじ", file: "niji2.png", round: true },
  { id: "taiyou3", name: "にこにこ たいよう", file: "taiyou3.png", round: true },
  { id: "tsuki2", name: "おつきさま", file: "tsuki2.png", round: true },
  { id: "heart3", name: "ハート", file: "heart3.png", round: true },
  { id: "oukan2", name: "おうかん", file: "oukan2.png", round: true },
  { id: "kinmedal", name: "きんメダル", file: "kinmedal.png", round: true },
  { id: "takarabako", name: "たからばこ", file: "takarabako.png", round: true },
  { id: "present", name: "プレゼント", file: "present.png", round: true },
  { id: "juu", name: "10", file: "juu.png", round: true },
  { id: "nikukyu2", name: "にくきゅう", file: "nikukyu2.png", round: true },
  { id: "enpitsu2", name: "えんぴつ", file: "enpitsu2.png", round: true },
  { id: "nooto", name: "ノート", file: "nooto.png", round: true },
  { id: "honnoyama", name: "ほんの やま", file: "honnoyama.png", round: true },
  { id: "onetwothree", name: "123", file: "onetwothree.png", round: true },
  { id: "mii_tewofuru", name: "みー てを ふる", file: "mii_tewofuru.png", round: true },
  { id: "koro_tewofuru", name: "ころ てを ふる", file: "koro_tewofuru.png", round: true },
  { id: "futari_hoshi", name: "ふたりと ほし", file: "futari_hoshi.png", round: true },
  { id: "futari_yoru", name: "ふたりの よる", file: "futari_yoru.png", round: true },
];
