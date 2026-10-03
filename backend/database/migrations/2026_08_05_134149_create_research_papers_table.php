<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            $table->foreignId('research_area_id')->constrained()->onDelete('restrict');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title', 300);
            $table->text('abstract');
            $table->year('publication_year')->nullable();
            $table->string('pdf_path', 255);
            $table->string('pdf_filename', 255);
            $table->unsignedBigInteger('file_size')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'withdrawn'])->default('pending');
            $table->boolean('is_verified')->default(false);
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('downloads')->default(0);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('status');
            $table->index('publication_year');
            $table->index('is_verified');
            $table->fullText(['title', 'abstract']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_papers');
    }
};