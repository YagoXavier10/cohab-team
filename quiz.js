// Quiz de jiu-jitsu em níveis de faixa: da branca (fácil) à preta (muito difícil)
(() => {
  const box = document.getElementById("quiz");
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const store = {
    get: () => { try { return JSON.parse(localStorage.getItem("quiz-faixas")) || {}; } catch { return {}; } },
    set: (v) => { try { localStorage.setItem("quiz-faixas", JSON.stringify(v)); } catch { /* sem armazenamento */ } },
  };

  // Fotos livres do Wikimedia Commons: [arquivo, autor, licença]
  const PHOTOS = {
    royce: ["Royce Gracie 2.jpg", "Peter Gordon", "CC BY 2.0"],
    helio: ["Helio Gracie in 2004.jpg", "Satorijits", "CC BY-SA 3.0"],
    carlos: ["Carlos Gracie (1951) (cropped).tif", "Correio da Manhã", "domínio público"],
    rickson: ["Rickson gracie 20080608.jpg", "Zekerags", "domínio público"],
    renzo: ["RenzoCropped.jpg", "Chris Hutt", "CC BY 3.0"],
    roger: ["RogerGracie.JPG", "Kerri Roberts", "CC BY-SA 3.0"],
    maeda: ["Mitsuyo Maeda c1910.jpg", "autor desconhecido", "domínio público"],
    kano: ["Jigoro-Kano-BW-4375px.jpg", "autor desconhecido", "domínio público"],
    lo: ["Leandro Lo Worlds IBJJF 2022.jpg", "Lu'nivers Athletics", "CC BY-SA 4.0"],
    dern: ["Mackenzie Dern.png", "Canal Faixa Preta", "CC BY 3.0"],
    gabi: ["Gabi Garcia.png", "Bruno Massami", "CC BY 3.0"],
    guarda: ["Brazilian Jiu-jitsu-Closed guard.jpg", "MartialArtsNomad.com", "CC BY 2.0"],
    mataleao: ["Rear naked choke.jpg", "Exército dos EUA", "domínio público"],
    triangulo: ["Triangle choke.jpeg", "Zoran Jerkovic", "CC BY-SA 4.0"],
    armlock: ["Armlock juji-gatame armbar.jpg", "Wikimedia Commons", "domínio público"],
    kimura: ["Brazilian Jiu-jitsu Kimura lock from guard.jpg", "Linsey Williams / Exército dos EUA", "domínio público"],
    katagatame: ["Arm triangle choke.jpg", "Eric Langley", "CC BY 2.0"],
    transicao: ["BJJ, brazilian-jiujitsu 04.jpg", "Yossigur", "CC BY-SA 4.0"],
  };

  // Cada pergunta: [pergunta, resposta certa, erradas, explicação, foto?]
  const LEVELS = [
    {
      id: "branca", name: "Faixa branca", tag: "Fácil", color: "#f2f2f2", ink: "#111",
      questions: [
        ["Qual é o cumprimento mais usado no tatame?", "Oss", ["Hajime", "Arigatô", "Salve"], "“Oss” serve para cumprimentar, agradecer e dizer que entendeu."],
        ["Quantos pontos vale a montada?", "4", ["2", "3", "6"], "A montada vale 4 pontos, assim como a pegada nas costas."],
        ["Quantos pontos vale uma raspagem?", "2", ["1", "3", "4"], "Sair de baixo e terminar por cima vale 2 pontos."],
        ["Quantos pontos vale a passagem de guarda?", "3", ["2", "4", "5"], "Passar a guarda e estabilizar ao lado vale 3 pontos."],
        ["Como se avisa que desistiu de uma finalização?", "Batendo (tapinhas)", ["Levantando a mão", "Gritando “chega”", "Saindo do tatame"], "Bate-se no parceiro ou no chão. Quem aplica deve soltar na hora."],
        ["Qual é a primeira faixa do jiu-jitsu adulto?", "Branca", ["Amarela", "Cinza", "Azul"], "Todo mundo começa na branca. Cinza e amarela são faixas infantis."],
        ["Qual faixa vem depois da azul?", "Roxa", ["Marrom", "Verde", "Preta"], "A ordem adulta é branca, azul, roxa, marrom e preta."],
        ["Como se chama a roupa de treino de tecido grosso?", "Kimono", ["Rash guard", "Dobok", "Collant"], "O kimono (gi) permite pegadas na gola e na manga."],
        ["Qual é esta posição?", "Guarda fechada", ["Montada", "Cem quilos", "Meia-guarda"], "Quem está por baixo prende o adversário com as pernas cruzadas nas costas dele.", "guarda"],
        ["Qual finalização está sendo aplicada?", "Mata-leão", ["Triângulo", "Guilhotina", "Kimura"], "O mata-leão é um estrangulamento pelas costas, com o braço em volta do pescoço.", "mataleao"],
        ["Quem é este lutador, campeão do primeiro UFC, em 1993?", "Royce Gracie", ["Rickson Gracie", "Anderson Silva", "Royler Gracie"], "Royce venceu o UFC 1 finalizando adversários bem maiores.", "royce"],
        ["Por cima ou por baixo: onde fica quem está “na guarda”?", "Por baixo", ["Por cima", "De pé", "De costas"], "Quem faz a guarda fica por baixo, controlando com as pernas."],
        ["Na montada, onde fica quem está por cima?", "Sentado sobre o tronco do adversário", ["De pé, de frente para ele", "Deitado ao lado dele", "Atrás dele, de joelhos"], "Na montada você senta sobre o tronco, com os dois joelhos no chão."],
        ["O que é o “rola” no treino?", "O treino livre, como uma luta", ["O aquecimento", "O cumprimento final", "Uma faixa infantil"], "No rola os colegas lutam de verdade, mas com controle e respeito."],
        ["O que é um “drill”?", "Repetir uma técnica muitas vezes", ["Um tipo de campeonato", "Uma corrida de aquecimento", "O alongamento final"], "O drill deixa a técnica automática antes de usar no rola."],
        ["Como se chama o piso acolchoado onde se treina?", "Tatame", ["Ringue", "Octógono", "Quadra"], "Entra-se no tatame descalço e cumprimentando."],
        ["Como é chamado o jiu-jitsu treinado sem kimono?", "NoGi", ["Gi", "Kickboxing", "Vale-tudo"], "No NoGi se luta de bermuda e camisa de lycra, sem pegar no tecido."],
        ["Quando uma luta termina por finalização, significa que…", "O adversário desistiu (bateu)", ["Alguém fez mais pontos", "O tempo acabou", "O árbitro deu empate"], "Finalizar é obrigar o adversário a bater, e isso vence na hora."],
        ["Qual destas técnicas é um estrangulamento?", "Triângulo", ["Kimura", "Americana", "Armlock"], "O triângulo aperta o pescoço; as outras são chaves de articulação."],
        ["“Cem quilos” é o nome de qual posição?", "Controle lateral", ["Montada", "Guarda fechada", "Pegada nas costas"], "Por cima, de lado e peito com peito. Em inglês, side control."],
        ["Em que bairro de São Paulo fica a Cohab Team?", "Itaquera", ["São Mateus", "Tatuapé", "Brás"], "A equipe nasceu na Cohab José Bonifácio, em Itaquera."],
        ["Como se chama o projeto social da Cohab?", "Nasci pra Vencer", ["Tatame Solidário", "Jiu-Jitsu para Todos", "Nova Geração"], "O projeto leva jiu-jitsu gratuito a crianças e jovens desde 1998."],
        ["O que são os “graus” de uma faixa?", "Listras que marcam a evolução", ["A cor da faixa", "A categoria de peso", "O número de vitórias"], "Os graus são as listras na ponta da faixa, dadas pelo professor."],
        ["Em que país nasceu o jujutsu, a luta que deu origem ao jiu-jitsu?", "Japão", ["China", "Brasil", "Coreia"], "O jujutsu era a luta corpo a corpo dos samurais japoneses."],
      ],
    },
    {
      id: "azul", name: "Faixa azul", tag: "Médio", color: "#1f4fbf", ink: "#fff",
      questions: [
        ["Que finalização feita com as pernas é esta?", "Triângulo", ["Armlock", "Omoplata", "Mata-leão"], "No triângulo, as pernas prendem o pescoço e um braço do adversário.", "triangulo"],
        ["Que chave de braço é esta?", "Armlock", ["Kimura", "Americana", "Triângulo"], "O armlock (juji-gatame) estica o cotovelo do adversário.", "armlock"],
        ["Qual chave está sendo aplicada da guarda?", "Kimura", ["Americana", "Armlock", "Guilhotina"], "A kimura torce o ombro para trás, com os dois braços.", "kimura"],
        ["Quem é este mestre, que adaptou o jiu-jitsu para depender de alavanca e não de força?", "Hélio Gracie", ["Carlos Gracie", "Jigoro Kano", "Rorion Gracie"], "Hélio era franzino e ajustou as técnicas para o mais fraco vencer o mais forte.", "helio"],
        ["Quem é esta campeã mundial de jiu-jitsu que foi lutar no UFC?", "Mackenzie Dern", ["Gabi Garcia", "Ronda Rousey", "Beatriz Mesquita"], "Mackenzie Dern foi campeã mundial na faixa preta antes de ir para o MMA.", "dern"],
        ["Quem é esta atleta, multicampeã mundial e do ADCC no peso pesado?", "Gabi Garcia", ["Mackenzie Dern", "Kyra Gracie", "Leticia Ribeiro"], "Gabi Garcia é uma das maiores campeãs da história do jiu-jitsu.", "gabi"],
        ["Quantos pontos vale o joelho na barriga?", "2", ["3", "4", "1"], "Joelho na barriga vale 2 pontos."],
        ["Quantos pontos vale a pegada nas costas?", "4", ["2", "3", "5"], "Com os dois ganchos por dentro, vale 4 pontos."],
        ["Em que ano foi o primeiro UFC?", "1993", ["1989", "1996", "2001"], "O UFC 1 foi em novembro de 1993, nos Estados Unidos."],
        ["A kimura leva o nome de quem?", "Masahiko Kimura, judoca japonês", ["Um lutador de sumô", "Um aluno de Hélio Gracie", "O criador do judô"], "Kimura venceu Hélio Gracie com essa chave em 1951."],
        ["O que é a meia-guarda?", "Prender só uma perna do adversário", ["Guarda com uma mão só", "Guarda de joelhos", "Metade da luta por baixo"], "Na meia-guarda, quem está por baixo prende uma perna do adversário entre as suas."],
        ["Qual é a idade mínima para a faixa azul?", "16 anos", ["12 anos", "14 anos", "18 anos"], "A azul é a primeira faixa adulta, a partir dos 16 anos."],
        ["Para que servem as vantagens?", "Desempatar a luta", ["Valem 1 ponto cada", "Dar tempo extra", "Anular uma punição"], "Vantagem é quando quase pontuou. Com pontos iguais, vence quem tem mais."],
        ["Qual articulação o armlock força?", "Cotovelo", ["Ombro", "Joelho", "Punho"], "O armlock estica o braço e força o cotovelo."],
        ["A kimura e a americana são chaves de quê?", "Ombro", ["Joelho", "Tornozelo", "Pescoço"], "As duas torcem o ombro, só que para lados opostos."],
        ["O que é a omoplata?", "Uma chave de ombro feita com as pernas", ["Um estrangulamento com a gola", "Uma chave de pé", "Uma queda de judô"], "Na omoplata, as pernas prendem o braço e torcem o ombro."],
        ["No triângulo, as pernas prendem o pescoço e…", "Um braço do adversário", ["Os dois braços", "As duas pernas", "A faixa"], "Um braço fica dentro e outro fora: por isso fecha o estrangulamento."],
        ["Qual é a idade mínima para a faixa roxa?", "16 anos", ["14 anos", "18 anos", "19 anos"], "A roxa pode vir a partir dos 16, mas depois de pelo menos 2 anos de azul."],
        ["Em que ano começou a Cohab Team?", "1998", ["1995", "2002", "2007"], "A Cohab começou em 1998, em Itaquera, com um único aluno."],
        ["Quem foi o primeiro aluno da Cohab?", "Dan, hoje Mestre Dan", ["Sérgio Moraes", "Diogo Almeida", "Fábio Gurgel"], "O primeiro aluno virou faixa preta e hoje lidera a equipe."],
        ["Na guarda aranha (spider), onde ficam os pés de quem está por baixo?", "Nos bíceps do adversário", ["No quadril do adversário", "Cruzados nas costas dele", "No chão"], "Na aranha, as mãos puxam as mangas e os pés empurram os bíceps."],
        ["O que caracteriza a guarda De La Riva?", "Um gancho por fora da perna do adversário", ["As pernas cruzadas nas costas", "Ficar de joelhos", "Prender só uma perna entre as suas"], "A De La Riva enrola uma perna por fora da perna da frente do adversário."],
        ["Em que cidade nasceu o ADCC, o maior torneio sem kimono?", "Abu Dhabi", ["Rio de Janeiro", "Las Vegas", "Tóquio"], "O ADCC (Abu Dhabi Combat Club) nasceu em 1998, nos Emirados Árabes."],
        ["Quantos pontos vale uma queda?", "2", ["1", "3", "4"], "Derrubar o adversário e ficar por cima vale 2 pontos."],
      ],
    },
    {
      id: "roxa", name: "Faixa roxa", tag: "Difícil", color: "#6a2fb3", ink: "#fff",
      questions: [
        ["Quem é este judoca japonês, o “Conde Koma”, que levou a luta ao Brasil?", "Mitsuyo Maeda", ["Jigoro Kano", "Masahiko Kimura", "Yukio Kato"], "Maeda chegou ao Brasil em 1914 e ensinou Carlos Gracie.", "maeda"],
        ["Quem é este, fundador do judô e do Kodokan?", "Jigoro Kano", ["Mitsuyo Maeda", "Gichin Funakoshi", "Morihei Ueshiba"], "Kano criou o judô em 1882 reunindo escolas de jujutsu.", "kano"],
        ["Quem é este Gracie, considerado por muitos o melhor da família?", "Rickson Gracie", ["Royce Gracie", "Renzo Gracie", "Roger Gracie"], "Rickson ficou famoso por ser invicto em desafios e no vale-tudo.", "rickson"],
        ["Quem é este Gracie, dono de academia famosa em Nova York?", "Renzo Gracie", ["Ralph Gracie", "Roger Gracie", "Royler Gracie"], "Na academia dele treinaram nomes como John Danaher e Georges St-Pierre.", "renzo"],
        ["Em que cidade Maeda se fixou no Brasil?", "Belém", ["Rio de Janeiro", "São Paulo", "Manaus"], "Foi em Belém do Pará que ele conheceu a família Gracie."],
        ["Onde foi a luta Hélio Gracie x Kimura, em 1951?", "No Maracanã", ["No Pacaembu", "No Ibirapuera", "Em Tóquio"], "A luta lotou o Maracanã, no Rio de Janeiro."],
        ["Em que ano foi fundada a CBJJ?", "1994", ["1985", "1998", "2003"], "A Confederação Brasileira de Jiu-Jitsu nasceu em 1994."],
        ["Em que cidade foi o primeiro Mundial de Jiu-Jitsu, em 1996?", "Rio de Janeiro", ["São Paulo", "Los Angeles", "Abu Dhabi"], "O Mundial só foi para a Califórnia anos depois."],
        ["Quem fundou a CBJJE, em 2007?", "Moisés Muradi", ["Carlos Gracie Jr.", "Fábio Gurgel", "Carlson Gracie"], "A CBJJE é uma das ligas em que a Cohab mais compete."],
        ["Este professor demonstra a transição para qual finalização?", "Armlock (juji-gatame)", ["Triângulo", "Kimura", "Estrangulamento de gola"], "Ele está girando para esticar o braço do parceiro: o juji-gatame.", "transicao"],
        ["Qual é o tempo mínimo na faixa azul antes da roxa?", "2 anos", ["1 ano", "3 anos", "6 meses"], "A IBJJF exige pelo menos 2 anos de faixa azul."],
        ["Quem entregou a faixa preta ao Mestre Dan, em 2005?", "Fernando Tererê", ["Fábio Gurgel", "Hélio Gracie", "Rolls Gracie"], "Foi o Fernando Tererê quem entregou a faixa preta ao Dan."],
        ["Com qual equipe a Cohab foi parceira de 2007 a 2018?", "Alliance", ["Gracie Barra", "Checkmat", "Atos"], "Nesse período a equipe se chamou Cohab Alliance Jiu-Jitsu."],
        ["Qual era o parentesco entre Carlos e Hélio Gracie?", "Irmãos", ["Pai e filho", "Primos", "Tio e sobrinho"], "Carlos era o mais velho e ensinou os irmãos, entre eles o caçula Hélio."],
        ["Royce Gracie é filho de quem?", "Hélio Gracie", ["Carlos Gracie", "Rorion Gracie", "Rickson Gracie"], "Royce, Rickson e Rorion são filhos de Hélio."],
        ["Qual Gracie ajudou a criar o UFC, em 1993?", "Rorion Gracie", ["Royce Gracie", "Renzo Gracie", "Carlson Gracie"], "Rorion idealizou o evento e escolheu o irmão Royce para lutar."],
        ["O que significa “jiu-jitsu” em japonês?", "Arte suave", ["Caminho da força", "Mão vazia", "Arte da guerra"], "“Jū” é suave e “jutsu” é arte ou técnica."],
        ["O judô foi criado a partir de qual luta?", "Jujutsu", ["Karatê", "Sumô", "Kendô"], "Kano tirou as técnicas mais perigosas do jujutsu e criou o judô."],
        ["Para qual estado dos EUA o Mundial de Jiu-Jitsu se mudou?", "Califórnia", ["Flórida", "Texas", "Nova York"], "O Mundial saiu do Brasil e foi para a Califórnia em 2007."],
        ["Qual é o tempo mínimo na faixa roxa antes da marrom?", "1 ano e meio", ["6 meses", "1 ano", "3 anos"], "A IBJJF exige pelo menos um ano e meio de roxa."],
        ["Em qual destes países a Cohab NÃO tem filial?", "Portugal", ["Argentina", "Chile", "Peru"], "As filiais fora do Brasil ficam na Argentina, no Chile, no Equador e no Peru."],
        ["Quantas unidades a Cohab tem no Brasil?", "16", ["4", "9", "30"], "São 16 unidades no Brasil, além das filiais em outros países."],
      ],
    },
    {
      id: "marrom", name: "Faixa marrom", tag: "Muito difícil", color: "#6b3e1e", ink: "#fff",
      questions: [
        ["Quem é este, o primeiro da família a aprender com Maeda?", "Carlos Gracie", ["Hélio Gracie", "George Gracie", "Gastão Gracie"], "Carlos aprendeu em Belém e passou a arte aos irmãos.", "carlos"],
        ["Quem é este faixa preta, neto de Carlos Gracie, famoso por finalizar quase todo mundo no Mundial?", "Roger Gracie", ["Ryron Gracie", "Kron Gracie", "Rener Gracie"], "Roger foi 10 vezes campeão mundial, famoso pelos estrangulamentos da montada.", "roger"],
        ["Quem é este campeão, morto em 2022 e lembrado como um dos maiores da sua geração?", "Leandro Lo", ["Lucas Lepri", "Rafael Mendes", "Marcus Buchecha"], "Leandro Lo foi oito vezes campeão mundial.", "lo"],
        ["Em que ano Jigoro Kano fundou o Kodokan?", "1882", ["1868", "1900", "1914"], "O Kodokan nasceu em Tóquio em 1882."],
        ["Em que ano Mitsuyo Maeda chegou ao Brasil?", "1914", ["1908", "1925", "1930"], "Depois de rodar o mundo lutando, Maeda chegou ao Brasil em 1914."],
        ["Em que ano Rolls Gracie morreu?", "1982", ["1975", "1990", "1993"], "Rolls morreu jovem, num acidente de asa-delta, em 1982."],
        ["Qual técnica de inversão ficou famosa com os irmãos Mendes?", "Berimbolo", ["Toreando", "Omoplata", "Lapela"], "O berimbolo leva às costas a partir da guarda De La Riva."],
        ["Qual é a idade mínima para a faixa preta?", "19 anos", ["16 anos", "18 anos", "21 anos"], "A faixa preta só pode ser dada a partir dos 19 anos."],
        ["Qual destas NÃO é uma faixa infantil?", "Roxa", ["Cinza", "Amarela", "Laranja"], "As infantis são cinza, amarela, laranja e verde."],
        ["De que cores é a faixa coral do 7º grau?", "Vermelha e preta", ["Vermelha e branca", "Preta e branca", "Toda vermelha"], "A vermelha e branca vem no 8º grau; a toda vermelha no 9º e 10º."],
        ["Qual destas finalizações é uma chave de pé?", "Chave de calcanhar (heel hook)", ["Omoplata", "Ezequiel", "Kimura"], "A chave de calcanhar torce o joelho a partir do pé; é proibida para faixas mais baixas."],
        ["Que estrangulamento é este, feito com o próprio braço do adversário?", "Katagatame (triângulo de mão)", ["Triângulo de pernas", "Guilhotina", "Ezequiel"], "O braço do adversário fica preso contra o próprio pescoço.", "katagatame"],
        ["Em que ano o Mestre Dan recebeu a faixa preta?", "2005", ["1998", "2002", "2010"], "Dan foi o primeiro aluno da Cohab e virou faixa preta em 2005."],
        ["Carlson Gracie, técnico de grandes campeões, era filho de quem?", "Carlos Gracie", ["Hélio Gracie", "George Gracie", "Gastão Gracie"], "Carlson era filho de Carlos e criou uma das equipes mais fortes do Rio."],
        ["Quem fundou a Gracie Barra, em 1986?", "Carlos Gracie Jr.", ["Rickson Gracie", "Renzo Gracie", "Royler Gracie"], "A Gracie Barra nasceu no Rio e hoje tem academias no mundo todo."],
        ["Qual estrangulamento usa a manga do próprio kimono por dentro?", "Ezequiel", ["Mata-leão", "Triângulo", "Guilhotina"], "No ezequiel, uma mão entra na própria manga e a outra passa pelo pescoço."],
        ["Como se chama a raspagem em inglês?", "Sweep", ["Pass", "Takedown", "Mount"], "Pass é passagem, takedown é queda e mount é montada."],
        ["Em que guarda o atleta fica sentado com os pés por dentro das coxas do adversário?", "Guarda borboleta", ["Guarda fechada", "Guarda aranha", "Meia-guarda"], "Na borboleta (butterfly), os pés por dentro servem de ganchos para levantar o adversário."],
        ["Qual é o nome do atleta conhecido como “Buchecha”, multicampeão mundial?", "Marcus Almeida", ["Rodolfo Vieira", "Felipe Preguiça", "Lucas Lepri"], "Marcus “Buchecha” Almeida é um dos maiores campeões de absoluto da história."],
        ["Qual é a primeira faixa infantil depois da branca?", "Cinza", ["Amarela", "Laranja", "Verde"], "Nas crianças a ordem é branca, cinza, amarela, laranja e verde."],
        ["Qual destas faixas exige no mínimo 18 anos?", "Marrom", ["Azul", "Roxa", "Branca"], "Azul e roxa a partir de 16; marrom a partir de 18; preta a partir de 19."],
      ],
    },
    {
      id: "preta", name: "Faixa preta", tag: "Lenda", color: "#111111", ink: "#fff",
      questions: [
        ["Que judoca japonês Hélio Gracie enfrentou em 1951, antes de lutar com Kimura?", "Yukio Kato", ["Mitsuyo Maeda", "Masahiko Kimura", "Yasuhiro Yamashita"], "Hélio empatou com Kato e depois o finalizou na revanche."],
        ["Quem jogou a toalha na luta Hélio x Kimura?", "Carlos Gracie", ["O próprio Hélio", "O árbitro", "Rolls Gracie"], "Hélio não bateu; o irmão Carlos jogou a toalha para salvar o braço dele."],
        ["Em que ano Carlos Gracie abriu sua academia no Rio?", "1925", ["1914", "1932", "1951"], "A academia dos Gracie no Rio abriu em 1925."],
        ["Por quantos segundos é preciso estabilizar uma posição para pontuar?", "3 segundos", ["1 segundo", "5 segundos", "10 segundos"], "A posição precisa ser mantida por 3 segundos para valer pontos."],
        ["Quantos pontos vale pegar as costas com só um gancho?", "Nenhum", ["2", "3", "4"], "Sem os dois ganchos por dentro, a pegada nas costas não pontua (pode dar vantagem)."],
        ["Empate em pontos e vantagens; o atleta A tem uma punição e o B nenhuma. Quem vence?", "O atleta B", ["O atleta A", "Vai para a decisão dos árbitros", "Os dois são desclassificados"], "Com pontos e vantagens iguais, vence quem tem menos punições."],
        ["Quem criou o ADCC, em 1998?", "Sheik Tahnoon bin Zayed", ["Carlos Gracie Jr.", "Dana White", "Rorion Gracie"], "O sheik de Abu Dhabi criou o torneio depois de treinar jiu-jitsu."],
        ["Que lutas Rolls Gracie misturou ao jiu-jitsu?", "Wrestling, judô e sambo", ["Boxe, muay thai e karatê", "Capoeira, kung fu e taekwondo", "Sumô, aikidô e kendô"], "Rolls trouxe quedas e chaves de outras lutas e modernizou o jogo."],
        ["Qual é a graduação da faixa vermelha?", "9º e 10º grau", ["7º grau", "8º grau", "6º grau"], "A vermelha é a graduação máxima, para quem dedicou a vida à arte."],
        ["Quem deu a primeira aula da Cohab, em 1998?", "Professor Tony", ["Mestre Dan", "Mestre Fluído Caiman", "Sérgio Moraes"], "O professor Tony começou com um único aluno: o Dan."],
        ["Na faixa preta do Mestre Dan, quem amarrou a faixa?", "André Galvão", ["Fernando Tererê", "Eduardo Telles", "Fábio Gurgel"], "O Tererê entregou, o Eduardo Telles anunciou e o André Galvão amarrou."],
        ["Qual atleta é chamado de “O Orgulho da Cohab”?", "Sérgio Moraes", ["Guilherme Augusto", "Dimitrius Souza", "Paulinho Baraúna"], "Nascido na Cohab 2, Sérgio Moraes foi campeão mundial e lutou no UFC."],
        ["Quantos graus a faixa preta recebe antes da faixa coral?", "6 graus", ["4 graus", "5 graus", "10 graus"], "A preta vai do 1º ao 6º grau; no 7º grau vem a coral vermelha e preta."],
        ["Quanto dura uma luta da faixa preta adulta na IBJJF?", "10 minutos", ["5 minutos", "8 minutos", "15 minutos"], "Branca 5, azul 6, roxa 7, marrom 8 e preta 10 minutos."],
        ["Qual destas situações gera punição na IBJJF?", "Falta de combatividade (amarrar a luta)", ["Bater para desistir", "Cumprimentar o adversário", "Pedir para arrumar o kimono"], "Quem trava a luta sem tentar avançar recebe punição."],
        ["Quem derrotou Hélio Gracie em 1955, numa luta de quase 4 horas?", "Waldemar Santana", ["Masahiko Kimura", "Yukio Kato", "Carlson Gracie"], "Waldemar, ex-aluno de Hélio, venceu depois de 3 horas e 40 minutos de luta."],
        ["Como Hélio venceu Yukio Kato na revanche de 1951?", "Por estrangulamento", ["Por pontos", "Por chave de braço", "Por nocaute"], "Hélio estrangulou Kato, o que levou o desafio contra Kimura."],
        ["Quem foi o fundador e primeiro presidente da CBJJ?", "Carlos Gracie Jr.", ["Hélio Gracie", "Moisés Muradi", "Rorion Gracie"], "Carlos Gracie Jr. organizou a CBJJ em 1994 e depois a IBJJF."],
        ["Em que mês de 1998 foi a primeira aula da Cohab?", "Setembro", ["Janeiro", "Maio", "Dezembro"], "A primeira aula foi em setembro de 1998."],
        ["Onde foi a primeira aula da Cohab?", "No centro esportivo da Cohab José Bonifácio", ["Numa academia no Tatuapé", "Numa escola de São Mateus", "No ginásio do Ibirapuera"], "Tudo começou no centro esportivo do conjunto habitacional, em Itaquera."],
        ["Qual é o nome completo do Mestre Dan?", "Everdan Olegário da Silva", ["Daniel Moraes da Silva", "Everton Daniel Souza", "Danilo Olegário Santos"], "Everdan virou “Dan” no tatame e hoje é o Mestre Dan."],
      ],
    },
  ];
  const PER_ROUND = 8;
  const PASS = 6;
  const recent = {};

  // Perguntas com os dados atuais da Cohab entram nos níveis roxa e preta
  fetch("data/cohab-conquistas.json").then((r) => r.json()).then((d) => {
    const titles = d.team.filter((t) => t.pos === 1).length;
    const wrong = shuffle([titles - 3, titles - 1, titles + 2, titles + 4].filter((n) => n > 0)).slice(0, 3);
    LEVELS[2].questions.push(["Em quantos campeonatos a Cohab já foi campeã geral por equipe?", String(titles), wrong.map(String),
      `Foram ${titles} títulos de campeã geral, e a lista cresce toda semana.`]);
    const pan = d.team.filter((t) => /pan-americano/i.test(t.event)).sort((a, b) => b.year - a.year)[0];
    if (pan) {
      const right = `${pan.pos}º lugar`;
      LEVELS[4].questions.push([`Em que lugar a Cohab ficou no ${pan.event} ${pan.year}?`, right,
        ["1º lugar", "2º lugar", "3º lugar", "5º lugar"].filter((o) => o !== right).slice(0, 3),
        `Ficou em ${pan.pos}º lugar geral, com ${pan.gold} ouros.`]);
    }
  }).catch(() => { /* sem os dados, segue só com as perguntas fixas */ });

  function photo(key) {
    const [file, author, license] = PHOTOS[key];
    const fig = el("figure", "quiz-photo");
    const img = el("img");
    img.src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=480`;
    img.alt = "Foto da pergunta";
    const cap = el("figcaption");
    const a = el("a", "", `Foto: ${author} · ${license}`);
    a.href = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;
    a.target = "_blank";
    a.rel = "noopener";
    cap.append(a);
    fig.append(img, cap);
    return fig;
  }

  function menu() {
    const best = store.get();
    box.replaceChildren();
    const start = el("div", "quiz-start");
    start.append(
      el("h2", "", "Escolha sua faixa"),
      el("p", "muted", `Cada nível tem ${PER_ROUND} perguntas sobre história, regras, posições, lendas do jiu-jitsu e a Cohab. Acerte ${PASS} para passar de faixa.`),
    );
    const list = el("div", "quiz-levels");
    LEVELS.forEach((lv, i) => {
      const b = el("button", "quiz-level");
      b.type = "button";
      const stripe = el("span", "quiz-level-belt");
      stripe.style.background = lv.color;
      stripe.dataset.belt = lv.id;
      const name = el("strong", "", lv.name);
      const tag = el("span", "muted", lv.tag);
      const score = best[lv.id];
      const badge = el("span", "quiz-level-best", score === undefined ? "" : `${score >= PASS ? "✅" : "🔁"} ${score}/${PER_ROUND}`);
      b.append(stripe, name, tag, badge);
      b.addEventListener("click", () => play(i));
      list.append(b);
    });
    start.append(list);
    box.append(start);
  }

  function play(levelIndex) {
    const lv = LEVELS[levelIndex];
    // sorteia primeiro as perguntas que ainda não saíram; quando acabam, recomeça
    const seen = recent[lv.id] || (recent[lv.id] = new Set());
    const fresh = lv.questions.filter((q) => !seen.has(q[0]));
    const old = lv.questions.filter((q) => seen.has(q[0]));
    const picked = shuffle([...shuffle(fresh), ...shuffle(old)].slice(0, PER_ROUND));
    if (fresh.length <= PER_ROUND) seen.clear();
    picked.forEach((q) => seen.add(q[0]));
    const questions = picked.map(([q, right, wrong, why, img]) =>
      ({ q, right, options: shuffle([right, ...wrong]), why, img }));
    let i = 0, score = 0;

    const show = () => {
      box.replaceChildren();
      const { q, right, options, why, img } = questions[i];
      const head = el("div", "quiz-head");
      const level = el("span", "quiz-tag", lv.name);
      level.style.background = lv.color;
      level.style.color = lv.ink;
      head.append(level, el("span", "muted", `Pergunta ${i + 1} de ${questions.length}`), el("span", "quiz-score", `${score} ✓`));
      const bar = el("div", "quiz-bar");
      const fill = el("i");
      fill.style.width = `${(i / questions.length) * 100}%`;
      bar.append(fill);
      const list = el("div", "quiz-options");
      const note = el("p", "quiz-why");
      const next = el("button", "button quiz-next", i + 1 < questions.length ? "Próxima →" : "Ver resultado →");
      next.hidden = true;
      options.forEach((opt) => {
        const b = el("button", "quiz-option", opt);
        b.type = "button";
        b.addEventListener("click", () => {
          const ok = opt === right;
          if (ok) score++;
          list.querySelectorAll("button").forEach((x) => {
            x.disabled = true;
            if (x.textContent === right) x.classList.add("right");
          });
          if (!ok) b.classList.add("wrong");
          note.textContent = `${ok ? "✅ Isso aí!" : "❌ Não foi dessa vez."} ${why}`;
          next.hidden = false;
          next.focus();
        });
        list.append(b);
      });
      next.addEventListener("click", () => { i++; i < questions.length ? show() : finish(); });
      box.append(head, bar, el("h2", "quiz-q", q));
      if (img) box.append(photo(img));
      box.append(list, note, next);
    };

    const finish = () => {
      const passed = score >= PASS;
      const best = store.get();
      best[lv.id] = Math.max(score, best[lv.id] ?? 0);
      store.set(best);
      const nextLevel = LEVELS[levelIndex + 1];
      box.replaceChildren();
      const card = el("div", "quiz-result");
      const beltEl = el("div", "quiz-belt");
      beltEl.style.background = lv.color;
      beltEl.append(el("span"));
      const text = passed
        ? (nextLevel ? `Oss! 🥋 Você passou na ${lv.name.toLowerCase()}. Pronto para a ${nextLevel.name.toLowerCase()}?` : "Oss! 🥋 Você é uma lenda do jiu-jitsu. Passou no nível mais difícil!")
        : `Faltou pouco: precisa de ${PASS} acertos para passar. Leia a página de jiu-jitsu e tente de novo.`;
      card.append(
        el("p", "muted", `Você acertou ${score} de ${questions.length}`),
        el("h2", "", passed ? `${lv.name} aprovada!` : `${lv.name}: ainda não`),
        beltEl,
        el("p", "", text),
      );
      const actions = el("div", "quiz-actions");
      if (passed && nextLevel) {
        const up = el("button", "button", `Ir para a ${nextLevel.name.toLowerCase()} →`);
        up.type = "button";
        up.addEventListener("click", () => play(levelIndex + 1));
        actions.append(up);
      }
      const again = el("button", passed && nextLevel ? "share-btn" : "button", "Jogar de novo");
      again.type = "button";
      again.addEventListener("click", () => play(levelIndex));
      const back = el("button", "share-btn", "Escolher outra faixa");
      back.type = "button";
      back.addEventListener("click", menu);
      const share = el("button", "share-btn", "Compartilhar ↗");
      share.type = "button";
      share.addEventListener("click", () => window.siteShare?.({
        title: "Quiz de jiu-jitsu da Cohab",
        text: `Fiz ${score}/${questions.length} no nível ${lv.name.toLowerCase()} do quiz de jiu-jitsu da Cohab Team! Consegue mais?`,
        url: location.href,
      }));
      actions.append(again, back, share);
      if (!passed) {
        const more = el("a", "share-btn", "Estudar a história");
        more.href = "jiujitsu.html";
        actions.append(more);
      }
      const total = Object.values(store.get()).reduce((a, b) => a + b, 0);
      const rk = window.cohabRanking?.badge("quiz", total);
      if (rk) card.append(rk);
      card.append(actions);
      box.append(card);
    };

    show();
  }

  menu();
})();
