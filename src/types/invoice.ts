export interface Invoice {
  customer: string;
  expected: number;
  billed: number;
}

export interface InvoiceResult extends Invoice {
    status: string;
}