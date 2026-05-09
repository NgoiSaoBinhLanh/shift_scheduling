// src/algorithms/base/Algorithm.js
export class BaseAlgorithm {
  constructor(employees, shifts, constraintEngine) {
    this.employees = employees;
    this.shifts = shifts;
    this.constraintEngine = constraintEngine;
  }
  
  async solve() {
    throw new Error("Method 'solve()' must be implemented.");
  }

  generateRandomSchedule() {
    const schedule = [];
    for (const shift of this.shifts) {
      // 1. Lọc và XÁO TRỘN ngẫu nhiên danh sách Bác sĩ
      const availableDocs = this.employees
        .filter(e => e.role === 'DOCTOR' && e.department === shift.department)
        .sort(() => 0.5 - Math.random()); // Thuật toán xáo trộn

      // Chỉ lấy đúng số lượng cần, không bốc lại người cũ
      for(let i = 0; i < (shift.requiredDoctors || 1); i++) {
        if(availableDocs[i]) schedule.push({ employeeId: availableDocs[i].id, shiftId: shift.id });
      }

      // 2. Tương tự cho Điều dưỡng
      const availableNurses = this.employees
        .filter(e => e.role === 'NURSE' && e.department === shift.department)
        .sort(() => 0.5 - Math.random());

      for(let i = 0; i < (shift.requiredNurses || 2); i++) {
        if(availableNurses[i]) schedule.push({ employeeId: availableNurses[i].id, shiftId: shift.id });
      }
    }
    return schedule;
  }
}