const test=require("node:test");
const assert=require("node:assert/strict");
const {parseReportTime,japanDayKey,formatReportDate}=require("../src/dateTime.cjs");
test("JST when source omits timezone",()=>{
  assert.equal(parseReportTime("2026/11/23 09:30:00").toISOString(),"2026-11-23T00:30:00.000Z");
});
test("localized Today only for the same calendar day in Japan",()=>{
  const now=new Date("2026-11-23T02:00:00Z");
  assert.match(formatReportDate("2026-11-23T00:30:00Z","vi","Hôm nay",now),/^Hôm nay · /);
  assert.doesNotMatch(formatReportDate("2026-11-22T14:30:00Z","vi","Hôm nay",now),/^Hôm nay/);
  assert.equal(japanDayKey(now),"2026-11-23");
});
test("Tokyo day rollover applies even while UTC remains yesterday",()=>{
  const now=new Date("2026-11-22T15:15:00Z");
  assert.match(formatReportDate("2026/11/23 00:10:00","ja","今日",now),/^今日 · /);
});
test("invalid, empty and zoned timestamps",()=>{
  assert.equal(formatReportDate("invalid","en","Today"),"invalid");
  assert.equal(formatReportDate(null,"en","Today"),"—");
  assert.equal(parseReportTime("2026-11-23T00:30:00+09:00").toISOString(),"2026-11-22T15:30:00.000Z");
});
