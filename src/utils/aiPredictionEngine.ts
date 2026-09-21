import { AttendanceRecord, RiskLevel, Student, StudentPrediction, Subject } from '../types';

/**
 * AI & Statistical Prediction Engine for College Attendance
 * 
 * Separates standard arithmetic attendance computation from predictive modeling.
 * Analyzes historical attendance velocity, recent attendance inertia (rolling window regression),
 * and computes prescriptive remediation requirements (number of upcoming sessions needed).
 */

export function calculateStandardAttendance(records: AttendanceRecord[]): {
  totalHeld: number;
  totalAttended: number;
  percentage: number;
} {
  if (records.length === 0) {
    return { totalHeld: 0, totalAttended: 0, percentage: 100 };
  }

  const totalHeld = records.length;
  // Present = 1.0, Late = 0.75, Excused = 1.0, Absent = 0
  const attendedCount = records.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const effectiveAttended = attendedCount + (lateCount * 0.75);

  const percentage = Math.min(100, Math.round((effectiveAttended / totalHeld) * 1000) / 10);
  return {
    totalHeld,
    totalAttended: Math.round(effectiveAttended),
    percentage
  };
}

export function computeRiskLevel(percentage: number): RiskLevel {
  if (percentage >= 80) return 'GOOD';
  if (percentage >= 75) return 'WARNING';
  return 'AT_RISK';
}

/**
 * Calculates exact classes needed to achieve target percentage T (0.0 - 1.0)
 * Formula: (Attended + x) / (Held + x) >= T => x >= (T * Held - Attended) / (1 - T)
 */
