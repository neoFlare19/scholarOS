<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_papers', function (Blueprint $table) {
            // Add submission status fields
            $table->enum('submission_status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])
                  ->default('draft')
                  ->after('status');
            
            $table->timestamp('submitted_at')->nullable()->after('submission_status');
            $table->timestamp('reviewed_at')->nullable()->after('submitted_at');
            
            $table->foreignId('reviewed_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null')
                  ->after('reviewed_at');
            
            $table->text('rejection_reason')->nullable()->after('reviewed_by');
            $table->text('reviewer_notes')->nullable()->after('rejection_reason');
            
            // Add department_id (if not exists)
            if (!Schema::hasColumn('research_papers', 'department_id')) {
                $table->foreignId('department_id')
                      ->nullable()
                      ->constrained()
                      ->onDelete('set null')
                      ->after('research_area_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('research_papers', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropForeign(['department_id']);
            
            $table->dropColumn([
                'submission_status',
                'submitted_at',
                'reviewed_at',
                'reviewed_by',
                'rejection_reason',
                'reviewer_notes',
                'department_id',
            ]);
        });
    }
};