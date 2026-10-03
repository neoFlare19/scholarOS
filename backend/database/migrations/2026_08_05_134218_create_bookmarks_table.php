<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('entity_type', ['paper', 'project', 'researcher']);
            $table->unsignedBigInteger('entity_id');
            $table->timestamps();
            
            $table->unique(['user_id', 'entity_type', 'entity_id'], 'unique_user_entity');
            $table->index(['entity_type', 'entity_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookmarks');
    }
};