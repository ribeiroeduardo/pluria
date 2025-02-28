
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
  'omni-corpo-freijo.png': '/images/omni-corpo-freijo.png',
  'omni-corpo-freijo-vermelho.png': '/images/omni-corpo-freijo-vermelho.png',
  'omni-corpo-freijo-roxo.png': '/images/omni-corpo-freijo-roxo.png',
  'omni-corpo-freijo-verde.png': '/images/omni-corpo-freijo-verde.png',
  'omni-corpo-freijo-preto.png': '/images/omni-corpo-freijo-preto.png',
  'omni-corpo-amarelo-neon.png': '/images/omni-corpo-amarelo-neon.png',
  'omni-corpo-laranja-neon.png': '/images/omni-corpo-laranja-neon.png',
  'omni-corpo-azul-neon.png': '/images/omni-corpo-azul-neon.png',
  'omni-corpo-verde-neon.png': '/images/omni-corpo-verde-neon.png',
  'omni-corpo-rosa-neon.png': '/images/omni-corpo-rosa-neon.png',
  'omni-corpo-vermelho-neon.png': '/images/omni-corpo-vermelho-neon.png',
  'omni-corpo-azul.png': '/images/omni-corpo-azul.png',
  'omni-corpo-branco.png': '/images/omni-corpo-branco.png',
  'omni-corpo-preto.png': '/images/omni-corpo-preto.png',
  'omni-corpo-preto-sparkle.png': '/images/omni-corpo-preto-sparkle.png',
  'omni-corpo-verde.png': '/images/omni-corpo-verde.png',
  'omni-corpo-roxo.png': '/images/omni-corpo-roxo.png',
  'omni-corpo-amarelo.png': '/images/omni-corpo-amarelo.png',
  'omni-corpo-rosa.png': '/images/omni-corpo-rosa.png',
  'omni-corpo-cinza.png': '/images/omni-corpo-cinza.png',
  
  // Neck options
  'omni-braco-pau-ferro.png': '/images/omni-braco-pau-ferro.png',
  'omni-braco-flamed-maple.png': '/images/omni-braco-flamed-maple.png',
  'omni-braco-trastes-padrao.png': '/images/omni-braco-trastes-padrao.png',
  'omni-escala-flamed-maple.png': '/images/omni-escala-flamed-maple.png',
  'omni-escala-pale-moon.png': '/images/omni-escala-pale-moon.png',
  'omni-escala-pau-ferro.png': '/images/omni-escala-pau-ferro.png',
  'omni-braco-inlays-constelacoes-preto.png': '/images/omni-braco-inlays-constelacoes-preto.png',
  'omni-braco-inlays-constelacoes-branco.png': '/images/omni-braco-inlays-constelacoes-branco.png',
  
  // Hardware options
  'captador-humbucker-preto.png': '/images/captador-humbucker-preto.png',
  'captador-humbucker-branco.png': '/images/captador-humbucker-branco.png',
  'captador-humbucker-braço-preto.png': '/images/captador-humbucker-braço-preto.png',
  'captador-humbucker-fishman-branco.png': '/images/captador-humbucker-fishman-branco.png',
  'captador-humbucker-fishman-preto.png': '/images/captador-humbucker-fishman-preto.png',
  'captador-humbucker-capa-preto.png': '/images/captador-humbucker-capa-preto.png',
  'captador-humbucker-capa-niquel.png': '/images/captador-humbucker-capa-niquel.png',
  'omni-spokewheel-preto.png': '/images/omni-spokewheel-preto.png',
  'omni-spokewheel-cromado.png': '/images/omni-spokewheel-cromado.png',
  'omni-ponte-fixa-6-preto.png': '/images/omni-ponte-fixa-6-preto.png',
  'omni-ponte-fixa-6-cromado.png': '/images/omni-ponte-fixa-6-cromado.png',
  'omni-ponte-fixa-6.png': '/images/omni-ponte-fixa-6.png',
  'omni-tarraxas-6-preto.png': '/images/omni-tarraxas-6-preto.png',
  'omni-tarraxas-6-cromado.png': '/images/omni-tarraxas-6-cromado.png',
  'omni-knobs-preto.png': '/images/omni-knobs-preto.png',
  'omni-knobs-cromado.png': '/images/omni-knobs-cromado.png',
  'omni-knob-volume-preto.png': '/images/omni-knob-volume-preto.png',
  'omni-knob-volume-cromado.png': '/images/omni-knob-volume-cromado.png',
  'omni-switch-blade.png': '/images/omni-switch-blade.png',
  
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
  
  // Lighting
  'omni-lighting-luz-corpo.png': '/images/omni-lighting-luz-corpo.png',
  'omni-lighting-sombra-corpo.png': '/images/omni-lighting-sombra-corpo.png',
  'omni-lighting-corpo.png': '/images/omni-lighting-corpo.png',
  
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
