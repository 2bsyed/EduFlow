<?php
class TeacherController extends Controller
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid     = $this->instituteId();
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $filters = ['search' => $_GET['search'] ?? ''];

        $result  = $this->userModel->getTeachersPaginated($iid, $filters, $page, 15);

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('teachers/index', compact('result', 'filters', 'user', 'institute', 'flash', 'csrf'));
    }

    public function create(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('teachers/create', compact('user', 'institute', 'flash', 'csrf'));
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
            'email'        => $this->input('email'),
            'phone'        => $this->input('phone'),
            'role'         => 'teacher'
        ];

        if (!$data['name']) {
            $this->flash('error', 'Name is required.');
            $this->redirect('teachers.create');
            return;
        }

        // Check for duplicate email before attempting insert
        if (!empty($data['email']) && $this->userModel->emailExists($data['email'], $iid)) {
            $this->flash('error', 'A user with this email already exists in your institute.');
            $this->redirect('teachers.create');
            return;
        }

        $baseName = preg_replace('/[^a-z0-9]/', '', strtolower($data['name']));
        if (empty($baseName)) $baseName = 'teacher';
        $username = 'tea-' . $baseName;
        $counter = 1;

        while ($this->userModel->usernameExists($username, $iid)) {
            $username = 'tea-' . $baseName . $counter;
            $counter++;
        }

        $password = bin2hex(random_bytes(4)); // 8 char random password
        $data['username'] = $username;
        $data['password'] = $password;

        $userId = $this->userModel->create($data);

        $db = Database::getInstance();
        $stmt = $db->prepare(
            "INSERT INTO activity_log (institute_id, user_id, action, entity_type, entity_id, description)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$iid, $this->auth()['id'], 'teacher_enrolled', 'user', $userId, "New teacher enrolled: {$data['name']}"]);

        $_SESSION['flash']['card_data'] = [
            'title'    => 'Teacher Enrolled',
            'name'     => $data['name'],
            'username' => $username,
            'password' => $password
        ];
        
        $this->redirect('teachers');
    }

    public function edit(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid = $this->instituteId();
        $id  = (int)($_GET['id'] ?? 0);
        $teacher = $this->userModel->findById($id, $iid);

        if (!$teacher || $teacher['role'] !== 'teacher') {
            $this->flash('error', 'Teacher not found.');
            $this->redirect('teachers');
            return;
        }

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('teachers/edit', compact('teacher', 'user', 'institute', 'flash', 'csrf'));
    }

    public function update(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $data = [
            'name'   => $this->input('name'),
            'email'  => $this->input('email'),
            'phone'  => $this->input('phone'),
            'status' => $this->input('status')
        ];

        if (!$data['name']) {
            $this->flash('error', 'Name is required.');
            $this->redirect("teachers.edit&id=$id");
            return;
        }

        $this->userModel->update($id, $iid, $data);
        $this->flash('success', 'Teacher updated successfully.');
        $this->redirect('teachers');
    }

    public function delete(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $this->userModel->softDelete($id, $iid);
        $this->flash('success', 'Teacher archived.');
        $this->redirect('teachers');
    }

    public function destroy(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $teacher = $this->userModel->findById($id, $iid);
        if ($teacher && $teacher['role'] === 'teacher') {
            // Delete user. To avoid foreign key constraint error with batches,
            // we should nullify teacher_id in batches first.
            $db = Database::getInstance();
            $db->prepare("UPDATE batches SET teacher_id = NULL WHERE teacher_id = ? AND institute_id = ?")
               ->execute([$id, $iid]);

            $this->userModel->destroy($id, $iid);
            $this->flash('success', 'Teacher and all linked configurations permanently deleted.');
        } else {
            $this->flash('error', 'Teacher not found.');
        }

        $this->redirect('teachers');
    }
}
