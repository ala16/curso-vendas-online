# Curso de Vendas Online no Campo

Landing page estática, responsiva e focada em celular. HTML e CSS sem frameworks, JavaScript, fontes externas ou rastreadores.

## Abrir
Abra index.html no navegador, ou execute `python -m http.server 8000` nesta pasta.

## Contato
Os botões abrem o WhatsApp (11) 94442-2266 com mensagens distintas para informações e inscrição. A inscrição depende da confirmação do Sindicato Rural.

## Conteúdo
Dados extraídos do cartaz fornecido: curso gratuito e presencial, 6 e 7 de novembro, 8h às 12h e 13h às 17h. O cartaz não informa o ano; ele não foi acrescentado. Imagens recortadas do material fornecido e comprimidas para JPEG.

## Publicar
Pode ser hospedada em qualquer serviço de arquivos estáticos. No GitHub Pages, selecione a branch main e a pasta raiz em Settings > Pages, quando disponível no plano e na visibilidade do repositório.


## Painel de cliques

Acesse `admin/` no caminho do site. Na hospedagem atual: https://ala16.github.io/curso-vendas-online/admin/ . O acesso é restrito a ricardorodrigues173@gmail.com por confirmação de e-mail no Supabase. Caso o e-mail mostre um botão em vez de código, copie o endereço completo desse botão e cole no campo de acesso do painel.

O painel mostra total de cliques, inscrições, dúvidas e contagens por link, com filtros de 24 horas, 7 dias, 30 dias ou desde o início. Não representa pessoas únicas nem inscrições confirmadas. Começa a contar após a publicação. Não registra IP, nome nem identificador persistente de visitante; armazena um UUID do evento, a posição do link e a data do servidor. Cliques podem não ser registrados com bloqueadores ou falhas de rede. A navegação não aguarda a contagem.

Backend: Supabase, projeto fbljnxjcwcmnzqidgbvc, tabela curso_vendas_clicks, com INSERT público limitado às colunas e links permitidos; SELECT e função de resumo restritos ao e-mail autenticado do administrador. A chave no frontend é pública (anon), nunca service_role. O SQL aplicado está documentado em database/click-analytics.sql.

Verificação: `node check-analytics.cjs` testa rastreamento, supressão de duplicados, falha de rede e a renderização das contagens com respostas simuladas. As permissões do banco também foram verificadas em transação revertida, sem manter cliques de teste. Entrega de e-mail requer validação pelo proprietário na primeira entrada; o projeto utiliza a configuração de e-mail já existente.
