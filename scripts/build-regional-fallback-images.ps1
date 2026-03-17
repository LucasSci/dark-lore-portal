$ErrorActionPreference = "Stop"

# Builds lightweight regional fallback images (JPEG) from the local tile pack.
# This keeps the app working (and non-empty) even when tiles are unavailable.
#
# Source tiles live in: .codex_tmp/witcher3map-maps-master/<folder>/<z>/<x>/<y>.png
# Output images go to:  public/maps/regions/<id>.jpg

Add-Type -AssemblyName System.Drawing

$RepoRoot = (Resolve-Path ".").Path
$TileRoot = Join-Path $RepoRoot ".codex_tmp/witcher3map-maps-master"
$OutDir = Join-Path $RepoRoot "public/maps/regions"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Get-TileIndex($path) {
  # Returns @{ X = int; Y = int } from ".../<z>/<x>/<y>.png"
  $yName = [System.IO.Path]::GetFileNameWithoutExtension($path)
  $xName = [System.IO.Path]::GetFileName((Split-Path -Parent $path))
  return @{
    X = [int]$xName
    Y = [int]$yName
  }
}

function Build-RegionJpegFromTiles(
  [string]$RegionId,
  [string]$Folder,
  [int]$Zoom,
  [bool]$InvertY,
  [int]$JpegQuality = 86
) {
  $regionRoot = Join-Path $TileRoot $Folder
  $zoomRoot = Join-Path $regionRoot $Zoom

  if (-not (Test-Path $zoomRoot)) {
    throw "Tile folder not found: $zoomRoot"
  }

  $tiles = Get-ChildItem -Recurse -File -Path $zoomRoot -Filter "*.png"
  if (-not $tiles -or $tiles.Count -lt 1) {
    throw "No tiles found under: $zoomRoot"
  }

  $firstTile = [System.Drawing.Bitmap]::FromFile($tiles[0].FullName)
  $tileSize = $firstTile.Width
  $firstTile.Dispose()

  $minX = [int]::MaxValue
  $maxX = [int]::MinValue
  $minY = [int]::MaxValue
  $maxY = [int]::MinValue

  foreach ($t in $tiles) {
    $idx = Get-TileIndex $t.FullName
    if ($idx.X -lt $minX) { $minX = $idx.X }
    if ($idx.X -gt $maxX) { $maxX = $idx.X }
    if ($idx.Y -lt $minY) { $minY = $idx.Y }
    if ($idx.Y -gt $maxY) { $maxY = $idx.Y }
  }

  $cols = ($maxX - $minX + 1)
  $rows = ($maxY - $minY + 1)

  $width = $cols * $tileSize
  $height = $rows * $tileSize

  Write-Host "Building $RegionId from $Folder z$Zoom ($cols x $rows tiles) => ${width}x${height}px"

  $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

  foreach ($t in $tiles) {
    $idx = Get-TileIndex $t.FullName
    $x = ($idx.X - $minX)
    $yFile = ($idx.Y - $minY)
    $y = if ($InvertY) { ($rows - 1 - $yFile) } else { $yFile }

    $img = [System.Drawing.Bitmap]::FromFile($t.FullName)
    $g.DrawImage($img, $x * $tileSize, $y * $tileSize, $tileSize, $tileSize)
    $img.Dispose()
  }

  $g.Dispose()

  $outPath = Join-Path $OutDir ($RegionId + ".jpg")
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$JpegQuality)
  $bmp.Save($outPath, $encoder, $encParams)
  $bmp.Dispose()

  Write-Host "Wrote $outPath"
}

# These two were too large as PNGs. Generate JPEG fallbacks from tiles at a lower zoom.
Build-RegionJpegFromTiles -RegionId "velen-novigrad" -Folder "hos_velen" -Zoom 4 -InvertY $true -JpegQuality 86
Build-RegionJpegFromTiles -RegionId "skellige" -Folder "skellige" -Zoom 4 -InvertY $false -JpegQuality 86

