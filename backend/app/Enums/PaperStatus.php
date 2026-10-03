<?php

namespace App\Enums;

enum PaperStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::UNDER_REVIEW => 'Under Review',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::DRAFT => 'gray',
            self::SUBMITTED => 'blue',
            self::UNDER_REVIEW => 'yellow',
            self::APPROVED => 'green',
            self::REJECTED => 'red',
        };
    }

    public function isEditable(): bool
    {
        return match($this) {
            self::DRAFT => true,
            self::SUBMITTED => false,
            self::UNDER_REVIEW => false,
            self::APPROVED => false,
            self::REJECTED => false,
        };
    }

    public function isSubmittable(): bool
    {
        return $this === self::DRAFT;
    }
}