import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import {
  layers as protomapsLayers,
  namedFlavor,
} from '@protomaps/basemaps'

import {
  currentRCPAtom,
  currentSpeciesAtom,
  timeStepAtom,
} from '../atoms'

import { THEME, TIME_STEPS } from '../constants'

const PROTOMAPS_URL = 'pmtiles:///maps/europe.pmtiles'

function useMapStyle() {
  const species = useAtomValue(currentSpeciesAtom)
  const timeStep = useAtomValue(timeStepAtom)
  const rcp = useAtomValue(currentRCPAtom)

  return useMemo(() => {
    const fut = TIME_STEPS.indexOf(timeStep)

    return getMapStyle({
      rcp,
      fut,
      species,
    })
  }, [species, timeStep, rcp])
}

function getMapStyle({
  rcp,
  fut,
  species,
}: {
  rcp: string
  fut: number
  species: string
}) {
  const basemapLayers = protomapsLayers(
    'protomaps',
    namedFlavor('white'),
    {
      lang: 'en',
    }
  )

  const valueProperty =
    fut === 0
      ? 'current'
      : fut === 1
        ? 'fut1'
        : fut === 2
          ? 'fut2'
          : 'fut3'

  const style = {
    version: 8 as const,

    glyphs:
      'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',

    sprite:
      'https://protomaps.github.io/basemaps-assets/sprites/v4/white',

    sources: {
      protomaps: {
        type: 'vector' as const,
        url: PROTOMAPS_URL,
        attribution:
          '© <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      },

      trees: {
        type: 'vector' as const,
        tiles: [
          `${window.location.origin}/pbf/${species}/{z}/{x}/{y}.pbf`,
        ],
        minzoom: 2,
        maxzoom: 8,
      },
    },

    layers: [
      ...basemapLayers,

      {
        id: 'trees',
        type: 'fill' as const,
        source: 'trees',
        'source-layer': species,
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', valueProperty],

            0,
            THEME.colors.decolonized,

            500,
            THEME.colors.suitable,

            1000,
            THEME.colors.stable,
          ],

          'fill-opacity': 0.85,
        },
      },
    ],
  }

  return style
}

export default useMapStyle
