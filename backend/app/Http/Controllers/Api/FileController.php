<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\UploadedFile;

class FileController extends Controller
{
    /**
     * Allowed file types
     */
    protected $allowedTypes = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'txt', 'csv', 'zip', 'rar', '7z',
        'jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp',
        'mp4', 'avi', 'mov', 'mkv',
        'mp3', 'wav', 'aac',
    ];

    /**
     * Max file size (10MB)
     */
    protected $maxFileSize = 10485760; // 10MB

    /**
     * Get all files for a project
     * GET /api/v1/projects/{project}/files
     */
    public function index(Request $request, $projectId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check access
        if (!$this->canAccess($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $query = File::where('project_id', $projectId)->with('uploadedBy');

        // Filter by type
        if ($request->has('type')) {
            $query->where('file_type', $request->type);
        }

        // Filter by search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('file_name', 'LIKE', "%{$search}%");
        }

        $files = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'message' => 'Files retrieved successfully',
            'data' => $files,
        ]);
    }

    /**
     * Upload a file to a project
     * POST /api/v1/projects/{project}/files
     */
    public function store(Request $request, $projectId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can upload
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to upload files to this project',
            ], 403);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:' . ($this->maxFileSize / 1024), // in KB
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->file('file');
        
        // Validate file type
        $extension = strtolower($uploadedFile->getClientOriginalExtension());
        if (!in_array($extension, $this->allowedTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'File type not allowed. Allowed types: ' . implode(', ', $this->allowedTypes),
            ], 422);
        }

        // Generate unique filename
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $uploadedFile->getClientOriginalName());
        $path = 'project-files/' . $projectId . '/' . $filename;

        // Store file
        Storage::disk('public')->put($path, file_get_contents($uploadedFile));

        // Create file record
        $file = File::create([
            'project_id' => $projectId,
            'uploaded_by' => $user->id,
            'file_name' => $uploadedFile->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $extension,
            'file_size' => $uploadedFile->getSize(),
            'description' => $request->description,
            'uploaded_at' => now(),
        ]);

        // Log activity
        $this->logActivity($user->id, 'uploaded_file', $projectId, [
            'project_title' => $project->title,
            'file_name' => $file->file_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => $file->load('uploadedBy'),
        ], 201);
    }

    /**
     * Download a file
     * GET /api/v1/projects/{project}/files/{file}/download
     */
    public function download(Request $request, $projectId, $fileId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check access
        if (!$this->canAccess($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $file = File::where('project_id', $projectId)->findOrFail($fileId);

        // Check if file exists
        if (!Storage::disk('public')->exists($file->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk('public')->download($file->file_path, $file->file_name);
    }

    /**
     * Get file details
     * GET /api/v1/projects/{project}/files/{file}
     */
    public function show(Request $request, $projectId, $fileId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check access
        if (!$this->canAccess($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $file = File::where('project_id', $projectId)
            ->with('uploadedBy')
            ->findOrFail($fileId);

        // Check if file exists
        $file->exists_in_storage = Storage::disk('public')->exists($file->file_path);

        return response()->json([
            'success' => true,
            'data' => $file,
        ]);
    }

    /**
     * Delete a file
     * DELETE /api/v1/projects/{project}/files/{file}
     */
    public function destroy(Request $request, $projectId, $fileId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete this file',
            ], 403);
        }

        $file = File::where('project_id', $projectId)->findOrFail($fileId);

        // Delete from storage
        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        // Delete record
        $file->delete();

        // Log activity
        $this->logActivity($user->id, 'deleted_file', $projectId, [
            'project_title' => $project->title,
            'file_name' => $file->file_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully',
        ]);
    }

    /**
     * Check if user can access project
     */
    private function canAccess($user, $project): bool
    {
        return $project->isMember($user->id) || $project->isCreator($user->id) || $user->isAdmin();
    }

    /**
     * Check if user can manage project resources
     */
    private function canManage($user, $project): bool
    {
        return $project->canEdit($user->id) || $user->isAdmin();
    }

    /**
     * Log activity
     */
    private function logActivity(int $userId, string $action, int $projectId, array $data = []): void
    {
        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => 'project',
            'entity_id' => $projectId,
            'new_values' => $data,
        ]);
    }
}