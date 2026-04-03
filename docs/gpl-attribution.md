# GPL e origem do sistema Witcher

Este repositório foi relicenciado para **GPL v3** para acomodar a adaptação direta de partes do projeto `TheWitcherTRPG-main`, originalmente distribuído sob a mesma licença.

## Fontes incorporadas

- `TheWitcherTRPG-main`
  - traduções de `lang/ptbr.json`
  - estrutura conceitual de atributos, profissões, raças, combate e ficha
  - referências de compêndio, inventário, magia, críticos e localização de acerto

## Regra de adaptação

- Código dependente do runtime do Foundry VTT não é executado diretamente no portal.
- Tabelas, textos, estruturas de dados e fórmulas foram portados ou reimplementados para React + TypeScript.
- Toda nova camada ligada a esse material deve preservar a compatibilidade com GPL v3.
