// Device-independent camera viewport calculation for map selection.
// Bounds intentionally include both the user and the selected verified
// event coordinate, never a guessed center for region-only warnings.
const valid = (p) => p && Number.isFinite(Number(p.latitude)) &&
 Number.isFinite(Number(p.longitude)) &&
 Number(p.latitude) >= -90 && Number(p.latitude) <= 90 &&
 Number(p.longitude) >= -180 && Number(p.longitude) <= 180;
function boundsForPoints(points) {
  const list = (Array.isArray(points) ? points : []).filter(valid);
  if (list.length < 2) return null;
  const latitudes = list.map((p) => Number(p.latitude));
  const longitudes = list.map((p) => Number(p.longitude));
  let west = Math.min(...longitudes), east = Math.max(...longitudes);
  let south = Math.min(...latitudes), north = Math.max(...latitudes);
  // Maps look cramped if markers touch the same spot or the same parallel.
  if (east-west < 0.03) { const mid=(west+east)/2;west=mid-0.015;east=mid+0.015; }
  if (north-south < 0.03) { const mid=(north+south)/2;south=mid-0.015;north=mid+0.015; }
  return [Math.max(-180, west),Math.max(-85,south),Math.min(180,east),Math.min(85,north)];
}
module.exports = { valid, boundsForPoints };
