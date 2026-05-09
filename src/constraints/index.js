export class ConstraintEngine {
  constructor(employees, shifts) {
    this.employees = employees;
    this.shifts = shifts;
    this.SHIFT_HOURS = 8;
  }

  evaluate(schedule) {
    let hardPenalty = 0;
    let softPenalty = 0;
    let totalCost = 0;
    const violations = [];

    // Map schedule assignments
    const employeeSchedules = new Map(this.employees.map(e => [e.id, []]));
    const shiftFulfillment = new Map(this.shifts.map(s => [s.id, { DOCTOR: 0, NURSE: 0 }]));

    for (const assignment of schedule) {
      employeeSchedules.get(assignment.employeeId).push(assignment.shiftId);
      const emp = this.employees.find(e => e.id === assignment.employeeId);
      shiftFulfillment.get(assignment.shiftId)[emp.role]++;
      totalCost += emp.wagePerHour * this.SHIFT_HOURS;
    }

    // 1. Hard Constraints
    // Đủ nhân sự mỗi ca
    for (const shift of this.shifts) {
      const fulfillment = shiftFulfillment.get(shift.id);
      if (fulfillment.DOCTOR < shift.requiredDoctors) {
        hardPenalty += (shift.requiredDoctors - fulfillment.DOCTOR) * 10000;
        violations.push(`Shift ${shift.id}: Thiếu Doctor`);
      }
      if (fulfillment.NURSE < shift.requiredNurses) {
        hardPenalty += (shift.requiredNurses - fulfillment.NURSE) * 10000;
        violations.push(`Shift ${shift.id}: Thiếu Nurse`);
      }
    }

    // Giới hạn giờ làm & Trùng ca & Nghỉ sau Night Shift
    for (const [empId, empShiftIds] of employeeSchedules.entries()) {
      const emp = this.employees.find(e => e.id === empId);
      const empShifts = empShiftIds.map(id => this.shifts.find(s => s.id === id)).sort((a,b) => a.dayOfWeek - b.dayOfWeek);
      
      // Không vượt max hours
      if (empShifts.length * this.SHIFT_HOURS > emp.maxHoursPerWeek) {
        hardPenalty += 5000;
        violations.push(`${emp.name}: Vượt max hours`);
      }

      // Kiểm tra trùng ngày và Night shift logic
      const daysWorked = new Set();
      for (let i = 0; i < empShifts.length; i++) {
        const s = empShifts[i];
        if (daysWorked.has(s.dayOfWeek)) {
          hardPenalty += 10000; // Trùng 2 ca 1 ngày
          violations.push(`${emp.name}: Làm 2 ca 1 ngày`);
        }
        daysWorked.add(s.dayOfWeek);

        // Nghỉ tối thiểu sau Night Shift (không làm morning hôm sau)
        if (s.shiftType === 'NIGHT' && i < empShifts.length - 1) {
          const nextShift = empShifts[i+1];
          if (nextShift.dayOfWeek === s.dayOfWeek + 1 && nextShift.shiftType === 'MORNING') {
             hardPenalty += 10000;
             violations.push(`${emp.name}: Không nghỉ sau Night shift`);
          }
        }

        // Soft Constraint: Preferred Shift
        if (emp.preferredShift && s.shiftType !== emp.preferredShift) {
          softPenalty += 100;
        }
      }
    }

    return { hardPenalty, softPenalty, totalCost, violations };
  }
}