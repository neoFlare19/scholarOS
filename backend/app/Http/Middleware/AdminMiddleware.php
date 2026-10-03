<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Only users with an administrative role can access
     * admin-only endpoints.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // User must already be authenticated.
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Get the user's role from the roles table.
        $roleName = DB::table('roles')
            ->where('id', $user->role_id)
            ->value('name');

        // Only department admins and system admins are allowed.
        if (!in_array($roleName, ['dept_admin', 'sys_admin'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Administrator access required.',
            ], 403);
        }

        return $next($request);
    }
}