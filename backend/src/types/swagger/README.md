# 📚 Swagger Documentation Structure

Esta pasta contém toda a documentação Swagger organizada de forma modular e limpa.

## 📁 Estrutura de Arquivos

```
src/types/swagger/
├── index.ts          # Importa todos os arquivos de documentação
├── schemas.ts        # Schemas de dados (User, Exercise, Workout, etc.)
├── auth.ts          # Documentação das rotas de autenticação
├── exercises.ts     # Documentação das rotas de exercícios
├── workouts.ts      # Documentação das rotas de treinos
└── README.md        # Este arquivo
```

## 🎯 Vantagens desta Estrutura

### ✅ **Organização Modular**
- Cada arquivo tem uma responsabilidade específica
- Fácil de manter e atualizar
- Código mais limpo nos controladores

### ✅ **Reutilização**
- Schemas podem ser reutilizados em múltiplas rotas
- Evita duplicação de código
- Facilita manutenção

### ✅ **Escalabilidade**
- Fácil adicionar novas rotas
- Estrutura clara para novos desenvolvedores
- Separação de responsabilidades

## 📋 Como Adicionar Nova Documentação

### **1. Para novas rotas:**
```typescript
// Em auth.ts, exercises.ts ou workouts.ts
/**
 * @swagger
 * /nova-rota:
 *   get:
 *     summary: Descrição da rota
 *     tags: [Tag]
 *     responses:
 *       200:
 *         description: Sucesso
 */
```

### **2. Para novos schemas:**
```typescript
// Em schemas.ts
/**
 * @swagger
 * components:
 *   schemas:
 *     NovoModelo:
 *       type: object
 *       properties:
 *         campo1:
 *           type: string
 *           example: "valor"
 */
```

### **3. Para novos controladores:**
1. Crie um novo arquivo `novoController.ts` em `swagger/`
2. Adicione a documentação das rotas
3. Importe no `index.ts`

## 🔧 Configuração

A configuração principal está em `src/config/swagger.ts`:

```typescript
apis: [
  './src/types/swagger/*.ts',  // ← Importa todos os arquivos desta pasta
  './src/routes/*.ts',
  './src/controllers/*.ts'
]
```

## 📝 Convenções

### **Nomenclatura de Arquivos**
- `schemas.ts` - Apenas schemas de dados
- `auth.ts` - Rotas de autenticação
- `exercises.ts` - Rotas de exercícios
- `workouts.ts` - Rotas de treinos
- `[nome].ts` - Outras funcionalidades

### **Estrutura de Comentários**
```typescript
/**
 * @swagger
 * /rota:
 *   metodo:
 *     summary: Descrição curta
 *     tags: [Tag]
 *     parameters: [...]
 *     requestBody: {...}
 *     responses: {...}
 */
```

### **Tags Recomendadas**
- `[Autenticação]` - Login, registro, perfil
- `[Exercícios]` - CRUD de exercícios
- `[Treinos]` - CRUD de treinos
- `[Metas]` - Sistema de metas
- `[Programas]` - Programas temáticos

## 🚀 Como Usar

1. **Desenvolver nova funcionalidade**
2. **Adicionar documentação** no arquivo apropriado
3. **Testar no Swagger UI** em `http://localhost:3000/api-docs`
4. **Atualizar este README** se necessário

## 🎉 Benefícios

- ✅ **Código limpo** - Controladores sem anotações Swagger
- ✅ **Manutenção fácil** - Documentação centralizada
- ✅ **Escalabilidade** - Fácil adicionar novas funcionalidades
- ✅ **Organização** - Estrutura clara e lógica
- ✅ **Reutilização** - Schemas compartilhados

---

**Esta estrutura torna a documentação Swagger muito mais organizada e fácil de manter!** 🎯
