import type { Uuid } from "../api/financeApiTypes";

export type FinanceMovementFormContext =
    | {
          type: "standard";
      }
    | {
          type: "simulation";
          simulationGroupId: Uuid;
          allowedAccountIds: Uuid[];
      };

export function isSimulationMovementContext(
    context: FinanceMovementFormContext,
): context is Extract<FinanceMovementFormContext, { type: "simulation" }> {
    return context.type === "simulation";
}
