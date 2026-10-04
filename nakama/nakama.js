/*
  なかまの いちらん
  ------------------------------------------------------------
  あたらしい なかまを ふやす ときは：
    1. nakama/<id>/ フォルダに え を いれる
       egg_n, egg_h, baby_n/h/s, child_n/h/s, young_n/h/s, adult_n/h/s, elder_n/h/s, depart, letter（すべて .webp）
       letter（いえでの てがみ）が ない ときは nakama/letter.webp を つかう
       _n＝ふつう、_h＝よろこび、_s＝しょんぼり
    2. 下の リストの「いちばん さいご」に 1行 たす
         { id: "フォルダ名", name: "しゅるいの なまえ（ひらがな）", young: "おとめ" か "せいねん" },
  ※ id は 一度 きめたら かえない・行を けさない
*/
window.NAKAMA = [
  { id: "popura", name: "ぽぷら", young: "おとめ" },
  { id: "gorosuke", name: "ごろすけ", young: "せいねん" },
  { id: "fuwarin", name: "ふわりん", young: "おとめ" },
  { id: "shizuku", name: "しずく", young: "しょうねん" },
  { id: "komugi", name: "こむぎ", young: "おとめ" },
  { id: "tomoshi", name: "ともし", young: "せいねん" },
  { id: "sarara", name: "さらら", young: "おとめ" },
  { id: "hotarubi", name: "ほたるび", young: "しょうねん" },
  { id: "sangorou", name: "さんごろう", young: "せいねん" },
  { id: "sunamaru", name: "すなまる", young: "しょうねん" },
];
