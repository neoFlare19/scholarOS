<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
            $table->enum('entity_type', ['project', 'paper', 'task', 'file']);
            $table->unsignedBigInteger('entity_id');
            $table->text('content');
            $table->boolean('is_edited')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['entity_type', 'entity_id']);
            $table->index('parent_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};