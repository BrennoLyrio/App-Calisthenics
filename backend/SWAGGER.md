# 📚 Swagger Documentation - Calisthenics App API

## 🚀 Como usar o Swagger

### 1. **Instalar dependências**
```bash
cd backend
npm install
```

### 2. **Configurar banco de dados**
```bash
# Criar banco PostgreSQL
createdb calisthenics_app

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações
```

### 3. **Executar migrações e seeds**
```bash
npm run db:migrate
npm run db:seed
```

### 4. **Iniciar servidor**
```bash
npm run dev
```

### 5. **Acessar documentação Swagger**
Abra seu navegador em: **http://localhost:3000/api-docs**

## 🔧 Funcionalidades do Swagger

### ✅ **Interface Interativa**
- Teste todas as rotas diretamente no navegador
- Autenticação JWT integrada
- Validação de dados em tempo real
- Exemplos de requisições e respostas

### ✅ **Documentação Completa**
- **Autenticação**: Registro, login, perfil
- **Exercícios**: CRUD, busca, filtros
- **Treinos**: Criação, listagem, execução
- **Metas**: Gestão de objetivos
- **Programas**: Desafios temáticos

### ✅ **Schemas Detalhados**
- Modelos de dados completos
- Validações e restrições
- Exemplos práticos
- Tipos de dados específicos

## 🧪 Como testar as rotas

### **1. Autenticação**
1. Acesse `/auth/register` para criar um usuário
2. Use `/auth/login` para obter o token JWT
3. Copie o token da resposta
4. Clique em "Authorize" no Swagger
5. Cole o token no formato: `Bearer SEU_TOKEN_AQUI`

### **2. Exercícios**
- **GET /exercises** - Listar todos os exercícios
- **GET /exercises?categoria=superiores** - Filtrar por categoria
- **GET /exercises?nivel=iniciante** - Filtrar por nível
- **GET /exercises/search?q=flexão** - Buscar exercícios
- **GET /exercises/1** - Obter exercício específico

### **3. Treinos**
- **POST /workouts** - Criar novo treino
- **GET /workouts** - Listar treinos do usuário
- **GET /workouts/1** - Obter treino específico
- **GET /workouts/recommended** - Treinos recomendados

## 📋 Exemplos de Requisições

### **Registrar Usuário**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "idade": 25,
  "peso": 70.5,
  "altura": 175.0,
  "nivel_condicionamento": "iniciante"
}
```

### **Criar Treino**
```json
{
  "objetivo": "forca",
  "nivel": "iniciante",
  "nome": "Treino de Força - Iniciante",
  "descricao": "Treino focado no desenvolvimento de força",
  "exercicios": [
    {
      "id_exercicio": 1,
      "series": 3,
      "repeticoes": 10,
      "descanso": 60,
      "ordem": 1
    }
  ]
}
```

## 🔐 Autenticação

### **Como obter token:**
1. Faça POST em `/auth/login`
2. Copie o token da resposta
3. Clique em "Authorize" no Swagger
4. Digite: `Bearer SEU_TOKEN_AQUI`

### **Rotas protegidas:**
- `/auth/profile` - Perfil do usuário
- `/workouts/*` - Todas as rotas de treinos
- `/goals/*` - Todas as rotas de metas

## 🎯 Endpoints Principais

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/auth/register` | Registrar usuário | ❌ |
| POST | `/auth/login` | Fazer login | ❌ |
| GET | `/auth/profile` | Obter perfil | ✅ |
| PUT | `/auth/profile` | Atualizar perfil | ✅ |
| GET | `/exercises` | Listar exercícios | ❌ |
| GET | `/exercises/search` | Buscar exercícios | ❌ |
| POST | `/workouts` | Criar treino | ✅ |
| GET | `/workouts` | Listar treinos | ✅ |
| GET | `/workouts/recommended` | Treinos recomendados | ✅ |

## 🐛 Troubleshooting

### **Erro 401 - Unauthorized**
- Verifique se o token JWT está correto
- Confirme se o token não expirou
- Use o formato: `Bearer SEU_TOKEN_AQUI`

### **Erro 400 - Bad Request**
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme se os tipos de dados estão corretos
- Veja os exemplos na documentação

### **Erro 500 - Internal Server Error**
- Verifique se o banco de dados está rodando
- Confirme se as migrações foram executadas
- Veja os logs do servidor

## 📊 Dados de Teste

O sistema já vem com dados iniciais:
- **5 exercícios** de diferentes categorias
- **2 programas temáticos** (30 dias de core, 6 semanas para barra fixa)
- **Categorias**: superiores, inferiores, core, completo
- **Níveis**: iniciante, intermediário, avançado

## 🚀 Próximos Passos

1. **Teste todas as rotas** no Swagger
2. **Integre com React Native** usando os endpoints
3. **Implemente funcionalidades adicionais** conforme necessário
4. **Monitore performance** e otimize conforme necessário

---

**🎉 Agora você pode testar toda a API de forma interativa e visual!**
