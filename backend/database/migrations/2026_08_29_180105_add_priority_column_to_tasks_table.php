<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Add priority if not exists
            if (!Schema::hasColumn('tasks', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            }
            
            // Add assigned_by if not exists
            if (!Schema::hasColumn('tasks', 'assigned_by')) {
                $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['priority', 'assigned_by']);
        });
    }
};