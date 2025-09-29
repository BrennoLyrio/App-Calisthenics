# 🚀 Instruções para Testar o Calisthenics App

## ✅ **Problema Resolvido**
- ❌ Erro do `react-native-reanimated` corrigido
- ✅ Dependências simplificadas
- ✅ Configuração do Babel atualizada

## 📱 **Como Testar o App**

### 1. **Iniciar o Servidor**
```bash
# No diretório frontend
npx expo start --clear
```

### 2. **Escolher Plataforma**
- **Android**: Pressione `a` ou escaneie o QR code
- **iOS**: Pressione `i` ou escaneie o QR code  
- **Web**: Pressione `w` para abrir no navegador

### 3. **Fluxo de Teste Completo**

#### **Tela de Boas-vindas**
- ✅ Verificar se carrega com gradiente laranja
- ✅ Testar botão "Começar Agora" → Login
- ✅ Testar botão "Já tenho uma conta" → Login

#### **Tela de Login**
- ✅ Testar validação de email inválido
- ✅ Testar validação de senha vazia
- ✅ Testar link "Esqueceu sua senha?"
- ✅ Testar link "Inscrever-se com email" → Register

#### **Tela de Registro**
- ✅ Testar validação de todos os campos
- ✅ Testar confirmação de senha
- ✅ Testar validação de idade (13-100)
- ✅ Testar validação de peso (30-300 kg)
- ✅ Testar validação de altura (100-250 cm)

#### **Fluxo de Onboarding**
- ✅ **Tela 1**: Seleção de objetivo (A-G)
- ✅ **Tela 2**: Seleção de experiência
- ✅ **Tela 3**: Seleção de recursos (múltipla)
- ✅ **Tela 4**: Dados físicos (peso, altura, idade)

#### **Tela Principal**
- ✅ Verificar dados do usuário
- ✅ Testar cards de ação rápida
- ✅ Testar botão de logout

## 🎯 **Dados de Teste**

### **Usuário de Teste:**
```
Nome: João Silva
Email: joao@teste.com
Senha: 123456
Idade: 25
Peso: 70
Altura: 175
Nível: iniciante
```

### **Onboarding:**
```
Objetivo: B - Ganho de músculo e força
Experiência: B - Iniciante
Recursos: A, B (Acessar planos + Acompanhar progresso)
Dados: Peso 70, Altura 175, Idade 25
```

## 🔧 **Se Houver Problemas**

### **Erro de Dependências:**
```bash
# Limpar cache
npx expo start --clear

# Reinstalar dependências
rm -rf node_modules
npm install
```

### **Erro de Metro:**
```bash
# Limpar cache do Metro
npx expo start --clear --reset-cache
```

### **Erro de Babel:**
```bash
# Verificar babel.config.js
# Deve estar sem plugins do reanimated
```

## 📋 **Checklist de Funcionalidades**

### ✅ **RF-001: Gestão de Perfil**
- [x] Tela de boas-vindas
- [x] Login com validação
- [x] Registro com validação
- [x] Onboarding completo
- [x] Tela principal com dados

### ✅ **RF-002: Sistema Progressivo**
- [x] Estrutura de níveis
- [x] Categorização
- [x] Base para treinos

### ✅ **Componentes**
- [x] Button com gradiente
- [x] Input com validação
- [x] Card com sombra
- [x] Navegação fluida

## 🎨 **Design Verificado**
- [x] Gradientes laranja
- [x] Gradientes marrom (onboarding)
- [x] Tipografia consistente
- [x] Espaçamentos padronizados
- [x] Ícones funcionais

## 🚀 **Próximos Passos**
1. Testar todas as telas
2. Verificar navegação
3. Testar validações
4. Implementar telas de exercícios
5. Criar sistema de treinos

---

**O app está pronto para teste!** 🎉
