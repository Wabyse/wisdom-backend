async function calculateIndividualFormScore(userIds, allReports, allResults, questionMap, formIds, forms) {
  const reportIds = allReports
    .filter(r => userIds.includes(r.Assessor_id))
    .map(r => r.id);

  const relevantResults = allResults.filter(r => reportIds.includes(r.report_id));

  const reportScores = {};
  const reportCounts = {};

  relevantResults.forEach(result => {
    const qMeta = questionMap[result.question_id];
    if (!qMeta) return;

    const normalizedScore = result.score / qMeta.max_score;

    if (!reportScores[result.report_id]) {
      reportScores[result.report_id] = 0;
      reportCounts[result.report_id] = 0;
    }

    reportScores[result.report_id] += normalizedScore;
    reportCounts[result.report_id] += 1;
  });

  const formScores = {};
  const formCounts = {};

  for (const [reportId, totalScore] of Object.entries(reportScores)) {
    const relatedResult = relevantResults.find(r => r.report_id === Number(reportId));
    if (!relatedResult) continue;

    const qMeta = questionMap[relatedResult.question_id];
    if (!qMeta) continue;

    const formId = qMeta.form_id;

    if (!formScores[formId]) {
      formScores[formId] = 0;
      formCounts[formId] = 0;
    }

    formScores[formId] += totalScore;
    formCounts[formId] += reportCounts[reportId];
  }

  const formScoreArray = formIds
    .filter(id => formScores[id])
    .map(id => ({
      form_id: id,
      code: forms.find(f => f.id === id).code,
      average_score: formCounts[id] > 0 ? formScores[id] / formCounts[id] : 0
    }));

  return formScoreArray;
}

module.exports = { calculateIndividualFormScore };