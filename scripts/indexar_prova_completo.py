"""Indexador completo de prova do REVALIDA (INEP) — versão SIMULADO.

Estende a lógica de deteccao de marcador/coluna de `indexador_revalida.py`
(a parte já validada nas edições 2020 e 2023/2) pra produzir o JSON pronto
pro import no modo SIMULADO: enunciado separado das alternativas, gabarito
já mesclado, heurística de figura.

Uso:
    pip install pdfplumber
    python indexar_prova_completo.py prova.pdf gabarito.pdf "2024" -o revalida_2024.json

Saída (compatível com scripts/import-simulado.mjs):
{
  "edicao": "2024",
  "questoes": [
    {"num": 1, "enunciado": "...", "alternativas": {"A": "...", "B": "..."},
     "gabarito": "B", "anulada": false, "tem_figura": false}
  ]
}
"""
import pdfplumber, re, json, sys, argparse, collections

PAREN = re.compile(r'\(([A-E])\)$')
LETRA = re.compile(r'[A-E]$')
MARCADOR_INICIO = re.compile(r'^\(?[A-E]\)?[.\-\):]*\s*')


def parse_gabarito(path):
    with pdfplumber.open(path) as pdf:
        t = pdf.pages[0].extract_text()
    ns, gs = [], []
    for l in t.split('\n'):
        tk = l.split()
        if not tk:
            continue
        if tk[0] == 'Questão' and tk[1].isdigit():
            ns += [int(x) for x in tk[1:]]
        elif tk[0] == 'Gabarito':
            gs += tk[1:]
    return {n: ({'letra': None, 'anulada': True} if g == '-'
                else {'letra': g, 'anulada': False}) for n, g in zip(ns, gs)}


def marcadores(pg):
    par = [{'letra': PAREN.match(w['text']).group(1), 'x0': w['x0'], 'top': w['top']}
           for w in pg.extract_words() if PAREN.match(w['text'])]
    if len(par) >= 4:
        return par
    g = collections.defaultdict(list)
    for c in pg.chars:
        if LETRA.match(c['text']):
            g[(c['fontname'], round(c['x0']))].append(c)
    out = []
    for cs in g.values():
        if len(cs) < 4:
            continue
        seq = ''.join(c['text'] for c in sorted(cs, key=lambda k: k['top']))
        if re.fullmatch(r'(ABCD|ABCDE)+', seq):
            out += [{'letra': c['text'], 'x0': c['x0'], 'top': c['top']} for c in cs]
    return out


def headers(pg):
    ws, h = pg.extract_words(), []
    for i, w in enumerate(ws):
        if (w['text'] == 'QUESTÃO' and i + 1 < len(ws) and ws[i + 1]['text'].isdigit()
                and abs(ws[i + 1]['top'] - w['top']) < 6):
            h.append({'num': int(ws[i + 1]['text']), 'top': w['top'], 'x0': w['x0']})
    return h


def split_global(pdf):
    xs = [round(h['x0']) for pg in pdf.pages for h in headers(pg)]
    if not xs:
        return None
    c = collections.Counter(xs)
    faixas = sorted(x for x, n in c.items() if n >= max(c.values()) * 0.1)
    esq = [x for x in faixas if x < pdf.pages[0].width / 2]
    dir_ = [x for x in faixas if x >= pdf.pages[0].width / 2]
    return (max(esq) + min(dir_)) / 2 if esq and dir_ else None


def tem_figura(pg, top, bottom, x0, x1):
    """Heurística: alguma imagem da página cai dentro da faixa da questão."""
    for img in pg.images:
        if img['top'] < bottom and img['bottom'] > top and img['x0'] < x1 and img['x1'] > x0:
            return True
    return False


def limpar_marcador(texto):
    return MARCADOR_INICIO.sub('', texto, count=1).strip()


def index_prova_completo(path_prova, path_gabarito, edicao):
    gabaritos = parse_gabarito(path_gabarito)
    questoes = []

    with pdfplumber.open(path_prova) as pdf:
        split = split_global(pdf)
        for pno, pg in enumerate(pdf.pages):
            marc = marcadores(pg)
            hs = headers(pg)
            if len(marc) < 4 or not hs:
                continue

            usa_2col = split is not None and any(
                o['x0'] > split for o in list(marc) + list(hs))
            col = (lambda x: 0) if split is None else (lambda x: 1 if x > split else 0)
            key = lambda o: (col(o['x0']), o['top'])
            hs.sort(key=key)

            for j, h in enumerate(hs):
                nxt = key(hs[j + 1]) if j + 1 < len(hs) else (99, 1e9)
                mine = sorted([m for m in marc if key(h) < key(m) < nxt], key=key)
                if not mine:
                    continue

                if split is None or not usa_2col:
                    x0, x1 = 0, pg.width
                elif h['x0'] > split:
                    x0, x1 = split, pg.width
                else:
                    x0, x1 = 0, split

                bloco_bottom = (
                    hs[j + 1]['top'] if j + 1 < len(hs) and key(hs[j + 1])[0] == col(h['x0'])
                    else pg.height
                )

                enunciado = pg.crop((x0, h['top'] + 12, x1, mine[0]['top'])).extract_text() or ''
                # remove o próprio cabeçalho "QUESTÃO N" da primeira linha
                enunciado = re.sub(r'^QUESTÃO\s+\d+\s*', '', enunciado.strip())

                alternativas = {}
                for k, alt in enumerate(mine):
                    fim = mine[k + 1]['top'] if k + 1 < len(mine) else bloco_bottom
                    texto = pg.crop((x0, alt['top'], x1, fim)).extract_text() or ''
                    alternativas[alt['letra']] = limpar_marcador(texto.strip())

                gab = gabaritos.get(h['num'], {'letra': None, 'anulada': True})
                figura = tem_figura(pg, h['top'], bloco_bottom, x0, x1)

                questoes.append({
                    'num': h['num'],
                    'enunciado': enunciado,
                    'alternativas': alternativas,
                    'gabarito': gab['letra'],
                    'anulada': gab['anulada'] or gab['letra'] not in alternativas,
                    'tem_figura': figura,
                })

    questoes.sort(key=lambda q: q['num'])
    return {'edicao': edicao, 'questoes': questoes}


def validar(resultado, total=100):
    nums = [q['num'] for q in resultado['questoes']]
    faltando = [n for n in range(1, total + 1) if n not in nums]
    vazias = [q['num'] for q in resultado['questoes'] if not q['enunciado'] or len(q['alternativas']) < 2]
    return faltando, vazias


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('prova_pdf')
    ap.add_argument('gabarito_pdf')
    ap.add_argument('edicao')
    ap.add_argument('-o', '--saida', default=None)
    args = ap.parse_args()

    resultado = index_prova_completo(args.prova_pdf, args.gabarito_pdf, args.edicao)
    faltando, vazias = validar(resultado)

    print(f'  questões extraídas : {len(resultado["questoes"])}')
    print(f'  faltando           : {faltando or "nenhuma"}')
    print(f'  enunciado/alt vazio: {vazias or "nenhuma"}')

    saida = args.saida or f'revalida_{args.edicao.replace("/", "-")}.json'
    with open(saida, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    print(f'  salvo em: {saida}')
