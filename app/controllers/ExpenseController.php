<?php
class ExpenseController extends Controller
{
    private Expense $expenseModel;
    private User    $userModel;

    public function __construct()
    {
        $this->expenseModel = new Expense();
        $this->userModel    = new User();
    }

    public function index(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid     = $this->instituteId();
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $tab     = $_GET['tab'] ?? 'all';
        $filters = [
            'category' => $_GET['category'] ?? '',
            'status'   => $_GET['status']   ?? '',
            'search'   => $_GET['search']   ?? '',
        ];

        $result       = $this->expenseModel->getAllPaginated($iid, $filters, $page, 15);
        $summary      = $this->expenseModel->getSummary($iid);
        $salaries     = $this->expenseModel->getSalaryByTeacher($iid);
        $recurring    = $this->expenseModel->getRecurringDue($iid);
        $breakdown    = $this->expenseModel->getCategoryBreakdown($iid);
        $monthlyTotal = $this->expenseModel->getMonthlyTotal($iid);

        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('expenses/index', compact(
            'result', 'summary', 'salaries', 'recurring', 'breakdown', 'monthlyTotal',
            'filters', 'tab', 'user', 'institute', 'flash', 'csrf'
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

        $this->render('expenses/create', compact(
            'teachers', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function store(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();

        $category     = $this->input('category');
        $isRecurring  = (int)$this->inputRaw('is_recurring', 0);
        $recurInterval = $this->input('recurring_interval');
        $dueDate      = $this->input('due_date');
        $status       = $this->input('status') ?: 'pending';

        // Calculate next_due_date for recurring expenses
        $nextDue = null;
        if ($isRecurring && $dueDate) {
            switch ($recurInterval) {
                case 'monthly':   $nextDue = date('Y-m-d', strtotime($dueDate . ' +1 month')); break;
                case 'quarterly': $nextDue = date('Y-m-d', strtotime($dueDate . ' +3 months')); break;
                case 'yearly':    $nextDue = date('Y-m-d', strtotime($dueDate . ' +1 year')); break;
            }
        }

        $data = [
            'institute_id'       => $iid,
            'category'           => $category,
            'title'              => $this->input('title'),
            'description'        => $this->input('description'),
            'amount'             => (float)$this->inputRaw('amount', 0),
            'teacher_id'         => $this->inputRaw('teacher_id') ?: null,
            'due_date'           => $dueDate,
            'payment_date'       => $this->input('payment_date') ?: null,
            'is_recurring'       => $isRecurring,
            'recurring_interval' => $isRecurring ? $recurInterval : null,
            'next_due_date'      => $nextDue,
            'payment_mode'       => $this->input('payment_mode') ?: null,
            'reference_no'       => $this->input('reference_no'),
            'status'             => $status,
            'created_by'         => $this->auth()['id'],
        ];

        if (!$data['title'] || !$data['amount'] || !$data['due_date']) {
            $this->flash('error', 'Title, amount, and due date are required.');
            $this->redirect('expenses.create');
            return;
        }

        $this->expenseModel->create($data);
        $this->flash('success', 'Expense recorded successfully.');
        $this->redirect('expenses');
    }

    public function edit(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);

        $iid     = $this->instituteId();
        $id      = (int)($_GET['id'] ?? 0);
        $expense = $this->expenseModel->findById($id, $iid);

        if (!$expense) {
            $this->flash('error', 'Expense not found.');
            $this->redirect('expenses');
            return;
        }

        $teachers  = $this->userModel->getTeachersByInstitute($iid);
        $user      = $this->auth();
        $institute = $_SESSION['institute'] ?? [];
        $flash     = $this->getFlash();
        $csrf      = $this->generateCsrfToken();

        $this->render('expenses/create', compact(
            'expense', 'teachers', 'user', 'institute', 'flash', 'csrf'
        ));
    }

    public function update(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $isRecurring   = (int)$this->inputRaw('is_recurring', 0);
        $recurInterval = $this->input('recurring_interval');
        $dueDate       = $this->input('due_date');

        $nextDue = null;
        if ($isRecurring && $dueDate) {
            switch ($recurInterval) {
                case 'monthly':   $nextDue = date('Y-m-d', strtotime($dueDate . ' +1 month')); break;
                case 'quarterly': $nextDue = date('Y-m-d', strtotime($dueDate . ' +3 months')); break;
                case 'yearly':    $nextDue = date('Y-m-d', strtotime($dueDate . ' +1 year')); break;
            }
        }

        $data = [
            'category'           => $this->input('category'),
            'title'              => $this->input('title'),
            'description'        => $this->input('description'),
            'amount'             => (float)$this->inputRaw('amount', 0),
            'teacher_id'         => $this->inputRaw('teacher_id') ?: null,
            'due_date'           => $dueDate,
            'payment_date'       => $this->input('payment_date') ?: null,
            'is_recurring'       => $isRecurring,
            'recurring_interval' => $isRecurring ? $recurInterval : null,
            'next_due_date'      => $nextDue,
            'payment_mode'       => $this->input('payment_mode') ?: null,
            'reference_no'       => $this->input('reference_no'),
            'status'             => $this->input('status') ?: 'pending',
        ];

        $this->expenseModel->update($id, $iid, $data);
        $this->flash('success', 'Expense updated successfully.');
        $this->redirect('expenses');
    }

    public function delete(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $this->expenseModel->delete($id, $iid);
        $this->flash('success', 'Expense deleted.');
        $this->redirect('expenses');
    }

    public function markPaid(): void
    {
        Middleware::requireAuth();
        Middleware::requireRole(['owner']);
        $this->validateCsrf();

        $iid = $this->instituteId();
        $id  = (int)($_POST['id'] ?? 0);

        $expense = $this->expenseModel->findById($id, $iid);
        if (!$expense) {
            $this->flash('error', 'Expense not found.');
            $this->redirect('expenses');
            return;
        }

        $paymentMode = $this->input('payment_mode') ?: 'cash';
        $referenceNo = $this->input('reference_no') ?: '';

        if ($expense['is_recurring']) {
            // Renew: mark paid + create next cycle
            $this->expenseModel->renewRecurring($id, $iid, $paymentMode, $referenceNo);
            $this->flash('success', 'Recurring expense marked as paid. Next cycle created automatically.');
        } else {
            $this->expenseModel->update($id, $iid, array_merge($expense, [
                'status'       => 'paid',
                'payment_date' => date('Y-m-d'),
                'payment_mode' => $paymentMode,
                'reference_no' => $referenceNo,
            ]));
            $this->flash('success', 'Expense marked as paid.');
        }

        $this->redirect('expenses');
    }
}
