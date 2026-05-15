package helpers

import (
	"fmt"
	"slices"
)

// emission factors hardcoded (kgCO2/kg)
const (
	OTHER_CO2   float64 = 0.1
	WOOD_CO2    float64 = 0.6
	METAL_CO2   float64 = 2.5
	TEXTILE_CO2 float64 = 4
	GLASS_CO2   float64 = 0.3
	PLASTIC_CO2 float64 = 1.2
	MIXED_CO2   float64 = 0.5
)

// liters/kg
const (
	OTHER_WATER   float64 = 40
	WOOD_WATER    float64 = 20
	METAL_WATER   float64 = 120
	TEXTILE_WATER float64 = 2500
	GLASS_WATER   float64 = 15
	PLASTIC_WATER float64 = 60
	MIXED_WATER   float64 = 40
)

// kWh/kg
const (
	OTHER_ENERGY   float64 = 3
	WOOD_ENERGY    float64 = 2
	METAL_ENERGY   float64 = 18
	TEXTILE_ENERGY float64 = 6
	GLASS_ENERGY   float64 = 4
	PLASTIC_ENERGY float64 = 10
	MIXED_ENERGY   float64 = 5
)

var Materials = []string{"wood", "metal", "textile", "glass", "plastic", "mixed", "other"}

func CalculateCO2(material string, weight float64) (float64, error) {
	if weight < 0 {
		return 0, fmt.Errorf("weight must be positive")
	}
	if !slices.Contains(Materials, material) {
		return 0, fmt.Errorf("invalid material")
	}
	switch material {
	case "wood":
		return weight * WOOD_CO2, nil
	case "metal":
		return weight * METAL_CO2, nil
	case "textile":
		return weight * TEXTILE_CO2, nil
	case "glass":
		return weight * GLASS_CO2, nil
	case "plastic":
		return weight * PLASTIC_CO2, nil
	case "mixed":
		return weight * MIXED_CO2, nil
	default:
		return weight * OTHER_CO2, nil
	}
}

func CalculateWaterSaved(material string, weight float64) (float64, error) {
	if weight < 0 {
		return 0, fmt.Errorf("weight must be positive")
	}
	if !slices.Contains(Materials, material) {
		return 0, fmt.Errorf("invalid material")
	}
	switch material {
	case "wood":
		return weight * WOOD_WATER, nil
	case "metal":
		return weight * METAL_WATER, nil
	case "textile":
		return weight * TEXTILE_WATER, nil
	case "glass":
		return weight * GLASS_WATER, nil
	case "plastic":
		return weight * PLASTIC_WATER, nil
	case "mixed":
		return weight * MIXED_WATER, nil
	default:
		return weight * OTHER_WATER, nil
	}
}

func CalculateElectricitySaved(material string, weight float64) (float64, error) {
	if weight < 0 {
		return 0, fmt.Errorf("weight must be positive")
	}
	if !slices.Contains(Materials, material) {
		return 0, fmt.Errorf("invalid material")
	}
	switch material {
	case "wood":
		return weight * WOOD_ENERGY, nil
	case "metal":
		return weight * METAL_ENERGY, nil
	case "textile":
		return weight * TEXTILE_ENERGY, nil
	case "glass":
		return weight * GLASS_ENERGY, nil
	case "plastic":
		return weight * PLASTIC_ENERGY, nil
	case "mixed":
		return weight * MIXED_ENERGY, nil
	default:
		return weight * OTHER_ENERGY, nil
	}
}

func CalculateScore(material string, weight float64) (int, error) {
	co2, err := CalculateCO2(material, weight)
	if err != nil {
		return 0, err
	}
	water, err := CalculateWaterSaved(material, weight)
	if err != nil {
		return 0, err
	}
	electricity, err := CalculateElectricitySaved(material, weight)
	if err != nil {
		return 0, err
	}
	return int(co2*10 + water*0.002 + electricity*2), nil
}
