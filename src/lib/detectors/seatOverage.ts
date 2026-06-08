export function detectSeatOverage(rows: any[]) {
  return rows
    .filter(
      (row) =>
        Number(row.actual_seats_used) >
        Number(row.billed_seats)
    )
    .map((row) => ({
      customer: row.company_name,

      leakType: "Seat Overages",

      loss:
        (Number(row.actual_seats_used) -
          Number(row.billed_seats)) *
        Number(row.price_per_seat_inr),
    }));
}