Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("f:\schoolStudio\src\static\cover.png")
$bmp = New-Object System.Drawing.Bitmap(300, 300)
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.DrawImage($img, 0, 0, 300, 300)
$bmp.Save("f:\schoolStudio\src\static\share_thumb.png", [System.Drawing.Imaging.ImageFormat]::Png)

$graph.Dispose()
$bmp.Dispose()
$img.Dispose()
