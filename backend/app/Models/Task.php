<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'assigned_to',
        'assigned_by',
        'created_by',
        'name',
        'description',
        'priority',
        'status',
        'deadline',
        'completed_at',
    ];

    protected $casts = [
        'deadline' => 'date',
        'completed_at' => 'datetime',
    ];

    protected $attributes = [
        'priority' => 'medium',
        'status' => 'pending',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getStatusLabelAttribute(): string
    {
        $labels = [
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
        ];
        return $labels[$this->status] ?? 'Unknown';
    }

    public function getStatusColorAttribute(): string
    {
        $colors = [
            'pending' => 'gray',
            'in_progress' => 'yellow',
            'completed' => 'green',
        ];
        return $colors[$this->status] ?? 'gray';
    }

    public function getPriorityLabelAttribute(): string
    {
        $labels = [
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
        ];
        return $labels[$this->priority] ?? 'Medium';
    }

    public function getPriorityColorAttribute(): string
    {
        $colors = [
            'low' => 'blue',
            'medium' => 'yellow',
            'high' => 'orange',
            'urgent' => 'red',
        ];
        return $colors[$this->priority] ?? 'gray';
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->deadline && $this->deadline < now() && $this->status !== 'completed';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('deadline', '<', now())
                     ->where('status', '!=', 'completed');
    }

    public function scopeForProject($query, int $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeAssignedTo($query, int $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    public function markAsCompleted(): bool
    {
        $this->status = 'completed';
        $this->completed_at = now();
        return $this->save();
    }

    public function markAsInProgress(): bool
    {
        $this->status = 'in_progress';
        $this->completed_at = null;
        return $this->save();
    }

    public function markAsPending(): bool
    {
        $this->status = 'pending';
        $this->completed_at = null;
        return $this->save();
    }
}