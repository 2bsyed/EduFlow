<?php
class ResultController extends Controller
{
    private Result  $resultModel;
    private Student $studentModel;
    private Batch   $batchModel;

    public function __construct()
    {
        $this->resultModel  = new Result();
        $this->studentModel = new Student();
        $this->batchModel   = new Batch();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher', 'student']);

        $iid     = $this->instituteId();
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $filters = [
            'batch_id' => $_GET['batch_id'] ?? '',
            'search'   => $_GET['search']   ?? '',
        ];

        $user = $this->auth();
        $isTeacher = ($user['role'] === 'teacher');
        $isStudent = ($user['role'] === 'student');
        $teacherId = $user['id'];

        if ($isTeacher) {
            $batches = $this->batchModel->getByTeacher($iid, $teacherId, 'active');
            if (empty($filters['batch_id'])) {
                $filters['teacher_id'] = $teacherId;
            }
        } elseif ($isStudent) {
            $batches = []; // Students don't need batch filter dropdown list
            $myStudent = $this->studentModel->findByUserId($user['id'], $iid);
            if ($myStudent) {
                $filters['student_id'] = $myStudent['id'];
            } else {
                $filters['student_id'] = -1; 
            }
        } else {
            $batches = $this->batchModel->getAll($iid, 'active');
        }

        $result      = $this->resultModel->getAllPaginated($iid, $filters, $page, 15);
        
        $topStudents = [];
        $batchAvg    = [];
        if (!$isStudent) {
            $topStudents = $this->resultModel->getTopPerformers($iid, 5);
            $batchAvg    = $this->resultModel->getAverageByBatch($iid);
        }

        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('results/index', compact(
            'result', 'batches', 'filters', 'topStudents', 'batchAvg',
            'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function entry(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);

        $iid     = $this->instituteId();
        $user      = $this->auth();
        
        $batches = ($user['role'] === 'teacher') 
                   ? $this->batchModel->getByTeacher($iid, $user['id'], 'active')
                   : $this->batchModel->getAll($iid, 'active');

        $selectedBatch = (int)($_GET['batch_id'] ?? 0);
        
        if ($selectedBatch && $user['role'] === 'teacher') {
            $allowed = false;
            foreach ($batches as $b) {
                if ($b['id'] == $selectedBatch) $allowed = true;
            }
            if (!$allowed) {
                $selectedBatch = 0;
                $this->flash('error', 'Unauthorized batch access.');
            }
        }
        
        $students = [];
        if ($selectedBatch) {
            $students = $this->studentModel->getByBatch($selectedBatch, $iid);
        }

        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('results/entry', compact(
            'batches', 'students', 'selectedBatch', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function store(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);
        $this->validateCsrf();

        $iid = $this->instituteId();

        $studentIds = $_POST['student_id'] ?? [];
        $marks      = $_POST['marks_obtained'] ?? [];
        $total      = (float)($_POST['marks_total'] ?? 100);
        $batchId    = (int)($_POST['batch_id'] ?? 0);
        $subject    = $this->input('subject');
        $examName   = $this->input('exam_name');
        $examDate   = $this->input('exam_date');

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $batches = $this->batchModel->getByTeacher($iid, $user['id']);
            $allowed = false;
            foreach ($batches as $b) {
                if ($b['id'] == $batchId) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                $this->flash('error', 'Unauthorized batch selection.');
                $this->redirect('results.entry');
                return;
            }
        }

        if (!$batchId || !$subject || !$examDate) {
            $this->flash('error', 'Batch, subject, and exam date are required.');
            $this->redirect('results.entry');
            return;
        }

        $count = 0;
        foreach ($studentIds as $i => $sid) {
            $sid = (int)$sid;
            $obtained = (float)($marks[$i] ?? 0);
            if ($sid > 0) {
                $this->resultModel->create([
                    'institute_id'   => $iid,
                    'student_id'     => $sid,
                    'batch_id'       => $batchId,
                    'subject'        => $subject,
                    'exam_name'      => $examName,
                    'marks_obtained' => $obtained,
                    'marks_total'    => $total,
                    'exam_date'      => $examDate,
                    'entered_by'     => $this->auth()['id'],
                ]);
                $count++;
            }
        }

        $this->flash('success', "Results saved for $count students.");
        $this->redirect('results');
    }

    public function edit(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);

        $iid = $this->instituteId();
        $id  = (int)($_GET['id'] ?? 0);

        $res = $this->resultModel->findById($id, $iid);
        if (!$res) {
            $this->flash('error', 'Result not found.');
            $this->redirect('results');
            return;
        }

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $batches = $this->batchModel->getByTeacher($iid, $user['id']);
            $allowed = false;
            foreach ($batches as $b) {
                if ($b['id'] == $res['batch_id']) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                $this->flash('error', 'Unauthorized access.');
                $this->redirect('results');
                return;
            }
        }

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('results/edit', compact('res', 'user', 'institute', 'flash', 'csrf'));
    }

    public function update(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $res = $this->resultModel->findById($id, $iid);
        if (!$res) {
            $this->flash('error', 'Result not found.');
            $this->redirect('results');
            return;
        }

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $batches = $this->batchModel->getByTeacher($iid, $user['id']);
            $allowed = false;
            foreach ($batches as $b) {
                if ($b['id'] == $res['batch_id']) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                $this->flash('error', 'Unauthorized access.');
                $this->redirect('results');
                return;
            }
        }

        $data = [
            'subject'        => $this->input('subject'),
            'exam_name'      => $this->input('exam_name'),
            'marks_obtained' => (float)$this->input('marks_obtained'),
            'marks_total'    => (float)$this->input('marks_total'),
            'exam_date'      => $this->input('exam_date'),
        ];

        if (empty($data['subject']) || empty($data['exam_date'])) {
            $this->flash('error', 'Subject and Date are required.');
            $this->redirect("results.edit&id=$id");
            return;
        }

        if ($this->resultModel->updateRecord($id, $data, $iid)) {
            $this->flash('success', 'Result updated successfully.');
            $this->redirect('results');
        } else {
            $this->flash('error', 'Failed to update result.');
            $this->redirect("results.edit&id=$id");
        }
    }

    public function delete(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);
        $this->resultModel->delete($id, $iid);
        $this->flash('success', 'Result deleted.');
        $this->redirect('results');
    }
}
