export function detectSeatOverage(rows: any[]) {
  return rows
    .filter(
      (row) =>
        Number(row.actual_seats_used) >
        Number(row.billed_seats)
    )
    .map((row) => {
      const actualSeats = Number(
        row.actual_seats_used
      );

      const billedSeats = Number(
        row.billed_seats
      );

      const extraSeats =
        actualSeats - billedSeats;

      const pricePerSeat = Number(
        row.price_per_seat_inr
      );

      const loss =
        extraSeats * pricePerSeat;

      return {
        customer: row.company_name,

        leakType: "Seat Overages",

        loss,

        // Evidence / Detail
        detail: `${extraSeats} extra seats used (${actualSeats} used vs ${billedSeats} billed)`,

        // Suggested Action
        suggestedAction:
          "Review seat count and rebill customer",

        // Raw evidence values
        actualSeats,
        billedSeats,
        extraSeats,
        pricePerSeat,
      };
    });
}
