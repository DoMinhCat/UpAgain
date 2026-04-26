package stripe

import (
	"backend/utils"

	"github.com/stripe/stripe-go/v85"
	"github.com/stripe/stripe-go/v85/checkout/session"
)

// Define a struct to pass data cleanly
type CheckoutRequest struct {
    EventName   string
    PriceInCents int64
    SuccessURL  string
    CancelURL   string
}

// The Modular Function
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
                        Name: stripe.String(req.EventName),
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

func IsPaymentPaid(sessionID string) (bool, error){
	s, err := session.Get(sessionID, nil)
	if err != nil {
		return false, err
	}
	return s.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid, nil
}