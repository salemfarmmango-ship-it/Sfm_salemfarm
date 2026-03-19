<?php
// backend/auth/send-otp.php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$identifier = trim($input['identifier'] ?? '');
$type = $input['type'] ?? '';
$purpose = $input['purpose'] ?? '';

// Sanitize phone number if type is phone
if ($type === 'phone') {
    $identifier = str_replace([' ', '-', '+91'], '', $identifier);
    if (strlen($identifier) === 11 && str_starts_with($identifier, '0')) {
        $identifier = substr($identifier, 1);
    }
}

if (!$identifier || !$type || !$purpose) {
    sendJson(['error' => 'Missing required fields'], 400);
}

if (!in_array($purpose, ['signup', 'reset', 'login'])) {
    sendJson(['error' => 'Purpose must be signup, reset, or login'], 400);
}

function isValidPhone($phone)
{
    return preg_match('/^[6-9][0-9]{9}$/', $phone);
}

function isValidEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

if ($type === 'phone' && !isValidPhone($identifier)) {
    sendJson(['error' => 'Invalid phone number'], 400);
}
if ($type === 'email' && !isValidEmail($identifier)) {
    sendJson(['error' => 'Invalid email address'], 400);
}

try {
    // Check if user exists
    $emailToCheck = $type === 'phone' ? "{$identifier}@phone.salemfarmmango.local" : $identifier;
    error_log("[OTP Debug] Identifier: $identifier, Type: $type, Purpose: $purpose, Looking for Email: $emailToCheck");

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$emailToCheck]);
    $userExists = $stmt->fetch();

    if ($purpose === 'signup' && $userExists) {
        error_log("[OTP Debug] Signup failed: User already exists ($emailToCheck)");
        sendJson(['error' => 'User already exists. Please login.'], 400);
    }
    if (in_array($purpose, ['reset', 'login']) && !$userExists) {
        error_log("[OTP Debug] {$purpose}: User not found in users table for $emailToCheck");
        // Fallback: Check if phone exists in addresses (unmigrated users)
        if ($type === 'phone') {
            $stmt = $pdo->prepare("SELECT user_id FROM addresses WHERE phone = ? LIMIT 1");
            $stmt->execute([$identifier]);
            $addressUser = $stmt->fetch();
            if ($addressUser) {
                error_log("[OTP Debug] Found orphan in addresses: " . $addressUser['user_id']);
            } else {
                error_log("[OTP Debug] Phone $identifier not found in addresses table either.");
                sendJson(['error' => 'User not found'], 404);
            }
        } else {
            sendJson(['error' => 'User not found'], 404);
        }
    }

    $code = (string) rand(100000, 999999);
    $expiresAt = date('Y-m-d H:i:s', time() + (30 * 60)); // 30 mins

    // Delete old OTPs
    $stmt = $pdo->prepare("DELETE FROM otp_verifications WHERE identifier = ? AND verified = FALSE");
    $stmt->execute([$identifier]);

    // Store new OTP
    $otpId = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("INSERT INTO otp_verifications (id, identifier, type, code, expires_at) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$otpId, $identifier, $type, $code, $expiresAt]);

    // Send OTP
    if ($type === 'phone') {
        // Call the Next.js API route which has FAST2SMS_API_KEY configured
        // This is more reliable than calling Fast2SMS directly from PHP (env var not available in Apache)
        $smsPayload = json_encode([
            'phone' => $identifier,
            'templateId' => '207630',
            'variables' => $code
        ]);

        $ch = curl_init('http://localhost:3000/api/send-sms');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $smsPayload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $smsResponse = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Log errors, but don't block OTP flow if SMS fails
        if ($curlError) {
            error_log("[OTP] cURL error sending SMS to {$identifier}: {$curlError}");
        } else {
            $smsData = json_decode($smsResponse, true);
            if (isset($smsData['error'])) {
                error_log("[OTP] SMS delivery error for {$identifier}: " . json_encode($smsData));
            }
        }
    } else {
        $apiKey = $ENV_SFM['RESEND_API_KEY'] ?? 'YOUR_RESEND_KEY';
        $subject = $purpose === 'signup' ? "{$code} is your Salem Farm verification code" : ($purpose === 'login' ? "{$code} is your login code" : "{$code} is your password reset code");
        
        $title = $purpose === 'signup' ? 'Welcome to Salem Farm!' : ($purpose === 'login' ? 'Login to Salem Farm' : 'Reset Your Password');
        $messageHeader = $purpose === 'signup' ? 'Thank you for joining us. Please use the following code to verify your account.' : ($purpose === 'login' ? 'Welcome back! Please use the following code to login.' : 'We received a request to reset your password. Please use the following code to proceed.');
        
        $html = "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>{$title}</title>
            </head>
            <body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>
                <table border='0' cellpadding='0' cellspacing='0' width='100%' style='table-layout: fixed;'>
                    <tr>
                        <td align='center' style='padding: 60px 0 30px 0;'>
                            <div style='display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);'>
                                <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;'>SALEM FARM <span style='color: #fcd34d;'>MANGO</span></h1>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align='center'>
                            <table border='0' cellpadding='0' cellspacing='0' width='90%' style='max-width: 550px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;'>
                                <tr>
                                    <td style='padding: 50px 40px;'>
                                        <h2 style='margin: 0 0 16px 0; color: #1e293b; font-size: 26px; font-weight: 800; text-align: center; letter-spacing: -0.5px;'>{$title}</h2>
                                        <p style='margin: 0 0 35px 0; color: #64748b; font-size: 16px; line-height: 26px; text-align: center;'>{$messageHeader}</p>
                                        
                                        <div style='background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #bbf7d0; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 35px;'>
                                            <span style='display: block; color: #16a34a; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1.5px;'>Your Secure Code</span>
                                            <span style='display: block; color: #0f172a; font-size: 48px; font-weight: 900; letter-spacing: 10px; margin-left: 10px;'>{$code}</span>
                                        </div>
                                        
                                        <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                                            <tr>
                                                <td align='center'>
                                                    <p style='margin: 0; color: #94a3b8; font-size: 14px;'>This code is valid for <strong style='color: #475569;'>30 minutes</strong>.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 25px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;'>
                                        <p style='margin: 0; color: #94a3b8; font-size: 13px; line-height: 20px; text-align: center;'>
                                            If you didn't request this code, please ignore this email or contact support if you have concerns.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='padding: 40px 0 60px 0;'>
                            <p style='margin: 0 0 10px 0; color: #1e293b; font-size: 14px; font-weight: 700; text-align: center;'>Salem Farm Mango</p>
                            <p style='margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 18px;'>
                                &copy; " . date('Y') . " Salem Farm Mango. All rights reserved.<br>
                                Traditional. Natural. Fresh from our farms to your home.
                            </p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        ";

        $postData = json_encode([
            'from' => 'Salem Farm <no-reply@salemfarmmango.com>',
            'to' => $identifier,
            'subject' => $subject,
            'html' => $html
        ]);

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
    }

    sendJson(['success' => true, 'message' => 'OTP sent successfully']);

} catch (Exception $e) {
    sendJson(['error' => 'Internal Server Error', 'details' => $e->getMessage()], 500);
}
?>