# 0.10.0 (2026-08-22)

Standardisation of return values when DEM elevation cannot be obtained; universal `null` return. If `DemApplier` encounters a `null` value from the DEM, the elevation is not added to the coordinates as the third element, hence you can test for the third element being `undefined` to check whether the elevation was applied or not. 

# 0.9.0 (2026-07-25)

**BREAKING CHANGE** : `JsonTiler` now known as `GeoJsonTiler` and only handles GeoJSON data. (In practise, most JSON geodata will probably be GeoJSON data, or can be generated as such).
Stronger typing with generics for tiled data. 

# 0.8.0 (2026-07-23)

Use standard `geojson` types rather than hand-rolled ones.
