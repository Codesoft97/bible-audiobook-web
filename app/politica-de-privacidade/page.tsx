import type { Metadata } from "next";

import {
  LegalDocumentPage,
  type LegalDocumentSection,
} from "@/components/legal-document-page";
import { CONTACT_EMAIL } from "@/lib/constants";

const LAST_UPDATED = "04 de abril de 2026";

const PRIVACY_POLICY_SECTIONS: LegalDocumentSection[] = [
  {
    title: "Introdução",
    paragraphs: [
      "Esta Política de Privacidade descreve como o aplicativo Evangelho em Áudio coleta, utiliza e protege as informações dos usuários.",
      "Ao utilizar o aplicativo, você concorda com os termos aqui descritos.",
    ],
  },
  {
    title: "Dados Coletados",
    paragraphs: [
      "Coletamos apenas os dados necessários para o funcionamento do aplicativo.",
      "Também poderemos coletar dados fornecidos por serviços de login de terceiros, conforme descrito abaixo.",
    ],
    items: ["Nome", "Endereço de e-mail", "Senha armazenada de forma criptografada"],
  },
  {
    title: "Finalidade da Coleta",
    paragraphs: [
      "Os dados coletados são utilizados exclusivamente para as finalidades abaixo.",
      "Não utilizamos seus dados para fins publicitários ou venda a terceiros.",
    ],
    items: [
      "Criar e gerenciar a conta do usuário",
      "Permitir acesso ao conteúdo do aplicativo",
      "Realizar autenticação (login)",
      "Processar pagamentos e assinaturas",
      "Enviar comunicações essenciais, como recuperação de senha",
    ],
  },
  {
    title: "Login com Conta Google",
    paragraphs: [
      "O aplicativo permite que o usuário se cadastre e acesse utilizando sua conta do Google.",
      "Ao optar por essa forma de acesso, poderemos receber os dados abaixo.",
      "Esses dados são utilizados exclusivamente para criar e autenticar sua conta e facilitar o acesso ao aplicativo.",
      "Não temos acesso à sua senha do Google.",
    ],
    items: ["Nome", "Endereço de e-mail"],
  },
  {
    title: "Pagamentos",
    paragraphs: [
      "Os pagamentos são processados por terceiros especializados.",
      "O Evangelho em Áudio não armazena dados de cartão de crédito.",
    ],
    items: [
      "Stripe para pagamentos via web",
      "Google Play e Apple App Store para compras em dispositivos móveis",
    ],
  },
  {
    title: "Compartilhamento de Dados",
    paragraphs: [
      "Seus dados não são vendidos ou compartilhados com terceiros, exceto quando necessário para as hipóteses abaixo.",
    ],
    items: ["Processamento de pagamentos", "Cumprimento de obrigações legais"],
  },
  {
    title: "Segurança dos Dados",
    paragraphs: [
      "Adotamos medidas de segurança adequadas para proteger suas informações.",
      "Apesar disso, nenhum sistema é totalmente seguro.",
    ],
    items: [
      "Criptografia de senhas",
      "Proteção contra acessos não autorizados",
      "Boas práticas de armazenamento",
    ],
  },
  {
    title: "Direitos do Usuário",
    paragraphs: ["Nos termos da LGPD, você pode exercer os seguintes direitos."],
    items: [
      "Solicitar acesso aos seus dados",
      "Corrigir dados incorretos",
      "Solicitar exclusão dos dados",
      "Revogar consentimentos",
    ],
  },
  {
    title: "Exclusão de Conta",
    paragraphs: [
      "Você pode solicitar a exclusão da sua conta a qualquer momento através do contato informado.",
      "Seus dados serão removidos, salvo obrigações legais.",
    ],
  },
  {
    title: "Retenção de Dados",
    paragraphs: ["Os dados serão mantidos enquanto observadas as situações abaixo."],
    items: ["Sua conta estiver ativa", "Forem necessários para obrigações legais"],
  },
  {
    title: "Alterações nesta Política",
    paragraphs: ["Esta Política pode ser atualizada a qualquer momento."],
  },
  {
    title: "Contato",
    paragraphs: [
      "Para dúvidas, solicitações ou exercício de direitos relacionados aos seus dados, entre em contato pelo e-mail abaixo.",
    ],
  },
  {
    title: "Controlador dos Dados",
    paragraphs: [
      "O responsável pelo tratamento dos dados é o desenvolvedor do aplicativo Evangelho em Áudio, atualmente atuando como pessoa física.",
    ],
  },
  {
    title: "Perfis de Usuário",
    paragraphs: [
      "O aplicativo permite a criação de perfis adicionais dentro de uma mesma conta.",
      "Os perfis adicionais permanecem vinculados à conta principal.",
      "O titular da conta é responsável pela criação e pelo gerenciamento desses perfis.",
    ],
    items: [
      "Podem conter histórico individual de uso",
      "Não exigem necessariamente dados pessoais adicionais",
      "Estão vinculados à conta principal",
    ],
  },
];

export const metadata: Metadata = {
  title: "Política de Privacidade | Evangelho em Áudio",
  description:
    "Leia a Política de Privacidade do Evangelho em Áudio e entenda como os dados dos usuários são tratados.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Política de Privacidade"
      organization="Evangelho em Áudio"
      updatedAt={LAST_UPDATED}
      sections={PRIVACY_POLICY_SECTIONS}
      contactEmail={CONTACT_EMAIL}
    />
  );
}
