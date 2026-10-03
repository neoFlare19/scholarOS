<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('role_verifications', function (Blueprint $table) {
            $table->id();

            // User who submitted the verification request
            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->onDelete('cascade');

            // Requested role: student or faculty/supervisor
            $table->string('role', 50);

            // Private storage path of the uploaded university ID card
            $table->string('id_card_path');

            // Verification status
            $table->string('status', 20)->default('pending');

            // Filled only when the request is rejected
            $table->text('rejection_reason')->nullable();

            // Verification request/review timestamps
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_verifications');
    }
};