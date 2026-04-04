import Link from "next/link";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_ROUTES } from "@/lib/constants";

export interface LegalDocumentGroup {
  title?: string;
  paragraphs?: string[];
  items?: string[];
}

export interface LegalDocumentSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
  groups?: LegalDocumentGroup[];
}

interface LegalDocumentPageProps {
  title: string;
  organization: string;
  updatedAt: string;
  sections: LegalDocumentSection[];
  contactEmail?: string;
  contactSectionTitle?: string;
}

export function LegalDocumentPage({
  title,
  organization,
  updatedAt,
  sections,
  contactEmail,
  contactSectionTitle = "Contato",
}: LegalDocumentPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden auth-atmosphere px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-6">
          <Link href={APP_ROUTES.root} aria-label="Voltar para a pagina inicial">
            <Logo className="max-w-[220px] sm:max-w-[300px]" />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={APP_ROUTES.root}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border/70 bg-background/70 px-4 text-sm font-medium text-foreground transition hover:bg-background"
            >
              Voltar ao inicio
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <article className="mx-auto max-w-4xl rounded-xl border border-border/70 bg-card/96 px-6 py-8 shadow-glow sm:px-10 sm:py-10 md:px-14 md:py-12">
          <header className="border-b border-border/60 pb-8 text-center">
            <h1 className="mt-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 font-serif text-lg text-foreground">{organization}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ultima atualização: {updatedAt}
            </p>
          </header>

          <div className="pt-8 font-serif text-[15px] leading-8 text-foreground/90 sm:text-base">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className="border-b border-border/40 py-6 first:pt-0 last:border-b-0 last:pb-0"
              >
                <h2 className="text-xl font-semibold text-foreground">
                  {index + 1}. {section.title}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3">
                    {paragraph}
                  </p>
                ))}

                {section.items?.length ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-6">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {section.groups?.map((group) => (
                  <div key={group.title ?? group.items?.join("-")} className="mt-4">
                    {group.title ? (
                      <p className="font-semibold text-foreground">{group.title}</p>
                    ) : null}

                    {group.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-3">
                        {paragraph}
                      </p>
                    ))}

                    {group.items?.length ? (
                      <ul className="mt-3 list-disc space-y-1.5 pl-6">
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}

                {contactEmail && section.title === contactSectionTitle ? (
                  <p className="mt-3">
                    <a
                      href={`mailto:${contactEmail}`}
                      className="font-medium text-foreground underline underline-offset-4 transition hover:opacity-80"
                    >
                      {contactEmail}
                    </a>
                  </p>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
