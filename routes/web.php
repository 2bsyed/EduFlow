<?php
/**
 * EduFlow — Route Definitions
 * Maps route names → [ControllerClass, method, allowed HTTP methods]
 */
$routes = [
    // Auth
    ''                  => ['AuthController',       'showLogin',        ['GET']],
    'login'             => ['AuthController',       'showLogin',        ['GET']],
    'login.post'        => ['AuthController',       'login',            ['POST']],
    'register'          => ['AuthController',       'showRegister',     ['GET']],
    'register.post'     => ['AuthController',       'register',         ['POST']],
    'logout'            => ['AuthController',       'logout',           ['GET', 'POST']],

    // Dashboard
    'dashboard'         => ['DashboardController',  'index',            ['GET']],
    'student.dashboard' => ['DashboardController',  'student',          ['GET']],
    'teacher.dashboard' => ['DashboardController',  'teacher',          ['GET']],

    // Profile
    'profile'           => ['ProfileController',    'index',            ['GET']],
    'profile.pass'      => ['ProfileController',    'updatePassword',   ['POST']],
    'profile.user'      => ['ProfileController',    'updateUsername',   ['POST']],
    'profile.logo'      => ['ProfileController',    'updateLogo',       ['POST']],

    // Students
    'students'          => ['StudentController',    'index',            ['GET']],
    'students.create'   => ['StudentController',    'create',           ['GET']],
    'students.store'    => ['StudentController',    'store',            ['POST']],
    'students.edit'     => ['StudentController',    'edit',             ['GET']],
    'students.update'   => ['StudentController',    'update',           ['POST']],
    'students.delete'   => ['StudentController',    'delete',           ['POST']],
    'students.destroy'  => ['StudentController',    'destroy',          ['POST']],
    'students.search'   => ['StudentController',    'search',           ['GET']],  // AJAX

    // Batches
    'batches'           => ['BatchController',      'index',            ['GET']],
    'batches.create'    => ['BatchController',      'create',           ['GET']],
    'batches.store'     => ['BatchController',      'store',            ['POST']],
    'batches.edit'      => ['BatchController',      'edit',             ['GET']],
    'batches.update'    => ['BatchController',      'update',           ['POST']],
    'batches.delete'    => ['BatchController',      'delete',           ['POST']],

    // Teachers
    'teachers'          => ['TeacherController',    'index',            ['GET']],
    'teachers.create'   => ['TeacherController',    'create',           ['GET']],
    'teachers.store'    => ['TeacherController',    'store',            ['POST']],
    'teachers.edit'     => ['TeacherController',    'edit',             ['GET']],
    'teachers.update'   => ['TeacherController',    'update',           ['POST']],
    'teachers.delete'   => ['TeacherController',    'delete',           ['POST']],
    'teachers.destroy'  => ['TeacherController',    'destroy',          ['POST']],

    // Attendance
    'attendance'        => ['AttendanceController', 'index',            ['GET']],
    'attendance.mark'   => ['AttendanceController', 'markAttendance',   ['POST']], // AJAX
    'attendance.get'    => ['AttendanceController', 'getAttendance',    ['GET']],  // AJAX

    // Fees
    'fees'              => ['FeeController',        'index',            ['GET']],
    'fees.record'       => ['FeeController',        'recordPayment',    ['GET']],
    'fees.update'       => ['FeeController',        'updateStatus',     ['POST']], // AJAX
    'fees.create'       => ['FeeController',        'create',           ['GET']],
    'fees.store'        => ['FeeController',        'store',            ['POST']],

    // Results
    'results'           => ['ResultController',     'index',            ['GET']],
    'results.entry'     => ['ResultController',     'entry',            ['GET']],
    'results.store'     => ['ResultController',     'store',            ['POST']],
    'results.edit'      => ['ResultController',     'edit',             ['GET']],
    'results.update'    => ['ResultController',     'update',           ['POST']],
    'results.delete'    => ['ResultController',     'delete',           ['POST']],

    // Expenses (Owner only)
    'expenses'           => ['ExpenseController',    'index',            ['GET']],
    'expenses.create'    => ['ExpenseController',    'create',           ['GET']],
    'expenses.store'     => ['ExpenseController',    'store',            ['POST']],
    'expenses.edit'      => ['ExpenseController',    'edit',             ['GET']],
    'expenses.update'    => ['ExpenseController',    'update',           ['POST']],
    'expenses.delete'    => ['ExpenseController',    'delete',           ['POST']],
    'expenses.markPaid'  => ['ExpenseController',    'markPaid',         ['POST']],

    // Analytics
    'analytics'         => ['AnalyticsController',  'index',            ['GET']],
    'analytics.data'    => ['AnalyticsController',  'getData',          ['GET']],  // AJAX JSON
];
