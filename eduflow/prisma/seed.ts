import { PrismaClient, Role, StudentStatus, AttendanceStatus, PaymentMethod, FeeStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting EduFlow database seeding...");

  // 1. Clean existing records for seed repeatability
  await prisma.activityLog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.fee.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.studentBatch.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institute.deleteMany({});

  console.log("🧹 Cleaned database.");

  // Password hash for all demo users ("password123")
  const defaultPasswordHash = bcrypt.hashSync("password123", 10);

  // 2. Create Demo Institute
  const institute = await prisma.institute.create({
    data: {
      name: "Ideal Coaching Center (Dhaka Branch)",
      code: "INST-DHAKA-01",
      phone: "+880 1711-000000",
      email: "contact@idealcoaching.bd",
      address: "House 42, Road 7, Dhanmondi, Dhaka-1205",
      logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1RtF3lsTq-wE897YPcKxxrNEUBpRytpQAb9yAf-72NOXPIfNQTJe24m6VStKTu6nuLOd-ybJhETSVx7zTAYV7UfIuk21LVr0hqSx04Ud_1MY_83MVgCGYX8h9o27cwlRf2rcTyFeqC6qHVa4MkC1griWGX7-0VKYK8eVYOqNcZaFFHhWxhe6htBJE9y7oIScCOlfP6X5MwV_O31zP57fFlLNNOxHd2tNYageotLLPQ2DaKV1yzn4-btVbPY5GwqB2cKsIzh4T6Q9p",
    },
  });

  console.log(`✅ Created Institute: ${institute.name} (${institute.code})`);

  // 3. Create Owner User
  const ownerUser = await prisma.user.create({
    data: {
      instituteId: institute.id,
      name: "Dr. Rafiqul Islam",
      email: "owner@eduflow.bd",
      passwordHash: defaultPasswordHash,
      role: Role.OWNER,
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcYvSOYEj2uLbUE0-oI8Ys6olo06MrlatBgCi-oFG3U8ao6u8aBJViRCCCsiDuXulFizICIuJ9FxCZ_ceH4fGd4QQo7t1LFdQ8eiXWTANbZFZjO_CzFe_fRXPIBOlL6uT1yOia66tSodlmp5a8Qlu3IKvCooHnt4dZK1K6OuxyEo52stNlHfASMJKJ7i8aOvksdsWT8GuNc6YR6jRdayFP6YMtkjjwRsYXa_Hflmu4aYooR9J3qulKsu_XtxSNbRgVGra-6AFR0tPp",
    },
  });

  // 4. Create 2 Teacher Users & Teacher Profiles
  const teacherUser1 = await prisma.user.create({
    data: {
      instituteId: institute.id,
      name: "Kamrul Hasan",
      email: "kamrul@eduflow.bd",
      passwordHash: defaultPasswordHash,
      role: Role.TEACHER,
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAy4FRP0tE0d-evVz_7VaLN-8FsUeaR4j4HWQ8w7YczQZU6fWKcxHyAuBiZYCzPpO0BkCrNv3gGy5BhKfdKQeeRzqKC0qESWxvqwuW7-GNVUP5SrEfelOC4QKZtS3XSijTKLgnDzWGoMCqlkAuMFSs3-M8p5JDaAJ_9abnU5hGCU2YrtOHGpsXwOLikdJCj2snul6gA2qRUckgAeqhPxkFdREBD6q9GnTvkzGtYKzxXlrVVt3YGglr02CYUOQ6DvuonKWU33g9TmpIR",
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      instituteId: institute.id,
      userId: teacherUser1.id,
      subject: "Higher Mathematics",
      phone: "+880 1812-111222",
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      instituteId: institute.id,
      name: "Farhana Nusrat",
      email: "farhana@eduflow.bd",
      passwordHash: defaultPasswordHash,
      role: Role.TEACHER,
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAD9kiyu9yWEPOiI0T5Mqki6zmGy6oi13ysmpOtg5-VSihU-Dg1jnvcfw6C3dYHTse9GaDQls0VhUfNADRTzj48mIg23V6MMv2QzeJsBNaM9xeuSYCkxeqq0KDqsgddA6mdmwhCZjAMkmLjijdngwav3v5ciONkYnL0FQkVyGyCb9bnGJI4id9Xv9690-z6yeqBNCZbh6DaP-hCzwsDUkw_906mph9ngq_Ntfk8V1_VAAUQLos-fOnYtK8tfSKjx3If-8QWiQ9bem2J",
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      instituteId: institute.id,
      userId: teacherUser2.id,
      subject: "Physics",
      phone: "+880 1913-333444",
    },
  });

  console.log(`✅ Created Owner & 2 Teachers (Password: password123).`);

  // 5. Create 2 Batches
  const batch1 = await prisma.batch.create({
    data: {
      instituteId: institute.id,
      teacherId: teacher1.id,
      name: "Class 10 - Higher Math Special",
      subject: "Higher Mathematics",
      schedule: "Sat-Mon-Wed 04:00 PM - 05:30 PM",
      monthlyFee: 2500.0,
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      instituteId: institute.id,
      teacherId: teacher2.id,
      name: "Class 12 - Physics Revision",
      subject: "Physics",
      schedule: "Sun-Tue-Thu 05:00 PM - 06:30 PM",
      monthlyFee: 3000.0,
    },
  });

  console.log(`✅ Created 2 Batches.`);

  // 6. Create 15 Demo Students
  const rawStudentsData = [
    { name: "Aisha Rahman", roll: "2026-001", guardian: "Abdur Rahman", phone: "+880 1711-100201", gender: "Female", blood: "A+" },
    { name: "Tanvir Ahmed", roll: "2026-002", guardian: "Tariq Ahmed", phone: "+880 1711-100202", gender: "Male", blood: "B+" },
    { name: "Nusrat Jahan", roll: "2026-003", guardian: "Mahbubul Alam", phone: "+880 1711-100203", gender: "Female", blood: "O+" },
    { name: "Syed Ahsan", roll: "2026-004", guardian: "Syed Mahmud", phone: "+880 1711-100204", gender: "Male", blood: "AB+" },
    { name: "Fahim Hossain", roll: "2026-005", guardian: "Delwar Hossain", phone: "+880 1711-100205", gender: "Male", blood: "O-" },
    { name: "Sadia Islam", roll: "2026-006", guardian: "Shafiqul Islam", phone: "+880 1711-100206", gender: "Female", blood: "A-" },
    { name: "Zubair Al-Mamun", roll: "2026-007", guardian: "Al-Mamun Khan", phone: "+880 1711-100207", gender: "Male", blood: "B-" },
    { name: "Anika Tabassum", roll: "2026-008", guardian: "Kamrul Islam", phone: "+880 1711-100208", gender: "Female", blood: "O+" },
    { name: "Mahir Faisal", roll: "2026-009", guardian: "Faisal Ahmed", phone: "+880 1711-100209", gender: "Male", blood: "A+" },
    { name: "Tasnim Sultana", roll: "2026-010", guardian: "Sultan Mahmud", phone: "+880 1711-100210", gender: "Female", blood: "AB-" },
    { name: "Naimur Rahman", roll: "2026-011", guardian: "Mustafizur Rahman", phone: "+880 1711-100211", gender: "Male", blood: "B+" },
    { name: "Meherin Akter", roll: "2026-012", guardian: "Jahangir Alam", phone: "+880 1711-100212", gender: "Female", blood: "O+" },
    { name: "Rafid Hasan", roll: "2026-013", guardian: "Nazmul Hasan", phone: "+880 1711-100213", gender: "Male", blood: "A+" },
    { name: "Sabrina Yasmin", roll: "2026-014", guardian: "Khorshed Alam", phone: "+880 1711-100214", gender: "Female", blood: "B+" },
    { name: "Imran Khan", roll: "2026-015", guardian: "Asaduzzaman Khan", phone: "+880 1711-100215", gender: "Male", blood: "AB+" },
  ];

  const createdStudents = [];

  for (let i = 0; i < rawStudentsData.length; i++) {
    const sData = rawStudentsData[i];
    const email = `student${i + 1}@eduflow.bd`;

    // Create User for Student
    const sUser = await prisma.user.create({
      data: {
        instituteId: institute.id,
        name: sData.name,
        email: email,
        passwordHash: defaultPasswordHash,
        role: Role.STUDENT,
      },
    });

    // Create Student record
    const student = await prisma.student.create({
      data: {
        instituteId: institute.id,
        userId: sUser.id,
        rollNo: sData.roll,
        fullName: sData.name,
        email: email,
        gender: sData.gender,
        bloodGroup: sData.blood,
        guardianName: sData.guardian,
        guardianPhone: sData.phone,
        address: "Dhanmondi, Dhaka",
        status: StudentStatus.ACTIVE,
      },
    });

    createdStudents.push(student);
  }

  console.log(`✅ Created 15 Students (Password: password123).`);

  // 7. Assign Students to Batches (StudentBatch pivot)
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    if (i < 10) {
      await prisma.studentBatch.create({
        data: {
          instituteId: institute.id,
          studentId: student.id,
          batchId: batch1.id,
        },
      });
    }
    if (i >= 6) {
      await prisma.studentBatch.create({
        data: {
          instituteId: institute.id,
          studentId: student.id,
          batchId: batch2.id,
        },
      });
    }
  }

  console.log(`✅ Enrolled students into batches.`);

  // 8. Seed Attendance Records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statuses: AttendanceStatus[] = [
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.LATE,
    AttendanceStatus.ABSENT,
  ];

  for (let i = 0; i < 10; i++) {
    const student = createdStudents[i];
    const status = statuses[i % statuses.length];
    await prisma.attendance.create({
      data: {
        instituteId: institute.id,
        studentId: student.id,
        batchId: batch1.id,
        date: today,
        status: status,
        markedBy: teacherUser1.id,
      },
    });
  }

  console.log(`✅ Created demo attendance records.`);

  // 9. Seed Fee Records
  const methods: PaymentMethod[] = [
    PaymentMethod.BKASH,
    PaymentMethod.CASH,
    PaymentMethod.NAGAD,
    PaymentMethod.BANK_TRANSFER,
  ];

  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const isPaid = i % 3 !== 0;
    const rcptNo = `RCPT-2026-${1000 + i}`;
    const method = methods[i % methods.length];

    await prisma.fee.create({
      data: {
        instituteId: institute.id,
        studentId: student.id,
        receiptNo: rcptNo,
        amount: i < 10 ? 2500.0 : 3000.0,
        monthYear: "October 2024",
        status: isPaid ? FeeStatus.PAID : FeeStatus.PENDING,
        paymentMethod: isPaid ? method : null,
        transactionId: isPaid && method === PaymentMethod.BKASH ? `TRX-BK-${84000 + i}` : null,
        paymentDate: isPaid ? new Date() : null,
        notes: isPaid ? "Paid in full" : "Payment reminder sent to guardian",
      },
    });
  }

  console.log(`✅ Created demo Fee receipts & statuses.`);

  // 10. Seed Exam Results
  const grades = ["A+", "A", "A-", "B", "C"];
  for (let i = 0; i < 10; i++) {
    const student = createdStudents[i];
    const marks = Math.floor(Math.random() * 30) + 70; // 70-100
    const grade = grades[Math.floor(Math.random() * grades.length)];

    await prisma.result.create({
      data: {
        instituteId: institute.id,
        studentId: student.id,
        batchId: batch1.id,
        examName: "Mid Term Exam 2024",
        subject: "Higher Mathematics",
        marksObtained: marks,
        totalMarks: 100.0,
        grade: grade,
        examDate: new Date(),
        comments: marks >= 80 ? "Excellent problem solving" : "Needs practice in Calculus",
      },
    });
  }

  console.log(`✅ Created demo Exam Results.`);

  // 11. Seed Institute Expenses
  await prisma.expense.createMany({
    data: [
      {
        instituteId: institute.id,
        title: "Campus Rent (Dhanmondi Branch)",
        category: "Rent",
        amount: 45000.0,
        notes: "Monthly venue lease payment",
      },
      {
        instituteId: institute.id,
        title: "Electricity & AC Bill",
        category: "Utilities",
        amount: 8200.0,
        notes: "DESCO monthly bill",
      },
      {
        instituteId: institute.id,
        title: "Photocopy Paper & Exam Sheets",
        category: "Stationery",
        amount: 3400.0,
        notes: "10 rims A4 paper & print cartridges",
      },
    ],
  });

  console.log(`✅ Created demo Expenses.`);
  console.log("🎉 EduFlow Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
