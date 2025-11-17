# 🚀 Quick Start - Storage App

## Em 5 Minutos

### 1️⃣ Instalar Rust (se ainda não tiver)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Depois reinicie o terminal.

### 2️⃣ Instalar dependências

```bash
cd /Users/felipesantos/Projects/storage
npm install
```

### 3️⃣ Configurar Cloudflare R2

1. Acesse: https://dash.cloudflare.com/ (crie conta gratuita se não tiver)
2. Vá em **R2 Object Storage**
3. Clique em **Create bucket** → nome: `storage-uploads`
4. Clique no bucket → Settings → **Public Development URL** → clique em **Enable**
5. Copie a URL pública que apareceu (ex: `https://pub-xxx.r2.dev`)
6. Volte para R2 → **Manage R2 API Tokens** → **Create API Token**
7. Copie: Account ID, Access Key ID e Secret Access Key

### 4️⃣ Criar arquivo de configuração

Crie o arquivo `src-tauri/.env` com suas credenciais:

```bash
cd src-tauri
nano .env
```

Cole (substitua pelos seus valores):

```env
R2_ACCOUNT_ID=seu_account_id
R2_ACCESS_KEY_ID=sua_access_key
R2_SECRET_ACCESS_KEY=sua_secret_key
R2_BUCKET_NAME=storage-uploads
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

Salve (Ctrl+O, Enter, Ctrl+X).

### 5️⃣ Rodar!

```bash
cd /Users/felipesantos/Projects/storage
npm run tauri:dev
```

⏱️ Primeira vez demora ~5-10 minutos para compilar Rust.

## ✅ Pronto!

1. Arraste uma imagem
2. Clique em "Copy Link" ou "Markdown"
3. Cole onde quiser!

## 📖 Documentação Completa

Veja `SETUP_GUIDE.md` para mais detalhes.

## ❓ Problemas?

### "R2_ACCOUNT_ID not set"
→ Verifique se `.env` está em `src-tauri/.env`

### "Upload failed"
→ Confirme que o bucket tem acesso público ativado

### "Command not found: rustc"
→ Instale Rust e reinicie o terminal

## 🎉 É isso!

Divirta-se usando seu app de upload de imagens!

