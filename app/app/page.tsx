import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { getServerAudiobooks } from "@/lib/audiobooks.server";
import {
  getServerBibleTextBooks,
  getServerBibleTextReadingState,
} from "@/lib/bible-text.server";
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

  if (session.family.requiresLegalAcceptance === true) {
    redirect(APP_ROUTES.profilesLegalAcceptance);
  }

  if (!session.selectedProfile) {
    redirect(APP_ROUTES.profiles);
  }

  const initialAudiobooks = await getServerAudiobooks();
  const initialBibleTextBooks = await getServerBibleTextBooks();
  const initialBibleTextReadingState = await getServerBibleTextReadingState();
  const initialCharacterJourneys = await getServerCharacterJourneys();
  const initialParables = await getServerParables();
  const initialTeachings = await getServerTeachings();

  return (
    <AppShell
      session={session}
      initialAudiobooks={initialAudiobooks}
      initialBibleTextBooks={initialBibleTextBooks}
      initialBibleTextReadingState={initialBibleTextReadingState}
      initialCharacterJourneys={initialCharacterJourneys}
      initialParables={initialParables}
      initialTeachings={initialTeachings}
    />
  );
}
