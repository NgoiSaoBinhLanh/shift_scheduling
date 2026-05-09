export class FitnessCalculator {
  static calculate(evaluationResult) {
    const { hardPenalty, softPenalty, totalCost } = evaluationResult;
    const objectiveFunctionValue = totalCost + hardPenalty + softPenalty;
    const fitnessScore = 1 / (1 + objectiveFunctionValue);
    
    return { fitnessScore, objectiveFunctionValue };
  }
}