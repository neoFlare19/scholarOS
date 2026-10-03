<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'institution',
        'email',
        'password_hash',
        'role_id',
        'department_id',
        'bio',
        'research_interests',
        'skills',
        'profile_picture',
        'is_active',
        'last_login_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Tell Laravel which database column contains the user's password.
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    // ============================================
    // EXISTING RELATIONSHIPS
    // ============================================

    /**
     * The user's assigned role.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Research areas selected by the user.
     */
    public function researchAreas(): BelongsToMany
    {
        return $this->belongsToMany(
            ResearchArea::class,
            'user_research_areas'
        );
    }

    /**
     * The user's role verification request.
     */
    public function roleVerification()
    {
        return $this->hasOne(RoleVerification::class);
    }

    // ============================================
    // DASHBOARD RELATIONSHIPS
    // ============================================

    /**
     * User's department
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Projects created by the user
     */
    public function createdProjects()
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    /**
     * Projects supervised by the user
     */
    public function supervisedProjects()
    {
        return $this->hasMany(Project::class, 'supervisor_id');
    }

    /**
     * Project memberships
     */
    public function projectMemberships()
    {
        return $this->hasMany(ProjectMember::class);
    }

    /**
     * Projects where user is a member
     */
    public function projectsAsMember()
    {
        return $this->belongsToMany(Project::class, 'project_members');
    }

    /**
     * Tasks assigned to the user
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Tasks created by the user
     */
    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /**
     * Papers uploaded by the user
     */
    public function papers()
    {
        return $this->hasMany(ResearchPaper::class, 'uploaded_by');
    }

    /**
     * Papers authored by the user (many-to-many)
     */
    public function authoredPapers()
    {
        return $this->belongsToMany(ResearchPaper::class, 'paper_authors', 'paper_id', 'user_id');
    }

    /**
     * Notifications received by the user
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Unread notifications
     */
    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->where('is_read', false);
    }

    /**
     * Notifications sent by the user
     */
    public function sentNotifications()
    {
        return $this->hasMany(Notification::class, 'sender_id');
    }

    /**
     * Activity logs for the user
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Users who follow this user
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'followers', 'followed_id', 'follower_id');
    }

    /**
     * Users this user follows
     */
    public function following()
    {
        return $this->belongsToMany(User::class, 'followers', 'follower_id', 'followed_id');
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Get total project count (as member + supervisor)
     */
    public function getProjectCountAttribute()
    {
        return $this->projectsAsMember()->count() + $this->supervisedProjects()->count();
    }

    /**
     * Get total task count (assigned to user)
     */
    public function getTaskCountAttribute()
    {
        return $this->tasks()->where('status', '!=', 'completed')->count();
    }

    /**
     * Get total paper count (uploaded by user)
     */
    public function getPaperCountAttribute()
    {
        return $this->papers()->count();
    }

    /**
     * Get unread notification count
     */
    public function getNotificationCountAttribute()
    {
        return $this->unreadNotifications()->count();
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role && in_array($this->role->name, ['dept_admin', 'sys_admin']);
    }

    /**
     * Check if user is faculty
     */
    public function isFaculty(): bool
    {
        return $this->role && $this->role->name === 'faculty';
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->role && $this->role->name === 'student';
    }
}