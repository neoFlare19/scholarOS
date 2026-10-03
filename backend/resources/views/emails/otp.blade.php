<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ScholarOS Email Verification</title>
</head>
<body>
    <h2>Welcome to ScholarOS{{ $name ? ', ' . $name : '' }}!</h2>

    <p>Use the verification code below to verify your email address:</p>

    <h1>{{ $otp }}</h1>

    <p>This code will expire in 10 minutes.</p>

    <p>If you did not create a ScholarOS account, you can ignore this email.</p>

    <p>Thanks,<br>ScholarOS Team</p>
</body>
</html>