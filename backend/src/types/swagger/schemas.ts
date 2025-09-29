/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao@email.com"
 *         idade:
 *           type: integer
 *           example: 25
 *         peso:
 *           type: number
 *           format: float
 *           example: 70.5
 *         altura:
 *           type: number
 *           format: float
 *           example: 175.0
 *         nivel_condicionamento:
 *           type: string
 *           enum: [iniciante, intermediario, avancado]
 *           example: "iniciante"
 *         data_criacao:
 *           type: string
 *           format: date-time
 *         data_ultima_sinc:
 *           type: string
 *           format: date-time
 * 
 *     Exercise:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Flexão de Braço"
 *         categoria:
 *           type: string
 *           enum: [superiores, inferiores, core, completo]
 *           example: "superiores"
 *         descricao_textual:
 *           type: string
 *           example: "Exercício clássico para fortalecer peito, ombros e tríceps..."
 *         nivel_dificuldade:
 *           type: string
 *           enum: [iniciante, intermediario, avancado]
 *           example: "iniciante"
 *         musculos_trabalhados:
 *           type: array
 *           items:
 *             type: string
 *           example: ["peito", "ombros", "tríceps"]
 *         video_url:
 *           type: string
 *           format: uri
 *           example: "https://example.com/video.mp4"
 *         imagem_url:
 *           type: string
 *           format: uri
 *           example: "https://example.com/image.jpg"
 *         instrucoes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Deite-se de bruços no chão", "Posicione as mãos na largura dos ombros"]
 *         dicas:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Mantenha o core contraído", "Respire na subida e expire na descida"]
 *         variacoes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["flexão inclinada", "flexão declinada"]
 *         equipamentos_necessarios:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         tempo_estimado:
 *           type: integer
 *           example: 30
 *         calorias_estimadas:
 *           type: integer
 *           example: 8
 *         ativo:
 *           type: boolean
 *           example: true
 * 
 *     Workout:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_usuario:
 *           type: integer
 *           example: 1
 *         objetivo:
 *           type: string
 *           enum: [forca, resistencia, hipertrofia, perda_peso]
 *           example: "forca"
 *         nivel:
 *           type: string
 *           enum: [iniciante, intermediario, avancado]
 *           example: "iniciante"
 *         nome:
 *           type: string
 *           example: "Treino de Força - Iniciante"
 *         descricao:
 *           type: string
 *           example: "Treino focado no desenvolvimento de força..."
 *         duracao_estimada:
 *           type: integer
 *           example: 45
 *         calorias_estimadas:
 *           type: integer
 *           example: 250
 *         data_criacao:
 *           type: string
 *           format: date-time
 *         ativo:
 *           type: boolean
 *           example: true
 * 
 *     WorkoutExercise:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_treino:
 *           type: integer
 *           example: 1
 *         id_exercicio:
 *           type: integer
 *           example: 1
 *         series:
 *           type: integer
 *           example: 3
 *         repeticoes:
 *           type: integer
 *           example: 10
 *         tempo_execucao:
 *           type: integer
 *           example: 30
 *         descanso:
 *           type: integer
 *           example: 60
 *         ordem:
 *           type: integer
 *           example: 1
 * 
 *     Goal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_usuario:
 *           type: integer
 *           example: 1
 *         descricao:
 *           type: string
 *           example: "Fazer 50 flexões em 1 minuto"
 *         tipo:
 *           type: string
 *           enum: [curto, medio, longo]
 *           example: "medio"
 *         valor_alvo:
 *           type: number
 *           format: float
 *           example: 50
 *         valor_atual:
 *           type: number
 *           format: float
 *           example: 25
 *         data_inicio:
 *           type: string
 *           format: date-time
 *         data_fim:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [em_andamento, concluida, pausada]
 *           example: "em_andamento"
 *         categoria:
 *           type: string
 *           enum: [forca, resistencia, flexibilidade, perda_peso, ganho_massa, outro]
 *           example: "forca"
 *         unidade_medida:
 *           type: string
 *           example: "repetições"
 * 
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operação realizada com sucesso"
 *         data:
 *           type: object
 *         error:
 *           type: string
 *           example: "Mensagem de erro"
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 100
 *             totalPages:
 *               type: integer
 *               example: 10
 * 
 *     RegisterRequest:
 *       type: object
 *       required: [nome, email, senha, idade, peso, altura, nivel_condicionamento]
 *       properties:
 *         nome:
 *           type: string
 *           example: "João Silva"
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *           example: "joao@email.com"
 *         senha:
 *           type: string
 *           example: "senha123"
 *           minLength: 6
 *           maxLength: 255
 *         idade:
 *           type: integer
 *           example: 25
 *           minimum: 13
 *           maximum: 120
 *         peso:
 *           type: number
 *           format: float
 *           example: 70.5
 *           minimum: 20
 *           maximum: 300
 *         altura:
 *           type: number
 *           format: float
 *           example: 175.0
 *           minimum: 100
 *           maximum: 250
 *         nivel_condicionamento:
 *           type: string
 *           enum: [iniciante, intermediario, avancado]
 *           example: "iniciante"
 * 
 *     LoginRequest:
 *       type: object
 *       required: [email, senha]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "joao@email.com"
 *         senha:
 *           type: string
 *           example: "senha123"
 * 
 *     CreateWorkoutRequest:
 *       type: object
 *       required: [objetivo, nivel, exercicios]
 *       properties:
 *         objetivo:
 *           type: string
 *           enum: [forca, resistencia, hipertrofia, perda_peso]
 *           example: "forca"
 *         nivel:
 *           type: string
 *           enum: [iniciante, intermediario, avancado]
 *           example: "iniciante"
 *         nome:
 *           type: string
 *           example: "Treino de Força - Iniciante"
 *         descricao:
 *           type: string
 *           example: "Treino focado no desenvolvimento de força..."
 *         exercicios:
 *           type: array
 *           items:
 *             type: object
 *             required: [id_exercicio, series, repeticoes, ordem]
 *             properties:
 *               id_exercicio:
 *                 type: integer
 *                 example: 1
 *               series:
 *                 type: integer
 *                 example: 3
 *                 minimum: 1
 *                 maximum: 20
 *               repeticoes:
 *                 type: integer
 *                 example: 10
 *                 minimum: 1
 *                 maximum: 1000
 *               tempo_execucao:
 *                 type: integer
 *                 example: 30
 *                 minimum: 5
 *                 maximum: 3600
 *               descanso:
 *                 type: integer
 *                 example: 60
 *                 minimum: 0
 *                 maximum: 600
 *               ordem:
 *                 type: integer
 *                 example: 1
 *                 minimum: 1
 *                 maximum: 50
 */
