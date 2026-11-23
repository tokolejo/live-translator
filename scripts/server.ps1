# Zero-Dependency Windows HTTP Server for IICE Live Translator
param(
    [int]$Port = 8080
)

$Root = Split-Path -Parent $PSScriptRoot
$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")

try {
    $Listener.Start()
} catch {
    Write-Host "Port $Port may already be in use or blocked. Error: $_" -ForegroundColor Yellow
    exit 1
}

Write-Host "IICE Conference Translator Server running at http://localhost:$Port/index.html" -ForegroundColor Cyan
Write-Host "Press Ctrl+C or close this window to stop." -ForegroundColor Gray

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

while ($Listener.IsListening) {
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $RelPath = $Request.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($RelPath)) { $RelPath = "index.html" }
        $RelPath = [System.Uri]::UnescapeDataString($RelPath)

        # Prevent directory traversal
        $FullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $RelPath))
        if (-not $FullPath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
            $Response.StatusCode = 403
            $Response.Close()
            continue
        }

        if (Test-Path $FullPath -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($FullPath).ToLower()
            $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
            $Bytes = [System.IO.File]::ReadAllBytes($FullPath)

            $Response.ContentType = $ContentType
            $Response.ContentLength64 = $Bytes.Length
            $Response.Headers.Add("Cache-Control", "no-cache")
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $Msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $Response.OutputStream.Write($Msg, 0, $Msg.Length)
        }
        $Response.Close()
    } catch {
        # Keep serving on minor connection resets
    }
}
