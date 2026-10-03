<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_research_areas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('research_area_id')
                ->constrained('research_areas')
                ->onDelete('cascade');

            $table->timestamps();

            $table->unique(['user_id', 'research_area_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_research_areas');
    }
};