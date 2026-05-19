package stripe

import (
	"backend/utils"

	"github.com/stripe/stripe-go/v85"
	"github.com/stripe/stripe-go/v85/checkout/session"
)

// Stripe commission = StripeCommissionRateEU + StripeCommissionFixedInCentsEU
var StripeCommissionRatePercentEU = 0.015 // 1.5%
var StripeCommissionFixedInCentsEU = 25 // 25 cents = 0.25 euro
var VatRate = 0.2 // 20% VAT in France

type CheckoutRequest struct {
	EntityName    string
	PriceInCents int64
	SuccessURL   string
	CancelURL    string
}

// CreateStripeSession create a checkout session in stripe and return the checkout URL
func CreateStripeSession(req CheckoutRequest) (string, error) {
	stripe.Key = utils.GetStripeSecretKey()

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		Mode:               stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency:   stripe.String("eur"),
					UnitAmount: stripe.Int64(req.PriceInCents),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(req.EntityName),
					},
				},
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(req.SuccessURL),
		CancelURL:  stripe.String(req.CancelURL),
	}

	s, err := session.New(params)
	if err != nil {
		return "", err
	}
	return s.URL, nil
}

func IsPaymentPaid(sessionID string) (bool, error) {
	s, err := session.Get(sessionID, nil)
	if err != nil {
		return false, err
	}
	return s.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid, nil
}
