<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'due_date',
        'completed_at',
        'order',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'date',
    ];

    protected $attributes = [
        'status' => 'pending',
        'order' => 0,
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function project()
    {
        return $this->belongsTo(Project::class);
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

    public function scopeUpcoming($query)
    {
        return $query->where('due_date', '>=', now());
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                     ->where('status', '!=', 'completed');
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

    public function isOverdue(): bool
    {
        return $this->due_date < now() && $this->status !== 'completed';
    }
}