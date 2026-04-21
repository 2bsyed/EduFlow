<?php
class DashboardController extends Controller
{
    private Student    $studentModel;
    private Batch      $batchModel;
    private Attendance $attendanceModel;
    private Fee        $feeModel;

    public function __construct()
    {
        $this->studentModel    = new Student();
        $this->batchModel      = new Batch();
        $this->attendanceModel = new Attendance();
        $this->feeModel        = new Fee();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid = $this->instituteId();

        $stats = [
            'total_students'  => $this->studentModel->countByInstitute($iid),
            'active_batches'  => $this->batchModel->countActive($iid),
            'avg_attendance'  => $this->attendanceModel->getAverageAttendance($iid),
            'total_revenue'   => $this->feeModel->getTotalRevenue($iid),
            'pending_fees'    => $this->feeModel->getTotalPending($iid),
            'new_this_month'  => $this->studentModel->countNewThisMonth($iid),
        ];

        $recentActivity    = $this->getRecentActivity($iid);
        $upcomingClasses   = $this->batchModel->getAll($iid, 'active');
        $monthlyRevenue    = $this->feeModel->getMonthlyRevenue($iid, 6);
        $attendanceTrend   = $this->attendanceModel->getMonthlyTrend($iid, 6);

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? ['name' => 'My Institute'];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('dashboard/index', compact(
            'stats', 'recentActivity', 'upcomingClasses',
            'monthlyRevenue', 'attendanceTrend',
            'user', 'institute', 'flash', 'csrf'
        ));
    }

    private function getRecentActivity(int $instituteId): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT * FROM activity_log WHERE institute_id = ?
             ORDER BY created_at DESC LIMIT 8"
        );
        $stmt->execute([$instituteId]);
        return $stmt->fetchAll();
    }

    public function student(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['student']);

        $user      = $this->auth();
        $iid       = $this->instituteId();
        $institute = $_SESSION['institute'] ?? ['name' => 'My Institute'];
        
        $myStudent = $this->studentModel->findByUserId($user['id'], $iid);
        $results = [];
        $fees = [];
        $attendance = [];
        
        if ($myStudent) {
            $resultModel = new Result();
            $results = $resultModel->getByStudent($myStudent['id'], $iid);
            
            $fees = $this->feeModel->getAllPaginated($iid, ['student_id' => $myStudent['id']], 1, 100)['data'] ?? [];
            // Attendance model doesn't have getByStudent yet, we'll just fetch raw:
            $db = Database::getInstance();
            $attendance = $db->prepare("SELECT * FROM attendance WHERE student_id = ? AND institute_id = ? ORDER BY date DESC LIMIT 30");
            $attendance->execute([$myStudent['id'], $iid]);
            $attendance = $attendance->fetchAll();
        }

        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('dashboard/student', compact('user', 'myStudent', 'results', 'fees', 'attendance', 'institute', 'flash', 'csrf'));
    }

    public function teacher(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['teacher']);

        $user      = $this->auth();
        $iid       = $this->instituteId();
        $institute = $_SESSION['institute'] ?? ['name' => 'My Institute'];
        
        $batches = $this->batchModel->getByTeacher($iid, $user['id'], 'active');
        $batchCount = count($batches);
        
        $db = Database::getInstance();
        $studentCount = 0;
        foreach ($batches as $b) {
            $studentCount += $b['student_count'];
        }
        
        $recentClasses = $db->prepare("SELECT a.date, a.status, COUNT(a.id) as count, b.name as batch_name 
                                       FROM attendance a JOIN batches b ON a.batch_id = b.id 
                                       WHERE b.teacher_id = ? AND a.institute_id = ? 
                                       GROUP BY a.date, a.batch_id, a.status ORDER BY a.date DESC LIMIT 10");
        $recentClasses->execute([$user['id'], $iid]);
        $recentClasses = $recentClasses->fetchAll();

        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('dashboard/teacher', compact('user', 'institute', 'batches', 'batchCount', 'studentCount', 'recentClasses', 'flash', 'csrf'));
    }
}
