import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { getServerAudiobooks } from "@/lib/audiobooks.server";
import { getServerCharacterJourneys } from "@/lib/character-journeys.server";
import { getServerParables } from "@/lib/parables.server";
import { getServerTeachings } from "@/lib/teachings.server";
import { getServerSessionWithFamily } from "@/lib/family";
import { APP_ROUTES } from "@/lib/constants";

export default async function AppPage() {
  const session = await getServerSessionWithFamily();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  if (!session.selectedProfile) {
    redirect(APP_ROUTES.profiles);
  }

  const initialAudiobooks = await getServerAudiobooks();
  const initialCharacterJourneys = await getServerCharacterJourneys();
  const initialParables = await getServerParables();
  const initialTeachings = await getServerTeachings();

  return (
    <AppShell
      session={session}
      initialAudiobooks={initialAudiobooks}
      initialCharacterJourneys={initialCharacterJourneys}
      initialParables={initialParables}
      initialTeachings={initialTeachings}
    />
  );
}
