export type EspecialidadeNode = {
  nome: string;
  caminho: string;
  total: number;
  filhos: EspecialidadeNode[];
};

export function construirArvoreEspecialidades(
  linhas: { disciplina: string; total: number }[]
): EspecialidadeNode[] {
  const raiz: EspecialidadeNode[] = [];
  const indice = new Map<string, EspecialidadeNode>();

  for (const { disciplina, total } of linhas) {
    const partes = disciplina.split(">").map((s) => s.trim());
    let caminhoAcumulado = "";
    let listaAtual = raiz;

    for (let i = 0; i < partes.length; i++) {
      caminhoAcumulado = i === 0 ? partes[i] : `${caminhoAcumulado} > ${partes[i]}`;
      let node = indice.get(caminhoAcumulado);
      if (!node) {
        node = { nome: partes[i], caminho: caminhoAcumulado, total: 0, filhos: [] };
        indice.set(caminhoAcumulado, node);
        listaAtual.push(node);
      }
      if (i === partes.length - 1) {
        node.total += total;
      }
      listaAtual = node.filhos;
    }
  }

  function propagar(nodes: EspecialidadeNode[]) {
    for (const n of nodes) {
      propagar(n.filhos);
      n.total += n.filhos.reduce((soma, f) => soma + f.total, 0);
    }
  }
  propagar(raiz);

  function ordenar(nodes: EspecialidadeNode[]) {
    nodes.sort((a, b) => b.total - a.total);
    nodes.forEach((n) => ordenar(n.filhos));
  }
  ordenar(raiz);

  return raiz;
}
