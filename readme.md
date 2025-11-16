# Desedux – Frontend

---

## 🧠 Sobre o Desedux

Uma plataforma desenvolvida para melhorar a comunicação entre alunos e professores universitários.

O frontend do Desedux é a interface web que os estudantes e a comunidade acadêmica utilizam para:

- visualizar perguntas da comunidade  
- votar em sugestões e comentários  
- enviar novas perguntas (anônimas ou não)  
- acompanhar respostas oficiais da instituição  

Ele consome a API do backend Desedux e foi pensado para ser simples, responsivo e fácil de integrar em ambientes universitários.

---

## 📘 O Projeto

O Desedux é um projeto acadêmico desenvolvido pelos alunos de Ciência da Computação da Newton Paiva, no curso de Engenharia de Software.

Problema que buscamos resolver:

- A comunicação entre alunos e professores muitas vezes é fragmentada
- Dúvidas importantes se perdem em grupos de WhatsApp ou e-mails isolados
- Falta um canal centralizado para perguntas, feedbacks e respostas oficiais

O frontend do Desedux fornece essa camada visual para que a comunidade universitária interaja de forma organizada, com:

- listagem de cards (perguntas/sugestões)
- filtros por relevância e data
- categorias baseadas em tags da API
- sistema de votos
- sistema de comentários encadeados
- login, refresh de token e logout

---

## 🧱 Stack

- Node **22.20.0**
- Next.js **14.0.0** (App Router)
- React **18**
- TypeScript **5**
- Tailwind CSS **3**
- shadcn/ui
- lucide-react
- Vaul (componentes de UI)
- Integração com backend em NestJS (API REST)

---

## ✅ Pré-requisitos

- Node **22.20.0** (recomendado manter a mesma versão do backend)
- npm **10+**
- Backend do Desedux rodando (porta padrão `3001`)
- Arquivo `.env.local` configurado

---

## 📦 Instalação

```bash
# Clonar o repositório do frontend
git clone <url-do-repo-frontend>
cd frontend

# Instalar dependências
npm ci
````

---

## ⚙️ Configuração de ambiente

Crie um arquivo `.env.local` na raiz do projeto com, no mínimo:

```ini
# Base da API usada em ambiente de servidor (SSR / rotas de API do Next)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

O frontend usa um helper HTTP que faz o seguinte:

* No **browser**: chama sempre a rota relativa `/api/...`
* No **servidor (SSR)**: usa `NEXT_PUBLIC_API_BASE_URL` (ou `http://localhost:3001` como fallback)

A configuração de `rewrites` no `next.config` cuida de encaminhar `/api/*` para o backend local:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

Em produção, você pode:

* apontar `NEXT_PUBLIC_API_BASE_URL` para a URL pública do backend
* ou manter o mesmo padrão de proxy reverso se estiver atrás de um gateway/reverso (NGINX, Cloudflare Tunnel etc.)

---

## 🗄️ Comunicação com o Backend

O frontend conversa com a API usando um helper HTTP centralizado em `src/lib/api/http`:

* Anexa automaticamente o `Authorization: Bearer <ID_TOKEN>` quando o usuário está logado
* Usa `API_BASE` baseado em `NEXT_PUBLIC_API_BASE_URL` + `/api` (via rewrite)

Principais endpoints consumidos:

* `GET /tags` – carrega categorias para exibição e seleção no modal de criação de pergunta
* `GET /card?page={page}` – lista cards paginados
* `GET /card/detail/{id}` – detalhes de um card na página de post individual
* `POST /card` – criação de card (autenticado)
* `PATCH /card` / `PATCH /card/{id}` – registro de votos
* `DELETE /card/{id}` – desativação/remoção lógica do card
* `/commentary/...` – criação, listagem, reação e deleção de comentários
* `/auth/login` e `/auth/refresh` – fluxo de autenticação e refresh de tokens

---

## 🧪 Executando o projeto

### Desenvolvimento

```bash
npm run dev
```

Por padrão, o Next sobe em `http://localhost:3000`.

Certifique-se de que o backend esteja rodando em `http://localhost:3001` ou ajuste:

* `NEXT_PUBLIC_API_BASE_URL` no `.env.local`
* o `destination` dos `rewrites` no `next.config.js`

### Build de produção

```bash
npm run build
npm run start
```

O comando `start` roda o servidor Next em modo produção.

---

## 🧰 Scripts úteis

```bash
npm run dev     # Ambiente de desenvolvimento
npm run build   # Build de produção
npm run start   # Servir build de produção
npm run lint    # Lint do código (ESLint + config Next)
```

---

## 🧩 Estrutura geral do frontend

Alguns diretórios importantes:

* `app/`
  Rotas da aplicação (App Router do Next 14).
  Ex.: `app/page.tsx` (home), `app/post/[id]/page.tsx` (detalhe de card).

* `components/`
  Componentes reutilizáveis de UI.
  Ex.: `Header`, `PostCard`, `CommentThread`, `OfficialResponseComment`, modais de criação de pergunta e login.

* `contexts/`
  Contextos globais, como autenticação.
  Ex.: `AuthContext` com:

    * login
    * logout
    * refresh automático de token
    * sincronização com `localStorage`

* `lib/api/`
  Clientes de API: `cards`, `commentary`, `tags`, `http` etc.

* `lib/mappers/`
  Funções para mapear DTOs do backend em view models usados pelos componentes (`Post`, `Comment` etc.).

* `lib/types/`
  Tipos compartilhados (interfaces de `Post`, `Comment`, modelos de API).

* `styles/` / `tailwind.config` / `postcss.config`
  Configuração de estilos, Tailwind e animações (`tailwindcss-animate`).

---

## 📏 Boas práticas e notas

* As rotas protegidas dependem de um `ID_TOKEN` válido emitido pelo backend (Firebase + NestJS).
* O token e o refresh token são guardados em `localStorage` através do `AuthContext`, com controle de expiração (`expiresAt`).
* O frontend tenta atualizar o token automaticamente alguns minutos antes de expirar (via `/auth/refresh`).
* Votos e reações têm atualização otimista na UI (atualiza na tela antes da resposta da API, revertendo em caso de erro).
* A listagem de cards é paginada e ordenada por:

    * relevância (votos)
    * ou data de criação
* A criação de cards consome as tags reais da API (`GET /tags`) para preencher as categorias do modal.

---

## 👥 Contribuidores

Adicione aqui as pessoas que contribuíram com o frontend (e papel):

* Gabriel Marliere de Souza — frontend / integração com backend
* Alexandre de Noronha José — frontend
* Gabriel de Almeida Paro — backend
* Ryan Alves da Costa — design

---

## Licença


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


Copyright (c) 2025 Desedux

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
