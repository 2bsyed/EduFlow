<?php
class FeeController extends Controller
{
    private Fee     $feeModel;
    private Student $studentModel;
    private Batch   $batchModel;

    public function __construct()
    {
        $this->feeModel     = new Fee();
        $this->studentModel = new Student();
        $this->batchModel   = new Batch();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'student']);

        $iid     = $this->instituteId();
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $filters = [
            'status' => $_GET['status'] ?? '',
            'search' => $_GET['search'] ?? '',
        ];

        $user = $this->auth();
        $studentId = 0;
        
        if ($user['role'] === 'student') {
            $myStudent = $this->studentModel->findByUserId($user['id'], $iid);
            if ($myStudent) {
                $studentId = $myStudent['id'];
                $filters['student_id'] = $studentId;
            } else {
                $filters['student_id'] = -1; // Force empty result if unlinked
            }
        }

        $result      = $this->feeModel->getAllPaginated($iid, $filters, $page, 15);
        $statusSummary = $this->feeModel->getStatusSummary($iid, $studentId);
        $totalRevenue = $this->feeModel->getTotalRevenue($iid, $studentId);
        $totalPending = $this->feeModel->getTotalPending($iid, $studentId);

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('fees/index', compact(
            'result', 'filters', 'statusSummary',
            'totalRevenue', 'totalPending',
            'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function create(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid      = $this->instituteId();
        $students = $this->studentModel->getByBatch(0, $iid) ?: [];
        // Get all active students
        $result   = $this->studentModel->getAllPaginated($iid, ['status' => 'active'], 1, 500);
        $students = $result['data'] ?? [];
        $batches  = $this->batchModel->getAll($iid, 'active');

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('fees/create', compact(
            'students', 'batches', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function store(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();

        $data = [
            'institute_id' => $iid,
            'student_id'   => (int)$this->inputRaw('student_id'),
            'batch_id'     => (int)$this->inputRaw('batch_id'),
            'amount'       => (float)$this->inputRaw('amount'),
            'due_date'     => $this->input('due_date'),
            'created_by'   => $this->auth()['id'],
        ];

        if (!$data['student_id'] || !$data['amount'] || !$data['due_date']) {
            $this->flash('error', 'Student, amount, and due date are required.');
            $this->redirect('fees.create');
            return;
        }

        $this->feeModel->create($data);
        $this->flash('success', 'Fee record created successfully.');
        $this->redirect('fees');
    }

    public function recordPayment(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid  = $this->instituteId();
        $id   = (int)($_GET['id'] ?? 0);
        $fee  = $this->feeModel->findById($id, $iid);

        if (!$fee) {
            $this->flash('error', 'Fee record not found.');
            $this->redirect('fees');
            return;
        }

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('fees/record', compact('fee', 'user', 'institute', 'flash', 'csrf'));
    }

    /**
     * AJAX: Mark fee as paid
     */
    public function updateStatus(): void
    {
        Middleware::requireAuthAjax();

        $token = $_POST['csrf_token'] ?? '';
        if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            $this->json(['error' => 'CSRF validation failed'], 403);
            return;
        }

        $iid    = $this->instituteId();
        $id     = (int)($_POST['id'] ?? 0);
        $amount = (float)($_POST['amount'] ?? 0);
        $mode   = $_POST['mode'] ?? 'cash';

        if (!in_array($mode, ['cash', 'online', 'cheque', 'bank_transfer'], true)) {
            $mode = 'cash';
        }

        $ok = $this->feeModel->markAsPaid($id, $iid, $amount, $mode);
        $this->json(['success' => $ok]);
    }
}
