import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.assignment.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.scheduleResult.deleteMany();

  // 20 Employees Data
  const employeesData = [
    { name: 'Khánh Long', role: 'DOCTOR', department: 'ICU', preferredShift: 'MORNING', wagePerHour: 50 },
  { name: 'Diệu Tâm', role: 'DOCTOR', department: 'ICU', preferredShift: 'NIGHT', wagePerHour: 52 },
  { name: 'Minh Hoàng', role: 'DOCTOR', department: 'ICU', preferredShift: 'AFTERNOON', wagePerHour: 50 },
  { name: 'Quốc Bảo', role: 'DOCTOR', department: 'ICU', preferredShift: 'MORNING', wagePerHour: 51 },
  { name: 'John Doe', role: 'DOCTOR', department: 'Emergency', preferredShift: 'AFTERNOON', wagePerHour: 48 },
  { name: 'Jane Smith', role: 'DOCTOR', department: 'Emergency', preferredShift: 'MORNING', wagePerHour: 49 },
  { name: 'Thanh Trúc', role: 'DOCTOR', department: 'Emergency', preferredShift: 'NIGHT', wagePerHour: 53 },
  { name: 'Phương Linh', role: 'DOCTOR', department: 'Emergency', preferredShift: 'AFTERNOON', wagePerHour: 48 },
  { name: 'Thị Na', role: 'NURSE', department: 'ICU', preferredShift: 'MORNING', wagePerHour: 25 },
  { name: 'Thảo Nguyên', role: 'NURSE', department: 'ICU', preferredShift: 'AFTERNOON', wagePerHour: 26 },
  { name: 'Minh Anh', role: 'NURSE', department: 'ICU', preferredShift: 'NIGHT', wagePerHour: 27 },
  { name: 'Tuấn Kiệt', role: 'NURSE', department: 'ICU', preferredShift: 'MORNING', wagePerHour: 25 },
  { name: 'Gia Trang', role: 'NURSE', department: 'Emergency', preferredShift: 'NIGHT', wagePerHour: 28 },
  { name: 'Anna', role: 'NURSE', department: 'Emergency', preferredShift: 'MORNING', wagePerHour: 25 },
  { name: 'Hồng Hạnh', role: 'NURSE', department: 'Emergency', preferredShift: 'AFTERNOON', wagePerHour: 26 },
  { name: 'Ngọc Bích', role: 'NURSE', department: 'Emergency', preferredShift: 'NIGHT', wagePerHour: 27 }
  ];

  for (let i = 6; i < 20; i++) {
    employeesData.push({
      name: `Staff ${i+1}`,
      role: i % 3 === 0 ? 'DOCTOR' : 'NURSE',
      department: i % 2 === 0 ? 'ICU' : 'Emergency',
      preferredShift: i % 3 === 0 ? 'NIGHT' : 'MORNING',
      wagePerHour: i % 3 === 0 ? 50 : 25
    });
  }

  await prisma.employee.createMany({ data: employeesData });

  // Sinh Shifts cho 7 ngày (0-6), 3 ca/ngày, 2 khoa = 42 shifts
  const shiftsData = [];
  const shiftTypes = ['MORNING', 'AFTERNOON', 'NIGHT'];
  const departments = ['ICU', 'Emergency'];

  for (let day = 0; day < 7; day++) {
    for (const dept of departments) {
      for (const type of shiftTypes) {
        shiftsData.push({
          dayOfWeek: day,
          shiftType: type,
          department: dept,
          requiredDoctors: type === 'NIGHT' ? 1 : 2,
          requiredNurses: type === 'NIGHT' ? 2 : 3
        });
      }
    }
  }
  await prisma.shift.createMany({ data: shiftsData });
  console.log('Seed completed!');
}
main().catch(console.error).finally(() => prisma.$disconnect());