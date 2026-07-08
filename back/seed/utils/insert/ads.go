package insert

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	"backend/seed/utils"

	"github.com/brianvoe/gofakeit/v7"
)

func InsertAds(tx *sql.Tx, projectPostIDs []int) error {
	query := `
		INSERT INTO ads (start_date, end_date, status, id_post, price_per_month, total_price, updated_at)
		VALUES ($1, $2, 'active', $3, $4, $5, $6)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare insert ads statement: %w", err)
	}
	defer stmt.Close()

	// Select a subset of project posts to receive ads (e.g., ~40% random coverage)
	var activeAdsCount int
	now := time.Now()

	for _, postID := range projectPostIDs {
		// Ensure not all posts have ads
		if !gofakeit.Bool() {
			continue
		}

		// Calculate dates (Start date = now, End date = +1 to 12 months)
		startDate := now
		nbMonths := rand.Intn(12) + 1
		endDate := startDate.AddDate(0, nbMonths, 0)

		// Calculate financial rates precisely in floating-point operations
		totalPriceBase := utils.ADS_PRICE_PER_MONTH * float64(nbMonths)

		// Match stripe logic using constants
		stripeCommTotalInCents := int64(utils.STRIPE_COMMISSION_RATE_PERCENT_EU*totalPriceBase*100) + int64(utils.STRIPE_COMMISSION_FIXED_IN_CENTS)
		vatTotalInCents := int64(totalPriceBase * 100 * utils.VAT_RATE)
		finalPriceInCents := stripeCommTotalInCents + int64(totalPriceBase*100) + vatTotalInCents

		// Convert back from cents to float decimal unit for the database field numeric(10,2)
		finalTotalPrice := float64(finalPriceInCents) / 100.0

		_, err := stmt.Exec(startDate, endDate, postID, utils.ADS_PRICE_PER_MONTH, finalTotalPrice, now)
		if err != nil {
			return fmt.Errorf("failed to insert ad for post %d: %w", postID, err)
		}
		activeAdsCount++
	}

	fmt.Printf("Successfully seeded %d active ads across project posts.\n", activeAdsCount)
	return nil
}