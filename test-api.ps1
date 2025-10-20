$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    query = "pipeline welding"
    useAI = $true
} | ConvertTo-Json

Write-Host "🧪 Probando SEMHYS Research API..."
Write-Host "📊 Query: pipeline welding con AI"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/research" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ RESULTADO:"
    Write-Host "🔍 Documentos encontrados:" ($response.results.Length)
    
    if ($response.aiAnalysis) {
        Write-Host "🤖 Análisis AI disponible:" ($response.aiAnalysis.Length) "chars"
        Write-Host "💰 Costo estimado:" $response.estimatedCost
        Write-Host "🎯 Confianza:" $response.confidence
    }
    
    if ($response.error) {
        Write-Host "❌ Error:" $response.error
    }
    
} catch {
    Write-Host "❌ Error:" $_.Exception.Message
}