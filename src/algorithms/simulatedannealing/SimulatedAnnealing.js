import { BaseAlgorithm } from '../base/Algorithm.js';
import { FitnessCalculator } from '../../fitness/index.js';

export class SimulatedAnnealing extends BaseAlgorithm {
  constructor(employees, shifts, constraintEngine, config = {}) {
    super(employees, shifts, constraintEngine);
    this.initialTemp = config.initialTemperature || 1000;
    this.coolingRate = config.coolingRate || 0.95;
    this.minTemp = config.minimumTemperature || 1;
  }

  async solve() {
    const startTime = performance.now();
    let currentSchedule = this.generateRandomSchedule();
    let currentEval = this.constraintEngine.evaluate(currentSchedule);
    let currentEnergy = currentEval.hardPenalty + currentEval.softPenalty + currentEval.totalCost;
    
    let bestSchedule = currentSchedule;
    let bestEval = currentEval;
    let bestEnergy = currentEnergy;

    let temp = this.initialTemp;

    while (temp > this.minTemp) {
      const neighbor = this.generateNeighbor(currentSchedule);
      const neighborEval = this.constraintEngine.evaluate(neighbor);
      const neighborEnergy = neighborEval.hardPenalty + neighborEval.softPenalty + neighborEval.totalCost;

      // Acceptance Probability: P = exp(-ΔE/T)
      if (neighborEnergy < currentEnergy || Math.random() < Math.exp((currentEnergy - neighborEnergy) / temp)) {
        currentSchedule = neighbor;
        currentEnergy = neighborEnergy;
        currentEval = neighborEval;

        if (currentEnergy < bestEnergy) {
          bestSchedule = currentSchedule;
          bestEnergy = currentEnergy;
          bestEval = currentEval;
        }
      }
      temp *= this.coolingRate;
    }

    const { fitnessScore } = FitnessCalculator.calculate(bestEval);
    const runtime = performance.now() - startTime;
    return { schedule: bestSchedule, ...bestEval, fitnessScore, runtime };
  }

  generateNeighbor(schedule) {
    const neighbor = [...schedule];
    const index = Math.floor(Math.random() * neighbor.length);
    const shift = this.shifts.find(s => s.id === neighbor[index].shiftId);
    
    const validEmployees = this.employees.filter(e => e.department === shift.department);
    const newEmp = validEmployees[Math.floor(Math.random() * validEmployees.length)];
    if(newEmp) neighbor[index] = { employeeId: newEmp.id, shiftId: shift.id };
    
    return neighbor;
  }
}