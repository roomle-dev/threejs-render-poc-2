# Notes

## Effects

### Ambient Occlusion

Add `thicknessFalloff` to `ao` pass (`GTAONode`)

![ao artifact](images/ao-artifact-1.jpg)

Can the AO be applied to the material by setting the `aoMap` and using screen space coordinates to look up the AO value?

## Material

`ShadowMaterial` does not seem to work with the `WebGPURenderer`.

## Light

Create a progressive shadow from a `RectAreaLight` using TSL and create a three.js example.
