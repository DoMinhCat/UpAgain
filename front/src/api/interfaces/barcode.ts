export interface Barcode {
  path: string;
  code: string;
  valid_from: string;
  valid_to: string;
  status: string;
  user_type: string;
  id_account: number;
  id_deposit: number;
  id_transaction: string;
  barcode_base64: string;
}
