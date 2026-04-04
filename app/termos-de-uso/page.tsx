import type { Metadata } from "next";

import {
  LegalDocumentPage,
  type LegalDocumentSection,
} from "@/components/legal-document-page";
import { CONTACT_EMAIL } from "@/lib/constants";

const LAST_UPDATED = "04 de abril de 2026";

const TERMS_OF_USE_SECTIONS: LegalDocumentSection[] = [
  {
    title: "Aceitação dos Termos",
    paragraphs: [
      "Ao utilizar o aplicativo Evangelho em Áudio, você concorda com estes Termos de Uso.",
    ],
  },
  {
    title: "Sobre o Serviço",
    paragraphs: [
      "O aplicativo oferece conteúdos bíblicos em áudio, narrativas e devocionais.",
      "O acesso completo é disponibilizado mediante assinatura.",
    ],
  },
  {
    title: "Cadastro",
    paragraphs: ["Para utilizar o aplicativo, o usuário deverá atender às condições abaixo."],
    items: ["Criar uma conta com nome, e-mail e senha", "Ou utilizar login via Google"],
    groups: [
      {
        title: "O usuário é responsável por:",
        items: [
          "Manter seus dados seguros",
          "Não compartilhar sua conta",
          "Fornecer informações verdadeiras",
        ],
      },
    ],
  },
  {
    title: "Assinatura e Pagamentos",
    paragraphs: [
      "O acesso ao conteúdo é feito por assinatura.",
      "Os pagamentos são processados pelos seguintes parceiros.",
    ],
    items: ["Stripe", "Google Play", "Apple App Store"],
    groups: [
      {
        title: "Condições:",
        items: [
          "Cobrança recorrente mensal ou anual",
          "Cancelamento a qualquer momento",
          "Acesso permanece até o fim do período pago",
        ],
      },
    ],
  },
  {
    title: "Cancelamento e Reembolso",
    items: [
      "O usuário pode cancelar a qualquer momento",
      "Não há reembolso proporcional, salvo exigência legal ou política das plataformas",
    ],
  },
  {
    title: "Uso da Conta e Perfis",
    paragraphs: [
      "O Evangelho em Áudio permite que o titular da conta crie perfis adicionais para uso compartilhado com terceiros, como familiares ou amigos.",
    ],
    groups: [
      {
        title: "Condições:",
        items: [
          "A conta é de responsabilidade do titular que realizou o cadastro",
          "O titular pode criar perfis adicionais dentro da mesma conta",
          "Cada perfil possui histórico individual dentro do aplicativo",
        ],
      },
      {
        title: "Responsabilidade:",
        items: [
          "Todas as atividades realizadas na conta",
          "O uso por terceiros autorizados",
          "A segurança das credenciais de acesso",
        ],
      },
      {
        title: "Limitações:",
        items: [
          "Definir limites de perfis por conta",
          "Monitorar uso abusivo, como compartilhamento em larga escala",
          "Suspender contas em caso de uso indevido",
        ],
      },
    ],
  },
  {
    title: "Propriedade Intelectual",
    paragraphs: ["Todo o conteúdo do aplicativo é protegido por direitos autorais."],
  },
  {
    title: "Disponibilidade",
    paragraphs: ["O serviço pode sofrer interrupções, atualizações ou modificações sem aviso prévio."],
  },
  {
    title: "Limitação de Responsabilidade",
    paragraphs: ["O aplicativo não se responsabiliza pelas situações abaixo."],
    items: ["Falhas técnicas externas", "Problemas de internet", "Danos indiretos"],
  },
  {
    title: "Exclusão de Conta",
    paragraphs: [
      "O usuário pode solicitar exclusão a qualquer momento.",
      "Contas podem ser suspensas em caso de violação dos termos.",
    ],
  },
  {
    title: "Alterações",
    paragraphs: ["Os Termos podem ser alterados a qualquer momento."],
  },
  {
    title: "Legislação",
    paragraphs: [
      "Este documento é regido pelas leis do Brasil, incluindo o Código de Defesa do Consumidor.",
    ],
  },
  {
    title: "Contato",
    paragraphs: [
      "Para dúvidas, solicitações ou temas relacionados ao uso da plataforma, entre em contato pelo e-mail abaixo.",
    ],
  },
  {
    title: "Responsável",
    paragraphs: [
      "O aplicativo é operado pelo desenvolvedor do Evangelho em Áudio, atualmente atuando como pessoa física.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Termos de Uso | Evangelho em Áudio",
  description:
    "Leia os Termos de Uso do Evangelho em Áudio e entenda as regras de acesso, assinatura e utilização da plataforma.",
};

export default function TermsOfUsePage() {
  return (
    <LegalDocumentPage
      title="Termos de Uso"
      organization="Evangelho em Áudio"
      updatedAt={LAST_UPDATED}
      sections={TERMS_OF_USE_SECTIONS}
      contactEmail={CONTACT_EMAIL}
    />
  );
}
