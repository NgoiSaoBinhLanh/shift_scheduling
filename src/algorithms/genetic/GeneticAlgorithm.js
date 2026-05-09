import { BaseAlgorithm } from '../base/Algorithm.js';
import { FitnessCalculator } from '../../fitness/index.js';

export class GeneticAlgorithm extends BaseAlgorithm {
  constructor(employees, shifts, constraintEngine, config = {}) {
    super(employees, shifts, constraintEngine);
    this.populationSize = config.populationSize || 100;
    this.maxGenerations = config.maxGenerations || 100;
    this.mutationRate = config.mutationRate || 0.1;
    this.crossoverRate = config.crossoverRate || 0.8;
  }

  async solve() {
    const startTime = performance.now();
    let population = Array.from({ length: this.populationSize }, () => this.generateRandomSchedule());
    let bestSchedule = null;
    let bestFitness = -1;
    let bestEval = null;

    for (let gen = 0; gen < this.maxGenerations; gen++) {
      // Đánh giá fitness
      const scoredPopulation = population.map(schedule => {
        const evalResult = this.constraintEngine.evaluate(schedule);
        const { fitnessScore } = FitnessCalculator.calculate(evalResult);
        if (fitnessScore > bestFitness) {
          bestFitness = fitnessScore;
          bestSchedule = JSON.parse(JSON.stringify(schedule));
          bestEval = evalResult;
        }
        return { schedule, fitnessScore };
      });

      // Selection (Roulette Wheel) & Elitism
      const newPopulation = [bestSchedule]; // Elitism
      
      while (newPopulation.length < this.populationSize) {
        let parent1 = this.select(scoredPopulation);
        let parent2 = this.select(scoredPopulation);
        
        // Crossover
        let child = Math.random() < this.crossoverRate ? this.crossover(parent1, parent2) : parent1;
        
        // Mutation
        if (Math.random() < this.mutationRate) {
          child = this.mutate(child);
        }
        newPopulation.push(child);
      }
      population = newPopulation;
    }

    const runtime = performance.now() - startTime;
    return { schedule: bestSchedule, ...bestEval, fitnessScore: bestFitness, runtime };
  }

  select(scoredPopulation) {
    const totalFitness = scoredPopulation.reduce((sum, ind) => sum + ind.fitnessScore, 0);
    let random = Math.random() * totalFitness;
    for (const ind of scoredPopulation) {
      random -= ind.fitnessScore;
      if (random <= 0) return ind.schedule;
    }
    return scoredPopulation[0].schedule;
  }

  crossover(parent1, parent2) {
    const midpoint = Math.floor(parent1.length / 2);
    return [...parent1.slice(0, midpoint), ...parent2.slice(midpoint)];
  }

  mutate(schedule) {
    const mutated = [...schedule];
    const index = Math.floor(Math.random() * mutated.length);
    const shift = this.shifts.find(s => s.id === mutated[index].shiftId);
    
    // Đổi người làm
    const validEmployees = this.employees.filter(e => e.department === shift.department);
    const newEmp = validEmployees[Math.floor(Math.random() * validEmployees.length)];
    if(newEmp) {
        mutated[index] = { employeeId: newEmp.id, shiftId: shift.id };
    }
    return mutated;
  }
}