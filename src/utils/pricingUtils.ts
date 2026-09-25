import { Accoutrement, PriceLine, PriceSummarySnapshot, Service } from '../types';

export type { PriceLine, PriceSummarySnapshot };

export interface PriceSummary {
  lines: PriceLine[];
  serviceBase: number;
  addOnsTotal: number;
  total: number;
}

/**
 * Single source of truth for booking totals.
 * Live during the flow — the caller freezes a snapshot at confirmation.
 */
export const calculateBookingTotal = (
  service: Service | null | undefined,
  accoutrements: Accoutrement[] | undefined
): PriceSummary => {
  const lines: PriceLine[] = [];
  const serviceBase = service?.price ?? 0;

  if (service) {
    lines.push({
      id: `svc-${service.id}`,
      label: service.name,
      amount: service.price,
      kind: 'service',
    });
  }

  let addOnsTotal = 0;
  for (const a of accoutrements ?? []) {
    if (!a.selected) continue;
    const amount = a.price ?? 0;
    addOnsTotal += amount;
    lines.push({
      id: `add-${a.id}`,
      label: a.name,
      amount,
      kind: 'addon',
    });
  }

  return {
    lines,
    serviceBase,
    addOnsTotal,
    total: serviceBase + addOnsTotal,
  };
};
