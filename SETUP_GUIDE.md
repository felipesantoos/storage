# Guia de Configuração - Storage App

## 📋 Pré-requisitos

### 1. Instalar Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Após a instalação, reinicie o terminal.

### 2. Instalar Node.js

Versão 18 ou superior. Baixe em [nodejs.org](https://nodejs.org/)

### 3. Criar conta no Cloudflare

Gratuito em [cloudflare.com](https://cloudflare.com/)

## ☁️ Configuração do Cloudflare R2

### Passo 1: Criar Bucket

1. Acesse o [Dashboard do Cloudflare](https://dash.cloudflare.com/)
2. No menu lateral, clique em **R2**
3. Clique em **"Create bucket"**
4. Nome do bucket: `storage-uploads` (ou outro nome)
5. Clique em **"Create bucket"**

### Passo 2: Ativar Acesso Público

1. Clique no bucket criado (`storage-uploads`)
2. Vá em **Settings**
3. Procure a seção **"Public Development URL"**
4. Clique no botão para **habilitar/enable** a Public Development URL
5. Após habilitar, copie a URL pública que aparecerá (ex: `https://pub-xxxxxxxxxxxxx.r2.dev`)

### Passo 3: Criar Token de API

1. No dashboard R2, clique em **"Manage R2 API Tokens"**
2. Clique em **"Create API Token"**
3. Configure:
   - **Token name**: `storage-app`
   - **Permissions**: 
     - ✅ Object Read & Write
     - ✅ Admin Read & Write (se quiser poder deletar)
   - **TTL**: Leave blank (sem expiração) ou defina um período
4. Clique em **"Create API Token"**
5. **IMPORTANTE**: Copie e guarde os seguintes valores:
   - Account ID
   - Access Key ID
   - Secret Access Key

⚠️ **AVISO**: O Secret Access Key só é mostrado uma vez!

### Passo 4: Configurar CORS (Opcional, mas recomendado)

No bucket, vá em Settings → CORS policy e adicione:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

## 🔧 Configuração da Aplicação

### Passo 1: Instalar Dependências

```bash
cd /Users/felipesantos/Projects/storage
npm install
```

### Passo 2: Configurar Credenciais

Crie o arquivo `.env` dentro da pasta `src-tauri/`:

```bash
cd src-tauri
touch .env
```

Abra o arquivo `.env` e adicione suas credenciais:

```env
R2_ACCOUNT_ID=sua_account_id_aqui
R2_ACCESS_KEY_ID=sua_access_key_id_aqui
R2_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
R2_BUCKET_NAME=storage-uploads
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

**Substitua os valores** com os dados que você copiou do Cloudflare.

### Exemplo de valores:

```env
R2_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0
R2_ACCESS_KEY_ID=1234567890abcdef1234567890abcdef
R2_SECRET_ACCESS_KEY=abcdef1234567890abcdef1234567890abcdef1234567890abcdef
R2_BUCKET_NAME=storage-uploads
R2_PUBLIC_URL=https://pub-a1b2c3d4e5f6.r2.dev
```

## 🚀 Executar a Aplicação

### Modo Desenvolvimento

```bash
npm run tauri:dev
```

Isso vai:
1. Compilar o código Rust (primeira vez demora ~5-10 min)
2. Iniciar o servidor de desenvolvimento React
3. Abrir a aplicação desktop

### Build para Produção

```bash
npm run tauri:build
```

O instalador estará em `src-tauri/target/release/bundle/`:
- **macOS**: arquivo `.dmg`
- **Windows**: arquivo `.exe`
- **Linux**: `.AppImage` ou `.deb`

## ✅ Testar a Aplicação

1. Arraste uma imagem para a zona de upload
2. Aguarde o upload completar
3. Clique em "Copy Link" ou "Markdown"
4. Cole o link em qualquer lugar (ex: GitHub, Discord)
5. A imagem deve ser exibida!

## 🐛 Solução de Problemas

### Erro: "R2_ACCOUNT_ID not set"

- Verifique se o arquivo `.env` está em `src-tauri/.env`
- Confirme que todas as variáveis estão definidas
- Reinicie o app

### Upload funciona mas links não abrem

- Verifique se a URL pública está correta
- Confirme que o acesso público está ativado no bucket
- Teste abrindo a URL pública no navegador

### Erro de compilação Rust (primeira vez)

- Normal na primeira vez (5-10 minutos)
- Certifique-se de ter Rust instalado: `rustc --version`
- Se ainda falhar, reinstale Rust

### "Failed to load files"

- Verifique as credenciais R2 no `.env`
- Teste a conexão com Cloudflare
- Verifique logs no terminal

## 📁 Estrutura de Arquivos

```
storage/
├── src/                       # Frontend React
│   ├── components/           # Componentes UI
│   ├── lib/                  # Utilitários
│   └── App.tsx              # App principal
├── src-tauri/                # Backend Rust
│   ├── src/
│   │   ├── r2.rs            # Cliente R2
│   │   ├── storage.rs       # Histórico local
│   │   └── lib.rs           # Comandos Tauri
│   ├── .env                 # ⚠️ SUAS CREDENCIAIS (não commitar!)
│   └── .env.example         # Template
└── package.json
```

## 🔒 Segurança

⚠️ **NUNCA** commite o arquivo `.env` para o Git!

Ele já está no `.gitignore`, mas tome cuidado ao compartilhar seu código.

## 💡 Próximos Passos

Após configurar, você pode:

1. Personalizar a interface em `src/App.tsx`
2. Adicionar mais tipos de arquivo em `src/components/UploadZone.tsx`
3. Configurar domínio customizado no Cloudflare
4. Adicionar atalhos de teclado personalizados

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs no terminal onde executou `npm run tauri:dev`
2. Confirme todas as configurações do Cloudflare
3. Teste as credenciais manualmente via AWS CLI (opcional)

## ✨ Pronto!

Agora você tem um app desktop para fazer upload de imagens e copiar links instantaneamente! 🎉

