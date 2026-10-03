<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add custom columns to users table
        Schema::table('users', function (Blueprint $table) {
            // Rename 'name' to 'full_name'
            $table->renameColumn('name', 'full_name');
            
            // Rename 'password' to 'password_hash'
            $table->renameColumn('password', 'password_hash');
            
            // Add new columns
            $table->foreignId('role_id')->after('id')->nullable()->constrained()->onDelete('restrict');
            $table->foreignId('department_id')->after('role_id')->nullable()->constrained()->onDelete('set null');
            $table->string('institution', 200)->nullable()->after('password_hash');
            $table->text('bio')->nullable()->after('institution');
            $table->text('research_interests')->nullable()->after('bio');
            $table->text('skills')->nullable()->after('research_interests');
            $table->string('profile_picture', 255)->nullable()->after('skills');
            $table->boolean('is_active')->default(true)->after('remember_token');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
    Schema::table('users', function (Blueprint $table) {
    // Rename 'name' to 'full_name'
    $table->renameColumn('name', 'full_name');

    // Rename 'password' to 'password_hash'
    $table->renameColumn('password', 'password_hash');

    // Add new columns
    $table->foreignId('role_id')
        ->after('id')
        ->nullable()
        ->constrained()
        ->onDelete('restrict');

    $table->foreignId('department_id')
        ->after('role_id')
        ->nullable()
        ->constrained()
        ->onDelete('set null');

    $table->string('institution', 200)->nullable()->after('password_hash');
    $table->text('bio')->nullable()->after('institution');
    $table->text('research_interests')->nullable()->after('bio');
    $table->text('skills')->nullable()->after('research_interests');
    $table->string('profile_picture', 255)->nullable()->after('skills');
    $table->boolean('is_active')->default(true)->after('remember_token');
    $table->timestamp('last_login_at')->nullable()->after('is_active');
    });
    }
};