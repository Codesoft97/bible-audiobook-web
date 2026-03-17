import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionCheckout } from "@/components/subscription/subscription-checkout";
import type { AppSession } from "@/lib/auth/types";
import { APP_ROUTES } from "@/lib/constants";
import type { SubscriptionStatusResponse } from "@/lib/subscriptions";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const baseSession: AppSession = {
  family: {
    id: "family-1",
    familyName: "Familia Teste",
    userName: "Joao",
    email: "joao@email.com",
    plan: "paid",
    authProvider: "local",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  profiles: [],
  selectedProfile: null,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function createSubscriptionStatus(
  overrides: Partial<SubscriptionStatusResponse> = {},
): SubscriptionStatusResponse {
  return {
    plan: "paid",
    hasActiveSubscription: true,
    hasActiveStripeSubscription: false,
    paidUntil: "2026-04-09T12:00:00.000Z",
    lastPaymentAt: "2026-03-10T12:00:00.000Z",
    lastPaymentProvider: "google_play",
    billingSource: "google_play",
    billingType: "recurring",
    managementChannel: "google_play",
    managementMessage: "Gerencie ou cancele sua assinatura no Google Play.",
    canManage: true,
    canCancel: true,
    canPurchaseOnWeb: false,
    canPurchaseOnMobile: false,
    purchaseBlocked: true,
    purchaseBlockedReason:
      "Esta conta ja possui uma assinatura ativa via Google Play. Gerencie-a no app Android ou na Play Store.",
    activeInAppPlatform: "android",
    activeInAppProductId: "premium",
    hasMultipleActiveRecurringSubscriptions: false,
    freeTrialStartedAt: "2026-03-01T10:00:00.000Z",
    freeTrialEndsAt: "2026-03-08T10:00:00.000Z",
    freeTrialDaysRemaining: null,
    ...overrides,
  };
}

describe("SubscriptionCheckout", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.restoreAllMocks();
  });

  it("mostra gerenciamento externo quando a assinatura ativa vem do Google Play", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      if (input === "/api/subscriptions/me") {
        return jsonResponse({
          status: "success",
          data: createSubscriptionStatus(),
        });
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    render(<SubscriptionCheckout session={baseSession} />);

    expect(
      await screen.findAllByText("Gerencie ou cancele sua assinatura no Google Play."),
    ).toHaveLength(2);
    expect(
      screen.getByText(
        "Esta conta ja possui uma assinatura ativa via Google Play. Gerencie-a no app Android ou na Play Store.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gerenciar no Stripe" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Assinar plano mensal" })).not.toBeInTheDocument();
  });

  it("exibe loading ao voltar para o app quando a assinatura e gerenciada via Stripe", async () => {
    const user = userEvent.setup();

    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      if (input === "/api/subscriptions/me") {
        return jsonResponse({
          status: "success",
          data: createSubscriptionStatus({
            hasActiveStripeSubscription: true,
            lastPaymentProvider: "stripe",
            billingSource: "stripe",
            managementChannel: "stripe",
            managementMessage: "Gerencie sua assinatura no Stripe.",
            purchaseBlocked: false,
            purchaseBlockedReason: null,
          }),
        });
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    render(<SubscriptionCheckout session={baseSession} />);

    expect(
      await screen.findByRole("button", { name: "Gerenciar no Stripe" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Voltar ao app" }));

    expect(screen.getByRole("button", { name: "Voltando..." })).toBeDisabled();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(APP_ROUTES.app);
    });
  });

  it("permite gerenciamento no web para assinatura Stripe ativa mesmo sem canManage explicito", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      if (input === "/api/subscriptions/me") {
        return jsonResponse({
          status: "success",
          data: createSubscriptionStatus({
            hasActiveStripeSubscription: true,
            lastPaymentProvider: "stripe",
            billingSource: "stripe",
            managementChannel: "stripe",
            managementMessage: "Gerencie sua assinatura no Stripe.",
            canManage: false,
            purchaseBlocked: false,
            purchaseBlockedReason: null,
          }),
        });
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    render(<SubscriptionCheckout session={baseSession} />);

    expect(
      await screen.findByRole("button", { name: "Gerenciar no Stripe" }),
    ).toBeInTheDocument();
  });
});
