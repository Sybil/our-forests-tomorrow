# PBF Builder

This directory contains the script used to generate the vector tiles used by the MapLibre map.

## Process

The PBF generation pipeline is:

SDM GeoTIFF rasters
→ build.py
→ read raster cells
→ generate polygon features
→ temporary GeoJSON
→ Tippecanoe
→ public/pbf/
→ MapLibre

The builder converts the SDM probability rasters into vector tiles.

Each valid raster cell is converted into a polygon representing the original raster cell. The polygons are then converted to PBF vector tiles using Tippecanoe.

The temporary GeoJSON files are only used during the build process and are not kept in public/.

## Input data

The input rasters are located in:

data/pbf_builder/extracted/ens_sdms/

For each species, the builder uses four rasters:

- Current suitability
- Future suitability for 2035
- Future suitability for 2065
- Future suitability for 2095

The current application uses the rcp85 climate scenario.

Example:

Abies_alba_ens-sdms_cur2005_prob_pot.tif
Abies_alba_ens-sdms_rcp85_fut2035_prob_pot.tif
Abies_alba_ens-sdms_rcp85_fut2065_prob_pot.tif
Abies_alba_ens-sdms_rcp85_fut2095_prob_pot.tif

## Raster values

The probability rasters use an integer scale from 0 to 1000.

- 0 → 0.0 probability
- 500 → 0.5 probability
- 1000 → 1.0 probability

The value -32768 is used as the raster nodata value and is ignored by the builder.

The values are kept on the 0–1000 scale in the PBF properties.

Each generated feature contains four probability values:

- current
- fut1
- fut2
- fut3

For example:

{
  "current": 15,
  "fut1": 14,
  "fut2": 11,
  "fut3": 10
}

This allows the frontend to switch between the current and future probabilities without regenerating the tiles.

## Geometry

Each valid raster cell is converted into a polygon covering the entire cell.

The cell dimensions are taken directly from the raster transform.

This preserves the original raster grid and allows MapLibre to render the data as contiguous square cells.

## Output

The generated vector tiles are stored directly in:

public/pbf/

Each species has its own directory.

Example:

public/pbf/Fagus_sylvatica/
├── metadata.json
├── 2/
├── 3/
├── 4/
├── 5/
├── 6/
├── 7/
└── 8/

The current configuration generates zoom levels 2 through 8.

Tiles are served by the application at:

/pbf/{species}/{z}/{x}/{y}.pbf

MapLibre requests the tiles dynamically according to the current species and map viewport.

## Running the builder

To generate tiles for one species:

python scripts/pbf_builder/build.py --species Fagus_sylvatica

To specify the climate scenario:

python scripts/pbf_builder/build.py \
  --species Fagus_sylvatica \
  --rcp rcp85

The application currently uses rcp85.

## Regenerating tiles

When the builder changes, remove the existing species tiles before rebuilding:

rm -rf public/pbf/Fagus_sylvatica

Then run:

python scripts/pbf_builder/build.py --species Fagus_sylvatica

## Checking a generated tile

A PBF tile can be inspected with Tippecanoe:

tippecanoe-decode public/pbf/Fagus_sylvatica/2/1/1.pbf 2 1 1

The output should contain Polygon geometries and the probability properties:

{
  "current": 15,
  "fut1": 14,
  "fut2": 11,
  "fut3": 10
}

## MapLibre

MapLibre consumes the generated tiles directly from:

/pbf/{species}/{z}/{x}/{y}.pbf

The tree layer is a fill layer because the PBF features are polygons.

The frontend selects the relevant property according to the selected timestep:

- current
- fut1
- fut2
- fut3

The probability is then used client-side to determine the cell color.

## Repository structure

scripts/
└── pbf_builder/
    ├── build.py
    └── README.md

data/
└── pbf_builder/
    └── extracted/
        └── ens_sdms/
            └── *.tif

public/
└── pbf/
    └── <species>/
        ├── metadata.json
        └── {z}/{x}/{y}.pbf

## Summary

The complete workflow is:

GeoTIFF
→ build.py
→ raster cells
→ polygon features
→ temporary GeoJSON
→ Tippecanoe
→ public/pbf
→ MapLibre

The PBF files are the only generated vector data required by the application at runtime.
