// A tsunami title may contain multiple known Japanese coastal regions.
// Transliterate a joined headline only if EVERY Japanese component has a
// verified reading, preserving the ordering and all separators.
const JAPANESE=/[\u3040-\u30ff\u3400-\u9fff]/;
const KANJI=/[\u3400-\u9fff]/;
const SPLIT=/(\s+[·•]\s+|、|，|,\s*|\s+\/\s+|\s+\|\s+)/u;
function composeReadings(value,getReading) {
  const text=String(value||"").trim();
  const parts=text.split(SPLIT);
  if (parts.length<3)return "";
  let convertedCount=0;
  const result=parts.map((part,index)=>{
    if(index%2===1)return part;
    if(!JAPANESE.test(part))return part;
    const reading=getReading(part.trim());
    if(typeof reading!=="string"||!reading.trim()||KANJI.test(reading))return null;
    convertedCount++;
    return reading.trim();
  });
  return convertedCount>0 && result.every((p)=>p!==null) ? result.join("") : "";
}
module.exports={composeReadings};
