import { redirect } from "next/navigation";

import { SubscriptionCheckout } from "@/components/subscription/subscription-checkout";
import { APP_ROUTES } from "@/lib/constants";
import { getServerSessionWithFamily } from "@/lib/family";

export default async function SubscriptionPage() {
  const session = await getServerSessionWithFamily();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  return <SubscriptionCheckout session={session} />;
}
