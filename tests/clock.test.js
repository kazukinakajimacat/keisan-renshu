// とけいの 計算の テスト（実行：node tests/clock.test.js）
const assert = require("node:assert/strict");
const { ClockMath: C } = require("../clock/clock.js");

const eq = (got, h, m, label) => assert.deepEqual(got, { h, m }, label);

// 12時間表記で 正しく 回る（指定の 6れい）
eq(C.add(11, 50, 20), 12, 10, "11:50 + 20分 = 12:10");
eq(C.add(12, 50, 20), 1, 10, "12:50 + 20分 = 1:10");
eq(C.add(3, 50, 30), 4, 20, "3:50 + 30分 = 4:20");
eq(C.add(5, 10, -20), 4, 50, "5:10 - 20分 = 4:50");
eq(C.add(1, 10, -20), 12, 50, "1:10 - 20分 = 12:50");
eq(C.add(12, 10, -20), 11, 50, "12:10 - 20分 = 11:50");

// 0時相当は 12時
eq(C.fromTotal(0), 12, 0, "0分 → 12:00");
eq(C.fromTotal(720), 12, 0, "720分 → 12:00");
assert.equal(C.toTotal(12, 0), 0);
assert.equal(C.toTotal(11, 59), 719);

// 針の 角度
assert.equal(C.hourAngle(3, 0), 90, "3:00 の 短針は 3");
assert.equal(C.hourAngle(3, 30), 105, "3:30 の 短針は 3と4の まんなか");
assert.equal(C.hourAngle(3, 50), 115, "3:50 の 短針は 4に ちかい");
assert.equal(C.hourAngle(12, 0), 0);
assert.equal(C.minuteAngle(30), 180);
assert.equal(C.minuteAngle(0), 0);

// ぜんぶの 時刻で 行って もどると もとに もどる
for(let h = 1; h <= 12; h++) for(let m = 0; m < 60; m += 5) for(const d of [10, 20, 30, 40, 50]){
  const f = C.add(h, m, d), b = C.add(f.h, f.m, -d);
  eq(b, h, m, `${h}:${m} ±${d}`);
  assert.ok(f.h >= 1 && f.h <= 12 && f.m >= 0 && f.m < 60);
}

// ひょうじ
assert.equal(C.fmt(3, 0), "3じ");
assert.equal(C.fmt(7, 30), "7じ30ぷん");
assert.equal(C.fmt(4, 10), "4じ10ぷん");
assert.equal(C.fmt(2, 20), "2じ20ぷん");
assert.equal(C.fmt(2, 50), "2じ50ぷん");
assert.ok(C.same({ h: 12, m: 0 }, { h: 12, m: 0 }));

console.log("clock tests: all passed");
