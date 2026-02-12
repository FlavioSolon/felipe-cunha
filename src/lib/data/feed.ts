export interface FeedPost {
    id: string;
    title: string;
    content: string; // The full text content
    images: string[]; // Array of image URLs
    date: string;
    likes: number;
    shares: number;
}

export const reflexoes: FeedPost[] = [
    {
        id: 'ref-1',
        title: 'O Silêncio que Fala',
        content: `No silêncio do sertão, aprendemos que Deus não precisa gritar para ser ouvido. 
        
        É na calmaria da tarde, quando o sol se põe tingindo o céu de laranja e roxo, que a voz do Pai ecoa mais forte em nossos corações. A natureza, em sua simplicidade e grandiosidade, testemunha a glória de um Criador que cuida de cada detalhe.
        
        Muitas vezes, buscamos respostas no barulho, na agitação, nas grandes manifestações. Mas Elias encontrou Deus na brisa suave. Da mesma forma, aqui no campo, descobrimos que a presença de Deus é constante, como o vento que nunca para de soprar.
        
        Que possamos aprender a silenciar nossas almas para ouvir o que realmente importa. Que a poeira da estrada não nos impeça de ver a beleza do caminho que Ele traçou para nós.`,
        images: [
            '/placeholders/campo1.jpg',
            '/placeholders/campo2.jpg'
        ],
        date: '2023-10-15',
        likes: 124,
        shares: 45
    },
    {
        id: 'ref-2',
        title: 'Raízes Profundas',
        content: `Assim como o mandacaru, que resiste à seca porque suas raízes buscam água nas profundezas, nossa fé precisa ser enraizada em Cristo.
        
        As tempestades vêm, o sol forte castiga, mas quem tem raízes profundas não tomba. No sertão, a vida brota da resiliência. Cada espinho conta uma história de sobrevivência, de adaptação, de força.
        
        Nossa caminhada cristã não é diferente. As dificuldades testam nossa estrutura, mas também nos fortalecem. É no tempo da seca que nossas raízes crescem mais, buscando a Fonte de Água Viva que nunca seca.
        
        Permaneça firme. Deixe suas raízes descerem até encontrar a sustentação que só Jesus pode dar. E quando a chuva vier, você florescerá mais belo e forte do que nunca.`,
        images: [
            '/placeholders/mandacaru.jpg'
        ],
        date: '2023-10-20',
        likes: 89,
        shares: 32
    },
    {
        id: 'ref-3',
        title: 'Simplicidade do Reino',
        content: `O Reino de Deus é como o sorriso de uma criança sertaneja: simples, genuíno e cheio de esperança.
        
        Não precisamos de grandes palcos ou luzes para viver o Evangelho. O amor se manifesta no partilhar do pão, no copo d'água oferecido ao cansado, no abraço que acolhe sem julgar.
        
        Jesus andou entre os simples, comeu com os pecadores, tocou nos intocáveis. Ele nos ensinou que a grandeza está em servir. Aqui, onde a vida é despojada de excessos, vemos com clareza que o essencial é invisível aos olhos, mas sensível ao coração.
        
        Que nossa vida seja um reflexo dessa simplicidade. Que possamos amar sem medidas e servir sem esperar nada em troca, apenas pela alegria de ver o Reino acontecer no meio de nós.`,
        images: [
            '/placeholders/crianca.jpg',
            '/placeholders/familia.jpg',
            '/placeholders/casal.jpg'
        ],
        date: '2023-10-25',
        likes: 156,
        shares: 67
    },
    {
        id: 'ref-4',
        title: 'Caminhos de Pó e Graça',
        content: `Caminhar pelo sertão é caminhar pela história de um povo forte. Cada marca no chão conta uma história de luta e fé.
        
        A graça de Deus nos alcança onde quer que estejamos. Não há lugar tão distante que o Seu amor não possa chegar. Na poeira da estrada, encontramos pegadas de quem já passou, mas também sentimos a presença Daquele que caminha ao nosso lado.
        
        Jesus é o Caminho, a Verdade e a Vida. Ele não promete um caminho fácil, sem pedras ou espinhos, mas promete que nunca nos deixará sós.
        
        Siga em frente, com fé e coragem. O Deus que abriu o Mar Vermelho é o mesmo que faz brotar água na rocha e flores no deserto.`,
        images: [
            '/placeholders/estrada.jpg'
        ],
        date: '2023-11-01',
        likes: 210,
        shares: 98
    },
    {
        id: 'ref-5',
        title: 'O Tempo de Deus',
        content: `Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu. (Eclesiastes 3:1)
        
        No campo, aprendemos a respeitar o tempo. Tempo de plantar, tempo de colher. Não adianta apressar a chuva ou forçar a semente a brotar antes da hora. A natureza tem seu ritmo, ditado pelo Criador.
        
        Em nossas vidas, muitas vezes somos impacientes. Queremos tudo para ontem. Mas Deus trabalha no silêncio, no secreto, moldando nosso caráter enquanto esperamos.
        
        Confie no tempo de Deus. Ele nunca atrasa. O que Ele preparou para você é maior e melhor do que você pode imaginar. Descanse e espere, pois a colheita virá no momento certo.`,
        images: [
            '/placeholders/plantacao.jpg',
            '/placeholders/colheita.jpg'
        ],
        date: '2023-11-10',
        likes: 180,
        shares: 75
    }

];

