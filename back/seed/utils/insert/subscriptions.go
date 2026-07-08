package insert

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	"backend/seed/utils"
)

func InsertSubscriptions(tx *sql.Tx, premiumProIDs []int) error {
	query := `
		INSERT INTO subscriptions (is_trial, is_active, sub_from, sub_to, id_pro, cancel_reason, price)
		VALUES (false, true, $1, $2, $3, nil, $4)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert subscriptions statement: %w", err)
	}
	defer stmt.Close()

	now := time.Now()

	for _, proID := range premiumProIDs {
		// Calculate random duration between 1 and 12 months
		nbMonths := rand.Intn(12) + 1
		subFrom := now
		subTo := subFrom.AddDate(0, nbMonths, 0)

		// Base price calculation (10 EUR per month)
		const basePricePerMonth = 10.0
		totalPriceBase := basePricePerMonth * float64(nbMonths)

		// Financial calculations matching Stripe + VAT layout
		stripeCommTotalInCents := int64(utils.STRIPE_COMMISSION_RATE_PERCENT_EU*totalPriceBase*100) + int64(utils.STRIPE_COMMISSION_FIXED_IN_CENTS)
		vatTotalInCents := int64(totalPriceBase * 100 * utils.VAT_RATE)
		finalPriceInCents := stripeCommTotalInCents + int64(totalPriceBase*100) + vatTotalInCents

		// Convert back from cents to float for numeric(10,2) field
		finalPrice := float64(finalPriceInCents) / 100.0

		_, err := stmt.Exec(subFrom, subTo, proID, finalPrice)
		if err != nil {
			return fmt.Errorf("failed to insert subscription for pro %d: %w", proID, err)
		}
	}

	fmt.Printf("Successfully seeded %d subscriptions for premium pros.\n", len(premiumProIDs))
	return nil
}