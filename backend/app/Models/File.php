<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'task_id',
        'uploaded_by',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'description',
        'uploaded_at',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'uploaded_at' => 'datetime',
    ];

    protected $attributes = [
        'uploaded_at' => null, // Will be set in constructor
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getFileTypeIconAttribute(): string
    {
        $icons = [
            'pdf' => 'file-pdf',
            'doc' => 'file-word',
            'docx' => 'file-word',
            'xls' => 'file-excel',
            'xlsx' => 'file-excel',
            'ppt' => 'file-powerpoint',
            'pptx' => 'file-powerpoint',
            'zip' => 'file-archive',
            'rar' => 'file-archive',
            'jpg' => 'file-image',
            'jpeg' => 'file-image',
            'png' => 'file-image',
            'gif' => 'file-image',
            'svg' => 'file-image',
            'mp4' => 'file-video',
            'avi' => 'file-video',
            'mp3' => 'file-audio',
            'txt' => 'file-text',
        ];
        return $icons[$this->file_type] ?? 'file';
    }

    public function getDownloadUrlAttribute(): string
    {
        return '/api/v1/projects/' . $this->project_id . '/files/' . $this->id . '/download';
    }

    public function getPreviewUrlAttribute(): string
    {
        return '/storage/' . $this->file_path;
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeImages($query)
    {
        return $query->whereIn('file_type', ['jpg', 'jpeg', 'png', 'gif', 'svg']);
    }

    public function scopeDocuments($query)
    {
        return $query->whereIn('file_type', ['pdf', 'doc', 'docx', 'txt']);
    }

    public function scopeSpreadsheets($query)
    {
        return $query->whereIn('file_type', ['xls', 'xlsx']);
    }

    public function scopeArchives($query)
    {
        return $query->whereIn('file_type', ['zip', 'rar']);
    }

    public function scopeForProject($query, int $projectId)
    {
        return $query->where('project_id', $projectId);
    }
}