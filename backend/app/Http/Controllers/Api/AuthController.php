<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user and send Gmail OTP.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'full_name' => $validated['name'],
            'institution' => $validated['institution'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'email_verified_at' => null,
        ]);

        $this->issueOtp($user);

        return response()->json([
            'message' => 'Account created. Please check your email for a verification code.',
            'email' => $user->email,
        ], 201);
    }

    /**
     * Verify Gmail OTP.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'digits:6'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => 'No account found for this email.',
            ]);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $cacheKey = $this->otpCacheKey($request->email);
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp || (string) $cachedOtp !== (string) $request->otp) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid or expired code.',
            ]);
        }

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        Cache::forget($cacheKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Resend OTP.
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => 'No account found for this email.',
            ]);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $this->issueOtp($user);

        return response()->json([
            'message' => 'A new verification code has been sent.',
        ]);
    }

    /**
     * Login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'requires_verification' => true,
                'email' => $user->email,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    /**
     * Generate and send OTP.
     */
    private function issueOtp(User $user): void
    {
        $otp = (string) random_int(100000, 999999);

        Cache::put(
            $this->otpCacheKey($user->email),
            $otp,
            now()->addMinutes(10)
        );

        Mail::to($user->email)->send(
            new OtpMail($otp, $user->full_name)
        );
    }

    private function otpCacheKey(string $email): string
    {
        return 'otp_' . strtolower($email);
    }
}