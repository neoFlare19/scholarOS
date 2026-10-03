<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paper_authors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('research_papers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_corresponding')->default(false);
            $table->unsignedInteger('author_order')->nullable();
            $table->timestamps();
            
            $table->unique(['paper_id', 'user_id']);
            $table->index('paper_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_authors');
    }
};