# Desenvolvimento com IA na prática com Kiro

Portfólio de projetos do curso Desenvolvimento com IA na prática, usando o Kiro da AWS.

## Projetos

| Nº | Projeto | Descrição |
| --- | --- | --- |
| 01 | [Habit Tracker](01-habit-tracker/) | App web para registrar hábitos e acompanhar as conclusões dos últimos sete dias. |

# Habit Tracker

Meu primeiro projeto do curso **Desenvolvimento com IA na prática**, feito com o Kiro da AWS. O Habit Tracker é um aplicativo web para registrar hábitos e acompanhar sua prática ao longo da semana.

## O que foi desenvolvido

O aplicativo foi implementado com HTML, CSS e JavaScript. A primeira entrega reúne as seguintes funcionalidades:

- Cadastro, edição e exclusão de hábitos.
- Marcação das conclusões dos últimos sete dias.
- Contagem de dias consecutivos e barra de progresso diário.
- Armazenamento dos dados no navegador com `localStorage`.
- Importação e exportação dos registros em CSV.

Para experimentar, baixe o repositório e abra o arquivo `01-habit-tracker/index.html` no navegador.

## O que é o Kiro?

O Kiro é uma ferramenta de desenvolvimento da AWS com agentes de IA integrados. A partir de uma solicitação em linguagem natural, ele pode ajudar a detalhar requisitos, planejar a implementação, editar o código e gerar documentação e testes. O desenvolvedor revisa as decisões e confere se o resultado atende ao que foi definido.

Quando os requisitos ficam espalhados em conversas com a IA, pode ser difícil recuperar a razão de uma decisão ou verificar se o código segue o comportamento esperado. O Kiro oferece um fluxo baseado em especificações, que podem ser registradas no repositório e consultadas durante a implementação e a revisão.

## Desenvolvimento guiado por especificações

**Spec-Driven Development (SDD)** é uma abordagem em que a especificação orienta o desenvolvimento. Primeiro, a equipe registra os requisitos, as restrições, os critérios de aceitação e os casos de borda. Depois de revisar essas decisões, usa a especificação para planejar as tarefas, implementar a solução e verificar o resultado. Quando há um agente de IA, ele usa o mesmo documento como referência para trabalhar no código e nos testes.

### Como isso se aplica ao Habit Tracker

O arquivo [SPEC.md](SPEC.md) registra o objetivo do aplicativo, a estrutura da interface e as regras de funcionamento. Um exemplo é a **contagem de dias consecutivos**. Se o hábito ainda não foi marcado hoje, a contagem começa ontem. Assim, a sequência pode continuar visível enquanto a pessoa ainda tem tempo de concluir o hábito no dia de hoje. Essa regra dá um ponto de partida concreto para implementar a funcionalidade e verificar seu comportamento.

## Referências

- [Documentação oficial do Kiro](https://kiro.dev/docs/)
- [Specs — documentação do Kiro](https://kiro.dev/docs/specs/)
- [Spec-Driven Development — Microsoft for Developers](https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering/)
