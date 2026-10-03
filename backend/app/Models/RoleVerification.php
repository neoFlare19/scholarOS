<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoleVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'id_card_path',
        'status',
        'rejection_reason',
        'submitted_at',
        'reviewed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * The user who submitted this verification request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}