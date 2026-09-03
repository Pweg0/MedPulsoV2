-- Remove somente da seleção da Reta Final questões que dependem de uma
-- figura/imagem explicitamente indicada, mas não possuem mídia no banco.
delete from reta_final_questoes rf
using questoes q
where q.id = rf.questao_id
  and (
    q.enunciado ~* '\\(\\s*ver\\s*imagem\\s*\\)'
    or q.enunciado ~* '\\bver\\s+(a\\s+)?imagem\\b'
    or q.enunciado ~* '\\bfigura\\s+(a\\s+)?(seguir|abaixo)\\b'
    or q.enunciado ~* '\\bgr[aá]fico\\s+(a\\s+)?(seguir|abaixo)\\b'
    or q.enunciado ~* '\\bimagem\\s+(a\\s+)?(seguir|abaixo)\\b'
    or q.enunciado ~* '\\btra[cç]ado(s)?\\s+(a\\s+)?(seguir|abaixo)\\b'
    or q.enunciado ~* '\\beletrocardiograma\\s+(a\\s+)?(seguir|abaixo)\\b'
  );
