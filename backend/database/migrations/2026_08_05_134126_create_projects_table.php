<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description');
            $table->foreignId('research_area_id')->constrained()->onDelete('restrict');
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->date('start_date');
            $table->date('deadline')->nullable();
            $table->enum('status', ['planning', 'in_progress', 'completed', 'archived'])->default('planning');
            $table->unsignedInteger('progress_pct')->default(0);
            $table->boolean('is_public')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('status');
            $table->index('supervisor_id');
            $table->index('created_by');
            $table->fullText(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};