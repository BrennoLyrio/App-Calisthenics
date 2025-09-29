/**
 * @swagger
 * /exercises:
 *   get:
 *     summary: Listar todos os exercícios
 *     tags: [Exercícios]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [superiores, inferiores, core, completo]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *           enum: [iniciante, intermediario, avancado]
 *         description: Filtrar por nível de dificuldade
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Limite de itens por página
 *     responses:
 *       200:
 *         description: Lista de exercícios
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Exercise'
 * 
 * /exercises/{id}:
 *   get:
 *     summary: Obter exercício por ID
 *     tags: [Exercícios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do exercício
 *     responses:
 *       200:
 *         description: Exercício encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Exercise'
 *       404:
 *         description: Exercício não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 * 
 * /exercises/categories:
 *   get:
 *     summary: Listar categorias de exercícios
 *     tags: [Exercícios]
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "superiores"
 *                           nome:
 *                             type: string
 *                             example: "Membros Superiores"
 *                           descricao:
 *                             type: string
 *                             example: "Exercícios para braços, ombros e peito"
 * 
 * /exercises/difficulty-levels:
 *   get:
 *     summary: Listar níveis de dificuldade
 *     tags: [Exercícios]
 *     responses:
 *       200:
 *         description: Lista de níveis de dificuldade
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "iniciante"
 *                           nome:
 *                             type: string
 *                             example: "Iniciante"
 *                           descricao:
 *                             type: string
 *                             example: "Para quem está começando na calistenia"
 * 
 * /exercises/search:
 *   get:
 *     summary: Buscar exercícios
 *     tags: [Exercícios]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Resultados da busca
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Exercise'
 *       400:
 *         description: Termo de busca é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 * 
 * /exercises/category/{categoria}:
 *   get:
 *     summary: Listar exercícios por categoria
 *     tags: [Exercícios]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *           enum: [superiores, inferiores, core, completo]
 *         description: Categoria dos exercícios
 *     responses:
 *       200:
 *         description: Exercícios da categoria
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Exercise'
 * 
 * /exercises/difficulty/{nivel}:
 *   get:
 *     summary: Listar exercícios por nível de dificuldade
 *     tags: [Exercícios]
 *     parameters:
 *       - in: path
 *         name: nivel
 *         required: true
 *         schema:
 *           type: string
 *           enum: [iniciante, intermediario, avancado]
 *         description: Nível de dificuldade
 *     responses:
 *       200:
 *         description: Exercícios do nível
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Exercise'
 */
