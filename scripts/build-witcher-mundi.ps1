param(
  [string]$TilesRoot = ".codex_tmp/witcher3map-maps-master",
  [string]$OutputPath = "public/maps/witcher-mundi.png",
  [string]$MetadataPath = "public/maps/witcher-mundi.meta.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-DirectoryIfMissing {
  param([string]$Path)

  $directory = Split-Path -Parent $Path

  if ($directory -and -not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }
}

function Get-RegionBitmap {
  param(
    [string]$RegionFolder,
    [int]$Zoom,
    [bool]$InvertY
  )

  $zoomPath = Join-Path $TilesRoot "$RegionFolder\$Zoom"

  if (-not (Test-Path $zoomPath)) {
    throw "Tile zoom path not found: $zoomPath"
  }

  $xDirs = Get-ChildItem -Path $zoomPath -Directory | Sort-Object { [int]$_.Name }

  if (-not $xDirs) {
    throw "No x directories found for $RegionFolder at zoom $Zoom"
  }

  $maxX = ($xDirs | ForEach-Object { [int]$_.Name } | Measure-Object -Maximum).Maximum
  $allY = @()

  foreach ($xDir in $xDirs) {
    $allY += Get-ChildItem -Path $xDir.FullName -Filter "*.png" | ForEach-Object { [int]$_.BaseName }
  }

  if (-not $allY) {
    throw "No y tiles found for $RegionFolder at zoom $Zoom"
  }

  $maxY = ($allY | Measure-Object -Maximum).Maximum
  $bitmapWidth = [int](($maxX + 1) * 256)
  $bitmapHeight = [int](($maxY + 1) * 256)
  $bitmap = New-Object System.Drawing.Bitmap $bitmapWidth, $bitmapHeight
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  try {
    foreach ($xDir in $xDirs) {
      $x = [int]$xDir.Name
      $tiles = Get-ChildItem -Path $xDir.FullName -Filter "*.png"

      foreach ($tileFile in $tiles) {
        $sourceY = [int]$tileFile.BaseName
        $targetY = if ($InvertY) { $maxY - $sourceY } else { $sourceY }
        $image = [System.Drawing.Image]::FromFile($tileFile.FullName)

        try {
          $graphics.DrawImage($image, $x * 256, $targetY * 256, 256, 256)
        } finally {
          $image.Dispose()
        }
      }
    }
  } finally {
    $graphics.Dispose()
  }

  return $bitmap
}

function Draw-Region {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Bitmap]$Bitmap,
    [int]$X,
    [int]$Y,
    [double]$Scale
  )

  $destWidth = [int][Math]::Round($Bitmap.Width * $Scale)
  $destHeight = [int][Math]::Round($Bitmap.Height * $Scale)
  $Graphics.DrawImage($Bitmap, $X, $Y, $destWidth, $destHeight)

  return @{
    Width = $destWidth
    Height = $destHeight
    X = $X
    Y = $Y
  }
}

function Draw-RegionWithOpacity {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Bitmap]$Bitmap,
    [int]$X,
    [int]$Y,
    [double]$Scale,
    [double]$Opacity
  )

  $destWidth = [int][Math]::Round($Bitmap.Width * $Scale)
  $destHeight = [int][Math]::Round($Bitmap.Height * $Scale)
  $imageAttributes = New-Object System.Drawing.Imaging.ImageAttributes
  $colorMatrix = New-Object System.Drawing.Imaging.ColorMatrix
  $colorMatrix.Matrix33 = [float]$Opacity
  $imageAttributes.SetColorMatrix($colorMatrix)

  try {
    $Graphics.DrawImage(
      $Bitmap,
      (New-Object System.Drawing.Rectangle $X, $Y, $destWidth, $destHeight),
      0,
      0,
      $Bitmap.Width,
      $Bitmap.Height,
      [System.Drawing.GraphicsUnit]::Pixel,
      $imageAttributes
    )
  } finally {
    $imageAttributes.Dispose()
  }
}

function Draw-AtlasLabel {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [int]$X,
    [int]$Y,
    [float]$Size = 26
  )

  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(170, 12, 8, 6))
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 226, 206, 160))
  $font = New-Object System.Drawing.Font("Georgia", $Size, [System.Drawing.FontStyle]::Bold)

  try {
    $Graphics.DrawString($Text, $font, $shadowBrush, ($X + 3), ($Y + 3))
    $Graphics.DrawString($Text, $font, $textBrush, $X, $Y)
  } finally {
    $shadowBrush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
  }
}

