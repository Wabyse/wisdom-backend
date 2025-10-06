const monthsArabic = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

function getArabicMonthName(date) {
  const monthIndex = new Date(date).getMonth();
  return monthsArabic[monthIndex];
}

module.exports = { monthsArabic, getArabicMonthName };