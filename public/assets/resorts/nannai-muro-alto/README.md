# Acervo NANNAI Muro Alto — onde colocar as imagens

Eu **não consegui acessar a pasta do SharePoint** (exige login Microsoft que não tenho no ambiente).
Então: **baixe as fotos/logo do acervo oficial** e salve aqui dentro, nos caminhos abaixo.
Depois, no **painel admin**, aponte os campos para esses arquivos (ex.: `/assets/resorts/nannai-muro-alto/hero/aerea.jpg`).

> Observações:
> - Prefira **.webp** ou **.avif** (mais leves). `.jpg` também funciona.
> - Não usar fotos de outros resorts. Cada acomodação deve ter fotos da **própria categoria**.
> - Enquanto não subir, o site usa imagens **placeholder** (genéricas) — troque antes de anunciar.

## Estrutura sugerida
```
public/assets/resorts/nannai-muro-alto/
  branding/        logo-claro.svg|png, logo-escuro.svg|png
  hero/            aerea.jpg (foto aérea p/ o hero), video.mp4 (opcional)
  praia/           muro-alto-1.jpg ...
  gastronomia/     restaurante-nannai.jpg, tia-te.jpg, salero.jpg ...
  spa/             spa-1.jpg ...
  experiencias/    cafe-flutuante.jpg, luau.jpg, jantar.jpg ...
  accommodations/
    bangalo-jardim/     cover.jpg, 01.jpg, 02.jpg ...
    bangalo-piscina/    cover.jpg, ...
    bangalo-beira-mar/  cover.jpg, ...
    bangalo-vista-mar/  cover.jpg, ...
    bangalo-master/     cover.jpg, ...
    suite-villa/        cover.jpg, ...
    apartamento-jardim/ cover.jpg, ...
    apartamento-vista-mar/ cover.jpg, ...
```

## Onde cada imagem é usada (campos do painel)
| Arquivo | Painel → campo |
|---|---|
| `branding/logo-*.{svg,png}` | Hotéis → NANNAI Muro Alto → **URL do logotipo** |
| `hero/aerea.jpg` | Campanhas → editar → Hero → **Imagem de fundo** |
| `hero/video.mp4` (opcional) | Hero → **Vídeo de fundo** |
| `accommodations/<categoria>/cover.jpg` | Hotéis → **Quartos** → categoria → **Imagem principal** |
| `accommodations/<categoria>/NN.jpg` | Quartos → categoria → **Galeria (uma URL por linha)** |
| `praia/`, `gastronomia/`, `spa/`, `experiencias/` | Campanhas → **Galeria** (seção "Momentos…") e **Sobre/Destino** |

## Pendências que dependem do acervo/dados oficiais (NÃO inventar)
- **Logotipo oficial** (versões clara e escura).
- **Fotos reais** de cada uma das 8 categorias + praia, gastronomia, SPA, experiências.
- **Preços/condições reais** da campanha (os valores atuais são PLACEHOLDER demonstrativos).
- **WhatsApp de atendimento** e dados da empresa responsável (rodapé/operadora).
- **Metragens e capacidades**: conferir com a página oficial antes de publicar.
