# Faruk Shop - SSH Tunnel Başlatıcı
# Kullanım: PowerShell'de sağ tık > "PowerShell ile Çalıştır"

Write-Host "FarukShop SSH Tunnel baslatiliyor..." -ForegroundColor Cyan
Write-Host "Sunucu: 37.148.209.146 | Lokal port: 5433 -> Uzak: 5432" -ForegroundColor Gray
Write-Host ""
Write-Host "Tüneli durdurmak için: Ctrl+C" -ForegroundColor Yellow
Write-Host ""

ssh -N -L 5433:localhost:5432 root@37.148.209.146 -i "$env:USERPROFILE\.ssh\farukshop_nopass" -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3
