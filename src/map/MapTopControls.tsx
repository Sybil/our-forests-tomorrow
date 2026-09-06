import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import {
  currentSpeciesAtom,
  introCompletedAtom,
  introStepAtom,
  timeStepAtom,
} from '../atoms'
import { ButtonBar, Button } from '../components/ButtonBar.styled'
import Dropdown from '../components/Dropdown'
import { TIME_STEPS } from '../constants'
import { IntroStepEnum } from '../intro/Intro'
import { AllSpeciesData } from '../types'
import {
  MapTopControlsSection,
  MapTopControlsSectionTitle,
  MapTopControlsWrapper,
  SpeciesDropdown,
  SpeciesDropdownButton,
  SpeciesDropdownChevron,
  SpeciesDropdownMenu,
  SpeciesDropdownOption,
} from './MapTopControls.styled'

type MapTopControlsProps = {
  species: AllSpeciesData
}

function MapTopControls({ species }: MapTopControlsProps) {
  const [currentTimestep, setCurrentTimestep] = useAtom(timeStepAtom)
  const [currentSpecies, setCurrentSpecies] = useAtom(currentSpeciesAtom)
  const introStep = useAtomValue(introStepAtom)
  const introCompleted = useAtomValue(introCompletedAtom)
  const [speciesMenuOpen, setSpeciesMenuOpen] = React.useState(false)

  const currentSpeciesData = species[currentSpecies]

  return (
    <MapTopControlsWrapper
      visible={introCompleted || introStep >= IntroStepEnum.Timesteps2}
    >

      <MapTopControlsSection>
        <MapTopControlsSectionTitle>
          Tree species
        </MapTopControlsSectionTitle>
      
        <SpeciesDropdown>
          <SpeciesDropdownButton
            type="button"
            onClick={() => setSpeciesMenuOpen((open) => !open)}
            aria-expanded={speciesMenuOpen}
          >
            <span>{currentSpeciesData.labels.en.name}</span>
      
            <SpeciesDropdownChevron open={speciesMenuOpen} />
          </SpeciesDropdownButton>
      
          {speciesMenuOpen && (
            <SpeciesDropdownMenu>
              {Object.entries(species).map(([speciesId, speciesData]) => (
                <SpeciesDropdownOption
                  key={speciesId}
                  type="button"
                  active={currentSpecies === speciesId}
                  onClick={() => {
                    setCurrentSpecies(speciesId)
                    setSpeciesMenuOpen(false)
                  }}
                >
                  {speciesData.labels.en.name}
                </SpeciesDropdownOption>
              ))}
            </SpeciesDropdownMenu>
          )}
        </SpeciesDropdown>
      </MapTopControlsSection>

      <MapTopControlsSection>
        <MapTopControlsSectionTitle>Year</MapTopControlsSectionTitle>

        <ButtonBar>
          {TIME_STEPS.map((timestep) => (
            <Button
              onMouseDown={() => setCurrentTimestep(timestep)}
              active={currentTimestep === timestep}
              key={timestep}
            >
              {timestep}
            </Button>
          ))}
        </ButtonBar>
      </MapTopControlsSection>

      <MapTopControlsSection>
        <MapTopControlsSectionTitle>
          Climate scenario
        </MapTopControlsSectionTitle>

        <ButtonBar>
          <Button active>
            rcp8.5<em> · Business as usual</em>
          </Button>
        </ButtonBar>
      </MapTopControlsSection>
    </MapTopControlsWrapper>
  )
}

export default MapTopControls

