<?php

require_once __DIR__ . '/../config/database.php';

$db = Database::getInstance();

$iid = 1; // Zenith Academy
if (empty($iid)) {
    die("No institute found to seed.");
}

$fakerFirstNames = ['Aisha', 'Rohit', 'Sana', 'Karan', 'Priya', 'Amit', 'Neha', 'Vikram', 'Anjali', 'Arjun', 'Simran', 'Rahul', 'Pooja', 'Deepak', 'Kavita', 'Ravi', 'Sneha', 'Sanjay', 'Meera', 'Vijay'];
$fakerLastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Das', 'Roy', 'Gupta', 'Dass', 'Rao', 'Chowdhury', 'Jain', 'Bose', 'Shah', 'Nath'];

function randomName($firsts, $lasts) {
    return $firsts[array_rand($firsts)] . ' ' . $lasts[array_rand($lasts)];
}

function generateUserId($db, $name, $prefix, $iid) {
    $baseName = preg_replace('/[^a-z0-9]/', '', strtolower($name));
    if (empty($baseName)) $baseName = 'user';
    $username = $prefix . $baseName;
    $counter = 1;

    while (true) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND institute_id = ?");
        $stmt->execute([$username, $iid]);
        if ($stmt->fetchColumn() == 0) break;
        $username = $prefix . $baseName . $counter;
        $counter++;
    }
    return $username;
}

$batches = [];
$stmt = $db->query("SELECT * FROM batches WHERE institute_id = $iid");
while ($row = $stmt->fetch()) {
    $batches[] = $row;
}
if (empty($batches)) {
    die("No active batches found to attach students to.");
}

echo "Seeding 5 Teachers...\n";
$teacherIds = [];
for ($i = 0; $i < 5; $i++) {
    $name = randomName($fakerFirstNames, $fakerLastNames);
    $username = generateUserId($db, $name, 'tea-', $iid);
    $pass = bin2hex(random_bytes(4));
    $uidStr = uniqid();
    $stmt = $db->prepare("INSERT INTO users (institute_id, name, email, username, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, 'teacher', ?, 'active')");
    $stmt->execute([$iid, $name, "teacher{$uidStr}@example.com", $username, password_hash('password', PASSWORD_BCRYPT), '98' . mt_rand(10000000, 99999999)]);
    $teacherIds[] = $db->lastInsertId();
}

// Ensure batches have a teacher if not
foreach ($batches as $bt) {
    $db->exec("UPDATE batches SET teacher_id = " . $teacherIds[array_rand($teacherIds)] . " WHERE id = {$bt['id']}");
}

echo "Seeding 50 Students & Historical Data over 6 Months...\n";
$startDate = new DateTime('-6 months');
$endDate = new DateTime('now');
$interval = new DateInterval('P1D');
$datePeriod = new DatePeriod($startDate, $interval, $endDate);
$allDates = [];
foreach ($datePeriod as $d) {
    if ($d->format('N') < 6) { // Weekdays
        $allDates[] = $d->format('Y-m-d');
    }
}

$months = [];
foreach ($datePeriod as $d) {
    $m = $d->format('Y-m');
    if (!in_array($m, $months)) $months[] = $m;
}

