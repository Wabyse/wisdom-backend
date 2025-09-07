async function calculateFormScore(userIds, allReports, allResults, questionMap, formIds, forms) {
  // related reports for users
  const reportRows = (allReports[0] ?? []).filter(r =>
    userIds.includes(r.Assessor_id ?? r.user_id)
  );
  const reportIds = reportRows.map(r => r.id);

  // quick lookups
  const reportIdToDate = new Map(reportRows.map(r => [r.id, r.createdAt]));
  const formsById = new Map((forms ?? []).map(f => [f.id, f]));

  // only results for those reports
  const relevantResults = (allResults ?? []).filter(r => reportIds.includes(r.report_id));

  // sum of normalized scores & count
  const reportScores = {};
  const reportCounts = {};
  for (const result of relevantResults) {
    const qMeta = questionMap[result.question_id];
    if (!qMeta || !qMeta.max_score) continue;

    const norm = result.score / qMeta.max_score;

    if (!reportScores[result.report_id]) {
      reportScores[result.report_id] = 0;
      reportCounts[result.report_id] = 0;
    }
    reportScores[result.report_id] += norm;
    reportCounts[result.report_id] += 1;
  }

  // 4) map each report_id -> form_id (from the first result we see)
  const reportIdToFormId = {};
  for (const r of relevantResults) {
    if (reportIdToFormId[r.report_id] == null) {
      const qMeta = questionMap[r.question_id];
      if (qMeta?.form_id != null) reportIdToFormId[r.report_id] = qMeta.form_id;
    }
  }

  const reportAvg = {}; // form_id -> { [reportId]: { score, latestDate } }
  for (const [reportIdStr, scoreSum] of Object.entries(reportScores)) {
    const reportId = Number(reportIdStr);
    const formId = reportIdToFormId[reportId];
    if (formId == null) continue;

    const countSum = reportCounts[reportId] || 0;
    if (!countSum) continue; // avoid divide-by-zero

    const createdAt = reportIdToDate.get(reportId) ?? null;

    // init containers
    if (!reportAvg[formId]) reportAvg[formId] = {};
    if (!reportAvg[formId][reportId]) {
      reportAvg[formId][reportId] = { score: 0, date: null };
    }

    // set score
    reportAvg[formId][reportId].score = scoreSum / countSum;

    // keep the latest date per report (optional)
    const prev = reportAvg[formId][reportId].date;
    reportAvg[formId][reportId].date =
      prev && createdAt ? (new Date(prev) > new Date(createdAt) ? prev : createdAt)
        : (createdAt || prev);
  }

  const reportArray = []
  for (const [formId, reports] of Object.entries(reportAvg)) {
    const form = formsById.get(Number(formId));
    for (const [reportId, data] of Object.entries(reports)) {
      reportArray.push({
        formId: formId,
        code: form ? form.code : null,
        reportId,
        average_score: data.score,
        formDate: data.date
      })
    }
  }

  return reportArray;
}

module.exports = { calculateFormScore };