export function getApsScoreDisplay(score, maximumScore, universityId) {
  const hasScore = Number.isFinite(score) && Number.isFinite(maximumScore);
  const isNmuApplicantScore = hasScore && universityId === "nmu" && maximumScore === 600;
  const displayedScore = hasScore ? score : null;
  const displayedMaximum = maximumScore;
  let scaleLabel = isNmuApplicantScore ? "AS out of 600" : "APS";
  let accessibilityLabel;

  if (hasScore) {
    scaleLabel = isNmuApplicantScore
      ? "Applicant Score out of 600"
      : `out of ${displayedMaximum}`;
  }
  if (isNmuApplicantScore) {
    accessibilityLabel = `Nelson Mandela University Applicant Score ${displayedScore} out of 600`;
  } else {
    accessibilityLabel = `APS score ${displayedScore ?? "unavailable"}${hasScore ? ` out of ${displayedMaximum}` : ""}`;
  }

  return {
    score: displayedScore,
    maximumScore: displayedMaximum,
    scaleLabel,
    accessibilityLabel,
  };
}