$studentIds = [];
$rollBase = 5000;
for ($i = 0; $i < 50; $i++) {
    $name = randomName($fakerFirstNames, $fakerLastNames);
    $username = generateUserId($db, $name, 'std-', $iid);
    $uidStr = uniqid();
    
    // Create User
    $stmt = $db->prepare("INSERT INTO users (institute_id, name, email, username, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, 'student', ?, 'active')");
    $stmt->execute([$iid, $name, "student{$uidStr}@example.com", $username, password_hash('password', PASSWORD_BCRYPT), '99' . mt_rand(10000000, 99999999)]);
    $uid = $db->lastInsertId();
    
    $batch = $batches[array_rand($batches)];
    $roll = "ED-" . mt_rand(10000, 99999);
    $enrolledAt = date('Y-m-d', strtotime('-' . mt_rand(3, 6) . ' months'));

    // Create Student
    $stmt = $db->prepare("INSERT INTO students (institute_id, user_id, roll_no, batch_id, full_name, email, phone, status, enrolled_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)");
    $stmt->execute([$iid, $uid, $roll, $batch['id'], $name, "student{$uidStr}@example.com", '99' . mt_rand(10000000, 99999999), $enrolledAt]);
    $sid = $db->lastInsertId();
    $studentIds[] = ['id' => $sid, 'batch_id' => $batch['id'], 'user_id' => $uid];
    
    // Activity Log - Enrolled
    $db->prepare("INSERT INTO activity_log (institute_id, user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, 'student_enrolled', 'student', ?, ?, ?)")
       ->execute([$iid, 1, $sid, "New student enrolled: $name", $enrolledAt . ' 10:00:00']);

    // Fees for last 6 months
    foreach ($months as $ym) {
        if ($ym >= substr($enrolledAt, 0, 7)) {
            $paid = mt_rand(0, 100) > 15; // 85% paid
            $status = $paid ? 'paid' : 'due';
            $paidDate = $paid ? $ym . sprintf('-%02d', mt_rand(1, 10)) : null;
            $paidAmount = $paid ? $batch['fee_amount'] : 0;
            
            $db->prepare("INSERT INTO fees (institute_id, student_id, batch_id, amount, paid_amount, due_date, paid_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)")
               ->execute([$iid, $sid, $batch['id'], $batch['fee_amount'], $paidAmount, $ym.'-10', $paidDate, $status]);
               
            if ($paid) {
                // log payment
                $db->prepare("INSERT INTO activity_log (institute_id, user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, 'fee_collected', 'fee', ?, ?, ?)")
                   ->execute([$iid, 1, $db->lastInsertId(), "Fee collected for $name - $ym", $paidDate . ' 12:00:00']);
            }
        }
    }
}

echo "Seeding Attendance for past 6 months (Sparse subset approx 20 classes/batch)...\n";
// Create attendance records
foreach ($batches as $batch) {
    $batchStudents = array_filter($studentIds, fn($s) => $s['batch_id'] == $batch['id']);
    
    // Pick 20 random dates
    $pickedDates = (array)array_rand(array_flip($allDates), 20);
    foreach ($pickedDates as $date) {
        foreach ($batchStudents as $s) {
            $status = mt_rand(1, 100) > 10 ? 'present' : 'absent'; // 90% attendance
            $db->prepare("INSERT INTO attendance (institute_id, batch_id, student_id, date, status) VALUES (?, ?, ?, ?, ?)")
               ->execute([$iid, $batch['id'], $s['id'], $date, $status]);
        }
    }
}

echo "Seeding Results for past 6 months...\n";
// Create some exams: Mid terms, unit tests
$exams = [
    ['name' => 'Unit Test 1', 'date' => date('Y-m-d', strtotime('-4 months')), 'total' => 50],
    ['name' => 'Mid Term Exam', 'date' => date('Y-m-d', strtotime('-3 months')), 'total' => 100],
    ['name' => 'Unit Test 2', 'date' => date('Y-m-d', strtotime('-1 months')), 'total' => 50]
];

foreach ($exams as $ex) {
    foreach ($studentIds as $s) {
        // Find batch subject
        $batch = array_values(array_filter($batches, fn($b) => $b['id'] == $s['batch_id']))[0];
        
        $obtained = mt_rand($ex['total'] * 0.4, $ex['total']);
        $grade = 'F';
        $pct = ($obtained / $ex['total']) * 100;
        if ($pct >= 80) $grade = 'A+';
        elseif ($pct >= 70) $grade = 'A';
        elseif ($pct >= 60) $grade = 'B';
        elseif ($pct >= 50) $grade = 'C';
        elseif ($pct >= 40) $grade = 'D';

        $db->prepare("INSERT INTO results (institute_id, student_id, batch_id, exam_name, subject, marks_obtained, marks_total, grade, exam_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
           ->execute([$iid, $s['id'], $s['batch_id'], $ex['name'], $batch['subject'], $obtained, $ex['total'], $grade, $ex['date']]);
    }
}

echo "Done! Data seeded successfully.\n";
