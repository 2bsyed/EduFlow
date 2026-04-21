<?php
class AttendanceController extends Controller
{
    private Attendance $attendanceModel;
    private Batch      $batchModel;
    private Student    $studentModel;

    public function __construct()
    {
        $this->attendanceModel = new Attendance();
        $this->batchModel      = new Batch();
        $this->studentModel    = new Student();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher', 'student']);

        $iid  = $this->instituteId();
        $user = $this->auth();

        if ($user['role'] === 'student') {
            $student = $this->studentModel->findByUserId($user['id'], $iid);
            $page = max(1, (int)($_GET['page'] ?? 1));
            
            $history = [];
            $summary = ['present' => 0, 'absent' => 0, 'late' => 0, 'total' => 0];
            
            if ($student) {
                $history = $this->attendanceModel->getStudentHistory($student['id'], $iid, $page, 15);
                // We'd typically have a `getStudentSummary` function but we can pull from DB
                $db = Database::getInstance();
                $stmt = $db->prepare("SELECT status, COUNT(*) as cnt FROM attendance WHERE student_id = ? AND institute_id = ? GROUP BY status");
                $stmt->execute([$student['id'], $iid]);
                $rows = $stmt->fetchAll();
                foreach($rows as $r) {
                    $summary[$r['status']] = (int)$r['cnt'];
                    $summary['total'] += (int)$r['cnt'];
                }
            }
            
            $institute = $_SESSION['institute'] ?? [];
            $flash     = $this->getFlash();
            $csrf      = $this->generateCsrfToken();
            
            $this->render('attendance/student', compact('history', 'summary', 'user', 'institute', 'flash', 'csrf'));
            return;
        }

        $date   = $_GET['date']     ?? date('Y-m-d');
        $batchId = (int)($_GET['batch_id'] ?? 0);

        $batches = ($user['role'] === 'teacher') 
                   ? $this->batchModel->getByTeacher($iid, $user['id'], 'active')
                   : $this->batchModel->getAll($iid, 'active');

        // Auto-select first batch if none selected
        if (!$batchId && !empty($batches)) {
            $batchId = (int)$batches[0]['id'];
        }

        // Verify if batch belongs to teacher
        if ($batchId && $user['role'] === 'teacher') {
            $allowed = false;
            foreach ($batches as $b) {
                if ($b['id'] == $batchId) $allowed = true;
            }
            if (!$allowed) {
                $batchId = 0; // unauthorized
                $this->flash('error', 'Unauthorized batch access.');
            }
        }

        $students = [];
        $summary  = ['present' => 0, 'absent' => 0, 'late' => 0, 'total' => 0];

        if ($batchId) {
            $students = $this->attendanceModel->getStudentWithStatus($batchId, $date, $iid);
            $summary  = $this->attendanceModel->getSummaryByDate($batchId, $date, $iid);
        }

        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('attendance/index', compact(
            'batches', 'batchId', 'date', 'students', 'summary',
            'user', 'institute', 'flash', 'csrf'
        ));
    }

    /**
     * AJAX: Mark single student attendance
     */
    public function markAttendance(): void
    {
        Middleware::requireRoleAjax(['owner', 'teacher']);

        // Validate CSRF from header or POST
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            $this->json(['error' => 'CSRF validation failed'], 403);
            return;
        }

        $iid       = $this->instituteId();
        $studentId = (int)($_POST['student_id'] ?? 0);
        $batchId   = (int)($_POST['batch_id']   ?? 0);
        $date      = $_POST['date']   ?? date('Y-m-d');
        $status    = $_POST['status'] ?? '';

        if (!in_array($status, ['present', 'absent', 'late'], true)) {
            $this->json(['error' => 'Invalid status'], 422);
            return;
        }

        if (!$studentId || !$batchId) {
            $this->json(['error' => 'Missing student_id or batch_id'], 422);
            return;
        }

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $batches = $this->batchModel->getByTeacher($iid, $user['id'], 'active');
            $allowed = false;
            foreach ($batches as $b) {
                if ($b['id'] == $batchId) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                $this->json(['error' => 'Unauthorized batch access'], 403);
                return;
            }
        }

        $ok = $this->attendanceModel->markOrUpdate(
            $studentId, $batchId, $date, $status, $this->auth()['id'], $iid
        );

        if ($ok) {
            $summary = $this->attendanceModel->getSummaryByDate($batchId, $date, $iid);
            $this->json(['success' => true, 'summary' => $summary]);
        } else {
            $this->json(['error' => 'Failed to save attendance'], 500);
        }
    }

    /**
     * AJAX: Get attendance for a batch/date combo
     */
    public function getAttendance(): void
    {
        Middleware::requireRoleAjax(['owner', 'teacher']);

        $iid     = $this->instituteId();
        $batchId = (int)($_GET['batch_id'] ?? 0);
        $date    = $_GET['date'] ?? date('Y-m-d');

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $batches = $this->batchModel->getByTeacher($iid, $user['id'], 'active');
            $allowed = false;
            foreach ($batches as $b) {
                if ($b['id'] == $batchId) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                $this->json(['error' => 'Unauthorized batch access'], 403);
                return;
            }
        }

        $students = $this->attendanceModel->getStudentWithStatus($batchId, $date, $iid);
        $summary  = $this->attendanceModel->getSummaryByDate($batchId, $date, $iid);

        $this->json(['students' => $students, 'summary' => $summary]);
    }
}
