# Changelog - Storage App

## [Atualização] - 2025-11-17

### 🎉 Problemas Resolvidos

#### 1. ✅ Upload agora funciona em builds de produção

**Problema:** Quando o app era buildado e instalado, o upload de imagens não funcionava porque o arquivo `.env` não era incluído no bundle.

**Solução implementada:**
- Sistema de configuração persistente em `~/.storage-app/config.json`
- Interface gráfica para configurar credenciais (botão "Configurar" no app)
- Compatibilidade com `.env` para desenvolvimento
- Migração automática de `.env` para `config.json` na primeira execução

**Como funciona agora:**
1. **Desenvolvimento**: Usa `.env` e salva automaticamente em `config.json`
2. **Produção**: Usa `~/.storage-app/config.json` (persiste após instalação)
3. **Sem configuração**: Botão "Configurar" fica amarelo e pulsando (alerta visual)
4. **Configurado**: Botão fica verde com check ✓

#### 2. 📚 Guia completo para alterar a logo do app

**Criado:** `LOGO_GUIDE.md`

**Conteúdo:**
- Método automático usando Tauri Icon Generator (recomendado)
- Método manual para customização avançada
- Lista completa de ícones necessários para cada plataforma
- Dicas de design e boas práticas
- Solução de problemas comuns
- Ferramentas recomendadas

**Comando rápido:**
```bash
npx @tauri-apps/cli icon src-tauri/icon.png
```

### 🆕 Novas Funcionalidades

#### Modal de Configuração
- Botão "Configurar" no header do app
- Interface amigável para inserir credenciais R2
- Validação de campos obrigatórios
- Instruções passo a passo incluídas no modal
- Indicador visual de status de configuração
- Salvamento seguro em arquivo local

#### Melhorias no Sistema de Configuração
- Múltiplos locais de busca para `.env` em desenvolvimento
- Fallback automático entre diferentes métodos
- Mensagens de erro mais claras
- Logs detalhados para debugging

### 📝 Arquivos Modificados

#### Backend (Rust)
- `src-tauri/src/r2.rs`
  - Adicionado método `get_config_path()` para localizar arquivo de configuração
  - Adicionado método `load_from_file()` para carregar de `config.json`
  - Adicionado método `save_to_file()` para salvar configurações
  - Modificado `from_env()` para tentar `config.json` primeiro
  - Derivado trait `Clone` para `R2Config`

- `src-tauri/src/lib.rs`
  - Adicionado comando `save_config()` para salvar credenciais
  - Adicionado comando `get_config()` para obter configurações atuais
  - Adicionado comando `check_config()` para verificar se está configurado
  - Registrado novos comandos no handler

#### Frontend (TypeScript/React)
- `src/types.ts`
  - Adicionada interface `R2Config`

- `src/components/ConfigModal.tsx` (NOVO)
  - Componente completo de configuração
  - Modal responsivo com formulário
  - Validação de campos
  - Indicador de status
  - Instruções integradas

- `src/App.tsx`
  - Importado e integrado `ConfigModal`
  - Adicionado handler `handleConfigSaved()`
  - Ajustado layout do header

#### Documentação
- `README.md`
  - Atualizado seção de Features
  - Adicionado instruções para configuração via interface
  - Explicado funcionamento em dev vs produção

- `LOGO_GUIDE.md` (NOVO)
  - Guia completo para alterar logos/ícones

- `CHANGELOG.md` (NOVO)
  - Este arquivo

### 🧪 Como Testar

#### Testar em Desenvolvimento
1. Execute o app: `npm run tauri:dev`
2. Se tiver `.env` configurado:
   - Upload deve funcionar normalmente
   - Botão "Configurar" deve estar verde
3. Se não tiver `.env`:
   - Botão "Configurar" deve estar amarelo
   - Clique nele e configure as credenciais
   - Após salvar, teste o upload

#### Testar em Produção (Build)
1. Build o app: `npm run tauri:build`
2. Instale o app do arquivo gerado em `src-tauri/target/release/bundle/`
3. Execute o app instalado
4. Configure as credenciais via botão "Configurar"
5. Teste upload de uma imagem
6. Feche e reabra o app
7. Verifique que as configurações persistiram (botão verde)
8. Teste upload novamente

#### Testar Alteração de Logo
1. Prepare uma imagem PNG 1024x1024
2. Execute: `npx @tauri-apps/cli icon caminho/para/sua/imagem.png`
3. Rebuild: `npm run tauri:build`
4. Instale o novo build
5. Verifique o novo ícone no sistema

### 🔐 Segurança

- Credenciais são salvas localmente em `~/.storage-app/config.json`
- Arquivo tem permissões de usuário padrão
- Não é sincronizado para nuvem
- Não é incluído no bundle/instalador
- Permanece após desinstalação (pode ser deletado manualmente se necessário)

### 📁 Localização dos Arquivos de Configuração

**macOS:**
```
~/.storage-app/config.json
~/.storage-app/history.json
```

**Windows:**
```
C:\Users\[seu-usuario]\.storage-app\config.json
C:\Users\[seu-usuario]\.storage-app\history.json
```

**Linux:**
```
~/.storage-app/config.json
~/.storage-app/history.json
```

### 🐛 Problemas Conhecidos

Nenhum no momento.

### 📝 Notas de Migração

Se você já usa o app em desenvolvimento com `.env`:
1. Na próxima execução, o app vai migrar automaticamente para `config.json`
2. Você pode continuar usando `.env` normalmente
3. O `config.json` terá prioridade se ambos existirem
4. Quando fizer build, o `config.json` será usado automaticamente

### 🎯 Próximos Passos Sugeridos

- [ ] Adicionar opção de exportar/importar configurações
- [ ] Adicionar validação de credenciais (teste de conexão)
- [ ] Adicionar opção de limpar/resetar configurações
- [ ] Adicionar múltiplos perfis de configuração
- [ ] Adicionar opção de criptografar `config.json`

---

**Data da atualização:** 17 de Novembro de 2025
**Versão:** 0.1.0

