<?php
class AnalyticsController extends Controller
{
    private Fee        $feeModel;
    private Attendance $attendanceModel;
    private Result     $resultModel;
    private Student    $studentModel;
    private Batch      $batchModel;

    public function __construct()
    {
        $this->feeModel        = new Fee();
        $this->attendanceModel = new Attendance();
        $this->resultModel     = new Result();
        $this->studentModel    = new Student();
        $this->batchModel      = new Batch();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid = $this->instituteId();

        $monthlyRevenue  = $this->feeModel->getMonthlyRevenue($iid, 6);
        $attendanceTrend = $this->attendanceModel->getMonthlyTrend($iid, 6);
        $topStudents     = $this->resultModel->getTopPerformers($iid, 10);
        $batchAvg        = $this->resultModel->getAverageByBatch($iid);
        $feeStatus       = $this->feeModel->getStatusSummary($iid);

        $totalRevenue  = $this->feeModel->getTotalRevenue($iid);
        $totalPending  = $this->feeModel->getTotalPending($iid);
        $totalStudents = $this->studentModel->countByInstitute($iid);
        $avgAttendance = $this->attendanceModel->getAverageAttendance($iid);

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('analytics/index', compact(
            'monthlyRevenue', 'attendanceTrend', 'topStudents', 'batchAvg', 'feeStatus',
            'totalRevenue', 'totalPending', 'totalStudents', 'avgAttendance',
            'user', 'institute', 'flash', 'csrf'
        ));
    }

    /**
     * AJAX: Return chart data as JSON
     */
    public function getData(): void
    {
        Middleware::requireAuthAjax();
        Middleware::requireRole(['owner']);

        $iid  = $this->instituteId();
        $type = $_GET['type'] ?? 'revenue';

        switch ($type) {
            case 'revenue':
                $data = $this->feeModel->getMonthlyRevenue($iid, 6);
                break;
            case 'attendance':
                $data = $this->attendanceModel->getMonthlyTrend($iid, 6);
                break;
            case 'batch_performance':
                $data = $this->resultModel->getAverageByBatch($iid);
                break;
            default:
                $data = [];
        }

        $this->json(['data' => $data]);
    }
}
