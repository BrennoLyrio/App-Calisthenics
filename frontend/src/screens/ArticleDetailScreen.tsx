import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

const { width } = Dimensions.get('window');

interface ArticleDetailScreenProps {
  navigation: any;
  route: {
    params: {
      articleId: string;
      category: 'articles' | 'nutrition' | 'progression' | 'recovery';
    };
  };
}

// Mock content - em produção viria do backend
const articleContent: Record<string, any> = {
  // ARTIGOS SOBRE CALISTENIA
  'a1': {
    title: 'Fundamentos da Calistenia',
    category: 'articles',
    readTime: 8,
    content: [
      {
        type: 'section',
        title: 'O que é Calistenia?',
        text: 'A calistenia é uma modalidade de treinamento físico que utiliza exclusivamente o peso corporal como resistência. Originada na Grécia Antiga (do grego "kallos" = belo e "sthenos" = força), a calistenia busca desenvolver força, flexibilidade, coordenação e controle corporal através de movimentos naturais e funcionais.',
      },
      {
        type: 'section',
        title: 'Princípios Fundamentais',
        text: 'A calistenia baseia-se em três pilares principais:\n\n• Progressão gradual: aumentar a dificuldade dos exercícios de forma sistemática\n• Controle total: cada movimento deve ser executado com máxima precisão\n• Consistência: treinos regulares são essenciais para o progresso sustentável',
      },
      {
        type: 'tip',
        title: 'Dica Profissional',
        text: 'Comece sempre dominando as variações mais básicas antes de progredir. A paciência e a técnica correta são mais importantes que a velocidade do progresso.',
      },
      {
        type: 'section',
        title: 'Benefícios da Calistenia',
        text: '• Desenvolve força funcional e natural\n• Melhora a coordenação e consciência corporal\n• Não requer equipamentos caros ou academias\n• Pode ser praticada em qualquer lugar\n• Desenvolve flexibilidade e mobilidade\n• Previne lesões através de movimentos naturais\n• Melhora a postura e o alinhamento corporal',
      },
      {
        type: 'section',
        title: 'Movimentos Básicos',
        text: 'A calistenia começa com movimentos fundamentais que devem ser dominados antes de progredir:\n\n• Flexões (push-ups): desenvolvimento da parte superior do corpo\n• Agachamentos (squats): fortalecimento das pernas\n• Pranchas (planks): desenvolvimento do core\n• Barra fixa (pull-ups): desenvolvimento das costas\n• Ponte (bridge): desenvolvimento da cadeia posterior',
      },
    ],
    references: [
      'Behm, D. G. et al. (2015). "Effectiveness of traditional strength vs. power training on muscle strength, power and speed". Journal of Strength and Conditioning Research.',
      'Thomas, E. et al. (2014). "The role of bodyweight training in physical fitness". Sports Medicine.',
      'Falatic, J. A. et al. (2015). "Effects of calisthenics training on flexibility and strength". International Journal of Sports Science & Coaching.',
    ],
  },
  'a2': {
    title: 'Técnicas de Execução Correta',
    category: 'articles',
    readTime: 10,
    content: [
      {
        type: 'section',
        title: 'Por que a técnica é essencial',
        text: 'A execução correta não é apenas sobre estética - é fundamental para prevenir lesões, maximizar os resultados e desenvolver força funcional real. Uma técnica adequada permite que você ative os músculos corretos e evite compensações que podem levar a desequilíbrios musculares.',
      },
      {
        type: 'section',
        title: 'Princípios de Execução',
        text: '1. Controle completo do movimento\n• Fase excêntrica (descida): controle de 2-3 segundos\n• Fase isométrica (pausa): 1 segundo na posição mais difícil\n• Fase concêntrica (subida): movimento explosivo mas controlado\n\n2. Respiração adequada\n• Expire durante a fase de esforço máximo\n• Inspire durante a fase de recuperação\n• Nunca segure a respiração completamente',
      },
      {
        type: 'tip',
        title: 'Erro Comum',
        text: 'Evite usar o momentum (inércia) para completar os movimentos. Cada repetição deve ser controlada e deliberada.',
      },
      {
        type: 'section',
        title: 'Alinhamento Corporal',
        text: 'Mantenha sempre:\n\n• Cabeça neutra (olhando para frente ou ligeiramente para baixo)\n• Omoplatas retraídas e deprimidas\n• Core ativado (abdômen contraído)\n• Coluna em posição neutra\n• Joelhos alinhados com os pés durante exercícios de perna\n• Pés totalmente apoiados no chão',
      },
      {
        type: 'section',
        title: 'Progressão Segura',
        text: 'Aumente a dificuldade apenas quando:\n\n• Você consegue realizar 3 séries de 8-12 repetições com técnica perfeita\n• Não há compensações ou movimento assistido\n• Você se sente confortável e controlado durante todo o movimento\n• Não há dor articular durante ou após o exercício',
      },
    ],
    references: [
      'Schoenfeld, B. J. (2010). "The mechanisms of muscle hypertrophy and their application to resistance training". Journal of Strength and Conditioning Research.',
      'Contreras, B. et al. (2017). "Effects of a six-week hip thrust vs. front squat training program on performance in adolescent males". Journal of Strength and Conditioning Research.',
      'Warburton, D. E. et al. (2006). "Health benefits of physical activity: the evidence". CMAJ.',
    ],
  },
  'a3': {
    title: 'Princípios de Força e Resistência',
    category: 'articles',
    readTime: 7,
    content: [
      {
        type: 'section',
        title: 'Força vs Resistência',
        text: 'Embora relacionados, força e resistência são qualidades físicas distintas:\n\n• FORÇA: capacidade de gerar tensão máxima em um único esforço (ex: 1 repetição máxima)\n• RESISTÊNCIA: capacidade de manter um nível de força por múltiplas repetições ou tempo prolongado',
      },
      {
        type: 'section',
        title: 'Como Treinar Força',
        text: 'Para desenvolver força máxima na calistenia:\n\n• Volume baixo, intensidade alta (3-5 repetições por série)\n• Descanso longo entre séries (3-5 minutos)\n• Foco em movimentos complexos e pesados\n• Exemplos: one-arm push-ups, weighted pull-ups, pistol squats\n• Frequência: 2-3 vezes por semana por grupo muscular',
      },
      {
        type: 'tip',
        title: 'Dica de Treino',
        text: 'Para força, prefira variações mais difíceis com menos repetições. Para resistência, use variações mais fáceis com mais repetições.',
      },
      {
        type: 'section',
        title: 'Como Treinar Resistência',
        text: 'Para desenvolver resistência muscular:\n\n• Volume alto, intensidade moderada (15-30+ repetições)\n• Descanso curto entre séries (30-90 segundos)\n• Foco em movimentos contínuos\n• Exemplos: push-ups clássicas, pull-ups assistidas, squats\n• Frequência: 3-5 vezes por semana',
      },
      {
        type: 'section',
        title: 'Treinamento Combinado',
        text: 'A maioria dos praticantes se beneficia de uma combinação:\n\n• Dias de força: 2-3 vezes por semana\n• Dias de resistência: 2-3 vezes por semana\n• Diferentes grupos musculares em dias diferentes\n• Ou alternar semanas de força e resistência',
      },
    ],
    references: [
      'Grgic, J. et al. (2018). "The effects of time of day-specific resistance training on adaptations in skeletal muscle hypertrophy and muscle strength". Journal of Strength and Conditioning Research.',
      'Schoenfeld, B. J. et al. (2017). "Dose-response relationship between weekly resistance training volume and increases in muscle mass". Sports Medicine.',
      'Kraemer, W. J. & Ratamess, N. A. (2004). "Fundamentals of resistance training: progression and exercise prescription". Medicine & Science in Sports & Exercise.',
    ],
  },
  'a4': {
    title: 'Movimentos Básicos para Iniciantes',
    category: 'articles',
    readTime: 9,
    content: [
      {
        type: 'section',
        title: 'Por onde começar?',
        text: 'Como iniciante, seu foco deve ser dominar os movimentos fundamentais. Esses exercícios formam a base para todos os movimentos avançados e devem ser sua prioridade nos primeiros 3-6 meses de treino.',
      },
      {
        type: 'section',
        title: '1. Flexões (Push-ups)',
        text: 'Posição inicial:\n• Mãos alinhadas com os ombros\n• Corpo em linha reta dos pés à cabeça\n• Core ativado\n\nMovimento:\n• Desça até quase tocar o chão\n• Mantenha os cotovelos próximos ao corpo\n• Empurre de volta à posição inicial\n\nProgressão: Flexões inclinadas → Flexões no chão → Flexões com pés elevados',
      },
      {
        type: 'section',
        title: '2. Agachamentos (Squats)',
        text: 'Posição inicial:\n• Pés na largura dos ombros\n• Dedos dos pés ligeiramente apontados para fora\n• Coluna ereta\n\nMovimento:\n• Desça como se fosse sentar em uma cadeira\n• Joelhos não devem passar dos dedos dos pés\n• Desça até as coxas ficarem paralelas ao chão\n• Suba empurrando através dos calcanhares\n\nProgressão: Agachamento assistido → Agachamento livre → Agachamento com salto',
      },
      {
        type: 'tip',
        title: 'Erro Comum em Iniciantes',
        text: 'Muitos iniciantes negligenciam exercícios de puxar (pull-ups). Mesmo que você não consiga fazer uma barra fixa completa, pratique variações assistidas desde o início para desenvolver equilíbrio muscular.',
      },
      {
        type: 'section',
        title: '3. Pranchas (Planks)',
        text: 'Posição:\n• Apoio nos antebraços e dedos dos pés\n• Corpo em linha reta\n• Contraia o abdômen e glúteos\n\nComece com: 20-30 segundos\nProgressão: Aumente gradualmente até 60+ segundos',
      },
      {
        type: 'section',
        title: '4. Barra Fixa (Pull-ups)',
        text: 'Se você não consegue fazer uma completa:\n\n• Negativas: pule para a posição superior e desça lentamente\n• Assistida com elástico ou parceiro\n• Barra australiana (mais fácil, com corpo inclinado)\n\nQuando conseguir: Foque em 3 séries de 5-8 repetições',
      },
      {
        type: 'section',
        title: 'Rutina Inicial Recomendada',
        text: 'Para os primeiros 2-3 meses, treine 3 vezes por semana:\n\n• Dia 1: Push (flexões, dips)\n• Dia 2: Pull (barras, remadas)\n• Dia 3: Legs & Core (agachamentos, pranchas)\n\n3 séries de 8-12 repetições por exercício, com 60-90 segundos de descanso.',
      },
    ],
    references: [
      'Contreras, B. & Schoenfeld, B. (2011). "To crunch or not to crunch: an evidence-based examination of spinal flexion exercises". Strength and Conditioning Journal.',
      'Calatayud, J. et al. (2015). "Importance of mind-muscle connection during progressive resistance training". European Journal of Applied Physiology.',
      'Ratamess, N. A. et al. (2009). "Progression models in resistance training for healthy adults". Medicine & Science in Sports & Exercise.',
    ],
  },

  // DICAS DE NUTRIÇÃO
  'n1': {
    title: 'Alimentação para Calistenia',
    category: 'nutrition',
    readTime: 12,
    content: [
      {
        type: 'section',
        title: 'Nutrição e Performance',
        text: 'A alimentação adequada é tão importante quanto o treino para alcançar seus objetivos na calistenia. Seu corpo precisa dos nutrientes certos para construir músculos, se recuperar e ter energia para treinar com intensidade.',
      },
      {
        type: 'section',
        title: 'Macronutrientes Essenciais',
        text: 'PROTEÍNAS (1,6-2,2g por kg de peso corporal)\n• Função: construção e reparo muscular\n• Fontes: carnes magras, ovos, peixes, laticínios, leguminosas\n• Quando: distribuídas ao longo do dia, especialmente pós-treino\n\nCARBOIDRATOS (3-5g por kg de peso corporal)\n• Função: energia para treinos e recuperação\n• Fontes: batata-doce, arroz integral, aveia, frutas\n• Quando: principalmente antes e após treinos\n\nGORDURAS (0,8-1g por kg de peso corporal)\n• Função: produção hormonal e absorção de vitaminas\n• Fontes: abacate, nozes, azeite, peixes gordurosos\n• Quando: distribuídas ao longo do dia',
      },
      {
        type: 'tip',
        title: 'Dica Prática',
        text: 'Planeje suas refeições com antecedência. Ter alimentos nutritivos prontos facilita manter uma alimentação adequada mesmo com rotina corrida.',
      },
      {
        type: 'section',
        title: 'Micronutrientes Importantes',
        text: 'Certifique-se de incluir alimentos ricos em:\n\n• CÁLCIO: essencial para saúde óssea e contração muscular\n  Fontes: laticínios, vegetais folhosos escuros, sardinha\n\n• FERRO: transporte de oxigênio para os músculos\n  Fontes: carnes vermelhas, feijões, espinafre\n\n• VITAMINA D: saúde óssea e função muscular\n  Fontes: sol (exposição moderada), peixes gordurosos, gema de ovo\n\n• ZINCO: recuperação e função imunológica\n  Fontes: carnes, sementes, nozes',
      },
      {
        type: 'section',
        title: 'Hidratação Adequada',
        text: 'Mantenha-se hidratado ao longo do dia:\n\n• Beba água regularmente, não apenas quando sentir sede\n• Durante treinos intensos: 150-250ml a cada 15-20 minutos\n• Após o treino: reidrate com água ou bebida esportiva se o treino foi muito intenso\n• Sinal de boa hidratação: urina clara ou amarela clara',
      },
      {
        type: 'section',
        title: 'Planejamento Alimentar',
        text: 'Estrutura básica de refeições:\n\n• CAFÉ DA MANHÃ: Proteína + Carboidrato + Gordura saudável\n  Exemplo: Ovos, aveia, frutas, nozes\n\n• ALMOÇO: Proteína + Carboidrato + Vegetais\n  Exemplo: Frango, arroz integral, salada, legumes\n\n• JANTAR: Similar ao almoço, pode ser mais leve\n• LANCHE PRÉ-TREINO: Carboidrato de fácil digestão\n• LANCHE PÓS-TREINO: Proteína + Carboidrato',
      },
    ],
    references: [
      'Jäger, R. et al. (2017). "International Society of Sports Nutrition Position Stand: protein and exercise". Journal of the International Society of Sports Nutrition.',
      'Kerksick, C. M. et al. (2018). "International Society of Sports Nutrition position stand: nutrient timing". Journal of the International Society of Sports Nutrition.',
      'Thomas, D. T. et al. (2016). "American College of Sports Medicine Joint Position Statement. Nutrition and Athletic Performance". Medicine & Science in Sports & Exercise.',
    ],
  },
  'n2': {
    title: 'Pré e Pós-Treino: O Que Comer',
    category: 'nutrition',
    readTime: 9,
    content: [
      {
        type: 'section',
        title: 'A Janela Nutricional',
        text: 'O que você come antes e depois do treino pode impactar significativamente sua performance e recuperação. Vamos entender o timing ideal para maximizar seus resultados.',
      },
      {
        type: 'section',
        title: 'Nutrição Pré-Treino (30-90 minutos antes)',
        text: 'Objetivo: Fornecer energia sem causar desconforto digestivo\n\nO QUE COMER:\n• Carboidratos de fácil digestão: banana, aveia, batata-doce\n• Pouca proteína: iogurte, shake proteico leve\n• Evite: gorduras, fibras em excesso, refeições grandes\n\nEXEMPLOS PRÁTICOS:\n• 1 banana + café\n• Aveia com frutas (30g de aveia)\n• Pão integral com mel (1-2 fatias)\n• Smoothie de frutas\n\nQUANTO TEMPO ANTES:\n• Refeição completa: 2-3 horas\n• Lanche leve: 30-60 minutos',
      },
      {
        type: 'tip',
        title: 'Dica de Performance',
        text: 'Se você treina de manhã cedo, um pequeno carboidrato (como uma banana) pode ser suficiente. Experimente para encontrar o que funciona melhor para você.',
      },
      {
        type: 'section',
        title: 'Nutrição Durante o Treino',
        text: 'Para a maioria das sessões de calistenia (até 60 minutos), água é suficiente. Considere carboidratos apenas se:\n\n• Treino durar mais de 90 minutos\n• Treino muito intenso (circuitos longos)\n• Você se sente fraco durante o treino\n\nOpções: Bebida esportiva diluída, géis energéticos, frutas secas',
      },
      {
        type: 'section',
        title: 'Nutrição Pós-Treino (até 2 horas após)',
        text: 'Objetivo: Reparar músculos e repor energia\n\nO QUE COMER:\n• PROTEÍNA (20-40g): essencial para reparo muscular\n  Fontes: frango, peixe, ovos, whey protein, quinoa\n\n• CARBOIDRATOS (30-60g): repõem glicogênio\n  Fontes: batata-doce, arroz, frutas, pão integral\n\nEXEMPLOS PRÁTICOS:\n• Frango grelhado + arroz integral + legumes\n• Ovos mexidos + batata-doce + vegetais\n• Smoothie: whey protein + banana + aveia\n• Salmão + quinoa + salada',
      },
      {
        type: 'section',
        title: 'Timing Ideal',
        text: '• 0-30 minutos pós-treino: Ideal para proteína rápida (shake)\n• 1-2 horas pós-treino: Refeição completa com proteína, carboidrato e vegetais\n\nImportante: Não precisa ser imediatamente após o treino, mas tente dentro de 2 horas para otimizar a recuperação.',
      },
      {
        type: 'section',
        title: 'Suplementação Pós-Treino',
        text: 'Suplementos podem ser úteis mas não são essenciais:\n\n• WHEY PROTEIN: conveniente e rápida absorção\n• CREATINA: pode ajudar na força e recuperação (3-5g/dia)\n• BCAA: geralmente desnecessário se você consome proteína adequada\n\nLembre-se: suplementos complementam, não substituem uma alimentação adequada.',
      },
    ],
    references: [
      'Aragon, A. A. & Schoenfeld, B. J. (2013). "Nutrient timing revisited: is there a post-exercise anabolic window?". Journal of the International Society of Sports Nutrition.',
      'Kerksick, C. M. et al. (2017). "International Society of Sports Nutrition position stand: nutrient timing". Journal of the International Society of Sports Nutrition.',
      'Ivy, J. L. (2004). "Regulation of muscle glycogen repletion, muscle protein synthesis and repair following exercise". Journal of Sports Science & Medicine.',
    ],
  },
  'n3': {
    title: 'Hidratação e Performance',
    category: 'nutrition',
    readTime: 6,
    content: [
      {
        type: 'section',
        title: 'Por que a hidratação importa?',
        text: 'A água representa 60-70% do peso corporal e é essencial para praticamente todas as funções do corpo. Durante o exercício, perdemos água através do suor, e mesmo uma desidratação leve (2% do peso corporal) pode prejudicar significativamente a performance.',
      },
      {
        type: 'section',
        title: 'Efeitos da Desidratação',
        text: 'Quando você está desidratado:\n\n• Performance diminui (até 30% com 3% de desidratação)\n• Frequência cardíaca aumenta\n• Regulação de temperatura corporal fica prejudicada\n• Fadiga aparece mais rapidamente\n• Concentração e coordenação são afetadas\n• Risco de cãibras aumenta',
      },
      {
        type: 'tip',
        title: 'Sinal de Alerta',
        text: 'Sede já é um sinal de desidratação leve. Não espere sentir sede para beber água - mantenha-se hidratado proativamente.',
      },
      {
        type: 'section',
        title: 'Quanto Beber?',
        text: 'RECOMENDAÇÕES GERAIS:\n• Diariamente: 2-3 litros de água (8-12 copos)\n• Antes do treino: 500ml nas 2 horas anteriores\n• Durante o treino: 150-250ml a cada 15-20 minutos\n• Após o treino: reponha o que perdeu (pese-se antes e depois para calcular)\n\nFATORES QUE AUMENTAM NECESSIDADES:\n• Clima quente e úmido\n• Treinos longos ou muito intensos\n• Suor excessivo\n• Altitude elevada',
      },
      {
        type: 'section',
        title: 'Como Saber se Está Bem Hidratado?',
        text: '• COR DA URINA:\n  - Clara ou amarela clara: bem hidratado ✓\n  - Amarela escura: precisa beber mais água\n  - Marrom ou muito escura: desidratação grave (consulte médico)\n\n• OUTROS SINAIS:\n  - Boca seca ou pegajosa\n  - Fadiga sem motivo aparente\n  - Tontura ao levantar\n  - Cãibras musculares frequentes',
      },
      {
        type: 'section',
        title: 'Água vs Bebidas Esportivas',
        text: 'ÁGUA é suficiente para:\n• Maioria dos treinos de calistenia (até 60 minutos)\n• Treinos de intensidade moderada\n• Hidratação diária geral\n\nBEBIDAS ESPORTIVAS considerem para:\n• Treinos muito longos (90+ minutos)\n• Treinos extremamente intensos\n• Quando você suar muito (clima quente)\n• Treinos de resistência de alta intensidade\n\nO objetivo: repor eletrólitos (sódio, potássio) perdidos no suor.',
      },
      {
        type: 'section',
        title: 'Dicas Práticas',
        text: '• Mantenha uma garrafa de água sempre à vista\n• Beba pequenos goles ao longo do dia\n• Adicione limão ou frutas para dar sabor\n• Use apps ou lembretes para beber água regularmente\n• Monitore a cor da urina como indicador\n• Após treinos intensos, considere água com uma pitada de sal',
      },
    ],
    references: [
      'Sawka, M. N. et al. (2007). "American College of Sports Medicine position stand. Exercise and fluid replacement". Medicine & Science in Sports & Exercise.',
      'Casa, D. J. et al. (2000). "National Athletic Trainers\' Association Position Statement: Fluid Replacement for Athletes". Journal of Athletic Training.',
      'Armstrong, L. E. (2005). "Hydration assessment techniques". Nutrition Reviews.',
    ],
  },

  // GUIAS DE PROGRESSÃO
  'p1': {
    title: 'Do Iniciante ao Intermediário',
    category: 'progression',
    readTime: 15,
    content: [
      {
        type: 'section',
        title: 'O Caminho da Progressão',
        text: 'A progressão na calistenia não é linear. Cada pessoa tem seu ritmo, mas seguir uma estrutura lógica acelera seus resultados e previne lesões. Este guia leva você dos primeiros movimentos até um nível intermediário sólido.',
      },
      {
        type: 'section',
        title: 'Fase 1: Fundamentos (Semanas 1-8)',
        text: 'Objetivo: Dominar os movimentos básicos\n\nSEMANA 1-2:\n• Aprenda a técnica correta de cada exercício\n• Foque em flexões inclinadas, agachamentos assistidos, pranchas\n• 3 treinos por semana, 30-40 minutos cada\n• Volume: 2-3 séries de 5-8 repetições\n\nSEMANA 3-4:\n• Aumente para flexões no chão (quando possível)\n• Agachamentos completos\n• Pranchas por 30-45 segundos\n• Volume: 3 séries de 8-10 repetições\n\nSEMANA 5-8:\n• Consolide os movimentos básicos\n• Aumente gradualmente as repetições\n• Adicione variações: flexões com pés elevados, prancha lateral\n• Volume: 3 séries de 10-15 repetições',
      },
      {
        type: 'tip',
        title: 'Regra de Ouro',
        text: 'Não avance para o próximo nível até dominar completamente o nível atual. A técnica perfeita é mais importante que números impressionantes.',
      },
      {
        type: 'section',
        title: 'Fase 2: Construção de Base (Semanas 9-16)',
        text: 'Objetivo: Construir volume e força\n\nSEMANA 9-12:\n• Flexões: 3 séries de 15-20 repetições\n• Agachamentos: 3 séries de 20-25 repetições\n• Introduza barra fixa (negativas ou assistidas)\n• Pranchas: 3 séries de 45-60 segundos\n• Adicione dips (assistidos se necessário)\n\nSEMANA 13-16:\n• Aumente volume total\n• Introduza exercícios compostos: burpees, mountain climbers\n• Trabalhe estabilização: prancha com elevação de braço/perna\n• Comece a pensar em splits de treino (push/pull/legs)',
      },
      {
        type: 'section',
        title: 'Fase 3: Intermediário (Semanas 17-24)',
        text: 'Objetivo: Desenvolver força e introduzir variações avançadas\n\nVariações para trabalhar:\n• FLEXÕES: Diamante, com pés elevados, archer (um braço assistido)\n• BARRA: Pull-ups completos, chin-ups, wide grip\n• AGACHAMENTOS: Pistol squat assistido, jump squats\n• DIPS: Completos, em paralelas ou cadeira\n• CORE: L-sit progressivo, hollow body holds\n\nEstrutura de treino:\n• 4 vezes por semana\n• Split: Push/Pull/Legs/Core ou Full Body alternado\n• Volume: 4 séries de 8-12 repetições',
      },
      {
        type: 'section',
        title: 'Marcos de Progresso',
        text: 'Você está pronto para o próximo nível quando conseguir:\n\n✓ 3 séries de 20 flexões com técnica perfeita\n✓ 3 séries de 10 pull-ups completos\n✓ 3 séries de 20 agachamentos com salto\n✓ 3 séries de 10 dips completos\n✓ Prancha por 2 minutos\n✓ 3 séries de 30 segundos de hollow body hold',
      },
      {
        type: 'section',
        title: 'Erros Comuns a Evitar',
        text: '• Progressar muito rápido e perder a técnica\n• Negligenciar exercícios de puxar (desequilíbrio muscular)\n• Não descansar o suficiente entre treinos\n• Focar apenas em um grupo muscular\n• Ignorar mobilidade e flexibilidade\n• Comparar seu progresso com outros',
      },
    ],
    references: [
      'Ralston, G. W. et al. (2018). "The effect of weekly set volume on strength gain". Journal of Strength and Conditioning Research.',
      'Schoenfeld, B. J. et al. (2016). "Effects of resistance training frequency on measures of muscle hypertrophy". Sports Medicine.',
      'Grgic, J. et al. (2020). "Effect of resistance training frequency on gains in muscular strength". Sports Medicine.',
    ],
  },
  'p2': {
    title: 'Progressões de Movimentos Avançados',
    category: 'progression',
    readTime: 18,
    content: [
      {
        type: 'section',
        title: 'Preparação para Movimentos Avançados',
        text: 'Antes de buscar movimentos avançados como handstand, muscle-up ou planche, certifique-se de ter uma base sólida: força adequada, flexibilidade, controle corporal e experiência com movimentos fundamentais.',
      },
      {
        type: 'section',
        title: 'HANDSTAND (Parada de Mãos)',
        text: 'Pré-requisitos:\n• 10 push-ups com técnica perfeita\n• Flexibilidade de ombros adequada\n• Core forte\n\nProgressão:\n1. Prancha com pés elevados (fortalecer ombros)\n2. Handstand na parede (frente para a parede)\n3. Handstand na parede de costas (equilíbrio)\n4. Handstand kick-up (impulso para a parada)\n5. Handstand livre (prática de equilíbrio)\n\nFoco:\n• Fortalecer deltoides e core\n• Desenvolver controle e consciência corporal\n• Trabalhar mobilidade de ombros\n• Praticar diariamente (mesmo 5 minutos faz diferença)',
      },
      {
        type: 'tip',
        title: 'Dica para Handstand',
        text: 'O equilíbrio vem do core e dos dedos das mãos. Mantenha o corpo rígido como uma tábua e faça microajustes com os dedos.',
      },
      {
        type: 'section',
        title: 'MUSCLE-UP',
        text: 'Pré-requisitos:\n• 10 pull-ups completos\n• 10 dips completos\n• Força de transição adequada\n\nProgressão:\n1. Pull-ups explosivos (chest to bar)\n2. Transição assistida (com elástico ou balanço)\n3. Muscle-up negativa (descer lentamente)\n4. Muscle-up completo\n\nTécnica:\n• Balanço controlado (kip) pode ajudar no início\n• Puxe até o peito na barra\n• Transfira o peso sobre a barra\n• Complete com dip\n\nFoco:\n• Força de puxar e empurrar\n• Coordenação e timing\n• Força de transição',
      },
      {
        type: 'section',
        title: 'PLANCHE',
        text: 'Pré-requisitos:\n• 20+ push-ups\n• L-sit por 10+ segundos\n• Flexibilidade de punhos e ombros\n\nProgressão:\n1. Frog stand (apoio na cabeça)\n2. Crow pose (apoio nos joelhos nos braços)\n3. Tucked planche (joelhos no peito)\n4. Advanced tucked planche (joelhos mais altos)\n5. Straddle planche (pernas abertas)\n6. Full planche (pernas juntas e estendidas)\n\nFoco:\n• Força incrível de ombros e core\n• Flexibilidade de punhos\n• Aumente gradualmente - este é um movimento muito avançado\n• Pode levar meses ou anos para dominar',
      },
      {
        type: 'section',
        title: 'FRONT LEVER',
        text: 'Pré-requisitos:\n• 10 pull-ups\n• Core muito forte\n• Flexibilidade de ombros\n\nProgressão:\n1. Dead hang (pendurar na barra)\n2. Tucked front lever (joelhos no peito)\n3. One leg front lever (uma perna estendida)\n4. Advanced tucked (joelhos mais altos)\n5. Straddle front lever (pernas abertas)\n6. Full front lever (pernas juntas)\n\nFoco:\n• Força das costas (lats) e core\n• Controle isométrico\n• Flexibilidade de ombros e coluna',
      },
      {
        type: 'section',
        title: 'Princípios Gerais de Progressão',
        text: '• DOMINE CADA ETAPA antes de avançar\n• TRABALHE FORÇA AUXILIAR: exercícios que fortalecem músculos específicos necessários\n• DESCANSE ADEQUADAMENTE: movimentos avançados são muito desgastantes\n• SEJA PACIENTE: alguns movimentos levam meses ou anos\n• TRABALHE MOBILIDADE: flexibilidade é crucial para movimentos avançados\n• REGISTRE SEU PROGRESSO: vídeos ajudam a identificar problemas na técnica',
      },
    ],
    references: [
      'Behm, D. G. et al. (2010). "The use of instability to train the core musculature". Applied Physiology, Nutrition, and Metabolism.',
      'McGill, S. M. et al. (2009). "Kinesiological basis for conditioning strength and power exercises". Strength and Conditioning Journal.',
      'Calatayud, J. et al. (2015). "Progression model in resistance training for healthy adults". Medicine & Science in Sports & Exercise.',
    ],
  },
  'p3': {
    title: 'Periodização para Calistenia',
    category: 'progression',
    readTime: 14,
    content: [
      {
        type: 'section',
        title: 'O que é Periodização?',
        text: 'Periodização é o planejamento estruturado do treino ao longo do tempo para maximizar resultados e evitar platôs. Em vez de fazer sempre a mesma coisa, você varia volume, intensidade e foco para continuar progredindo.',
      },
      {
        type: 'section',
        title: 'Por que Periodizar?',
        text: 'Benefícios:\n\n• Evita platôs de performance\n• Previne overtraining\n• Permite recuperação adequada\n• Mantém motivação alta\n• Otimiza adaptações do corpo\n• Reduz risco de lesões\n\nSem periodização, você pode ficar preso no mesmo nível ou até regredir.',
      },
      {
        type: 'section',
        title: 'Modelo de Periodização Linear',
        text: 'CICLO DE 12 SEMANAS:\n\nMES 1 (Semanas 1-4): VOLUME\n• Foco: Construir base, técnica, resistência\n• Volume: Alto (3-5 séries de 12-20 repetições)\n• Intensidade: Moderada (60-70% do máximo)\n• Frequência: 4-5 vezes por semana\n• Exemplo: 4 séries de 15 flexões, 4 séries de 15 agachamentos\n\nMES 2 (Semanas 5-8): HÍBRIDO\n• Foco: Manter volume, aumentar intensidade\n• Volume: Médio (3-4 séries de 8-12 repetições)\n• Intensidade: Média-Alta (70-80%)\n• Frequência: 3-4 vezes por semana\n• Exemplo: 3 séries de 10 flexões com pés elevados\n\nMES 3 (Semanas 9-12): INTENSIDADE\n• Foco: Força máxima, movimentos avançados\n• Volume: Baixo (3 séries de 3-8 repetições)\n• Intensidade: Alta (80-95%)\n• Frequência: 3 vezes por semana\n• Exemplo: 3 séries de 5 archer push-ups',
      },
      {
        type: 'tip',
        title: 'Semana de Descarga',
        text: 'A cada 4-6 semanas, faça uma semana mais leve (50% do volume normal) para permitir recuperação completa e prevenir overtraining.',
      },
      {
        type: 'section',
        title: 'Periodização Ondulatória (Semanal)',
        text: 'Variação dentro da mesma semana:\n\nSEGUNDA: FORÇA\n• Volume baixo, intensidade alta\n• 3 séries de 3-6 repetições de movimentos difíceis\n\nQUARTA: HÍBRIDO\n• Volume médio, intensidade média\n• 3 séries de 8-12 repetições\n\nSEXTA: RESISTÊNCIA\n• Volume alto, intensidade baixa\n• 3-4 séries de 15-25 repetições\n\nBenefício: Estimula diferentes adaptações musculares na mesma semana.',
      },
      {
        type: 'section',
        title: 'Split de Treino Periodizado',
        text: 'EXEMPLO DE 4 DIAS:\n\nDIA 1 - PUSH (Força)\n• Flexões com variação difícil: 3x5\n• Dips pesados: 3x5\n• Overhead press: 3x6\n\nDIA 2 - PULL (Força)\n• Pull-ups pesados: 3x5\n• Rows: 3x6\n• Curls: 3x8\n\nDIA 3 - LEGS & CORE\n• Pistol squats: 3x5 cada perna\n• Jump squats: 3x8\n• Core complex: 3 rounds\n\nDIA 4 - FULL BODY (Resistência)\n• Circuito: 4 rounds de 8 exercícios\n• Alta intensidade, volume moderado\n\nAlternar semanas de força e resistência.',
      },
      {
        type: 'section',
        title: 'Indicadores para Ajustar',
        text: 'Ajuste seu plano se:\n\n✓ Você atinge as metas de repetições facilmente\n✓ Não há progresso há 2+ semanas\n✓ Você se sente sempre exausto\n✓ Performance está diminuindo\n✓ Motivação está baixa\n\nSinais de que está funcionando:\n✓ Progresso consistente\n✓ Energia e motivação altas\n✓ Recuperação adequada\n✓ Sem dores articulares',
      },
    ],
    references: [
      'Kraemer, W. J. & Ratamess, N. A. (2004). "Fundamentals of resistance training: progression and exercise prescription". Medicine & Science in Sports & Exercise.',
      'Rhea, M. R. et al. (2003). "A meta-analysis to determine the dose response for strength development". Medicine & Science in Sports & Exercise.',
      'Williams, T. D. et al. (2017). "Comparison of periodized and non-periodized resistance training programs". Journal of Strength and Conditioning Research.',
    ],
  },

  // RECUPERAÇÃO
  'r1': {
    title: 'Importância do Descanso',
    category: 'recovery',
    readTime: 10,
    content: [
      {
        type: 'section',
        title: 'Por que o descanso é essencial',
        text: 'O descanso é uma parte fundamental do processo de crescimento muscular e melhoria da performance. Durante o exercício, causamos microlesões nas fibras musculares, e é durante o descanso que o corpo repara e fortalece essas fibras, resultando em ganhos de força e massa muscular.',
      },
      {
        type: 'section',
        title: 'O que acontece durante o descanso',
        text: 'Durante o período de recuperação, o corpo:\n\n• Repara as fibras musculares danificadas\n• Repõe as reservas de energia (glicogênio)\n• Remove metabólitos e produtos de degradação\n• Fortalece o sistema imunológico\n• Melhora a síntese de proteínas musculares\n• Regula hormônios (testosterona, cortisol)\n• Restaura o sistema nervoso central',
      },
      {
        type: 'tip',
        title: 'Regra do Descanso',
        text: 'Para melhores resultados, aguarde pelo menos 48 horas antes de treinar o mesmo grupo muscular novamente. Isso permite recuperação completa e supercompensação.',
      },
      {
        type: 'section',
        title: 'Sinais de que você precisa descansar',
        text: 'Preste atenção a estes sinais:\n\n• Fadiga persistente mesmo após dormir bem\n• Diminuição do desempenho nos treinos\n• Dores musculares prolongadas (DOMS excessivo)\n• Alterações no sono (insônia ou sono inquieto)\n• Irritabilidade ou mudanças de humor\n• Perda de apetite ou apetite excessivo\n• Frequência cardíaca elevada em repouso\n• Sistema imunológico fraco (doenças frequentes)',
      },
      {
        type: 'section',
        title: 'Tipos de Descanso',
        text: 'DESCANSO ATIVO:\n• Atividades leves: caminhada, alongamento, yoga\n• Melhora circulação e acelera recuperação\n• Pode ser feito em dias de "descanso"\n\nDESCANSO PASSIVO:\n• Relaxamento total\n• Sono adequado (7-9 horas)\n• Redução de estresse mental e físico\n\nDESCANSO COMPLETO:\n• Sem exercícios físicos\n• Foco em recuperação\n• Importante após treinos muito intensos',
      },
      {
        type: 'section',
        title: 'Planejamento de Descanso',
        text: 'Estrutura recomendada:\n\n• SEMANAL: 1-2 dias de descanso completo\n• PÓS-TREINO: 24-48 horas antes de treinar o mesmo grupo muscular\n• MENSAL: 1 semana mais leve (descarga) após 3-4 semanas de treino intenso\n• ANUAL: 1-2 semanas completas de descanso para evitar overtraining crônico',
      },
    ],
    references: [
      'Kreher, J. B. & Schwartz, J. B. (2012). "Overtraining syndrome: a practical guide". Sports Health.',
      'Meeusen, R. et al. (2013). "Prevention, diagnosis, and treatment of the overtraining syndrome". European Journal of Sport Science.',
      'Kellmann, M. (2010). "Preventing overtraining in athletes in high-intensity sports and stress/recovery monitoring". Scandinavian Journal of Medicine & Science in Sports.',
    ],
  },
  'r2': {
    title: 'Alongamento e Mobilidade',
    category: 'recovery',
    readTime: 12,
    content: [
      {
        type: 'section',
        title: 'Alongamento vs Mobilidade',
        text: 'Embora relacionados, alongamento e mobilidade são diferentes:\n\n• ALONGAMENTO: Capacidade de esticar passivamente um músculo\n• MOBILIDADE: Capacidade de mover uma articulação através de sua amplitude completa de movimento com controle\n\nPara calistenia, ambos são importantes, mas a mobilidade é especialmente crucial.',
      },
      {
        type: 'section',
        title: 'Tipos de Alongamento',
        text: 'ALONGAMENTO DINÂMICO (Antes do treino)\n• Movimentos ativos que preparam o corpo\n• Aumenta fluxo sanguíneo e temperatura\n• Exemplos: círculos de braço, leg swings, cat-cow\n• Duração: 5-10 minutos\n\nALONGAMENTO ESTÁTICO (Após o treino)\n• Mantenha posição por 30-60 segundos\n• Não force até sentir dor\n• Foque em músculos trabalhados\n• Duração: 10-15 minutos\n\nALONGAMENTO ESTÁTICO PASSIVO (Dias de descanso)\n• Sessões mais longas e relaxadas\n• Foque em áreas tensas\n• Use para melhorar flexibilidade geral\n• Duração: 20-30 minutos',
      },
      {
        type: 'tip',
        title: 'Timing Importante',
        text: 'Evite alongamento estático intenso antes do treino - pode reduzir força e performance. Use alongamento dinâmico para aquecer.',
      },
      {
        type: 'section',
        title: 'Rutina de Mobilidade para Calistenia',
        text: 'OMBROS (Crucial para handstand, planche):\n• Círculos de braço: 2x10 em cada direção\n• Wall slides: 2x10\n• Dislocates com band/towel: 2x10\n• Shoulder CARs (Controlled Articular Rotations)\n\nQUADRIS (Para agachamentos profundos):\n• Hip circles: 2x10 cada lado\n• Leg swings: 2x10 frente/lado\n• Cossack squats: 2x5 cada lado\n• 90/90 stretches\n\nCOLUNA (Para movimentos de core):\n• Cat-cow: 2x10\n• Spinal twists: 2x10 cada lado\n• Dead hang (descompressão)\n• Back bridge progressivo\n\nPUNHOS (Para suportes, planche):\n• Wrist circles: 2x10\n• Wrist stretches: segure 30s cada\n• Finger walks na parede',
      },
      {
        type: 'section',
        title: 'Frequência Recomendada',
        text: '• ANTES DO TREINO: 5-10 minutos de mobilidade dinâmica\n• APÓS O TREINO: 10-15 minutos de alongamento estático\n• DIAS DE DESCANSO: 20-30 minutos de sessão completa\n• SEMANAL: 1-2 sessões focadas em áreas problemáticas',
      },
      {
        type: 'section',
        title: 'Benefícios Comprovados',
        text: '• Reduz tensão muscular pós-treino\n• Melhora amplitude de movimento\n• Pode ajudar a prevenir lesões\n• Ajuda na recuperação\n• Melhora postura\n• Reduz dor muscular tardia (DOMS)\n• Melhora performance em movimentos que requerem flexibilidade',
      },
    ],
    references: [
      'Shrier, I. (2004). "Does stretching improve performance? A systematic and critical review of the literature". Clinical Journal of Sport Medicine.',
      'McHugh, M. P. & Cosgrave, C. H. (2010). "To stretch or not to stretch: the role of stretching in injury prevention and performance". Scandinavian Journal of Medicine & Science in Sports.',
      'Page, P. (2012). "Current concepts in muscle stretching for exercise and rehabilitation". International Journal of Sports Physical Therapy.',
    ],
  },
  'r3': {
    title: 'Sono e Recuperação',
    category: 'recovery',
    readTime: 8,
    content: [
      {
        type: 'section',
        title: 'Sono: O Suplemento Mais Poderoso',
        text: 'Se você treina calistenia regularmente, o sono não é luxo - é essencial. Durante o sono profundo, seu corpo realiza processos críticos de recuperação que nenhum suplemento pode replicar.',
      },
      {
        type: 'section',
        title: 'O que Acontece Durante o Sono',
        text: 'Durante as diferentes fases do sono:\n\n• FASE REM: Consolidação de memórias motoras (aprender novos movimentos)\n• SONO PROFUNDO: Liberação de hormônio do crescimento (GH)\n• REPARAÇÃO CELULAR: Síntese proteica muscular\n• REGULAÇÃO HORMONAL: Testosterona, cortisol\n• SISTEMA IMUNOLÓGICO: Fortalecimento das defesas\n• PROCESSAMENTO METABÓLICO: Regulação de açúcar no sangue',
      },
      {
        type: 'section',
        title: 'Quantas Horas?',
        text: 'RECOMENDAÇÕES POR IDADE:\n\n• Adultos (18-64 anos): 7-9 horas por noite\n• Adultos mais velhos (65+): 7-8 horas\n• Atletas/Treinamento intenso: 8-10 horas\n\nPara praticantes de calistenia:\n• Mínimo: 7 horas\n• Ideal: 8-9 horas\n• Durante períodos de treino intenso: até 10 horas',
      },
      {
        type: 'tip',
        title: 'Qualidade > Quantidade',
        text: '9 horas de sono fragmentado são piores que 7 horas de sono profundo e ininterrupto. Foque na qualidade tanto quanto na quantidade.',
      },
      {
        type: 'section',
        title: 'Sono e Performance',
        text: 'Impactos da falta de sono:\n\n• FORÇA: Redução de 10-30% na força máxima\n• RESISTÊNCIA: Diminuição significativa\n• COORDENAÇÃO: Piora na técnica\n• TEMPO DE REAÇÃO: Aumenta (mais lento)\n• RISCO DE LESÃO: Aumenta 1,7x\n• RECUPERAÇÃO: Muito mais lenta\n• APETITE: Desregulado (mais fome, piores escolhas)',
      },
      {
        type: 'section',
        title: 'Como Melhorar o Sono',
        text: 'HIGIENE DO SONO:\n\n• HORÁRIO REGULAR: Durma e acorde sempre no mesmo horário (mesmo nos fins de semana)\n• ROTINA PRÉ-SONO: 30-60 minutos relaxando antes de dormir\n• AMBIENTE: Quarto escuro, fresco (18-20°C), silencioso\n• EVITE TELAS: 1-2 horas antes de dormir (luz azul atrapalha)\n• CAFEÍNA: Evite após 14h (ou 8h antes de dormir)\n• ÁLCOOL: Interfere na qualidade do sono (mesmo que ajude a pegar no sono)\n• EXERCÍCIO: Evite treinos intensos 2-3 horas antes de dormir',
      },
      {
        type: 'section',
        title: 'Sinais de Sono Insuficiente',
        text: 'Você pode precisar de mais sono se:\n\n• Precisa de despertador para acordar\n• Sente sono durante o dia\n• Depende de café para funcionar\n• Mudanças de humor frequentes\n• Fadiga constante apesar de treinar\n• Performance estagnada ou regredindo\n• Fome excessiva ou desregulada\n• Sistema imunológico fraco',
      },
      {
        type: 'section',
        title: 'Sestas (Power Naps)',
        text: 'Para atletas, sestas curtas podem ajudar:\n\n• DURAÇÃO: 20-30 minutos (ideal)\n• QUANDO: Meio-dia ou início da tarde\n• NÃO: Sestas longas (60+ min) ou tarde demais (depois das 15h)\n\nBenefícios: Melhora alerta, performance e recuperação sem atrapalhar o sono noturno.',
      },
    ],
    references: [
      'Fullagar, H. H. et al. (2015). "Sleep and athletic performance: the effects of sleep loss on exercise performance, and physiological and cognitive responses to exercise". Sports Medicine.',
      'Dattilo, M. et al. (2011). "Sleep and muscle recovery: endocrinological and molecular basis for a new and promising hypothesis". Medical Hypotheses.',
      'Watson, A. M. (2017). "Sleep and Athletic Performance". Current Sports Medicine Reports.',
    ],
  },
  'r4': {
    title: 'Quando Descansar: Sinais do Corpo',
    category: 'recovery',
    readTime: 7,
    content: [
      {
        type: 'section',
        title: 'Escute seu corpo',
        text: 'Seu corpo sempre dá sinais quando precisa de descanso. Aprender a reconhecer esses sinais é essencial para evitar overtraining e lesões. A calistenia exige muito do corpo, e ignorar os sinais pode levar a regressão ou lesões sérias.',
      },
      {
        type: 'section',
        title: 'Sinais claros de necessidade de descanso',
        text: 'SINAIS FÍSICOS:\n• Dores articulares persistentes (não apenas muscular)\n• Fadiga extrema mesmo após dormir bem\n• Dores musculares que não melhoram após 72 horas\n• Lesões recorrentes ou dores que pioram durante o treino\n• Diminuição de força ou resistência\n• Tremores ou fraqueza durante exercícios\n• Náusea ou tontura durante ou após treinos\n\nSINAIS MENTAIS:\n• Falta de motivação para treinar\n• Sensação de "não conseguir" mentalmente\n• Irritabilidade ou mudanças de humor\n• Dificuldade de concentração\n• Ansiedade ou depressão relacionada ao treino\n\nSINAIS FISIOLÓGICOS:\n• Frequência cardíaca em repouso elevada (5-10 bpm acima do normal)\n• Alterações no apetite (excesso ou falta)\n• Sono perturbado ou insônia\n• Sistema imunológico fraco (resfriados frequentes)\n• Ganho ou perda de peso sem explicação',
      },
      {
        type: 'tip',
        title: 'Regra Prática',
        text: 'Se você sentir 3 ou mais desses sinais simultaneamente, considere um descanso completo de 2-3 dias antes de retornar aos treinos.',
      },
      {
        type: 'section',
        title: 'Monitoramento Diário',
        text: 'Faça uma autoavaliação diária:\n\n• Nível de energia ao acordar (1-10)\n• Qualidade do sono (1-10)\n• Nível de motivação (1-10)\n• Presença de dores (sim/não e onde)\n• Performance no treino anterior (1-10)\n\nSe as notas estiverem consistentemente baixas (abaixo de 5), considere um dia de descanso.',
      },
      {
        type: 'section',
        title: 'O que fazer no dia de descanso',
        text: 'Um dia de descanso não significa ser completamente sedentário:\n\n• Caminhada leve (20-30 minutos)\n• Alongamento suave (15-20 minutos)\n• Yoga ou meditação\n• Massagem ou automassagem\n• Alimentação nutritiva e hidratação\n• Sono adequado\n• Atividades relaxantes que você gosta\n\nEvite: Treinos intensos, muito estresse, álcool excessivo.',
      },
      {
        type: 'section',
        title: 'Quando retornar aos treinos',
        text: 'Você está pronto para treinar novamente quando:\n\n✓ Energia restaurada ao acordar\n✓ Dores musculares diminuíram significativamente\n✓ Motivação voltou\n✓ Sono está normalizado\n✓ Sem dores articulares\n✓ Performance mental melhorou\n\nComece com um treino mais leve e aumente gradualmente.',
      },
    ],
    references: [
      'Kreher, J. B. & Schwartz, J. B. (2012). "Overtraining syndrome: a practical guide". Sports Health.',
      'Urhausen, A. & Kindermann, W. (2002). "Diagnosis of overtraining: what tools do we have?". Sports Medicine.',
      'Cadegiani, F. A. & Kater, C. E. (2019). "Hormonal aspects of overtraining syndrome: a systematic review". BMC Sports Science, Medicine and Rehabilitation.',
    ],
  },
};

