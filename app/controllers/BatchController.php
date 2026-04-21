<?php
class BatchController extends Controller
{
    private Batch $batchModel;
    private User  $userModel;

    public function __construct()
    {
        $this->batchModel = new Batch();
        $this->userModel  = new User();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);

        $user      = $this->auth();
        $iid     = $this->instituteId();
        $page    = max(1, (int)($_GET['page'] ?? 1));
        
        $filters = [];
        if ($user['role'] === 'teacher') {
            $filters['teacher_id'] = $user['id'];
        }
        
        $result  = $this->batchModel->getAllPaginated($iid, $filters, $page, 12);
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('batches/index', compact(
            'result', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function create(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid      = $this->instituteId();
        $teachers = $this->userModel->getTeachersByInstitute($iid);
        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('batches/create', compact(
            'teachers', 'user', 'institute', 'flash', 'csrf'
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
            'name'         => $this->input('name'),
            'subject'      => $this->input('subject'),
            'teacher_id'   => $this->inputRaw('teacher_id'),
            'schedule'     => $this->input('schedule'),
            'room'         => $this->input('room'),
            'capacity'     => (int)$this->inputRaw('capacity', 30),
            'start_date'   => $this->input('start_date'),
            'end_date'     => $this->input('end_date'),
            'fee_amount'   => (float)$this->inputRaw('fee_amount', 0),
        ];

        if (!$data['name'] || !$data['subject']) {
            $this->flash('error', 'Batch name and subject are required.');
            $this->redirect('batches.create');
            return;
        }

        $this->batchModel->create($data);
        $this->flash('success', "Batch '{$data['name']}' created successfully.");
        $this->redirect('batches');
    }

    public function edit(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid   = $this->instituteId();
        $id    = (int)($_GET['id'] ?? 0);
        $batch = $this->batchModel->findById($id, $iid);

        if (!$batch) {
            $this->flash('error', 'Batch not found.');
            $this->redirect('batches');
            return;
        }

        $teachers  = $this->userModel->getTeachersByInstitute($iid);
        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('batches/create', compact(
            'batch', 'teachers', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function update(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $data = [
            'name'       => $this->input('name'),
            'subject'    => $this->input('subject'),
            'teacher_id' => $this->inputRaw('teacher_id'),
            'schedule'   => $this->input('schedule'),
            'room'       => $this->input('room'),
            'capacity'   => (int)$this->inputRaw('capacity', 30),
            'start_date' => $this->input('start_date'),
            'end_date'   => $this->input('end_date'),
            'fee_amount' => (float)$this->inputRaw('fee_amount', 0),
            'status'     => $this->input('status'),
        ];

        $this->batchModel->update($id, $iid, $data);
        $this->flash('success', 'Batch updated successfully.');
        $this->redirect('batches');
    }

    public function delete(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);
        $this->batchModel->delete($id, $iid);
        $this->flash('success', 'Batch cancelled.');
        $this->redirect('batches');
    }
}
