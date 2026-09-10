Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(192, 192)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.Clear([System.Drawing.Color]::Green)
$bmp.Save("d:\DEVLOPEMENT\SahiRate\frontend\public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$bmp512 = New-Object System.Drawing.Bitmap(512, 512)
$graphics512 = [System.Drawing.Graphics]::FromImage($bmp512)
$graphics512.Clear([System.Drawing.Color]::Green)
$bmp512.Save("d:\DEVLOPEMENT\SahiRate\frontend\public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()
