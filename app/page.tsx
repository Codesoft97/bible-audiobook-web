import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/session.server";
import { APP_ROUTES } from "@/lib/constants";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  if (!session.selectedProfile) {
    redirect(APP_ROUTES.profiles);
  }

  redirect(APP_ROUTES.app);
}
