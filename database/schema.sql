-- ============================================================
-- EduFlow SaaS — Database Schema
-- Multi-tenant: every table includes institute_id
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Create & select database
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `eduflow_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `eduflow_db`;

-- ------------------------------------------------------------
-- Table: institutes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `institutes` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(150) NOT NULL,
    `subdomain`     VARCHAR(80)  NOT NULL UNIQUE,
    `plan`          ENUM('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
    `address`       TEXT,
    `phone`         VARCHAR(20),
    `logo_path`     VARCHAR(255),
    `status`        ENUM('active','suspended','cancelled') NOT NULL DEFAULT 'active',
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_subdomain` (`subdomain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`  INT UNSIGNED NOT NULL,
    `name`          VARCHAR(120) NOT NULL,
    `username`      VARCHAR(80)  NOT NULL,
    `email`         VARCHAR(180) NULL DEFAULT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role`          ENUM('owner','teacher','student','parent') NOT NULL DEFAULT 'student',
    `phone`         VARCHAR(20)  NULL DEFAULT NULL,
    `avatar_path`   VARCHAR(255),
    `status`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
    `last_login_at` DATETIME,
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email_institute` (`email`, `institute_id`),
    INDEX `idx_institute_role` (`institute_id`, `role`),
    CONSTRAINT `fk_users_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: batches
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `batches` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`  INT UNSIGNED NOT NULL,
    `name`          VARCHAR(100) NOT NULL,
    `subject`       VARCHAR(100) NOT NULL,
    `teacher_id`    INT UNSIGNED,
    `schedule`      VARCHAR(200),
    `room`          VARCHAR(50),
    `capacity`      SMALLINT UNSIGNED NOT NULL DEFAULT 30,
    `start_date`    DATE,
    `end_date`      DATE,
    `fee_amount`    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `status`        ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_institute` (`institute_id`),
    INDEX `idx_teacher` (`teacher_id`),
    CONSTRAINT `fk_batches_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_batches_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`  INT UNSIGNED NOT NULL,
    `user_id`       INT UNSIGNED,
    `roll_no`       VARCHAR(50) NOT NULL,
    `full_name`     VARCHAR(120) NOT NULL,
    `email`          VARCHAR(180),
    `phone`          VARCHAR(20),
    `date_of_birth`  DATE,
    `guardian_name`  VARCHAR(120),
    `guardian_phone` VARCHAR(20),
    `address`        TEXT,
    `status`         ENUM('active','inactive','archived') NOT NULL DEFAULT 'active',
    `enrolled_at`    DATE NOT NULL DEFAULT (CURRENT_DATE),
    `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_roll_no_institute` (`roll_no`, `institute_id`),
    INDEX `idx_institute` (`institute_id`),
    CONSTRAINT `fk_students_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure for `student_batches`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_batches` (
    `institute_id`  INT UNSIGNED NOT NULL,
    `student_id`    INT UNSIGNED NOT NULL,
    `batch_id`      INT UNSIGNED NOT NULL,
    PRIMARY KEY (`student_id`, `batch_id`),
    KEY `idx_institute` (`institute_id`),
    KEY `idx_batch` (`batch_id`),
    CONSTRAINT `fk_sb_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sb_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sb_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: attendance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`  INT UNSIGNED NOT NULL,
    `student_id`    INT UNSIGNED NOT NULL,
    `batch_id`      INT UNSIGNED NOT NULL,
    `date`          DATE NOT NULL,
    `status`        ENUM('present','absent','late') NOT NULL DEFAULT 'present',
    `marked_by`     INT UNSIGNED,
    `note`          VARCHAR(255),
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_attendance` (`student_id`, `batch_id`, `date`),
    INDEX `idx_institute_date` (`institute_id`, `date`),
    INDEX `idx_batch_date` (`batch_id`, `date`),
    CONSTRAINT `fk_attendance_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attendance_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: fees
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fees` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`  INT UNSIGNED NOT NULL,
    `student_id`    INT UNSIGNED NOT NULL,
    `batch_id`      INT UNSIGNED,
    `amount`        DECIMAL(10,2) NOT NULL,
    `due_date`      DATE NOT NULL,
    `paid_date`     DATE,
    `paid_amount`   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `receipt_no`    VARCHAR(50),
    `payment_mode`  ENUM('cash','online','cheque','bank_transfer') DEFAULT 'cash',
    `status`        ENUM('paid','due','overdue','partial') NOT NULL DEFAULT 'due',
    `note`          VARCHAR(255),
    `created_by`    INT UNSIGNED,
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_institute` (`institute_id`),
    INDEX `idx_student` (`student_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_due_date` (`due_date`),
    CONSTRAINT `fk_fees_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_fees_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: results
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `results` (
    `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`   INT UNSIGNED NOT NULL,
    `student_id`     INT UNSIGNED NOT NULL,
    `batch_id`       INT UNSIGNED NOT NULL,
    `subject`        VARCHAR(100) NOT NULL,
    `exam_name`      VARCHAR(100) NOT NULL DEFAULT 'Unit Test',
    `marks_obtained` DECIMAL(6,2) NOT NULL DEFAULT 0,
    `marks_total`    DECIMAL(6,2) NOT NULL DEFAULT 100,
    `grade`          VARCHAR(5),
    `remarks`        VARCHAR(255),
    `exam_date`      DATE NOT NULL,
    `entered_by`     INT UNSIGNED,
    `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_institute` (`institute_id`),
    INDEX `idx_student` (`student_id`),
    INDEX `idx_batch` (`batch_id`),
    CONSTRAINT `fk_results_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_results_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_results_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: expenses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
    `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`       INT UNSIGNED NOT NULL,
    `category`           ENUM('teacher_salary','rent','utilities','supplies','maintenance','marketing','other') NOT NULL DEFAULT 'other',
    `title`              VARCHAR(200) NOT NULL,
    `description`        TEXT,
    `amount`             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `teacher_id`         INT UNSIGNED DEFAULT NULL,
    `due_date`           DATE NOT NULL,
    `payment_date`       DATE DEFAULT NULL,
    `is_recurring`       TINYINT(1) NOT NULL DEFAULT 0,
    `recurring_interval` ENUM('monthly','quarterly','yearly') DEFAULT NULL,
    `next_due_date`      DATE DEFAULT NULL,
    `payment_mode`       ENUM('cash','online','cheque','bank_transfer') DEFAULT NULL,
    `reference_no`       VARCHAR(50) DEFAULT NULL,
    `status`             ENUM('paid','pending','overdue') NOT NULL DEFAULT 'pending',
    `created_by`         INT UNSIGNED DEFAULT NULL,
    `created_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_institute` (`institute_id`),
    INDEX `idx_category` (`category`),
    INDEX `idx_status` (`status`),
    INDEX `idx_teacher` (`teacher_id`),
    INDEX `idx_due_date` (`due_date`),
    CONSTRAINT `fk_expenses_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_expenses_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: activity_log
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_log` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institute_id`  INT UNSIGNED NOT NULL,
    `user_id`       INT UNSIGNED,
    `action`        VARCHAR(100) NOT NULL,
    `entity_type`   VARCHAR(50),
    `entity_id`     INT UNSIGNED,
    `description`   TEXT,
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_institute_date` (`institute_id`, `created_at`),
    CONSTRAINT `fk_log_institute` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Seed Data — Demo Institute & Owner
-- ------------------------------------------------------------

INSERT INTO `institutes` (`name`, `subdomain`, `plan`, `address`, `phone`, `status`) VALUES
('Zenith Academy', 'zenith', 'professional', '123 Scholar Lane, Knowledge City', '+91 98765 43210', 'active');

-- Owner password: Admin@123 (bcrypt)
INSERT INTO `users` (`institute_id`, `name`, `email`, `password_hash`, `role`, `phone`, `status`) VALUES
(1, 'Admin Director', 'admin@zenith.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', '+91 98765 43210', 'active'),
(1, 'Dr. Priya Mehta', 'priya@zenith.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', '+91 98200 11111', 'active'),
(1, 'Prof. Rajan Das', 'rajan@zenith.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', '+91 98200 22222', 'active');

INSERT INTO `batches` (`institute_id`, `name`, `subject`, `teacher_id`, `schedule`, `room`, `capacity`, `fee_amount`, `status`) VALUES
(1, 'Morning A-1', 'Mathematics', 2, 'Mon-Fri 7:00 AM - 9:00 AM', 'Room 101', 30, 2500.00, 'active'),
(1, 'Morning B-2', 'Physics', 2, 'Mon-Wed-Fri 9:30 AM - 11:30 AM', 'Room 202', 25, 2800.00, 'active'),
(1, 'Evening C-1', 'Chemistry', 3, 'Mon-Fri 5:00 PM - 7:00 PM', 'Lab 4', 20, 3000.00, 'active'),
(1, 'Weekend Advanced', 'Biology', 3, 'Sat-Sun 10:00 AM - 1:00 PM', 'Room 302', 15, 3500.00, 'active');

INSERT INTO `students` (`institute_id`, `user_id`, `roll_no`, `full_name`, `email`, `phone`, `guardian_name`, `guardian_phone`, `status`, `enrolled_at`) VALUES
(1, NULL, 'ED-1001', 'Aarav Sharma', '', '+91 91234 56780', 'Ramesh Sharma', '+91 91234 50000', 'active', '2023-11-01'),
(1, NULL, 'ED-1002', 'Diya Patel', '', '+91 91234 56781', 'Manish Patel', '+91 91234 50001', 'active', '2023-11-02'),
(1, NULL, 'ED-1003', 'Rohan Gupta', '', '+91 91234 56782', 'Sunil Gupta', '+91 91234 50002', 'active', '2023-11-03'),
(1, NULL, 'ED-1004', 'Isha Singh', '', '+91 91234 56783', 'Vikram Singh', '+91 91234 50003', 'active', '2023-11-04'),
(1, NULL, 'ED-1005', 'Karan Verma', '', '+91 91234 56784', 'Anil Verma', '+91 91234 50004', 'active', '2023-11-05');

INSERT INTO `student_batches` (`institute_id`, `student_id`, `batch_id`) VALUES
(1, 1, 1),
(1, 2, 3),
(1, 3, 1),
(1, 4, 2),
(1, 5, 2);

INSERT INTO `fees` (`institute_id`, `student_id`, `batch_id`, `amount`, `due_date`, `paid_date`, `paid_amount`, `receipt_no`, `payment_mode`, `status`) VALUES
(1, 1, 1, 2500.00, '2024-07-01', '2024-06-28', 2500.00, 'REC-001', 'cash', 'paid'),
(1, 2, 3, 3000.00, '2024-07-01', NULL, 0.00, NULL, NULL, 'due'),
(1, 3, 2, 2800.00, '2024-07-01', NULL, 0.00, NULL, NULL, 'overdue'),
(1, 4, 4, 3500.00, '2024-07-01', '2024-07-02', 3500.00, 'REC-002', 'online', 'paid'),
(1, 5, 1, 2500.00, '2024-08-01', NULL, 0.00, NULL, NULL, 'due'),
(1, 6, 2, 2800.00, '2024-08-01', '2024-08-03', 2800.00, 'REC-003', 'bank_transfer', 'paid');

INSERT INTO `attendance` (`institute_id`, `student_id`, `batch_id`, `date`, `status`, `marked_by`) VALUES
(1, 1, 1, CURDATE(), 'present', 1),
(1, 5, 1, CURDATE(), 'present', 1),
(1, 2, 3, CURDATE(), 'absent', 1),
(1, 3, 2, CURDATE(), 'late', 1),
(1, 4, 4, CURDATE(), 'present', 1),
(1, 6, 2, CURDATE(), 'present', 1);

INSERT INTO `results` (`institute_id`, `student_id`, `batch_id`, `subject`, `exam_name`, `marks_obtained`, `marks_total`, `grade`, `exam_date`, `entered_by`) VALUES
(1, 1, 1, 'Mathematics', 'Unit Test 1', 88.00, 100.00, 'A', '2024-07-15', 1),
(1, 2, 3, 'Chemistry', 'Unit Test 1', 74.00, 100.00, 'B', '2024-07-15', 1),
(1, 3, 2, 'Physics', 'Unit Test 1', 62.00, 100.00, 'C', '2024-07-15', 1),
(1, 4, 4, 'Biology', 'Unit Test 1', 91.00, 100.00, 'A+', '2024-07-15', 1),
(1, 5, 1, 'Mathematics', 'Unit Test 1', 79.00, 100.00, 'B+', '2024-07-15', 1),
(1, 6, 2, 'Physics', 'Unit Test 1', 85.00, 100.00, 'A', '2024-07-15', 1);

INSERT INTO `activity_log` (`institute_id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`) VALUES
(1, 1, 'student_enrolled', 'student', 6, 'New student enrolled: Ananya Patel → Morning B-2'),
(1, 1, 'fee_received', 'fee', 6, 'Fee payment received from Ananya Patel — ₹2,800'),
(1, 1, 'attendance_marked', 'batch', 1, 'Attendance marked for Morning A-1'),
(1, 2, 'result_entered', 'result', 5, 'Results entered for Unit Test 1 — Mathematics');

INSERT INTO `expenses` (`institute_id`, `category`, `title`, `description`, `amount`, `teacher_id`, `due_date`, `payment_date`, `is_recurring`, `recurring_interval`, `payment_mode`, `reference_no`, `status`, `created_by`) VALUES
(1, 'teacher_salary', 'Dr. Priya Mehta - April Salary', 'Monthly salary', 25000.00, 2, '2024-04-30', '2024-04-30', 1, 'monthly', 'bank_transfer', 'SAL-APR-001', 'paid', 1),
(1, 'teacher_salary', 'Prof. Rajan Das - April Salary', 'Monthly salary', 22000.00, 3, '2024-04-30', NULL, 1, 'monthly', NULL, NULL, 'pending', 1),
(1, 'rent', 'Office Space Rent - April', 'Monthly rent for 3rd floor', 35000.00, NULL, '2024-04-05', '2024-04-04', 1, 'monthly', 'bank_transfer', 'RENT-APR', 'paid', 1),
(1, 'utilities', 'Electricity Bill - April', 'WASA utility bill', 8500.00, NULL, '2024-04-15', NULL, 1, 'monthly', NULL, NULL, 'overdue', 1),
(1, 'utilities', 'Internet Bill - April', 'Broadband connection', 3500.00, NULL, '2024-04-10', '2024-04-09', 1, 'monthly', 'online', 'NET-APR', 'paid', 1),
(1, 'supplies', 'Whiteboard Markers & Chalk', 'Classroom supplies', 1200.00, NULL, '2024-04-12', '2024-04-12', 0, NULL, 'cash', NULL, 'paid', 1),
(1, 'maintenance', 'AC Servicing - Lab 4', 'Annual AC maintenance', 4500.00, NULL, '2024-04-20', NULL, 0, NULL, NULL, NULL, 'pending', 1),
(1, 'marketing', 'Facebook Ads - April Campaign', 'Student enrollment ads', 5000.00, NULL, '2024-04-01', '2024-04-01', 1, 'monthly', 'online', 'FB-APR', 'paid', 1);
