<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResearchPaperController;
use App\Http\Controllers\Api\ResearchAreaController;
use App\Http\Controllers\Api\RoleVerificationController;
use App\Http\Controllers\Api\Admin\VerificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PaperController;
use App\Http\Controllers\Api\ResearcherController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaperSubmissionController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\MilestoneController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Authentication routes remain at /api/*
| Versioned application routes are under /api/v1/*
|
*/

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Register
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:5,1');

// Verify email OTP
Route::post('/otp/verify', [AuthController::class, 'verifyOtp'])
    ->middleware('throttle:10,1');

// Resend email OTP
Route::post('/otp/resend', [AuthController::class, 'resendOtp'])
    ->middleware('throttle:3,1');

// Login
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Current authenticated user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// ============================================================================
// VERSION 1 API ROUTES
// ============================================================================

Route::prefix('v1')->group(function () {

    // ========================================================================
    // PUBLIC ROUTES
    // ========================================================================

    // API health check
    Route::get('/ping', function () {
        return response()->json([
            'success' => true,
            'message' => 'ScholarOS API is working!',
            'timestamp' => now()->toISOString()
        ]);
    });

    // ========================================================================
    // ADMIN VERIFICATION
    // ========================================================================

    // Protected admin verification routes.
    //
    // auth:sanctum -> user must be authenticated
    // admin         -> user must have an administrator role
    //
    Route::middleware(['auth:sanctum', 'admin'])
        ->prefix('admin/verifications')
        ->group(function () {

            // GET /api/v1/admin/verifications
            // Retrieve verification requests
            Route::get('/', [VerificationController::class, 'index']);

            // GET /api/v1/admin/verifications/{id}
            // Retrieve a single verification request
            Route::get('/{id}', [VerificationController::class, 'show']);

            // POST /api/v1/admin/verifications/{id}/approve
            // Approve a pending verification request
            Route::post(
                '/{id}/approve',
                [VerificationController::class, 'approve']
            );

            // POST /api/v1/admin/verifications/{id}/reject
            // Reject a pending verification request
            Route::post(
                '/{id}/reject',
                [VerificationController::class, 'reject']
            );

            // GET /api/v1/admin/verifications/{id}/id-card
            // Securely retrieve the uploaded university ID card
            Route::get(
                '/{id}/id-card',
                [VerificationController::class, 'idCard']
            );
        });

    // ========================================================================
    // RESEARCH AREAS
    // ========================================================================

    // GET /api/v1/research-areas
    // Retrieve all available research areas
    Route::get(
        '/research-areas',
        [ResearchAreaController::class, 'index']
    );

    // POST /api/v1/research-areas
    // Save the authenticated user's selected research areas
    Route::middleware('auth:sanctum')->post(
        '/research-areas',
        [ResearchAreaController::class, 'store']
    );

    // ========================================================================
    // ROLE VERIFICATION
    // ========================================================================

    // Protected role verification routes
    Route::middleware('auth:sanctum')->group(function () {

        // POST /api/v1/role-verification
        // Submit a role verification request
        Route::post(
            '/role-verification',
            [RoleVerificationController::class, 'store']
        );

        // GET /api/v1/role-verification
        // Retrieve the authenticated user's verification status
        Route::get(
            '/role-verification',
            [RoleVerificationController::class, 'show']
        );
    });

    // ========================================================================
    // RESEARCH PAPERS
    // ========================================================================

    Route::prefix('papers')->group(function () {

        // ------------------------------------------------------------
        // GET ALL PAPERS
        // GET /api/v1/papers
        // ------------------------------------------------------------
        Route::get(
            '/',
            [ResearchPaperController::class, 'index']
        );

        // ------------------------------------------------------------
        // SEARCH PAPERS
        // GET /api/v1/papers/search?q=title&exact=true
        // ------------------------------------------------------------
        Route::get(
            '/search',
            [ResearchPaperController::class, 'search']
        );

        // ------------------------------------------------------------
        // SEARCH GOOGLE SCHOLAR
        // GET /api/v1/papers/scholar-search?q=title&limit=10
        // ------------------------------------------------------------
        Route::get(
            '/scholar-search',
            [ResearchPaperController::class, 'searchGoogleScholar']
        );

        // ------------------------------------------------------------
        // PERSONALIZED GOOGLE SCHOLAR RECOMMENDATIONS
        // GET /api/v1/papers/recommendations (authenticated)
        // ------------------------------------------------------------
        Route::middleware('auth:sanctum')->get(
            '/recommendations',
            [ResearchPaperController::class, 'recommendations']
        );

        // ------------------------------------------------------------
        // SUMMARIZE A RESEARCH PAPER (authenticated)
        // POST /api/v1/papers/summarize
        // ------------------------------------------------------------
        Route::middleware('auth:sanctum')->post(
            '/summarize',
            [ResearchPaperController::class, 'summarize']
        );

        // ------------------------------------------------------------
        // GET SINGLE PAPER
        // GET /api/v1/papers/{id}
        // ------------------------------------------------------------
        Route::get(
            '/{id}',
            [ResearchPaperController::class, 'show']
        );

        // ------------------------------------------------------------
        // PROTECTED PAPER ROUTES
        // ------------------------------------------------------------

        Route::middleware('auth:sanctum')->group(function () {

            // Create paper
            // POST /api/v1/papers
            Route::post(
                '/',
                [ResearchPaperController::class, 'store']
            );

            // Update paper
            // PUT /api/v1/papers/{id}
            Route::put(
                '/{id}',
                [ResearchPaperController::class, 'update']
            );

            // Delete paper
            // DELETE /api/v1/papers/{id}
            Route::delete(
                '/{id}',
                [ResearchPaperController::class, 'destroy']
            );
        });
    });

    // ========================================================================
    // PAPER SUBMISSIONS
    // ========================================================================

    Route::prefix('submissions')->group(function () {

        // ------------------------------------------------------------
        // AUTHENTICATED USER ROUTES
        // ------------------------------------------------------------
        
        Route::middleware('auth:sanctum')->group(function () {
            
            // GET /api/v1/submissions - Get user's papers
            Route::get('/', [PaperSubmissionController::class, 'index']);
            
            // POST /api/v1/submissions - Create draft
            Route::post('/', [PaperSubmissionController::class, 'store']);
            
            // GET /api/v1/submissions/{id} - Get single paper
            Route::get('/{id}', [PaperSubmissionController::class, 'show']);
            
            // PUT /api/v1/submissions/{id} - Update draft
            Route::put('/{id}', [PaperSubmissionController::class, 'update']);
            
            // DELETE /api/v1/submissions/{id} - Delete paper (draft or rejected only)
            Route::delete('/{id}', [PaperSubmissionController::class, 'destroy']);
            
            // POST /api/v1/submissions/{id}/submit - Submit for approval
            Route::post('/{id}/submit', [PaperSubmissionController::class, 'submit']);
        });
        
        // ------------------------------------------------------------
        // ADMIN ROUTES (Review & Approve)
        // ------------------------------------------------------------
        
        Route::middleware(['auth:sanctum', 'admin'])->group(function () {
            
            // GET /api/v1/submissions/review - Get papers for review
            Route::get('/review', [PaperSubmissionController::class, 'reviewIndex']);
            
            // POST /api/v1/submissions/{id}/approve - Approve paper
            Route::post('/{id}/approve', [PaperSubmissionController::class, 'approve']);
            
            // POST /api/v1/submissions/{id}/reject - Reject paper
            Route::post('/{id}/reject', [PaperSubmissionController::class, 'reject']);
            
            // POST /api/v1/submissions/{id}/return-to-draft - Return to draft
            Route::post('/{id}/return-to-draft', [PaperSubmissionController::class, 'returnToDraft']);
        });
    });

    // ========================================================================
    // PROJECTS
    // ========================================================================

    Route::prefix('projects')->group(function () {

        Route::middleware('auth:sanctum')->group(function () {
            
            // ------------------------------------------------------------
            // GET ALL PROJECTS
            // GET /api/v1/projects
            // ------------------------------------------------------------
            Route::get('/', [ProjectController::class, 'index']);
            
            // ------------------------------------------------------------
            // CREATE PROJECT
            // POST /api/v1/projects
            // ------------------------------------------------------------
            Route::post('/', [ProjectController::class, 'store']);
            
            // ------------------------------------------------------------
            // GET SINGLE PROJECT
            // GET /api/v1/projects/{id}
            // ------------------------------------------------------------
            Route::get('/{id}', [ProjectController::class, 'show']);
            
            // ------------------------------------------------------------
            // UPDATE PROJECT
            // PUT /api/v1/projects/{id}
            // ------------------------------------------------------------
            Route::put('/{id}', [ProjectController::class, 'update']);
            
            // ------------------------------------------------------------
            // DELETE PROJECT
            // DELETE /api/v1/projects/{id}
            // ------------------------------------------------------------
            Route::delete('/{id}', [ProjectController::class, 'destroy']);
            
            // ------------------------------------------------------------
            // PROJECT MEMBERS
            // ------------------------------------------------------------
            
            // GET /api/v1/projects/{id}/members - Get members
            Route::get('/{id}/members', [ProjectController::class, 'members']);
            
            // POST /api/v1/projects/{id}/members - Add member
            Route::post('/{id}/members', [ProjectController::class, 'addMember']);
            
            // DELETE /api/v1/projects/{id}/members/{memberId} - Remove member
            Route::delete('/{id}/members/{memberId}', [ProjectController::class, 'removeMember']);
        });
    });

    // ========================================================================
    // PROJECT RESOURCES (Files, Milestones, Tasks)
    // ========================================================================

    Route::prefix('projects/{project}')->middleware('auth:sanctum')->group(function () {

        // ------------------------------------------------------------
        // PROJECT FILES
        // ------------------------------------------------------------
        
        Route::prefix('files')->group(function () {
            // GET /api/v1/projects/{project}/files - Get all files
            Route::get('/', [FileController::class, 'index']);
            
            // POST /api/v1/projects/{project}/files - Upload file
            Route::post('/', [FileController::class, 'store']);
            
            // GET /api/v1/projects/{project}/files/{file} - Get file details
            Route::get('/{file}', [FileController::class, 'show']);
            
            // GET /api/v1/projects/{project}/files/{file}/download - Download file
            Route::get('/{file}/download', [FileController::class, 'download']);
            
            // DELETE /api/v1/projects/{project}/files/{file} - Delete file
            Route::delete('/{file}', [FileController::class, 'destroy']);
        });

        // ------------------------------------------------------------
        // PROJECT MILESTONES
        // ------------------------------------------------------------
        
        Route::prefix('milestones')->group(function () {
            // GET /api/v1/projects/{project}/milestones - Get all milestones
            Route::get('/', [MilestoneController::class, 'index']);
            
            // POST /api/v1/projects/{project}/milestones - Create milestone
            Route::post('/', [MilestoneController::class, 'store']);
            
            // GET /api/v1/projects/{project}/milestones/{milestone} - Get single milestone
            Route::get('/{milestone}', [MilestoneController::class, 'show']);
            
            // PUT /api/v1/projects/{project}/milestones/{milestone} - Update milestone
            Route::put('/{milestone}', [MilestoneController::class, 'update']);
            
            // PATCH /api/v1/projects/{project}/milestones/{milestone}/status - Update milestone status
            Route::patch('/{milestone}/status', [MilestoneController::class, 'updateStatus']);
            
            // DELETE /api/v1/projects/{project}/milestones/{milestone} - Delete milestone
            Route::delete('/{milestone}', [MilestoneController::class, 'destroy']);
        });

        // ------------------------------------------------------------
        // PROJECT TASKS
        // ------------------------------------------------------------
        
        Route::prefix('tasks')->group(function () {
            // GET /api/v1/projects/{project}/tasks - Get all tasks
            Route::get('/', [TaskController::class, 'index']);
            
            // POST /api/v1/projects/{project}/tasks - Create task
            Route::post('/', [TaskController::class, 'store']);
            
            // GET /api/v1/projects/{project}/tasks/{task} - Get single task
            Route::get('/{task}', [TaskController::class, 'show']);
            
            // PUT /api/v1/projects/{project}/tasks/{task} - Update task
            Route::put('/{task}', [TaskController::class, 'update']);
            
            // PATCH /api/v1/projects/{project}/tasks/{task}/status - Update task status
            Route::patch('/{task}/status', [TaskController::class, 'updateStatus']);
            
            // POST /api/v1/projects/{project}/tasks/{task}/assign - Assign task
            Route::post('/{task}/assign', [TaskController::class, 'assign']);
            
            // DELETE /api/v1/projects/{project}/tasks/{task} - Delete task
            Route::delete('/{task}', [TaskController::class, 'destroy']);
        });
    });

    // ========================================================================
    // DASHBOARD ROUTES
    // ========================================================================

    // All dashboard routes require authentication
    Route::middleware('auth:sanctum')->prefix('dashboard')->group(function () {

        // ------------------------------------------------------------
        // STATISTICS
        // GET /api/v1/dashboard/stats
        // ------------------------------------------------------------
        Route::get('/stats', [DashboardController::class, 'stats']);

        // ------------------------------------------------------------
        // RECENT ACTIVITY
        // GET /api/v1/dashboard/recent-activity
        // ------------------------------------------------------------
        Route::get('/recent-activity', [DashboardController::class, 'recentActivity']);

        // ------------------------------------------------------------
        // PROJECTS (Dashboard)
        // ------------------------------------------------------------
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/projects/{id}', [ProjectController::class, 'show']);
        Route::post('/projects', [ProjectController::class, 'store']);

        // ------------------------------------------------------------
        // PAPERS (Dashboard)
        // ------------------------------------------------------------
        Route::get('/papers', [PaperController::class, 'index']);
        Route::get('/papers/stats', [PaperController::class, 'stats']);

        // ------------------------------------------------------------
        // RESEARCHERS (Dashboard)
        // ------------------------------------------------------------
        Route::get('/researchers', [ResearcherController::class, 'index']);
        Route::get('/researchers/{id}', [ResearcherController::class, 'show']);
        Route::get('/researchers/search', [ResearcherController::class, 'search']);

        // ------------------------------------------------------------
        // NOTIFICATIONS (Dashboard)
        // ------------------------------------------------------------
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/count', [NotificationController::class, 'count']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    });

    // ========================================================================
    // VERSIONED USER PROFILE
    // ========================================================================

    // GET /api/v1/user
    Route::middleware('auth:sanctum')->get(
        '/user',
        function (Request $request) {
            $user = $request->user()->load([
                'role',
                'researchAreas',
                'department',
                'projectsAsMember',
                'supervisedProjects',
                'createdProjects',
            ]);

            return response()->json([
                'success' => true,
                'data' => $user,
            ]);
        }
    );
});