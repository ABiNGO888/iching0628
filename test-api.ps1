$body = @{
    prompt = '请解读乾卦的含义'
    apiKey = 'sk-2661c12166e0409299a5384132eaa855'
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/ai/interpret' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
    Write-Host 'Status:' $response.StatusCode
    Write-Host 'Response:' $response.Content
} catch {
    Write-Host 'Error:' $_.Exception.Message
    Write-Host 'Full Error:' $_.Exception
}