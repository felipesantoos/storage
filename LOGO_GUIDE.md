# Guia: Como Alterar a Logo do Storage App

## 📍 Localização dos Ícones

Todos os ícones estão localizados em:
```
src-tauri/icons/
```

## 🎨 Ícones Necessários

### macOS
- `icon.icns` - Ícone principal do macOS (contém múltiplos tamanhos)
- `128x128.png` - Ícone 128x128 pixels
- `128x128@2x.png` - Ícone 256x256 pixels (retina)
- `32x32.png` - Ícone pequeno 32x32 pixels

### Windows
- `icon.ico` - Ícone do Windows (multi-resolução)
- `icon.png` - Ícone base (pode ser 512x512 ou 1024x1024)

### Linux
- `icon.png` - Ícone principal (512x512 ou maior recomendado)

### Windows Store (Opcional)
- `Square30x30Logo.png`
- `Square44x44Logo.png`
- `Square71x71Logo.png`
- `Square89x89Logo.png`
- `Square107x107Logo.png`
- `Square142x142Logo.png`
- `Square150x150Logo.png`
- `Square284x284Logo.png`
- `Square310x310Logo.png`
- `StoreLogo.png`

## 🛠️ Método 1: Usando o Tauri Icon Generator (Recomendado)

### Passo 1: Prepare uma imagem PNG
- Tamanho recomendado: **1024x1024 pixels**
- Formato: PNG com fundo transparente
- Coloque em: `src-tauri/icon.png` (temporariamente)

### Passo 2: Instalar o gerador de ícones do Tauri
```bash
npm install -g @tauri-apps/cli
```

### Passo 3: Gerar todos os ícones automaticamente
```bash
cd /Users/felipesantos/Projects/storage
npx @tauri-apps/cli icon src-tauri/icon.png
```

Isso vai gerar automaticamente todos os ícones necessários nos tamanhos corretos!

## 🎨 Método 2: Manualmente (Avançado)

Se você preferir fazer manualmente ou já tem os ícones:

### Para macOS (`.icns`)
1. Crie imagens PNG nos seguintes tamanhos:
   - 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
2. Use uma ferramenta como [Image2Icon](https://img2icnsapp.com/) ou Photoshop
3. Ou use o comando do macOS:
```bash
# Crie a estrutura
mkdir icon.iconset
cp icon-16x16.png icon.iconset/icon_16x16.png
cp icon-32x32.png icon.iconset/icon_16x16@2x.png
cp icon-32x32.png icon.iconset/icon_32x32.png
cp icon-64x64.png icon.iconset/icon_32x32@2x.png
cp icon-128x128.png icon.iconset/icon_128x128.png
cp icon-256x256.png icon.iconset/icon_128x128@2x.png
cp icon-256x256.png icon.iconset/icon_256x256.png
cp icon-512x512.png icon.iconset/icon_256x256@2x.png
cp icon-512x512.png icon.iconset/icon_512x512.png
cp icon-1024x1024.png icon.iconset/icon_512x512@2x.png

# Gere o .icns
iconutil -c icns icon.iconset -o icon.icns

# Copie para o projeto
cp icon.icns src-tauri/icons/
```

### Para Windows (`.ico`)
1. Use uma ferramenta online como [ICO Convert](https://icoconvert.com/)
2. Ou use o ImageMagick:
```bash
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### Para PNG individuais
Use qualquer editor de imagem para redimensionar:
- Photoshop
- GIMP
- Figma
- Sketch
- Canva

## 📝 Checklist Rápido

- [ ] Criar/ter imagem PNG 1024x1024
- [ ] Executar `npx @tauri-apps/cli icon src-tauri/icon.png`
- [ ] Verificar que os arquivos foram gerados em `src-tauri/icons/`
- [ ] Fazer rebuild do app: `npm run tauri:build`
- [ ] Testar o novo ícone

## 🎯 Dicas de Design

### Boas Práticas
- ✅ Use designs simples e reconhecíveis
- ✅ Evite detalhes muito pequenos (não ficam visíveis em 16x16)
- ✅ Use cores contrastantes
- ✅ Teste em fundo claro e escuro
- ✅ Mantenha proporções quadradas (1:1)
- ✅ Use fundo transparente quando possível

### O que evitar
- ❌ Texto muito pequeno ou fino
- ❌ Gradientes complexos
- ❌ Muitos detalhes finos
- ❌ Cores muito similares
- ❌ Formas muito complexas

## 🖼️ Exemplos de Ferramentas Online

### Geradores de Ícones
- [Icon Generator](https://www.icongenerators.com/)
- [App Icon Generator](https://appicon.co/)
- [Icon Slate](https://www.kodlian.com/apps/icon-slate)

### Editores
- [Figma](https://www.figma.com/) - Gratuito
- [Canva](https://www.canva.com/) - Gratuito
- [Photopea](https://www.photopea.com/) - Gratuito (Photoshop online)

## 🔄 Após Alterar os Ícones

1. **Recompilar o app:**
```bash
npm run tauri:build
```

2. **O ícone será atualizado no:**
   - Instalador (`.dmg`, `.exe`)
   - Aplicativo instalado
   - Dock/Barra de Tarefas
   - Gerenciador de arquivos

## 🐛 Solução de Problemas

### Ícone não atualiza após rebuild
- No **macOS**: Reinicie o Dock
```bash
killall Dock
```
- No **Windows**: Reinicie o Explorer
- Ou simplesmente reinicie o computador

### Ícone fica pixelado
- Certifique-se de que a imagem base tem pelo menos 512x512 pixels
- Use 1024x1024 para melhor qualidade
- Verifique se os ícones menores foram gerados corretamente

### Ícone não aparece no build
- Verifique se o caminho em `tauri.conf.json` está correto
- Confirme que todos os arquivos necessários existem em `src-tauri/icons/`

## 📂 Estrutura Final

Depois de gerar os ícones, você deve ter:

```
src-tauri/icons/
├── 32x32.png           ← macOS pequeno
├── 128x128.png         ← macOS normal
├── 128x128@2x.png      ← macOS retina
├── icon.icns           ← macOS bundle
├── icon.ico            ← Windows
├── icon.png            ← Linux/Base
└── Square*.png         ← Windows Store (opcional)
```

## ✨ Pronto!

Agora você sabe como alterar a logo do seu Storage App! 🎉

Qualquer dúvida, consulte a [documentação oficial do Tauri](https://tauri.app/v1/guides/features/icons/).

