<?php
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $otp = random_int(100000, 999999);

        // store for 10 minutes, keyed by email
        Cache::put('otp_' . $request->email, $otp, now()->addMinutes(10));

        Mail::to($request->email)->send(new OtpMail($otp));

        return response()->json(['message' => 'OTP sent']);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $cached = Cache::get('otp_' . $request->email);

        if (!$cached || (int) $cached !== (int) $request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP'], 422);
        }

        Cache::forget('otp_' . $request->email);

        // mark user as verified here (e.g. $user->update(['email_verified_at' => now()]))

        return response()->json(['message' => 'Email verified']);
    }
}