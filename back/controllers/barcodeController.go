package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	helpers "backend/utils/helpers"
	"log/slog"
	"net/http"
	"strconv"
)

// GetDepositCodesOfLatestTransactionByDepositId godoc
// @Summary      Get deposit codes for user and/or pro of the latest transaction
// @Description  Get deposit code of pro and user of the latest transaction for a deposit
// @Tags         deposit
// @Security     ApiKeyAuth
// @Produce      json
// @Param        deposit_id    path     int     true  "Deposit ID"
// @Success      200     {object}  []models.Barcode  "Deposit codes and their status"
// @Failure      400     {object}  nil                     "Invalid deposit ID"
// @Failure      500     {object}  nil                     "Internal server error"
// @Router       /deposits/{deposit_id}/codes/ [get]
func GetDepositCodesOfLatestTransactionByDepositId(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	depositId, err := strconv.Atoi(r.PathValue("deposit_id"))
	if err != nil {
		slog.Error("strconv.Atoi() failed", "controller", "GetDepositCodesOfLatestTransactionByDepositId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid deposit ID")
		return
	}

	var codes []models.Barcode
	
	if role == "admin" {
		codes, err = db.GetCodesOfLatestTransactionByDepositId(depositId)
		if err != nil {
			slog.Error("db.GetCodesOfLatestTransactionByDepositId() failed", "controller", "GetDepositCodesOfLatestTransactionByDepositId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching deposit codes")
			return
		}
		// encode base64 for download in frontend
		for i := range codes {
			base64Code, err := helpers.EncodeBarcodeToBase64(codes[i].Path)
			if err != nil {
				slog.Error("helpers.EncodeBarcodeToBase64() failed", "controller", "GetDepositCodesOfLatestTransactionByDepositId", "error", err)
				utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while encoding deposit codes")
				return
			}
			codes[i].BarcodeBase64 = "data:image/png;base64," + base64Code
		}
		utils.RespondWithJSON(w, http.StatusOK, codes)
		return
	} else {
		code, err := db.GetCodeByDepositIdAndAccountId(depositId, r.Context().Value("user").(models.AuthClaims).Id)
		if err != nil {
			slog.Error("db.GetCodeByDepositIdAndUserType() failed", "controller", "GetDepositCodesOfLatestTransactionByDepositId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching deposit codes")
			return
		}
		if code.IdAccount != 0 {
			base64Code, err := helpers.EncodeBarcodeToBase64(code.Path)
			if err != nil {
				slog.Error("helpers.EncodeBarcodeToBase64() failed", "controller", "GetDepositCodesOfLatestTransactionByDepositId", "error", err)
				utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while encoding deposit codes")
				return
			}
			code.BarcodeBase64 = "data:image/png;base64," + base64Code
			slog.Debug("base64", "base64", base64Code)
		}
		utils.RespondWithJSON(w, http.StatusOK, []models.Barcode{code})
		return
	}
}
