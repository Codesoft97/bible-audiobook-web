import { redirect } from "next/navigation";

import { ProfileSelection } from "@/components/profiles/profile-selection";
import { getServerSessionWithFamily } from "@/lib/family";
import { APP_ROUTES } from "@/lib/constants";

export default async function ProfilesPage() {
  const session = await getServerSessionWithFamily();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  return <ProfileSelection session={session} />;
}
