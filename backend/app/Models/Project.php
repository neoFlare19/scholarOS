<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'research_area_id',
        'supervisor_id',
        'created_by',
        'start_date',
        'deadline',
        'status',
        'progress_pct',
        'is_public',
        'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'deadline' => 'date',
        'progress_pct' => 'integer',
        'is_public' => 'boolean',
        'completed_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'planning',
        'progress_pct' => 0,
        'is_public' => false,
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function researchArea()
    {
        return $this->belongsTo(ResearchArea::class);
    }

    public function members()
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'project_members');
    }

    // ============================================
    // PROJECT RESOURCES RELATIONSHIPS
    // ============================================

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function milestones()
    {
        return $this->hasMany(Milestone::class)->orderBy('order');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function activeTasks()
    {
        return $this->hasMany(Task::class)->where('status', '!=', 'completed');
    }

    public function completedTasks()
    {
        return $this->hasMany(Task::class)->where('status', 'completed');
    }

    public function upcomingMilestones()
    {
        return $this->hasMany(Milestone::class)->where('due_date', '>=', now())
                      ->where('status', '!=', 'completed');
    }

    public function overdueMilestones()
    {
        return $this->hasMany(Milestone::class)->where('due_date', '<', now())
                      ->where('status', '!=', 'completed');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'entity');
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getStatusColorAttribute(): string
    {
        $colors = [
            'planning' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'archived' => 'gray',
        ];
        return $colors[$this->status] ?? 'gray';
    }

    public function getStatusLabelAttribute(): string
    {
        $labels = [
            'planning' => 'Planning',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'archived' => 'Archived',
        ];
        return $labels[$this->status] ?? 'Unknown';
    }

    public function getMemberCountAttribute(): int
    {
        return $this->members()->count();
    }

    public function getTaskCountAttribute(): int
    {
        return $this->tasks()->count();
    }

    public function getCompletedTaskCountAttribute(): int
    {
        return $this->tasks()->where('status', 'completed')->count();
    }

    public function getProgressAttribute(): int
    {
        return $this->progress_pct;
    }

    public function getMilestoneProgressAttribute(): int
    {
        $total = $this->milestones()->count();
        if ($total === 0) return 0;
        
        $completed = $this->milestones()->where('status', 'completed')->count();
        return round(($completed / $total) * 100);
    }

    public function getTaskProgressAttribute(): int
    {
        $total = $this->tasks()->count();
        if ($total === 0) return 0;
        
        $completed = $this->tasks()->where('status', 'completed')->count();
        return round(($completed / $total) * 100);
    }

    public function getFileCountAttribute(): int
    {
        return $this->files()->count();
    }

    public function getMilestoneCountAttribute(): int
    {
        return $this->milestones()->count();
    }

    public function getCompletedMilestoneCountAttribute(): int
    {
        return $this->milestones()->where('status', 'completed')->count();
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['planning', 'in_progress']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->whereHas('members', function ($sub) use ($userId) {
                $sub->where('user_id', $userId);
            })->orWhere('created_by', $userId)
              ->orWhere('supervisor_id', $userId);
        });
    }

    // ============================================
    // AUTHORIZATION HELPERS
    // ============================================

    public function isMember(int $userId): bool
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    public function isSupervisor(int $userId): bool
    {
        return $this->supervisor_id === $userId;
    }

    public function isCreator(int $userId): bool
    {
        return $this->created_by === $userId;
    }

    public function canEdit(int $userId): bool
    {
        return $this->isCreator($userId) || $this->isSupervisor($userId);
    }

    public function canManageMembers(int $userId): bool
    {
        return $this->isCreator($userId) || $this->isSupervisor($userId);
    }
}