const categoryGradients = {
  articles: ['#FF6B35', '#FF8C42'],
  nutrition: ['#4CAF50', '#66BB6A'],
  progression: ['#2196F3', '#42A5F5'],
  recovery: ['#9C27B0', '#BA68C8'],
};

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({ navigation, route }) => {
  const { articleId, category } = route.params;
  const article = articleContent[articleId] || {
    title: 'Artigo não encontrado',
    content: [{ type: 'section', text: 'Conteúdo não disponível.' }],
  };
  const gradient = categoryGradients[category] || categoryGradients.articles;

  const renderContent = (item: any, index: number) => {
    if (item.type === 'section') {
      return (
        <View key={index} style={styles.section}>
          {item.title && (
            <Text style={styles.sectionTitle}>{item.title}</Text>
          )}
          <Text style={styles.sectionText}>{item.text}</Text>
        </View>
      );
    }
    
    if (item.type === 'tip') {
      return (
        <Card key={index} style={styles.tipCard} shadow>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color={Colors.warning} />
            <Text style={styles.tipTitle}>{item.title}</Text>
          </View>
          <Text style={styles.tipText}>{item.text}</Text>
        </Card>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={gradient}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.surface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Artigo</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Article Content */}
          <Card style={styles.articleCard} shadow>
            <View style={styles.articleHeader}>
              <View style={styles.readTimeBadge}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.readTimeText}>{article.readTime || 5} min de leitura</Text>
              </View>
            </View>
            <Text style={styles.articleTitle}>{article.title}</Text>
            
            {article.content && article.content.map((item: any, index: number) => 
              renderContent(item, index)
            )}

            {/* References */}
            {article.references && article.references.length > 0 && (
              <View style={styles.referencesContainer}>
                <Text style={styles.referencesTitle}>Referências</Text>
                {article.references.map((ref: string, index: number) => (
                  <Text key={index} style={styles.referenceText}>
                    {index + 1}. {ref}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: 'bold',
    color: Colors.surface,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  articleCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md,
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light,
  },
  readTimeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  articleTitle: {
    ...Typography.h1,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.lg,
    lineHeight: 32,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
  },
  tipCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tipText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  referencesContainer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  referencesTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  referenceText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
    fontSize: 11,
  },
});
