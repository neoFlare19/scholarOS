<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public ?string $name;

    public function __construct(string $otp, ?string $name = null)
    {
        $this->otp = $otp;
        $this->name = $name;
    }

    public function build(): self
    {
        return $this->subject('Your ScholarOS verification code')
                     ->view('emails.otp');
    }
}