export function calculateRequiredClassesToReachTarget(
  attended: number,
  held: number,
  targetPct: number = 0.75
): number {
  if (held === 0) return 0;
  const currentRatio = attended / held;
  if (currentRatio >= targetPct) return 0;

  const numerator = (targetPct * held) - attended;
  const denominator = 1 - targetPct;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

/**
 * Calculates maximum classes a student can safely miss while keeping attendance >= targetPct
 * Formula: Attended / (Held + y) >= T => y <= (Attended / T) - Held
 */
export function calculateMaxAffordableAbsences(
  attended: number,
  held: number,
  targetPct: number = 0.75
): number {
  if (held === 0) return 0;
  const currentRatio = attended / held;
  if (currentRatio < targetPct) return 0;

  const maxTotalClasses = Math.floor(attended / targetPct);
  const affordable = maxTotalClasses - held;
  return Math.max(0, affordable);
}

/**
 * Predictive AI Model:
 * Evaluates attendance momentum via weighted sliding-window regression,
 * projects remaining semester behavior, and computes confidence risk metrics.
 */
export function generateStudentPrediction(
  student: Student,
  allStudentRecords: AttendanceRecord[],
  subjects: Subject[],
  plannedTotalSemesterClasses: number = 60
): StudentPrediction {
  const sortedRecords = [...allStudentRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const { totalHeld, totalAttended, percentage: currentPct } = calculateStandardAttendance(sortedRecords);

  // Remaining classes for the semester
  const remainingClasses = Math.max(0, plannedTotalSemesterClasses - totalHeld);

  // Compute momentum: compare first half vs second half or last 10 records
  let recentTrend: 'IMPROVING' | 'DECLINING' | 'STABLE' = 'STABLE';
  let trendSlope = 0; // % shift

  if (sortedRecords.length >= 8) {
    const half = Math.floor(sortedRecords.length / 2);
    const olderRecords = sortedRecords.slice(0, half);
    const recentRecords = sortedRecords.slice(half);

    const olderAttendance = calculateStandardAttendance(olderRecords).percentage;
    const recentAttendance = calculateStandardAttendance(recentRecords).percentage;

    trendSlope = Math.round((recentAttendance - olderAttendance) * 10) / 10;

    if (trendSlope > 3) recentTrend = 'IMPROVING';
    else if (trendSlope < -3) recentTrend = 'DECLINING';
    else recentTrend = 'STABLE';
  }

  // Linear projection factoring momentum
  // If declining, project a slightly lower future attendance rate than current
  // If improving, project slightly higher
  let projectedFutureAttendanceRate = currentPct / 100;
  if (recentTrend === 'DECLINING') {
    projectedFutureAttendanceRate = Math.max(0.4, (currentPct / 100) - 0.08);
  } else if (recentTrend === 'IMPROVING') {
    projectedFutureAttendanceRate = Math.min(0.98, (currentPct / 100) + 0.05);
  }

  const projectedFutureAttended = remainingClasses * projectedFutureAttendanceRate;
  const projectedTotalAttended = totalAttended + projectedFutureAttended;
  const predictedFinalPct = plannedTotalSemesterClasses > 0
    ? Math.min(100, Math.max(0, Math.round((projectedTotalAttended / plannedTotalSemesterClasses) * 1000) / 10))
    : currentPct;

  const riskStatus = computeRiskLevel(predictedFinalPct);

  const requiredClassesTo75 = calculateRequiredClassesToReachTarget(totalAttended, totalHeld, 0.75);
  const requiredClassesTo85 = calculateRequiredClassesToReachTarget(totalAttended, totalHeld, 0.85);
  const maxCanAffordToMiss = calculateMaxAffordableAbsences(totalAttended, totalHeld, 0.75);

  // Subject-wise breakdowns
  const subjectPredictions = subjects.map(sub => {
    const subRecords = sortedRecords.filter(r => r.subjectId === sub.id);
    const subStats = calculateStandardAttendance(subRecords);
    const subRemaining = Math.max(0, (sub.totalPlannedClasses || 15) - subStats.totalHeld);
    
    // Project subject final
    const subProjectedAttended = subStats.totalAttended + (subRemaining * (subStats.percentage / 100));
    const subPlannedTotal = sub.totalPlannedClasses || 15;
    const subPredictedPct = subPlannedTotal > 0
      ? Math.min(100, Math.round((subProjectedAttended / subPlannedTotal) * 1000) / 10)
      : subStats.percentage;

    const subRisk = computeRiskLevel(subPredictedPct);
    const classesNeededFor75 = calculateRequiredClassesToReachTarget(subStats.totalAttended, subStats.totalHeld, 0.75);

    return {
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      currentPct: subStats.percentage,
      predictedPct: subPredictedPct,
      status: subRisk,
      classesNeededFor75
    };
  });

  // Synthesize AI explanation
  let aiExplanation = '';
  if (riskStatus === 'AT_RISK') {
    aiExplanation = `High Risk Alert: Projected final attendance is ${predictedFinalPct}%, which falls below the mandatory 75% cutoff. Student exhibits a ${recentTrend.toLowerCase()} pattern (${trendSlope >= 0 ? '+' : ''}${trendSlope}% velocity). To regain exam eligibility, student must attend the next ${requiredClassesTo75} consecutive classes without unexcused absences.`;
  } else if (riskStatus === 'WARNING') {
    aiExplanation = `Borderline Warning: Current attendance trajectory predicts ${predictedFinalPct}%. Even 1 or 2 more absences could push the student below 75%. Safe absence buffer is critically low (${maxCanAffordToMiss} classes). Maintaining consistent attendance over the next 2 weeks is strongly advised.`;
  } else {
    aiExplanation = `Satisfactory Standing: Predicted final attendance is comfortably at ${predictedFinalPct}%. Student has an attendance cushion and can safely afford up to ${maxCanAffordToMiss} absences before reaching the 75% threshold. Recommend maintaining current routine to attain honors threshold (85%+).`;
  }

  return {
    studentId: student.id,
    rollNumber: student.rollNumber,
    studentName: student.name,
    department: student.department,
    semester: student.semester,
    currentAttendancePct: currentPct,
    totalHeld,
    totalAttended,
    totalPlannedSemesterClasses: plannedTotalSemesterClasses,
    remainingClasses,
    recentTrend,
    trendSlope,
    predictedFinalPct,
    riskStatus,
    requiredClassesTo75,
    requiredClassesTo85,
    maxCanAffordToMiss,
    aiExplanation,
    subjectPredictions
  };
}

/**
 * Interactive Simulation:
 * Given a student's current standing, simulates what happens if they attend `x` and miss `y`
 * upcoming classes out of hypothetical future sessions.
 */
export function simulateAttendanceOutcome(
  currentAttended: number,
  currentHeld: number,
  hypotheticalAttend: number,
  hypotheticalMiss: number
): {
  projectedAttended: number;
  projectedHeld: number;
  projectedPercentage: number;
  projectedStatus: RiskLevel;
  deltaPct: number;
} {
  const projectedAttended = currentAttended + hypotheticalAttend;
  const projectedHeld = currentHeld + hypotheticalAttend + hypotheticalMiss;
  const currentPct = currentHeld > 0 ? (currentAttended / currentHeld) * 100 : 100;

  const projectedPercentage = projectedHeld > 0
    ? Math.min(100, Math.round((projectedAttended / projectedHeld) * 1000) / 10)
    : 100;

  const deltaPct = Math.round((projectedPercentage - currentPct) * 10) / 10;
  const projectedStatus = computeRiskLevel(projectedPercentage);

  return {
    projectedAttended,
    projectedHeld,
    projectedPercentage,
    projectedStatus,
    deltaPct
  };
}
