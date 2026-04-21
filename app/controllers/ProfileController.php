<?php

class ProfileController extends Controller
{
    private User $userModel;
    private Institute $instituteModel;

    public function __construct()
    {
        $this->userModel = new User();
        $this->instituteModel = new Institute();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        $user = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash = $this->getFlash();
        $csrf = $this->generateCsrfToken();

        // Refresh user info directly to ensure UI reflects real DB values
        $fullUser = $this->userModel->findById($user['id'], $user['institute_id']);
        
        // Extract prefix based on role
        $prefix = 'std-';
        if ($fullUser['role'] === 'owner') $prefix = 'own-';
        if ($fullUser['role'] === 'teacher') $prefix = 'tea-';

        // Get the editable suffix part
        $suffix = substr($fullUser['username'], 4);

        $this->render('profile/index', compact('fullUser', 'institute', 'flash', 'csrf', 'prefix', 'suffix'));
    }

    public function updatePassword(): void
    {
        Middleware::requireAuth();
        $this->validateCsrf();

        $user = $this->auth();
        $oldPass = $_POST['old_password'] ?? '';
        $newPass = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';

        $fullUser = $this->userModel->findById($user['id'], $user['institute_id']);

        if (!password_verify($oldPass, $fullUser['password_hash'] ?? '')) {
            $this->flash('error', 'Incorrect current password provided.');
            $this->redirect('profile');
            return;
        }

        if (strlen($newPass) < 8) {
            $this->flash('error', 'New password must be at least 8 characters long.');
            $this->redirect('profile');
            return;
        }

        if ($newPass !== $confirm) {
            $this->flash('error', 'New passwords do not match.');
            $this->redirect('profile');
            return;
        }

        $newHash = password_hash($newPass, PASSWORD_BCRYPT, ['cost' => 12]);
        $this->userModel->updateCredentials($user['id'], $fullUser['username'], $newHash);
        
        $this->flash('success', 'Your password has been successfully updated.');
        $this->redirect('profile');
    }

    public function updateUsername(): void
    {
        Middleware::requireAuth();
        $this->validateCsrf();

        $user = $this->auth();
        $fullUser = $this->userModel->findById($user['id'], $user['institute_id']);

        $prefix = 'std-';
        if ($fullUser['role'] === 'owner') $prefix = 'own-';
        if ($fullUser['role'] === 'teacher') $prefix = 'tea-';

        $suffix = preg_replace('/[^a-z0-9]/', '', strtolower($_POST['username_suffix'] ?? ''));

        if (empty($suffix)) {
            $this->flash('error', 'User ID suffix cannot be empty.');
            $this->redirect('profile');
            return;
        }

        $newUsername = $prefix . $suffix;

        if ($newUsername !== $fullUser['username'] && $this->userModel->usernameExists($newUsername, $user['institute_id'])) {
            $this->flash('error', "The User ID $newUsername is already taken.");
            $this->redirect('profile');
            return;
        }

        $this->userModel->updateCredentials($user['id'], $newUsername);
        
        // Update session
        $_SESSION['user']['username'] = $newUsername;

        $this->flash('success', 'Your User ID has been updated.');
        $this->redirect('profile');
    }

    public function updateLogo(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $user = $this->auth();
        $iid = $user['institute_id'];

        if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
            $this->flash('error', 'Please select a valid image file to upload.');
            $this->redirect('profile');
            return;
        }

        $file = $_FILES['logo'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

        if (!in_array($ext, $allowed)) {
            $this->flash('error', 'Only JPG, PNG, WEBP, or SVG files are allowed.');
            $this->redirect('profile');
            return;
        }

        if ($file['size'] > 2 * 1024 * 1024) {
            $this->flash('error', 'File size must not exceed 2MB.');
            $this->redirect('profile');
            return;
        }

        $uploadDir = __DIR__ . '/../../public/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Clean potentially existing previous logo file
        $institute = $this->instituteModel->findById($iid);
        if ($institute['logo_path'] && file_exists($uploadDir . $institute['logo_path'])) {
            @unlink($uploadDir . $institute['logo_path']);
        }

        $filename = 'logo_' . $iid . '_' . time() . '.' . $ext;
        if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            // Update db
            $this->instituteModel->updateLogo($iid, $filename);
            
            // Update session cache
            $_SESSION['institute']['logo_path'] = $filename;
            
            $this->flash('success', 'Institute logo updated successfully.');
        } else {
            $this->flash('error', 'Failed to upload logo.');
        }

        $this->redirect('profile');
    }
}
