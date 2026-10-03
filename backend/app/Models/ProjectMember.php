<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'role',
        'joined_at',
        'left_at',
        'is_active',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'role' => 'member',
        'is_active' => true,
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getRoleLabelAttribute(): string
    {
        $labels = [
            'supervisor' => 'Supervisor',
            'co_supervisor' => 'Co-Supervisor',
            'member' => 'Member',
            'viewer' => 'Viewer',
            'admin' => 'Admin',
        ];
        return $labels[$this->role] ?? 'Member';
    }

    public function getRoleColorAttribute(): string
    {
        $colors = [
            'supervisor' => 'green',
            'co_supervisor' => 'blue',
            'member' => 'gray',
            'viewer' => 'orange',
            'admin' => 'red',
        ];
        return $colors[$this->role] ?? 'gray';
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }
}