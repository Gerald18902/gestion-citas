function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isOverlapping(startA, endA, startB, endB) {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);

  // Lógica de Detección de Solapamiento
  return aStart < bEnd && aEnd > bStart;
}

module.exports = { toMinutes, isOverlapping };
