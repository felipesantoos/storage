# Storage App

Desktop application for uploading images to Cloudflare R2 with instant link copying.

## Features

- 🖼️ **Drag & Drop Upload**: Simply drag images into the app
- 🔗 **Instant Link Copy**: Copy direct URLs or markdown format
- ☁️ **Cloudflare R2**: Free 10GB storage
- 🖥️ **Cross-platform**: macOS, Windows, Linux
- 📦 **Lightweight**: ~8-10MB installed
- 🔒 **Secure**: Credentials stored locally
- ⚙️ **Easy Setup**: Configure credentials directly in the app
- 🚀 **Works in Production**: Credentials persist after installation

## Prerequisites

1. **Rust**: Install from [rustup.rs](https://rustup.rs/)
2. **Node.js**: Version 18 or higher
3. **Cloudflare Account**: Free tier available

## Cloudflare R2 Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket (e.g., `storage-uploads`)
4. Enable public access:
   - Go to bucket Settings
   - Enable "Public R2.dev subdomain"
   - Note the public URL (e.g., `https://pub-xxx.r2.dev`)
5. Create API Token:
   - Go to R2 → Manage R2 API Tokens
   - Create Token with R2 permissions
   - Save the Access Key ID and Secret Access Key

## Installation

1. **Clone/Download this repository**

2. **Install dependencies:**
```bash
npm install
```

3. **Configure R2 credentials:**

**Opção 1: Através da interface do app (Recomendado para produção)**
1. Execute o app
2. Clique no botão "Configurar" no canto superior direito
3. Preencha suas credenciais do Cloudflare R2
4. Clique em "Salvar Configurações"

As configurações são salvas em: `~/.storage-app/config.json`

**Opção 2: Usando arquivo `.env` (Para desenvolvimento)**

Create a `.env` file in `src-tauri/` directory:
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=storage-uploads
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

⚠️ **Important**: Never commit the `.env` file to version control!

**Como funciona:**
- Em **desenvolvimento**: O app tenta carregar do `.env` primeiro, depois salva em `config.json`
- Em **produção (app instalado)**: O app usa as configurações de `~/.storage-app/config.json`

4. **Run in development mode:**
```bash
npm run tauri:dev
```

5. **Build for production:**
```bash
npm run tauri:build
```

The installer will be in `src-tauri/target/release/bundle/`:
- macOS: `.dmg` file
- Windows: `.exe` installer
- Linux: `.AppImage` or `.deb`

## Usage

1. **Launch the app**
2. **Drag & drop images** into the upload zone
3. **Wait for upload** to complete
4. **Copy links:**
   - Click "Copy Link" for direct URL
   - Click "Markdown" for markdown format
5. **Paste anywhere** - GitHub, Discord, Notion, etc.

## File History

Uploaded files are tracked in `~/.storage-app/history.json`

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Desktop**: Tauri (Rust)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Upload**: Presigned URLs (serverless)

## Keyboard Shortcuts

- `Cmd/Ctrl + Shift + U`: Open app (planned feature)

## Troubleshooting

### "Failed to load files" or "Upload failed"

- Check that `.env` file exists in `src-tauri/` directory
- Verify all R2 credentials are correct
- Ensure bucket has public access enabled

### "Command not found: tauri"

Make sure Rust is installed:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Upload works but links don't work

- Verify the `R2_PUBLIC_URL` matches your bucket's public URL
- Check bucket public access settings in Cloudflare dashboard

## Development

### Project Structure

```
storage/
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── lib/               # Utilities
│   └── App.tsx            # Main app
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── r2.rs         # R2 client
│   │   ├── storage.rs    # Local history
│   │   └── lib.rs        # Tauri commands
│   └── .env              # Credentials (not in git)
└── package.json
```

### Adding Features

To add new Tauri commands:

1. Add function in `src-tauri/src/lib.rs`
2. Add to `invoke_handler!` macro
3. Call from React using `invoke()`

## License

MIT

## Author

Felipe Santos
