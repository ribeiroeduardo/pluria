import type { Tables } from '@/integrations/supabase/types';

export const imageMapping = {
  // Body options
  'omni-corpo-paulownia.png': '/images/omni-corpo-paulownia.png',
  'omni-corpo-paulownia-amarelo.png': '/images/omni-corpo-paulownia-amarelo.png',
  'omni-corpo-paulownia-vermelho.png': '/images/omni-corpo-paulownia-vermelho.png',
  'omni-corpo-paulownia-verde.png': '/images/omni-corpo-paulownia-verde.png',
  'omni-corpo-paulownia-roxo.png': '/images/omni-corpo-paulownia-roxo.png',
  'omni-corpo-paulownia-preto.png': '/images/omni-corpo-paulownia-preto.png',
  'omni-corpo-paulownia-cinza.png': '/images/omni-corpo-paulownia-cinza.png',
  'omni-corpo-mogno.png': '/images/omni-corpo-mogno.png',
  'omni-corpo-mogno-verso.png': '/images/omni-corpo-mogno-verso.png',
  'omni-corpo-black-limba.png': '/images/omni-corpo-black-limba.png',
  'omni-corpo-black-limba-verso.png': '/images/omni-corpo-black-limba-verso.png',
  'omni-corpo-freijo.png': '/images/omni-corpo-freijo.png',
  'omni-corpo-freijo-vermelho.png': '/images/omni-corpo-freijo-vermelho.png',
  'omni-corpo-freijo-roxo.png': '/images/omni-corpo-freijo-roxo.png',
  'omni-corpo-freijo-verde.png': '/images/omni-corpo-freijo-verde.png',
  'omni-corpo-freijo-preto.png': '/images/omni-corpo-freijo-preto.png',
  'omni-corpo-freijo-verso.png': '/images/omni-corpo-freijo-verso.png',
  'omni-corpo-freijo-preto-verso.png': '/images/omni-corpo-freijo-preto-verso.png',
  'omni-corpo-freijo-roxo-verso.png': '/images/omni-corpo-freijo-roxo-verso.png',
  'omni-corpo-freijo-verde-verso.png': '/images/omni-corpo-freijo-verde-verso.png',
  'omni-corpo-freijo-vermelho-verso.png': '/images/omni-corpo-freijo-vermelho-verso.png',
  'omni-corpo-amarelo-neon.png': '/images/omni-corpo-amarelo-neon.png',
  'omni-corpo-amarelo-neon-verso.png': '/images/omni-corpo-amarelo-neon-verso.png',
  'omni-corpo-laranja-neon.png': '/images/omni-corpo-laranja-neon.png',
  'omni-corpo-laranja-neon-verso.png': '/images/omni-corpo-laranja-neon-verso.png',
  'omni-corpo-azul-neon.png': '/images/omni-corpo-azul-neon.png',
  'omni-corpo-azul-neon-verso.png': '/images/omni-corpo-azul-neon-verso.png',
  'omni-corpo-rosa-neon.png': '/images/omni-corpo-rosa-neon.png',
  'omni-corpo-rosa-neon-verso.png': '/images/omni-corpo-rosa-neon-verso.png',
  'omni-corpo-azul.png': '/images/omni-corpo-azul.png',
  'omni-corpo-azul-verso.png': '/images/omni-corpo-azul-verso.png',
  'omni-corpo-branco.png': '/images/omni-corpo-branco.png',
  'omni-corpo-branco-verso.png': '/images/omni-corpo-branco-verso.png',
  'omni-corpo-preto.png': '/images/omni-corpo-preto.png',
  'omni-corpo-preto-verso.png': '/images/omni-corpo-preto-verso.png',
  'omni-corpo-preto-sparkle.png': '/images/omni-corpo-preto-sparkle.png',
  'omni-corpo-preto-sparkle-verso.png': '/images/omni-corpo-preto-sparkle-verso.png',
  'omni-corpo-verde.png': '/images/omni-corpo-verde.png',
  'omni-corpo-verde-verso.png': '/images/omni-corpo-verde-verso.png',
  'omni-corpo-amarelo.png': '/images/omni-corpo-amarelo.png',
  'omni-corpo-amarelo-verso.png': '/images/omni-corpo-amarelo-verso.png',
  'omni-corpo-rosa.png': '/images/omni-corpo-rosa.png',
  'omni-corpo-rosa-verso.png': '/images/omni-corpo-rosa-verso.png',
  'omni-corpo-cinza.png': '/images/omni-corpo-cinza.png',
  'omni-corpo-cinza-verso.png': '/images/omni-corpo-cinza-verso.png',
  
  // Bridge options
  'omni-ponte-fixa-evertune-6-cromado.png': '/images/omni-ponte-fixa-evertune-6-cromado.png',
  'omni-ponte-fixa-evertune-6-preto.png': '/images/omni-ponte-fixa-evertune-6-preto.png',
  'omni-ponte-tremolo-gotohfloyd-6-preto.png': '/images/omni-ponte-tremolo-gotohfloyd-6-preto.png',
  'omni-ponte-tremolo-gotoh510-6-cromado.png': '/images/omni-ponte-tremolo-gotoh510-6-cromado.png',
  'omni-ponte-tremolo-gotoh510-6-preto.png': '/images/omni-ponte-tremolo-gotoh510-6-preto.png',
  'omni-ponte-tremolo-gotohfloyd-6-cromado.png': '/images/omni-ponte-tremolo-gotohfloyd-6-cromado.png',
  'omni-ponte-tremolo-vega-6-cromado.png': '/images/omni-ponte-tremolo-vega-6-cromado.png',
  'omni-ponte-tremolo-vega-6-preto.png': '/images/omni-ponte-tremolo-vega-6-preto.png',

  // Neck options
  'omni-braco-pau-ferro.png': '/images/omni-braco-pau-ferro.png',
  'omni-braco-pau-ferro-escuro.png': '/images/omni-braco-pau-ferro-escuro.png',
  'omni-braco-pau-ferro-verso.png': '/images/omni-braco-pau-ferro-verso.png',
  'omni-braco-pau-ferro-escuro-verso.png': '/images/omni-braco-pau-ferro-escuro-verso.png',
  'omni-braco-flamed-maple.png': '/images/omni-braco-flamed-maple.png',
  'omni-braco-flamed-maple-verso.png': '/images/omni-braco-flamed-maple-verso.png',
  'omni-braco-bolts-cromado-verso.png': '/images/omni-braco-bolts-cromado-verso.png',
  'omni-braco-bolts-preto-verso.png': '/images/omni-braco-bolts-preto-verso.png',

  // Hardware options
  'omni-tarraxas-cromado-verso.png': '/images/omni-tarraxas-cromado-verso.png',
  'omni-tarraxas-preto-verso.png': '/images/omni-tarraxas-preto-verso.png',
  'omni-plates-multiscale-preto.png': '/images/omni-plates-multiscale-preto.png',
  'omni-plates-tremolo-preto.png': '/images/omni-plates-tremolo-preto.png',
  'omni-plates-fixa-preto.png': '/images/omni-plates-fixa-preto.png',

  // Lighting effects
  'omni-lighting-luz-corpo.png': '/images/omni-lighting-luz-corpo.png',
  'omni-lighting-sombra-corpo.png': '/images/omni-lighting-sombra-corpo.png',
  'omni-lighting-corpo.png': '/images/omni-lighting-corpo.png',
  'omni-lighting-corpo-verso-sombra.png': '/images/omni-lighting-corpo-verso-sombra.png',
  'omni-lighting-corpo-verso-luz.png': '/images/omni-lighting-corpo-verso-luz.png',
  'omni-corpo-mascara.png': '/images/omni-corpo-mascara.png',
  
  // Top options
  'omni-tampo-buckeye-burl-azul.png': '/images/omni-tampo-buckeye-burl-azul.png',
  'omni-tampo-buckeye-burl-roxo.png': '/images/omni-tampo-buckeye-burl-roxo.png',
  'omni-tampo-buckeye-burl-amarelo.png': '/images/omni-tampo-buckeye-burl-amarelo.png',
  'omni-tampo-buckeye-burl-natural.png': '/images/omni-tampo-buckeye-burl-natural.png',
  'omni-tampo-buckeye-burl-vermelho.png': '/images/omni-tampo-buckeye-burl-vermelho.png',
  'omni-tampo-flamed-maple.png': '/images/omni-tampo-flamed-maple.png',
  'omni-tampo-flamed-maple-1.png': '/images/omni-tampo-flamed-maple-1.png',
  'omni-tampo-flamed-maple-azul.png': '/images/omni-tampo-flamed-maple-azul.png',
  'omni-tampo-flamed-maple-cinza.png': '/images/omni-tampo-flamed-maple-cinza.png',
  'omni-tampo-flamed-maple-laranja.png': '/images/omni-tampo-flamed-maple-laranja.png',
  'omni-tampo-flamed-maple-preto.png': '/images/omni-tampo-flamed-maple-preto.png',
  'omni-tampo-flamed-maple-roxo.png': '/images/omni-tampo-flamed-maple-roxo.png',
  'omni-tampo-flamed-maple-verde.png': '/images/omni-tampo-flamed-maple-verde.png',
  'omni-tampo-flamed-maple-vermelho.png': '/images/omni-tampo-flamed-maple-vermelho.png',
  'omni-tampo-quilted-maple.png': '/images/omni-tampo-quilted-maple.png',
  'omni-tampo-quilted-maple-azul.png': '/images/omni-tampo-quilted-maple-azul.png',
  'omni-tampo-quilted-maple-cinza.png': '/images/omni-tampo-quilted-maple-cinza.png',
  'omni-tampo-quilted-maple-laranja.png': '/images/omni-tampo-quilted-maple-laranja.png',
  'omni-tampo-quilted-maple-preto.png': '/images/omni-tampo-quilted-maple-preto.png',
  'omni-tampo-quilted-maple-roxo.png': '/images/omni-tampo-quilted-maple-roxo.png',
  'omni-tampo-quilted-maple-roxo-1.png': '/images/omni-tampo-quilted-maple-roxo-1.png',
  'omni-tampo-quilted-maple-verde.png': '/images/omni-tampo-quilted-maple-verde.png',
  'omni-tampo-quilted-maple-verde-escuro.png': '/images/omni-tampo-quilted-maple-verde-escuro.png',
  'omni-tampo-quilted-maple-vermelho.png': '/images/omni-tampo-quilted-maple-vermelho.png',
  'omni-tampo-maple-burl.png': '/images/omni-tampo-maple-burl.png',
  'omni-tampo-maple-burl-amarelo.png': '/images/omni-tampo-maple-burl-amarelo.png',
  'omni-tampo-maple-burl-azul.png': '/images/omni-tampo-maple-burl-azul.png',
  'omni-tampo-maple-burl-preto.png': '/images/omni-tampo-maple-burl-preto.png',
  'omni-tampo-maple-burl-roxo.png': '/images/omni-tampo-maple-burl-roxo.png',
  'omni-tampo-maple-burl-vermelho.png': '/images/omni-tampo-maple-burl-vermelho.png',
  'omni-tampo-golden-camphor.png': '/images/omni-tampo-golden-camphor.png',
  'omni-tampo-hibrido.png': '/images/omni-tampo-hibrido.png',
  'omni-tampo-koa.png': '/images/omni-tampo-koa.png',
  'omni-tampo-mun-ebony.png': '/images/omni-tampo-mun-ebony.png',
  'omni-tampo-sombra-corpo.png': '/images/omni-tampo-sombra-corpo.png',
  
  // Burst options
  'omni-burst-glow-invertido-azul.png': '/images/omni-burst-glow-invertido-azul.png',
  'omni-burst-glow-invertido-preto.png': '/images/omni-burst-glow-invertido-preto.png',
  'omni-burst-glow-invertido-roxo.png': '/images/omni-burst-glow-invertido-roxo.png',
  'omni-burst-glow-invertido-vermelho.png': '/images/omni-burst-glow-invertido-vermelho.png',
  'omni-burst-glow-verde.png': '/images/omni-burst-glow-verde.png',
  'omni-burst-glow-preto.png': '/images/omni-burst-glow-preto.png',
  'omni-burst-glow-rosa.png': '/images/omni-burst-glow-rosa.png',
  'omni-burst-glow-roxo.png': '/images/omni-burst-glow-roxo.png',
  'omni-burst-glow-vermelho.png': '/images/omni-burst-glow-vermelho.png',
  'omni-burst-glow-degrade-azul.png': '/images/omni-burst-glow-degrade-azul.png',
  'omni-burst-glow-degrade-preto.png': '/images/omni-burst-glow-degrade-preto.png',
  'omni-burst-glow-degrade-roxo.png': '/images/omni-burst-glow-degrade-roxo.png',
  'omni-burst-glow-degrade-verde.png': '/images/omni-burst-glow-degrade-verde.png',
  'omni-burst-invertido-roxo.png': '/images/omni-burst-invertido-roxo.png',
  'omni-burst-preto.png': '/images/omni-burst-preto.png',
  
  // Headstock options
  'omni-headplate-buckeye-burl.png': '/images/omni-headplate-buckeye-burl.png',
  'omni-headstock-inlay-branco.png': '/images/omni-headstock-inlay-branco.png',
  'omni-headstock-inlay-preto.png': '/images/omni-headstock-inlay-preto.png',
  
  // Other components
  'omni-cordas-6.png': '/images/omni-cordas-6.png',
  
  // Branding
  'logo-pluria-white.svg': '/images/logo-pluria-white.svg'
} as const;

export type ImageKey = keyof typeof imageMapping;

export function getImagePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  
  // Extract filename from URL or path
  const filename = imageUrl.split('/').pop();
  if (!filename) return null;
  
  // Check if the filename exists in our mapping
  const mappedPath = imageMapping[filename as ImageKey];
  
  // Add console logging to help diagnose the issue
  console.log('Resolving image path:', { 
    imageUrl, 
    filename, 
    mappedPath,
    exists: !!mappedPath 
  });
  
  return mappedPath || null;
}
