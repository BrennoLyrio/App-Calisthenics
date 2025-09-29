# Calisthenics App - Backend

Backend API para o aplicativo de calistenia desenvolvido em TypeScript, Express e Sequelize.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **MongoDB** - Banco de dados não-relacional (comunidade)
- **Redis** - Cache e sessões
- **JWT** - Autenticação
- **Joi** - Validação de dados

## 📋 Requisitos Funcionais Implementados

### ✅ RF-001: Gestão de Perfil e Autenticação
- [x] Criação de perfil individual
- [x] Login e autenticação JWT
- [x] Atualização de perfil
- [x] Alteração de senha
- [x] Exclusão de conta

### ✅ RF-002: Sistema de Treinamento Progressivo
- [x] Estrutura de níveis (iniciante, intermediário, avançado)
- [x] Modelos de dados para progressão
- [x] Sistema de treinos personalizados

### ✅ RF-003: Biblioteca de Exercícios
- [x] CRUD de exercícios
- [x] Categorização por grupos musculares
- [x] Níveis de dificuldade
- [x] Busca e filtros
- [x] Instruções e dicas

### ✅ RF-004: Geração de Treinos Automáticos
- [x] Criação de treinos personalizados
- [x] Cálculo de duração e calorias
- [x] Recomendações baseadas no perfil

### ✅ RF-005: Histórico e Relatórios
- [x] Registro de execução de treinos
- [x] Estatísticas de progresso
- [x] Relatórios semanais

### ✅ RF-006: Notificações Inteligentes
- [x] Estrutura para notificações (MongoDB)
- [x] Sistema de lembretes

### ✅ RF-007: Sistema de Metas
- [x] Criação e gestão de metas
- [x] Acompanhamento de progresso
- [x] Categorização de metas

### ✅ RF-008: Desafios e Programas Temáticos
- [x] Programas estruturados
- [x] Acompanhamento de progresso
- [x] Sistema de conquistas

## 🗄️ Arquitetura do Banco de Dados

### Banco Relacional (PostgreSQL)
- **usuarios** - Dados dos usuários
- **exercicios** - Biblioteca de exercícios
- **treinos** - Treinos personalizados
- **treino_exercicios** - Relação N:N entre treinos e exercícios
- **historico_treinos** - Histórico de execução
- **metas** - Metas dos usuários
- **programas_tematicos** - Programas e desafios
- **usuario_programas** - Participação em programas

### Banco Não-Relacional (MongoDB)
- **posts** - Posts da comunidade
- **notificacoes** - Notificações do sistema
- **wearables** - Dados de dispositivos

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# PostgreSQL
createdb calisthenics_app

# MongoDB (opcional para funcionalidades de comunidade)
# Instale e configure o MongoDB
```

5. **Execute as migrações e seeds**
```bash
npm run db:migrate
npm run db:seed
```

6. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📚 API Endpoints

### 🔐 Autenticação (`/api/v1/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Fazer login
- `GET /profile` - Obter perfil
- `PUT /profile` - Atualizar perfil
- `PUT /change-password` - Alterar senha
- `DELETE /account` - Excluir conta

### 💪 Exercícios (`/api/v1/exercises`)
- `GET /` - Listar exercícios
- `GET /:id` - Obter exercício por ID
- `GET /categories` - Listar categorias
- `GET /difficulty-levels` - Listar níveis de dificuldade
- `GET /search` - Buscar exercícios
- `GET /category/:categoria` - Exercícios por categoria
- `GET /difficulty/:nivel` - Exercícios por dificuldade

### 🏋️ Treinos (`/api/v1/workouts`)
- `POST /` - Criar treino
- `GET /` - Listar treinos do usuário
- `GET /:id` - Obter treino por ID
- `PUT /:id` - Atualizar treino
- `DELETE /:id` - Excluir treino
- `GET /recommended` - Treinos recomendados
- `POST /:id/start` - Iniciar treino

## 📖 Documentação Swagger

### 🎯 **Interface Interativa**
Acesse: **http://localhost:3000/api-docs**

### 📁 **Estrutura Modular**
```
src/types/swagger/
├── index.ts          # Importa todos os arquivos
├── schemas.ts        # Schemas de dados
├── auth.ts          # Rotas de autenticação
├── exercises.ts     # Rotas de exercícios
├── workouts.ts      # Rotas de treinos
└── README.md        # Documentação da estrutura
```

### ✅ **Vantagens**
- **Código limpo** - Controladores sem anotações Swagger
- **Manutenção fácil** - Documentação centralizada
- **Escalabilidade** - Fácil adicionar novas funcionalidades
- **Organização** - Estrutura clara e lógica

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia em modo desenvolvimento
npm run build        # Compila TypeScript
npm start           # Inicia em modo produção
npm test            # Executa testes
npm run db:migrate  # Executa migrações
npm run db:seed     # Executa seeds
npm run db:reset    # Reseta e recria banco
```

## 🏗️ Estrutura do Projeto

```
src/
├── config/          # Configurações (DB, Redis, MongoDB)
├── controllers/     # Controladores da API
├── middleware/      # Middlewares (auth, validation, error)
├── models/          # Modelos Sequelize
├── routes/          # Rotas da API
├── seeders/         # Dados iniciais
├── types/           # Definições TypeScript
└── server.ts        # Servidor principal
```

## 🔐 Segurança

- Autenticação JWT
- Validação de dados com Joi
- Rate limiting
- CORS configurado
- Helmet para headers de segurança
- Validação de senhas com bcrypt

## 📊 Monitoramento

- Health check em `/health`
- Logs com Morgan
- Tratamento de erros centralizado
- Graceful shutdown

## 🚀 Deploy

1. Configure as variáveis de ambiente de produção
2. Execute `npm run build`
3. Configure o banco de dados de produção
4. Execute as migrações
5. Inicie com `npm start`

## 📝 Próximos Passos

- [ ] Implementar funcionalidades de comunidade
- [ ] Integração com wearables
- [ ] Sistema de notificações push
- [ ] Conteúdo educativo
- [ ] Funcionalidades offline
- [ ] Testes automatizados
- [ ] Documentação da API com Swagger
