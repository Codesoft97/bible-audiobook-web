import { redirect } from "next/navigation";

import { LegalConsentGate } from "@/components/profiles/legal-consent-gate";
import { getServerSessionWithFamily } from "@/lib/family";
import {
  APP_ROUTES,
  DEFAULT_REQUIRED_LEGAL_DOCUMENTS,
} from "@/lib/constants";

export default async function ProfilesLegalAcceptancePage() {
  const session = await getServerSessionWithFamily();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  if (session.family.requiresLegalAcceptance !== true) {
    redirect(session.selectedProfile ? APP_ROUTES.app : APP_ROUTES.profiles);
  }

  const requiredDocuments = {
    termsVersion:
      session.family.requiredLegalDocuments?.termsVersion ??
      DEFAULT_REQUIRED_LEGAL_DOCUMENTS.termsVersion,
    policyVersion:
      session.family.requiredLegalDocuments?.policyVersion ??
      DEFAULT_REQUIRED_LEGAL_DOCUMENTS.policyVersion,
  };

  return (
    <LegalConsentGate
      familyName={session.family.familyName}
      userName={session.family.userName}
      requiredDocuments={requiredDocuments}
    />
  );
}
