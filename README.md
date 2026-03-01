# bible-audiobook-web

Frontend do Bible Audiobook construido com Next.js, React, Tailwind CSS e TypeScript.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- next-themes para dark/light mode

## O que foi implementado

- Tela de login
- Tela de cadastro
- Fluxo de esqueci minha senha com envio de email, validacao de codigo e redefinicao
- Login e cadastro via Google usando Google Identity Services
- Tema dark e light
- Cor principal em azul profundo `#102A45`
- Dourado classico `#C8A257` para brilho e destaque
- Dourado escuro / ocre `#8C6B32` para sombras do gradiente
- Fundo creme / pergaminho `#F8F6F0` e texto secundario em cinza chumbo `#2D3135`
- Tipografia base com Inter
- Selecao de perfil apos login/cadastro no estilo streaming
- Criacao de novos perfis com limite de 2 adultos e 1 infantil
- Dashboard inicial com sidebar preparada para futuras funcionalidades
- BFF em rotas `app/api` para conversar com o backend sem expor tokens no client
- Sessao de UI assinada em cookie HTTP-only
- Middleware com headers de seguranca
- Sincronizacao da familia via `GET /families/me` para usar o plano atual como fonte de verdade

## Estrutura de autenticacao

O frontend nao persiste token em `localStorage` ou `sessionStorage`.

Fluxo adotado:

1. O navegador envia credenciais para as rotas do proprio Next (`/api/auth/...`).
2. Essas rotas server-side chamam o backend real.
3. O cookie HTTP-only do backend e espelhado no frontend.
4. O frontend tambem grava um cookie HTTP-only assinado com dados de familia, perfis e perfil selecionado para renderizacao segura da UI.

Os dados da familia, especialmente `plan`, passam a ser sincronizados a partir de `GET /families/me` sempre que a aplicacao precisa dessas informacoes.

## Observacao importante sobre o cadastro

Pelo contrato atual do backend, o endpoint `POST /api/auth/register` cria automaticamente um primeiro perfil `adult` usando `userName`.

Por isso, a tela de cadastro comum foi implementada respeitando exatamente o contrato fornecido:

- `familyName`
- `userName`
- `email`
- `password`

Se voce quiser que o tipo do perfil inicial (`adult | child`) seja escolhido no cadastro e enviado ao backend, o contrato do endpoint de cadastro precisa ser expandido no backend.

## Variaveis de ambiente

Copie `.env.example` para `.env.local` e ajuste:

```bash
BACKEND_API_URL=http://localhost:5000/api
SESSION_SECRET=um-segredo-forte
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id-google
```

## Desenvolvimento

O frontend sobe em `http://localhost:3000` e faz proxy server-side para o backend em `http://localhost:5000`.

No navegador, as chamadas vao aparecer como `http://localhost:3000/api/...` porque elas passam primeiro pelas rotas do Next. O redirecionamento para `http://localhost:5000/api/...` acontece no servidor, dentro do BFF.

```bash
npm install
npm run dev
```

## Rotas principais

- `/login`
- `/register`
- `/forgot-password`
- `/profiles`
- `/app`

## Boas praticas de seguranca aplicadas

- Cookies HTTP-only para autenticacao
- Sessao assinada no frontend para integridade dos dados de UI
- Nenhum token em storage do navegador
- Headers de seguranca via middleware
- Validacao com Zod no client e server
- Proxy server-side para reduzir exposicao do backend
