package helper

import "fmt"

// emission factors hardcoded (kgCO2/kg)
const (
	OTHER   float64 = 0.1
	WOOD    float64 = 0.6
	METAL   float64 = 2.5
	TEXTILE float64 = 4
	GLASS   float64 = 0.3
	PLASTIC float64 = 1.2
	MIXED   float64 = 0.5
)

func CalculateCO2(material string, weight float64) (float64, error) {
	if weight < 0 {
		return 0, fmt.Errorf("weight must be positive")
	}
	if material != "wood" && material != "metal" && material != "textile" && material != "glass" && material != "plastic" && material != "mixed" {
		return 0, fmt.Errorf("invalid material")
	}
	switch material {
	case "wood":
		return weight * WOOD, nil
	case "metal":
		return weight * METAL, nil
	case "textile":
		return weight * TEXTILE, nil
	case "glass":
		return weight * GLASS, nil
	case "plastic":
		return weight * PLASTIC, nil
	case "mixed":
		return weight * MIXED, nil
	default:
		return weight * OTHER, nil
	}
}
