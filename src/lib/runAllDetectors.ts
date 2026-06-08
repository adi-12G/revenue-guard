import { detectSeatOverage } from "./detectors/seatOverage";
import { detectFailedPayments } from "./detectors/failedPayments";


export function runAllDetectors(data: any) {
  return [
    ...detectSeatOverage(data.seats),
    ...detectFailedPayments(data.payments),
    
  ];
}