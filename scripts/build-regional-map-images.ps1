$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $root ".codex_tmp\\witcher3map-maps-master"
$outputRoot = Join-Path $root "public\\maps\\regions"
$tileSize = 256

function Get-HighestZoom {
  param([string]$Folder)

  $folderPath = Join-Path $sourceRoot $Folder
  $zoomDirs = Get-ChildItem -Path $folderPath -Directory | Where-Object { $_.Name -match '^\d+$' }

  if ($zoomDirs.Count -eq 0) {
    throw "No zoom directories found in $folderPath"
  }

  return ($zoomDirs | ForEach-Object { [int]$_.Name } | Measure-Object -Maximum).Maximum
}

$mapConfig = @(
  @{ Id = "velen-novigrad"; Folder = "hos_velen" },
  @{ Id = "skellige"; Folder = "skellige" },
  @{ Id = "kaer-morhen"; Folder = "kaer_morhen" },
  @{ Id = "toussaint"; Folder = "toussaint" },
  @{ Id = "white-orchard"; Folder = "white_orchard" }
)

if (-not (Test-Path $outputRoot)) {
  New-Item -ItemType Directory -Path $outputRoot | Out-Null
}

$manifest = @()

foreach ($map in $mapConfig) {
  $resolvedZoom = if ($map.ContainsKey("Zoom")) { [int]$map.Zoom } else { Get-HighestZoom -Folder $map.Folder }
  $zoomPath = Join-Path $sourceRoot "$($map.Folder)\\$resolvedZoom"

  if (-not (Test-Path $zoomPath)) {
    throw "Tile folder not found: $zoomPath"
  }

  $xDirs = Get-ChildItem -Path $zoomPath -Directory | Sort-Object { [int]$_.Name }

  if ($xDirs.Count -eq 0) {
    throw "No x directories found in $zoomPath"
  }

  $xValues = $xDirs | ForEach-Object { [int]$_.Name }
  $yValues = New-Object System.Collections.Generic.List[int]

  foreach ($xDir in $xDirs) {
    foreach ($tile in (Get-ChildItem -Path $xDir.FullName -Filter "*.png")) {
      $yValues.Add([int][System.IO.Path]::GetFileNameWithoutExtension($tile.Name))
    }
  }

  if ($yValues.Count -eq 0) {
    throw "No png tiles found in $zoomPath"
  }

  $minX = ($xValues | Measure-Object -Minimum).Minimum
  $maxX = ($xValues | Measure-Object -Maximum).Maximum
  $minY = ($yValues | Measure-Object -Minimum).Minimum
  $maxY = ($yValues | Measure-Object -Maximum).Maximum

  $width = [int]((($maxX - $minX) + 1) * $tileSize)
  $height = [int]((($maxY - $minY) + 1) * $tileSize)

  $canvas = [System.Drawing.Bitmap]::new($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::Transparent)

  foreach ($xDir in $xDirs) {
    $x = [int]$xDir.Name
    foreach ($tilePath in (Get-ChildItem -Path $xDir.FullName -Filter "*.png")) {
      $y = [int][System.IO.Path]::GetFileNameWithoutExtension($tilePath.Name)
      $pasteX = ($x - $minX) * $tileSize
      $pasteY = ($maxY - $y) * $tileSize
      $tileImage = [System.Drawing.Image]::FromFile($tilePath.FullName)
      try {
        $graphics.DrawImage($tileImage, $pasteX, $pasteY, $tileSize, $tileSize)
      } finally {
        $tileImage.Dispose()
      }
    }
  }

  $outputPath = Join-Path $outputRoot "$($map.Id).png"
  try {
    $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $canvas.Dispose()
  }

  $manifest += [pscustomobject]@{
    id = $map.Id
    folder = $map.Folder
    zoom = $resolvedZoom
    width = $width
    height = $height
    minX = $minX
    maxX = $maxX
    minY = $minY
    maxY = $maxY
    output = "public/maps/regions/$($map.Id).png"
  }
}

$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $outputRoot "manifest.json")
Write-Output "Generated $($manifest.Count) regional maps at $outputRoot"
