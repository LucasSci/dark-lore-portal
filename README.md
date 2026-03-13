# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Loja digital com Stripe

O projeto agora inclui uma loja digital integrada com:

- catalogo de produtos digitais
- checkout Stripe
- confirmacao de compra por webhook
- download automatico apos pagamento
- biblioteca do usuario

### Banco e storage

A migration `supabase/migrations/20260312170500_storefront.sql` cria:

- `digital_products`
- `store_orders`
- bucket privado `digital-products`

Envie para o bucket os arquivos usados no catalogo, respeitando os `file_path` gravados na tabela `digital_products`.

### Edge Functions

As funcoes usadas pela loja sao:

- `storefront-data`
- `create-store-checkout`
- `confirm-store-purchase`
- `create-download-link`
- `stripe-store-webhook`

No `supabase/config.toml`, a funcao `stripe-store-webhook` esta configurada com `verify_jwt = false`.

### Secrets necessarios

Configure estes secrets no Supabase Functions:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`

### Webhook Stripe

Cadastre no Stripe um webhook apontando para:

`https://<seu-projeto>.supabase.co/functions/v1/stripe-store-webhook`

Eventos recomendados:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
