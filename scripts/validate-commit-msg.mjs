#!/usr/bin/env node
/**
 * Sensor computacional de mensagens de commit (Conventional Commits).
 * Chamado pelo hook .husky/commit-msg com o caminho do arquivo da mensagem.
 * Os erros já trazem instruções de correção, legíveis por pessoas e por agentes de IA.
 */
import { readFileSync } from "node:fs";

const TYPES = {
  feat: "nova funcionalidade",
  fix: "correção de bug",
  docs: "apenas documentação",
  style: "formatação, sem mudar lógica",
  refactor: "refatoração, sem mudar comportamento",
  perf: "melhoria de desempenho",
  test: "adição ou ajuste de testes",
  build: "build ou dependências",
  ci: "pipelines de CI",
  chore: "tarefas de manutenção",
  revert: "reversão de commit",
};
const MAX_HEADER = 72;
const MAX_BODY_LINE = 100;

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/validate-commit-msg.mjs <arquivo-da-mensagem>");
  process.exit(2);
}

const raw = readFileSync(file, "utf8");
// Remove comentários do git e linhas após o marcador de "commit -v"
const scissors = raw.indexOf("# ------------------------ >8 ------------------------");
const lines = (scissors >= 0 ? raw.slice(0, scissors) : raw)
  .split(/\r?\n/)
  .filter((l) => !l.startsWith("#"));
while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

const header = (lines[0] ?? "").trim();

// Mensagens geradas pelo próprio git passam sem validação
if (/^(Merge |Revert "|fixup! |squash! |amend! )/.test(header)) process.exit(0);

const errors = [];
const add = (problema, correcao) => errors.push({ problema, correcao });

const re = /^(?<type>[a-z]+)(?:\((?<scope>[a-z0-9._\/-]+)\))?(?<bang>!)?: (?<desc>.+)$/;
const m = header.match(re);

if (!header) {
  add("A mensagem está vazia.", "Escreva um cabeçalho no formato <tipo>(<escopo>): <descrição>.");
} else if (!m) {
  add(
    `O cabeçalho "${header}" não segue o formato <tipo>(<escopo>)?: <descrição>.`,
    "Use tipo em minúsculas, escopo opcional entre parênteses, dois-pontos e UM espaço. Ex.: feat(auth): adiciona login com google"
  );
} else {
  const { type, desc } = m.groups;
  if (!TYPES[type]) {
    add(
      `O tipo "${type}" não é permitido.`,
      `Escolha um destes: ${Object.entries(TYPES).map(([t, d]) => `${t} (${d})`).join(", ")}.`
    );
  }
  if (/^[A-ZÀ-Ý]/.test(desc)) {
    add("A descrição começa com letra maiúscula.", `Comece em minúscula: "${desc[0].toLowerCase()}${desc.slice(1)}".`);
  }
  if (/[.!?;:]$/.test(desc)) {
    add("A descrição termina com pontuação.", `Remova a pontuação final: "${desc.replace(/[.!?;:]+$/, "")}".`);
  }
  if (desc.trim().split(/\s+/).length < 2) {
    add("A descrição é curta demais para explicar a mudança.", "Use ao menos duas palavras, no imperativo: \"corrige cálculo de frete\".");
  }
  if (/^(adicionado|adicionei|corrigido|corrigi|alterado|alterei|removido|removi|atualizado|atualizei|criado|criei)\b/i.test(desc)) {
    add(
      "A descrição não está no imperativo (3ª pessoa do presente).",
      "Descreva o que o commit FAZ: \"adiciona\", \"corrige\", \"remove\", \"atualiza\", \"cria\"."
    );
  }
}

if (header.length > MAX_HEADER) {
  add(`O cabeçalho tem ${header.length} caracteres (máximo ${MAX_HEADER}).`, "Encurte a descrição e mova detalhes para o corpo, após uma linha em branco.");
}
if (lines.length > 1 && lines[1].trim() !== "") {
  add("Falta a linha em branco entre o cabeçalho e o corpo.", "Insira uma linha vazia logo após a primeira linha.");
}
lines.slice(2).forEach((l, i) => {
  if (l.length > MAX_BODY_LINE && !/^https?:\/\//.test(l.trim())) {
    add(`A linha ${i + 3} do corpo tem ${l.length} caracteres (máximo ${MAX_BODY_LINE}).`, "Quebre o texto em linhas menores.");
  }
});
if (m?.groups.bang && !lines.some((l) => /^BREAKING CHANGE: .+/.test(l))) {
  add(
    "O \"!\" indica breaking change, mas falta o rodapé explicativo.",
    "Adicione no rodapé: \"BREAKING CHANGE: <o que quebra e como migrar>\"."
  );
}

if (errors.length) {
  console.error("\n✖ Commit bloqueado: a mensagem não segue o padrão do projeto.\n");
  errors.forEach((e, i) => {
    console.error(`  ${i + 1}. Problema: ${e.problema}`);
    console.error(`     Como corrigir: ${e.correcao}\n`);
  });
  console.error("  Padrão: <tipo>(<escopo>): <descrição no imperativo, minúscula, sem ponto>");
  console.error("  Exemplo: fix(checkout): corrige arredondamento do frete\n");
  console.error("  Regras completas: seção \"Padrão de commits\" no AGENTS.md\n");
  process.exit(1);
}