export const conselhos: FeedPost[] = [
    {
        id: 'cons-1',
        title: 'Sobre a Paciência',
        content: `Não apresse o passo. O caminho mais curto nem sempre é o melhor.
        
        A paciência é uma virtude que se cultiva dia após dia. É saber esperar o tempo certo para agir, para falar, para colher. Quem tem pressa come cru, diz o ditado. Mas quem espera no Senhor renova as suas forças.
        
        Respire fundo. Olhe ao redor. Aprecie a paisagem. Deus está trabalhando, mesmo quando você não vê.`,
        images: [
            '/placeholders/caminho.jpg'
        ],
        date: '2023-10-12',
        likes: 200,
        shares: 80
    },
    {
        id: 'cons-2',
        title: 'Valorize o Pequeno',
        content: `Grandes árvores nascem de pequenas sementes. Não despreze os pequenos começos.
        
        Às vezes, ficamos esperando por grandes oportunidades e deixamos passar as pequenas chances de fazer o bem, de aprender, de crescer. Um sorriso, uma palavra amiga, um gesto de gentileza podem mudar o dia de alguém.
        
        Seja fiel no pouco, e sobre o muito você será colocado. Valorize cada passo, cada conquista, cada aprendizado.`,
        images: [
            '$lib/assets/menino.jpeg',
            '/placeholders/mao.jpg'
        ],
        date: '2023-10-18',
        likes: 150,
        shares: 60
    },
    {
        id: 'cons-3',
        title: 'Ouça Mais',
        content: `Temos dois ouvidos e uma boca para ouvirmos o dobro do que falamos.
        
        A sabedoria mora no ouvir. Ouça os mais velhos, ouça as crianças, ouça o vento, ouça o silêncio. E, acima de tudo, ouça a voz de Deus.
        
        Quem ouve aprende. Quem ouve compreende. Quem ouve se conecta.`,
        images: [
            '/placeholders/idoso.jpg'
        ],
        date: '2023-10-22',
        likes: 180,
        shares: 70
    },
    {
        id: 'cons-4',
        title: 'Seja Grato',
        content: `A gratidão transforma o que temos em suficiente.
        
        Não reclame do que falta. Agradeça pelo que tem. A vida já é um presente maravilhoso. Acordar, respirar, ver o sol nascer... tudo isso é milagre.
        
        Um coração grato é um coração feliz. A gratidão abre portas e atrai coisas boas. Experimente agradecer mais e veja como sua vida muda.`,
        images: [
            '/placeholders/nascer-do-sol.jpg'
        ],
        date: '2023-11-05',
        likes: 250,
        shares: 110
    },
    {
        id: 'cons-5',
        title: 'Perdoe',
        content: `O perdão não muda o passado, mas liberta o futuro.
        
        Guardar mágoa é como tomar veneno esperando que o outro morra. Solte o peso. Perdoe. Não porque o outro merece, mas porque você merece paz.
        
        O perdão cura a alma e restaura a alegria. Deixe ir o que te fere e abra espaço para o novo de Deus.`,
        images: [
            '/placeholders/liberdade.jpg'
        ],
        date: '2023-11-15',
        likes: 300,
        shares: 150
    }
];