function Get-ColorBrightness {
  param([System.Drawing.Color]$Color)

  return (($Color.R + $Color.G + $Color.B) / 3)
}

function Test-UsefulRow {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Y
  )

  for ($x = 0; $x -lt $Bitmap.Width; $x += 12) {
    $pixel = $Bitmap.GetPixel($x, $Y)

    if ($pixel.A -gt 0 -and (Get-ColorBrightness $pixel) -gt 10) {
      return $true
    }
  }

  return $false
}

function Test-UsefulColumn {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$X
  )

  for ($y = 0; $y -lt $Bitmap.Height; $y += 12) {
    $pixel = $Bitmap.GetPixel($X, $y)

    if ($pixel.A -gt 0 -and (Get-ColorBrightness $pixel) -gt 10) {
      return $true
    }
  }

  return $false
}

function Trim-Bitmap {
  param([System.Drawing.Bitmap]$Bitmap)

  $left = 0
  $top = 0
  $right = $Bitmap.Width - 1
  $bottom = $Bitmap.Height - 1

  while ($left -lt $right -and -not (Test-UsefulColumn -Bitmap $Bitmap -X $left)) {
    $left++
  }

  while ($right -gt $left -and -not (Test-UsefulColumn -Bitmap $Bitmap -X $right)) {
    $right--
  }

  while ($top -lt $bottom -and -not (Test-UsefulRow -Bitmap $Bitmap -Y $top)) {
    $top++
  }

  while ($bottom -gt $top -and -not (Test-UsefulRow -Bitmap $Bitmap -Y $bottom)) {
    $bottom--
  }

  $trimmed = New-Object System.Drawing.Bitmap ($right - $left + 1), ($bottom - $top + 1)
  $graphics = [System.Drawing.Graphics]::FromImage($trimmed)

  try {
    $graphics.DrawImage(
      $Bitmap,
      (New-Object System.Drawing.Rectangle 0, 0, $trimmed.Width, $trimmed.Height),
      (New-Object System.Drawing.Rectangle $left, $top, $trimmed.Width, $trimmed.Height),
      [System.Drawing.GraphicsUnit]::Pixel
    )
  } finally {
    $graphics.Dispose()
  }

  return [pscustomobject]@{
    Bitmap = $trimmed
    Left = $left
    Top = $top
    Width = $trimmed.Width
    Height = $trimmed.Height
  }
}

function Apply-EdgeFeather {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Feather
  )

  $result = New-Object System.Drawing.Bitmap $Bitmap.Width, $Bitmap.Height

  for ($x = 0; $x -lt $Bitmap.Width; $x++) {
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
      $pixel = $Bitmap.GetPixel($x, $y)

      if ($pixel.A -eq 0) {
        $result.SetPixel($x, $y, $pixel)
        continue
      }

      $distanceToEdge = [Math]::Min(
        [Math]::Min($x, $Bitmap.Width - 1 - $x),
        [Math]::Min($y, $Bitmap.Height - 1 - $y)
      )

      $alphaFactor = if ($distanceToEdge -ge $Feather) {
        1.0
      } else {
        [Math]::Max(0.0, $distanceToEdge / [double]$Feather)
      }

      $alpha = [int][Math]::Round($pixel.A * $alphaFactor)
      $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
    }
  }

  return $result
}

New-DirectoryIfMissing -Path $OutputPath
New-DirectoryIfMissing -Path $MetadataPath

$canvasWidth = 9000
$canvasHeight = 5600
$canvas = New-Object System.Drawing.Bitmap $canvasWidth, $canvasHeight
$graphics = [System.Drawing.Graphics]::FromImage($canvas)

