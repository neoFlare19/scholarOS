<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\GoogleScholarService;
use App\Enums\PaperStatus;

class ResearchPaper extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'abstract',
        'keywords',
        'research_area',
        'category',
        'authors',
        'google_scholar_url',
        'doi',
        'publication_status',
        'category_id',
        'research_area_id',
        'department_id',
        'uploaded_by',
        'verified_by',
        'reviewed_by',
        'publication_year',
        'pdf_path',
        'pdf_filename',
        'file_size',
        'status',
        'is_verified',
        'views',
        'downloads',
        'verified_at',
        'submission_status',
        'submitted_at',
        'reviewed_at',
        'rejection_reason',
        'reviewer_notes',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'publication_year' => 'integer',
        'file_size' => 'integer',
        'views' => 'integer',
        'downloads' => 'integer',
    ];

    protected $attributes = [
        'status' => 'pending',
        'is_verified' => false,
        'views' => 0,
        'downloads' => 0,
        'submission_status' => 'draft',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function researchArea()
    {
        return $this->belongsTo(ResearchArea::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function keywords()
    {
        return $this->belongsToMany(Keyword::class, 'paper_keywords');
    }

    /**
     * Authors relationship with proper foreign key
     * Table: paper_authors
     * Foreign key: paper_id (points to research_papers.id)
     * Related key: user_id (points to users.id)
     */
    public function authors()
    {
        return $this->belongsToMany(User::class, 'paper_authors', 'paper_id', 'user_id');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'entity');
    }

    public function bookmarks()
    {
        return $this->morphMany(Bookmark::class, 'entity');
    }

    public function versions()
    {
        return $this->hasMany(PaperVersion::class);
    }

    // ============================================
    // GOOGLE SCHOLAR METHODS
    // ============================================

    public function getScholarLinks(): array
    {
        $service = new GoogleScholarService();
        return $service->getScholarLinks($this->google_scholar_url, $this->title);
    }

    public function getGoogleScholarLinkAttribute(): ?string
    {
        if ($this->google_scholar_url) {
            return $this->google_scholar_url;
        }

        if ($this->title) {
            $service = new GoogleScholarService();
            return $service->generateSearchUrl($this->title);
        }

        return null;
    }

    public function getGoogleScholarSearchAttribute(): ?string
    {
        if ($this->title) {
            $service = new GoogleScholarService();
            return $service->generateSearchUrl($this->title);
        }
        return null;
    }

    public function hasExactScholarUrl(): bool
    {
        return !empty($this->google_scholar_url);
    }

    public function getDoiLinkAttribute(): ?string
    {
        if ($this->doi) {
            return 'https://doi.org/' . $this->doi;
        }
        return null;
    }

    // ============================================
    // SUBMISSION METHODS
    // ============================================

    public function isDraft(): bool
    {
        return $this->submission_status === PaperStatus::DRAFT->value;
    }

    public function isSubmitted(): bool
    {
        return $this->submission_status === PaperStatus::SUBMITTED->value;
    }

    public function isUnderReview(): bool
    {
        return $this->submission_status === PaperStatus::UNDER_REVIEW->value;
    }

    public function isApproved(): bool
    {
        return $this->submission_status === PaperStatus::APPROVED->value;
    }

    public function isRejected(): bool
    {
        return $this->submission_status === PaperStatus::REJECTED->value;
    }

    public function isEditable(): bool
    {
        return $this->isDraft();
    }

    public function isSubmittable(): bool
    {
        return $this->isDraft();
    }

    public function submit(): bool
    {
        if (!$this->isSubmittable()) {
            return false;
        }

        if (!$this->isComplete()) {
            return false;
        }

        $this->submission_status = PaperStatus::SUBMITTED->value;
        $this->submitted_at = now();
        
        return $this->save();
    }

    public function isComplete(): bool
    {
        return !empty($this->title) && 
               !empty($this->abstract) && 
               !empty($this->authors);
    }

    public function approve(int $reviewerId, ?string $notes = null): bool
    {
        if (!$this->isSubmitted() && !$this->isUnderReview()) {
            return false;
        }

        $this->submission_status = PaperStatus::APPROVED->value;
        $this->reviewed_by = $reviewerId;
        $this->reviewed_at = now();
        $this->reviewer_notes = $notes;
        $this->status = 'approved';
        $this->is_verified = true;
        
        return $this->save();
    }

    public function reject(int $reviewerId, string $reason, ?string $notes = null): bool
    {
        if (!$this->isSubmitted() && !$this->isUnderReview()) {
            return false;
        }

        $this->submission_status = PaperStatus::REJECTED->value;
        $this->reviewed_by = $reviewerId;
        $this->reviewed_at = now();
        $this->rejection_reason = $reason;
        $this->reviewer_notes = $notes;
        $this->status = 'rejected';
        $this->is_verified = false;
        
        return $this->save();
    }

    public function returnToDraft(): bool
    {
        if (!$this->isRejected() && !$this->isSubmitted()) {
            return false;
        }

        $this->submission_status = PaperStatus::DRAFT->value;
        $this->submitted_at = null;
        $this->reviewed_by = null;
        $this->reviewed_at = null;
        $this->rejection_reason = null;
        
        return $this->save();
    }

    public function getSubmissionStatusLabelAttribute(): string
    {
        return PaperStatus::tryFrom($this->submission_status)?->label() ?? 'Unknown';
    }

    public function getSubmissionStatusColorAttribute(): string
    {
        return PaperStatus::tryFrom($this->submission_status)?->color() ?? 'gray';
    }

    // ============================================
    // SCOPES - STATUS (for the 'status' column)
    // ============================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeStatusApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%")
              ->orWhere('abstract', 'LIKE', "%{$search}%");
        });
    }

    public function scopeSearchExact($query, string $title)
    {
        return $query->where('title', '=', $title);
    }

    // ============================================
    // SCOPES - SUBMISSION STATUS (for the 'submission_status' column)
    // ============================================

    public function scopeDrafts($query)
    {
        return $query->where('submission_status', PaperStatus::DRAFT->value);
    }

    public function scopeSubmitted($query)
    {
        return $query->where('submission_status', PaperStatus::SUBMITTED->value);
    }

    public function scopeUnderReview($query)
    {
        return $query->where('submission_status', PaperStatus::UNDER_REVIEW->value);
    }

    public function scopeSubmissionApproved($query)
    {
        return $query->where('submission_status', PaperStatus::APPROVED->value);
    }

    public function scopeRejected($query)
    {
        return $query->where('submission_status', PaperStatus::REJECTED->value);
    }

    public function scopeNeedsReview($query)
    {
        return $query->where('submission_status', PaperStatus::SUBMITTED->value)
                     ->orWhere('submission_status', PaperStatus::UNDER_REVIEW->value);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('uploaded_by', $userId)
                     ->orWhereHas('authors', function ($q) use ($userId) {
                         $q->where('user_id', $userId);
                     });
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getFormattedAuthorsAttribute()
    {
        return $this->authors->pluck('full_name')->implode(', ');
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
            'withdrawn' => 'secondary',
        ];
        return $badges[$this->status] ?? 'secondary';
    }

    public function getScholarDataAttribute(): array
    {
        return $this->getScholarLinks();
    }
}