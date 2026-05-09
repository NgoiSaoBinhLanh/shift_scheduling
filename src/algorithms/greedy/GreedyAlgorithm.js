// src/algorithms/greedy/GreedyAlgorithm.js
import { BaseAlgorithm } from '../base/Algorithm.js';

export class GreedyAlgorithm extends BaseAlgorithm {
  constructor(employees, shifts, constraintEngine) {
    super(employees, shifts, constraintEngine);
  }

  async solve() {
    const startTime = performance.now();
    const schedule = [];
    
    // Theo dõi khối lượng công việc để chia đều, tránh bóc lột 1 người
    const workload = {};
    this.employees.forEach(e => workload[e.id] = 0);

    for (const shift of this.shifts) {
      // Ưu tiên chọn bác sĩ cùng khoa đang có SỐ CA LÀM ÍT NHẤT
      const docs = this.employees
        .filter(e => e.role === 'DOCTOR' && e.department === shift.department)
        .sort((a, b) => workload[a.id] - workload[b.id]);

      for (let i = 0; i < (shift.requiredDoctors || 1); i++) {
        if (docs[i]) {
          schedule.push({ employeeId: docs[i].id, shiftId: shift.id });
          workload[docs[i].id]++; // Tăng số ca của người này lên
        }
      }

      // Tương tự cho Điều dưỡng
      const nurses = this.employees
        .filter(e => e.role === 'NURSE' && e.department === shift.department)
        .sort((a, b) => workload[a.id] - workload[b.id]);

      for (let i = 0; i < (shift.requiredNurses || 2); i++) {
        if (nurses[i]) {
          schedule.push({ employeeId: nurses[i].id, shiftId: shift.id });
          workload[nurses[i].id]++;
        }
      }
    }

    const evalResult = this.constraintEngine.evaluate(schedule);
    const runtime = performance.now() - startTime;

    return { 
      schedule, 
      ...evalResult, 
      fitnessScore: 0, 
      runtime 
    };
  }
}