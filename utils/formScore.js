async function calculateFormScore(userIds, allReports, allResults, questionMap, formIds, forms) {
  // related reports for users
  const reportRows = (allReports ?? []).filter(r =>
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

  // 5) aggregate per form_id and track latest formDate
  const formAgg = {}; // form_id -> { scoreSum, countSum, latestDate }
  for (const [reportIdStr, scoreSum] of Object.entries(reportScores)) {
    const reportId = Number(reportIdStr);
    const formId = reportIdToFormId[reportId];
    if (formId == null) continue;

    const countSum = reportCounts[reportId];
    const createdAt = reportIdToDate.get(reportId); // Date or ISO string

    if (!formAgg[formId]) {
      formAgg[formId] = { scoreSum: 0, countSum: 0, latestDate: createdAt ?? null };
    }
    formAgg[formId].scoreSum += scoreSum;
    formAgg[formId].countSum += countSum;

    // keep the most recent createdAt
    if (createdAt) {
      const prev = formAgg[formId].latestDate;
      formAgg[formId].latestDate =
        (!prev || new Date(createdAt) > new Date(prev)) ? createdAt : prev;
    }
  }

  // 6) build the array (with code and formDate)
  const formScoreArray = (formIds ?? []).map(id => {
    const agg = formAgg[id] || { scoreSum: 0, countSum: 0, latestDate: null };
    const avg = agg.countSum > 0 ? agg.scoreSum / agg.countSum : 0;
    const form = formsById.get(id);

    return {
      form_id: id,
      formDate: agg.latestDate,              // 👈 createdAt of the latest contributing report
      code: form ? form.code : null,
      average_score: avg
    };
  });

  return formScoreArray;
}

module.exports = { calculateFormScore };