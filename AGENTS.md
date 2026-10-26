# Padrão de commits

Você é responsável por escrever mensagens de commit neste repositório. Siga estas regras antes de executar qualquer `git commit`. Um hook (`.husky/commit-msg`) valida a mensagem e bloqueia o commit se algo estiver fora do padrão; se isso acontecer, leia a seção "Como corrigir" da saída, ajuste a mensagem e tente de novo. Não use `--no-verify` para pular a validação.

## Formato

```
<tipo>(<escopo>): <descrição>

<corpo opcional>

<rodapé opcional>
```

## Tipos permitidos

| Tipo | Quando usar |
|---|---|
| feat | nova funcionalidade para quem usa o sistema |
| fix | correção de bug |
| docs | apenas documentação |
| style | formatação, espaços, ponto e vírgula; sem mudar lógica |
| refactor | mudança de código que não altera comportamento |
| perf | melhoria de desempenho |
| test | adição ou ajuste de testes |
| build | build, empacotamento ou dependências |
| ci | pipelines e configuração de CI |
| chore | manutenção que não se encaixa acima |
| revert | reversão de um commit anterior |

## Regras do cabeçalho

1. Escopo opcional, em minúsculas, nomeando a área afetada: `auth`, `checkout`, `api`, `deps`.
2. Descrição em português, no imperativo da 3ª pessoa ("adiciona", "corrige", "remove"), nunca no passado ("adicionado", "corrigi").
3. Descrição começa com letra minúscula e não termina com pontuação.
4. Cabeçalho com no máximo 72 caracteres.
5. Um commit = uma mudança lógica. Se precisar de "e" para descrever, provavelmente são dois commits.

## Corpo e rodapé

- Separe o corpo do cabeçalho com uma linha em branco.
- No corpo, explique o PORQUÊ da mudança, não o como (o diff já mostra o como). Linhas de até 100 caracteres.
- Mudança incompatível: adicione `!` após o tipo/escopo e um rodapé `BREAKING CHANGE: <o que quebra e como migrar>`.
- Referências a tarefas vão no rodapé: `Refs: #123` ou `Closes: #123`.

## Antes de commitar

1. Rode `git diff --staged` e leia o que realmente será commitado.
2. Escolha o tipo pelo efeito da mudança, não pelos arquivos tocados.
3. Escreva a mensagem e confira cada regra acima.

## Exemplos

Bons:
```
feat(auth): adiciona login com google
fix(checkout): corrige arredondamento do frete em pedidos internacionais
docs: atualiza instruções de instalação
refactor(api)!: renomeia campo userId para accountId

BREAKING CHANGE: clientes da API devem enviar accountId no lugar de userId.
```

Ruins (e por quê):
```
Adicionado login.            -> sem tipo, verbo no passado, maiúscula, ponto final
fix: ajustes                 -> vago; diga o que foi corrigido
feat: adiciona login e corrige bug do carrinho  -> duas mudanças em um commit
```
