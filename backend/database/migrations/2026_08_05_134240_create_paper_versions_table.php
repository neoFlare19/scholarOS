<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paper_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('research_papers')->onDelete('cascade');
            $table->unsignedInteger('version_number');
            $table->string('pdf_path', 255);
            $table->string('pdf_filename', 255);
            $table->unsignedBigInteger('file_size');
            $table->text('changes')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['paper_id', 'version_number']);
            $table->index('paper_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_versions');
    }
};