export function getApsScoreDisplay(score, maximumScore, universityId) {
  const hasScore = Number.isFinite(score) && Number.isFinite(maximumScore);
  const isNmuApplicantScore = hasScore && universityId === "nmu" && maximumScore === 600;
  const displayedScore = isNmuApplicantScore
    ? Math.min(49, Math.floor(score / 10))
    : hasScore ? score : null;
  const displayedMaximum = isNmuApplicantScore ? 49 : maximumScore;
  let scaleLabel = isNmuApplicantScore ? "APS estimate out of 49" : "APS";
  let accessibilityLabel;

  if (hasScore) {
    scaleLabel = isNmuApplicantScore
      ? "APS estimate out of 49"
      : `out of ${displayedMaximum}`;
  }
  if (isNmuApplicantScore) {
    accessibilityLabel = `Nelson Mandela University scaled APS estimate ${displayedScore} out of 49`;
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
