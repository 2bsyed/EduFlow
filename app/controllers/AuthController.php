<?php
class AuthController extends Controller
{
    private User      $userModel;
    private Institute $instituteModel;

    public function __construct()
    {
        $this->userModel      = new User();
        $this->instituteModel = new Institute();
    }

    public function showLogin(): void
    {
        if ($this->auth()) {
            $this->redirect('dashboard');
        }
        $csrf  = $this->generateCsrfToken();
        $flash = $this->getFlash();
        $this->render('auth/login', compact('csrf', 'flash'), false);
    }

    public function login(): void
    {
        $this->validateCsrf();

        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        $remember = !empty($_POST['remember']);

        if (!$username || !$password) {
            $this->flash('error', 'User ID and password are required.');
            $this->redirect('login');
            return;
        }

        // Find institute by subdomain
        $subdomain = $_POST['subdomain'] ?? '';
        $institute = $this->findInstituteForLogin($subdomain);

        if (!$institute) {
            $this->flash('error', 'Institution not found. Please check your details.');
            $this->redirect('login');
            return;
        }

        $user = $this->userModel->findByUsername($username, $institute['id']);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->flash('error', 'Invalid User ID or password.');
            $this->redirect('login');
            return;
        }

        // Regenerate session to prevent fixation
        session_regenerate_id(true);

        $_SESSION['user'] = [
            'id'           => $user['id'],
            'institute_id' => $user['institute_id'],
            'name'         => $user['name'],
            'username'     => $user['username'],
            'role'         => $user['role'],
        ];

        $_SESSION['institute'] = [
            'id'   => $institute['id'],
            'name' => $institute['name'],
            'plan' => $institute['plan'],
            'logo_path' => $institute['logo_path'] ?? null
        ];

        if ($remember) {
            session_set_cookie_params(['lifetime' => 60 * 60 * 24 * 30]);
        }

        $this->userModel->updateLastLogin($user['id']);
        
        switch ($user['role']) {
            case 'owner':
                $this->redirect('dashboard');
                break;
            case 'teacher':
                $this->redirect('teacher.dashboard');
                break;
            case 'student':
                $this->redirect('student.dashboard');
                break;
            default:
                $this->redirect('dashboard');
        }
    }

    public function showRegister(): void
    {
        if ($this->auth()) {
            $this->redirect('dashboard');
        }
        $csrf  = $this->generateCsrfToken();
        $flash = $this->getFlash();
        $this->render('auth/register', compact('csrf', 'flash'), false);
    }

    public function register(): void
    {
        $this->validateCsrf();

        $instituteName = trim($_POST['institute_name'] ?? '');
        $subdomain     = strtolower(preg_replace('/[^a-z0-9]/i', '', $_POST['subdomain'] ?? ''));
        $ownerName     = trim($_POST['owner_name'] ?? '');
        $email         = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
        $password      = $_POST['password'] ?? '';
        $confirm       = $_POST['confirm_password'] ?? '';
        $phone         = trim($_POST['phone'] ?? '');

        $errors = [];
        if (!$instituteName)             $errors[] = 'Institution name is required.';
        if (!$subdomain || strlen($subdomain) < 3) $errors[] = 'Subdomain must be at least 3 characters.';
        if (!$ownerName)                 $errors[] = 'Your name is required.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required.';
        if (strlen($password) < 8)       $errors[] = 'Password must be at least 8 characters.';
        if ($password !== $confirm)      $errors[] = 'Passwords do not match.';

        if ($this->instituteModel->findBySubdomain($subdomain)) {
            $errors[] = 'That subdomain is already taken. Choose another.';
        }

        if (!empty($errors)) {
            $_SESSION['flash']['error']    = implode(' ', $errors);
            $_SESSION['flash']['formdata'] = $_POST;
            $this->redirect('register');
            return;
        }

        // Create institute
        $instituteId = $this->instituteModel->create([
            'name'      => $instituteName,
            'subdomain' => $subdomain,
            'phone'     => $phone,
        ]);

        $baseName = preg_replace('/[^a-z0-9]/', '', strtolower($ownerName));
        if (empty($baseName)) $baseName = 'owner';
        $username = 'own-' . $baseName;
        $counter = 1;

        while ($this->userModel->usernameExists($username, $instituteId)) {
            $username = 'own-' . $baseName . $counter;
            $counter++;
        }

        // Create owner user
        $this->userModel->create([
            'institute_id' => $instituteId,
            'name'         => $ownerName,
            'email'        => $email,
            'username'     => $username,
            'password'     => $password,
            'role'         => 'owner',
            'phone'        => $phone,
        ]);

        $this->flash('success', "Account created! Your User ID is <strong>$username</strong>. Please sign in to get started.");
        $this->redirect('login');
    }

    public function logout(): void
    {
        session_unset();
        session_destroy();
        header('Location: ' . APP_URL . '/index.php?route=login');
        exit;
    }

    private function findInstituteForLogin(string $subdomain): ?array
    {
        // If subdomain supplied use it
        if ($subdomain) {
            return $this->instituteModel->findBySubdomain($subdomain);
        }
        // Default: return first (demo/single-tenant fallback)
        return $this->instituteModel->getFirst();
    }
}
