<?php
$url = 'http://localhost/SFM/backend/api/enquiries.php?type=bulk';
$data = ['name' => 'Tester', 'email' => 'test@test.com', 'phone' => '1234', 'quantity' => '50kg', 'message' => 'hello'];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
