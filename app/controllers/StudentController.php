<?php
class StudentController extends Controller
{
    private Student $studentModel;
    private Batch   $batchModel;

    public function __construct()
    {
        $this->studentModel = new Student();
        $this->batchModel   = new Batch();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);

        $iid     = $this->instituteId();
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $filters = [
            'batch_id' => $_GET['batch_id'] ?? '',
            'status'   => $_GET['status']   ?? 'active',
            'search'   => $_GET['search']   ?? '',
        ];

        $user = $this->auth();
        $isTeacher = ($user['role'] === 'teacher');
        $teacherId = $user['id'];

        if ($isTeacher) {
            $batches = $this->batchModel->getByTeacher($iid, $teacherId, 'active');
            // enforce custom logic on $filters to limit batch list or inject logic into model
            if (empty($filters['batch_id'])) {
                $filters['teacher_id'] = $teacherId;
            }
        } else {
            $batches = $this->batchModel->getAll($iid, 'active');
        }

        $result  = $this->studentModel->getAllPaginated($iid, $filters, $page, 15);

        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('students/index', compact(
            'result', 'batches', 'filters', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function create(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);

        $iid     = $this->instituteId();
        $user    = $this->auth();
        $isTeacher = ($user['role'] === 'teacher');
        
        $batches = $isTeacher ? $this->batchModel->getByTeacher($iid, $user['id'], 'active') : $this->batchModel->getAll($iid, 'active');
        $nextRoll = $this->studentModel->generateRollNo($iid);

        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('students/create', compact(
            'batches', 'nextRoll', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function store(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);
        $this->validateCsrf();

        $iid = $this->instituteId();

        $data = [
            'institute_id'  => $iid,
            'roll_no'       => $this->input('roll_no'),
            'batch_ids'     => $_POST['batch_ids'] ?? [],
        ];

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $batches = $this->batchModel->getByTeacher($iid, $user['id']);
            $allowedBatchIds = array_column($batches, 'id');
            foreach ($data['batch_ids'] as $bId) {
                if (!in_array($bId, $allowedBatchIds)) {
                    $this->flash('error', 'Unauthorized batch selection.');
                    $this->redirect('students.create');
                    return;
                }
            }
        }

        $data = [
            'institute_id'  => $iid,
            'roll_no'       => $data['roll_no'],
            'batch_ids'     => $data['batch_ids'],
            'full_name'     => $this->input('full_name'),
            'email'         => $this->input('email'),
            'phone'         => $this->input('phone'),
            'date_of_birth' => $this->input('date_of_birth'),
            'guardian_name' => $this->input('guardian_name'),
            'guardian_phone'=> $this->input('guardian_phone'),
            'address'       => $this->input('address'),
        ];

        if (!$data['full_name'] || !$data['roll_no']) {
            $this->flash('error', 'Name and Roll No are required.');
            $this->redirect('students.create');
            return;
        }

        if ($this->studentModel->rollNoExists($data['roll_no'], $iid)) {
            $this->flash('error', 'Roll No already exists.');
            $this->redirect('students.create');
            return;
        }

        $userModel = new User();

        // Check for duplicate email before attempting insert
        if (!empty($data['email']) && $userModel->emailExists($data['email'], $iid)) {
            $this->flash('error', 'A user with this email already exists in your institute.');
            $this->redirect('students.create');
            return;
        }

        $baseName = preg_replace('/[^a-z0-9]/', '', strtolower($data['full_name']));
        if (empty($baseName)) $baseName = 'user';
        $username = 'std-' . $baseName;
        $counter = 1;

        while ($userModel->usernameExists($username, $iid)) {
            $username = 'std-' . $baseName . $counter;
            $counter++;
        }

        $password = bin2hex(random_bytes(4)); // 8 char random password

        $userId = $userModel->create([
            'institute_id' => $iid,
            'name'         => $data['full_name'],
            'email'        => $data['email'],
            'username'     => $username,
            'password'     => $password,
            'role'         => 'student',
            'phone'        => $data['phone']
        ]);

        $data['user_id'] = $userId;
        $id = $this->studentModel->create($data);

        // Auto-assign batch fee
        if (!empty($data['batch_ids'])) {
            foreach ($data['batch_ids'] as $bId) {
                if ($bId > 0) {
                    $batchInfo = $this->batchModel->findById($bId, $iid);
                    if ($batchInfo && (float)$batchInfo['fee_amount'] > 0) {
                        $feeModel = new Fee();
                        $feeModel->create([
                            'institute_id' => $iid,
                            'student_id'   => $id,
                            'batch_id'     => $bId,
                            'amount'       => (float)$batchInfo['fee_amount'],
                            'due_date'     => date('Y-m-d', strtotime('+7 days')),
                            'created_by'   => $this->auth()['id']
                        ]);
                    }
                }
            }
        }
        
        $this->logActivity($iid, 'student_enrolled', 'student', $id, "New student enrolled: {$data['full_name']}");
        
        $_SESSION['flash']['card_data'] = [
            'title'    => 'Student Enrolled',
            'name'     => $data['full_name'],
            'username' => $username,
            'password' => $password
        ];
        
        $this->redirect('students');
    }

    public function edit(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);

        $iid     = $this->instituteId();
        $id      = (int)($_GET['id'] ?? 0);
        $student = $this->studentModel->findById($id, $iid);

        if (!$student) {
            $this->flash('error', 'Student not found.');
            $this->redirect('students');
            return;
        }

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $allowed = false;
            $batches = $this->batchModel->getByTeacher($iid, $user['id']);
            foreach ($batches as $b) {
                if ($b['id'] == $student['batch_id']) {
                    $allowed = true;
                    break;
                }
            }
            if (!$allowed) {
                $this->flash('error', 'Unauthorized student access.');
                $this->redirect('students');
                return;
            }
        }

        $batches   = $this->batchModel->getAll($iid);
        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('students/edit', compact(
            'student', 'batches', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function update(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner', 'teacher']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $data = [
            'roll_no'       => $this->input('roll_no'),
            'batch_ids'     => $_POST['batch_ids'] ?? [],
        ];

        $user = $this->auth();
        if ($user['role'] === 'teacher') {
            $batches = $this->batchModel->getByTeacher($iid, $user['id']);
            $allowedBatchIds = array_column($batches, 'id');
            foreach ($data['batch_ids'] as $bId) {
                if (!in_array($bId, $allowedBatchIds)) {
                    $this->flash('error', 'Unauthorized batch selection.');
                    $this->redirect("students.edit&id=$id");
                    return;
                }
            }
        }

        $data = [
            'roll_no'       => $data['roll_no'],
            'batch_ids'     => $data['batch_ids'],
            'full_name'     => $this->input('full_name'),
            'email'         => $this->input('email'),
            'phone'         => $this->input('phone'),
            'date_of_birth' => $this->input('date_of_birth'),
            'guardian_name' => $this->input('guardian_name'),
            'guardian_phone'=> $this->input('guardian_phone'),
            'address'       => $this->input('address'),
            'status'        => $this->input('status'),
        ];

        if ($this->studentModel->rollNoExists($data['roll_no'], $iid, $id)) {
            $this->flash('error', 'Roll No already in use by another student.');
            $this->redirect("students.edit&id=$id");
            return;
        }

        $this->studentModel->update($id, $iid, $data);
        $this->flash('success', 'Student updated successfully.');
        $this->redirect('students');
    }

    public function delete(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $this->studentModel->softDelete($id, $iid);
        $this->flash('success', 'Student archived.');
        $this->redirect('students');
    }

    public function destroy(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $student = $this->studentModel->findById($id, $iid);
        if ($student) {
            $userId = $student['user_id'];
            // Student deletion cascades to fees, attendance, results
            $this->studentModel->destroy($id, $iid);
            // Then manually delete the parent user record to fully wipe
            if ($userId) {
                $userModel = new User();
                $userModel->destroy($userId, $iid);
            }
            $this->flash('success', 'Student and all linked records permanently deleted.');
        } else {
            $this->flash('error', 'Student not found.');
        }

        $this->redirect('students');
    }

    public function search(): void
    {
        Middleware::requireRoleAjax(['owner', 'teacher']);

        $iid  = $this->instituteId();
        $term = $this->input('q');
        $data = $this->studentModel->searchJson($iid, $term);
        $this->json(['students' => $data]);
    }

    private function logActivity(int $iid, string $action, string $type, int $entityId, string $desc): void
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            "INSERT INTO activity_log (institute_id, user_id, action, entity_type, entity_id, description)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$iid, $this->auth()['id'], $action, $type, $entityId, $desc]);
    }
}