try {
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $backdropRegions = @(
    @{ Folder = "hos_velen"; Zoom = 4; InvertY = $true; X = 1460; Y = 40; Scale = 1.34; Opacity = 0.28; Feather = 640 },
    @{ Folder = "skellige"; Zoom = 4; InvertY = $true; X = -220; Y = 760; Scale = 1.18; Opacity = 0.22; Feather = 620 },
    @{ Folder = "kaer_morhen"; Zoom = 4; InvertY = $true; X = 5440; Y = 180; Scale = 1.08; Opacity = 0.18; Feather = 520 },
    @{ Folder = "toussaint"; Zoom = 4; InvertY = $true; X = 2800; Y = 3160; Scale = 1.12; Opacity = 0.18; Feather = 520 }
  )

  foreach ($region in $backdropRegions) {
    $bitmap = Get-RegionBitmap -RegionFolder $region.Folder -Zoom $region.Zoom -InvertY $region.InvertY

    try {
      $trimmedBitmap = Trim-Bitmap -Bitmap $bitmap

      try {
        $featheredBackdrop = Apply-EdgeFeather -Bitmap $trimmedBitmap.Bitmap -Feather $region.Feather

        try {
          Draw-RegionWithOpacity -Graphics $graphics -Bitmap $featheredBackdrop -X $region.X -Y $region.Y -Scale $region.Scale -Opacity $region.Opacity
        } finally {
          $featheredBackdrop.Dispose()
        }
      } finally {
        $trimmedBitmap.Bitmap.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  }

  $regions = @(
    @{ Folder = "skellige"; Zoom = 4; InvertY = $true; X = 120; Y = 920; Scale = 1.02; Feather = 280 },
    @{ Folder = "hos_velen"; Zoom = 4; InvertY = $true; X = 1820; Y = 120; Scale = 1.14; Feather = 260 },
    @{ Folder = "kaer_morhen"; Zoom = 4; InvertY = $true; X = 5820; Y = 320; Scale = 0.94; Feather = 220 },
    @{ Folder = "toussaint"; Zoom = 4; InvertY = $true; X = 3180; Y = 3320; Scale = 0.94; Feather = 220 }
  )

  $regionRects = @{}

  foreach ($region in $regions) {
    $bitmap = Get-RegionBitmap -RegionFolder $region.Folder -Zoom $region.Zoom -InvertY $region.InvertY

    try {
      $trimmedBitmap = Trim-Bitmap -Bitmap $bitmap

      try {
        $featheredBitmap = Apply-EdgeFeather -Bitmap $trimmedBitmap.Bitmap -Feather $region.Feather

        try {
          $rect = Draw-Region -Graphics $graphics -Bitmap $featheredBitmap -X $region.X -Y $region.Y -Scale $region.Scale
          $regionRects[$region.Folder] = $rect
        } finally {
          $featheredBitmap.Dispose()
        }
      } finally {
        $trimmedBitmap.Bitmap.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  }

  Draw-AtlasLabel -Graphics $graphics -Text "Skellige" -X 420 -Y 620 -Size 72
  Draw-AtlasLabel -Graphics $graphics -Text "Reinos do Norte" -X 2920 -Y 86 -Size 82
  Draw-AtlasLabel -Graphics $graphics -Text "Kaer Morhen" -X 6080 -Y 182 -Size 60
  Draw-AtlasLabel -Graphics $graphics -Text "Toussaint" -X 3680 -Y 3160 -Size 60
  Draw-AtlasLabel -Graphics $graphics -Text "White Orchard" -X 2520 -Y 1970 -Size 46

  $trimmedCanvas = Trim-Bitmap -Bitmap $canvas

  try {
    $padding = 48
    $finalWidth = $trimmedCanvas.Width + ($padding * 2)
    $finalHeight = $trimmedCanvas.Height + ($padding * 2)
    $finalCanvas = New-Object System.Drawing.Bitmap $finalWidth, $finalHeight
    $finalGraphics = [System.Drawing.Graphics]::FromImage($finalCanvas)

    try {
      $finalGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $finalGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $finalGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

      $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle 0, 0, $finalWidth, $finalHeight),
        [System.Drawing.Color]::FromArgb(28, 20, 14),
        [System.Drawing.Color]::FromArgb(14, 10, 8),
        90
      )

      try {
        $finalGraphics.FillRectangle($backgroundBrush, 0, 0, $finalWidth, $finalHeight)
      } finally {
        $backgroundBrush.Dispose()
      }

      $finalGraphics.DrawImage($trimmedCanvas.Bitmap, $padding, $padding, $trimmedCanvas.Width, $trimmedCanvas.Height)
      $finalCanvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $finalGraphics.Dispose()
      $finalCanvas.Dispose()
    }

    $metadata = [ordered]@{
      width = $finalWidth
      height = $finalHeight
      trimLeft = $trimmedCanvas.Left
      trimTop = $trimmedCanvas.Top
      padding = $padding
      regions = [ordered]@{}
    }

    foreach ($key in $regionRects.Keys) {
      $rect = $regionRects[$key]
      $metadata.regions[$key] = [ordered]@{
        x = $rect.X - $trimmedCanvas.Left + $padding
        y = $rect.Y - $trimmedCanvas.Top + $padding
        width = $rect.Width
        height = $rect.Height
      }
    }

    $metadata | ConvertTo-Json -Depth 5 | Set-Content -Path $MetadataPath
  } finally {
    $trimmedCanvas.Bitmap.Dispose()
  }
} finally {
  $graphics.Dispose()
  $canvas.Dispose()
}
