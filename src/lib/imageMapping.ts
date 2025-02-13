import type { Tables } from '@/integrations/supabase/types';

export const imageMapping = {
  // Body options
  'omni-corpo-paulownia.png': '/images/omni-corpo-paulownia.png',
  'omni-corpo-paulownia-amarelo.png': '/images/omni-corpo-paulownia-amarelo.png',
  'omni-corpo-paulownia-vermelho.png': '/images/omni-corpo-paulownia-vermelho.png',
  'omni-corpo-paulownia-verde.png': '/images/omni-corpo-paulownia-verde.png',
  'omni-corpo-paulownia-roxo.png': '/images/omni-corpo-paulownia-roxo.png',
  'omni-corpo-paulownia-preto.png': '/images/omni-corpo-paulownia-preto.png',
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
  
  // Hardware options
  'captador-humbucker-preto.png': '/images/captador-humbucker-preto.png',
  'captador-humbucker-branco.png': '/images/captador-humbucker-branco.png',
  'captador-humbucker-braço-preto.png': '/images/captador-humbucker-braço-preto.png',
  'omni-spokewheel-preto.png': '/images/omni-spokewheel-preto.png',
  'omni-spokewheel-cromado.png': '/images/omni-spokewheel-cromado.png',
  
  // Top options
  'omni-tampo-buckeye-burl-azul.png': '/images/omni-tampo-buckeye-burl-azul.png',
  'omni-tampo-buckeye-burl-roxo.png': '/images/omni-tampo-buckeye-burl-roxo.png',
  'omni-tampo-buckeye-burl-amarelo.png': '/images/omni-tampo-buckeye-burl-amarelo.png',
  'omni-tampo-buckeye-burl-natural.png': '/images/omni-tampo-buckeye-burl-natural.png',
  'omni-tampo-buckeye-burl-vermelho.png': '/images/omni-tampo-buckeye-burl-vermelho.png',
  'omni-tampo-flamed-maple.png': '/images/omni-tampo-flamed-maple.png',
  'omni-tampo-burst-preto.png': '/images/omni-tampo-burst-preto.png',
  'omni-tampo-mun-ebony.png': '/images/omni-tampo-mun-ebony.png',
  
  // Headstock options
  'omni-headplate-buckeye-burl.png': '/images/omni-headplate-buckeye-burl.png',
  'omni-headstock-inlay-branco.png': '/images/omni-headstock-inlay-branco.png',
  'omni-headstock-inlay-preto.png': '/images/omni-headstock-inlay-preto.png',
  
  // Other components
  'omni-ponte-fixa-6.png': '/images/omni-ponte-fixa-6.png',
  'omni-ponte-fixa-6-preto.png': '/images/omni-ponte-fixa-6-preto.png',
  'omni-ponte-fixa-6-cromado.png': '/images/omni-ponte-fixa-6-cromado.png',
  'omni-knobs-preto.png': '/images/omni-knobs-preto.png',
  'omni-knobs-cromado.png': '/images/omni-knobs-cromado.png',
  'omni-switch-blade.png': '/images/omni-switch-blade.png',
  'omni-knob-volume-preto.png': '/images/omni-knob-volume-preto.png',
  'omni-knob-volume-cromado.png': '/images/omni-knob-volume-cromado.png',
  'omni-tarraxas-6-preto.png': '/images/omni-tarraxas-6-preto.png',
  'omni-tarraxas-6-cromado.png': '/images/omni-tarraxas-6-cromado.png',
  'omni-braco-inlays-constelacoes-preto.png': '/images/omni-braco-inlays-constelacoes-preto.png',
  'omni-braco-inlays-constelacoes-branco.png': '/images/omni-braco-inlays-constelacoes-branco.png',
  'omni-cordas-6.png': '/images/omni-cordas-6.png',
  'omni-lighting-luz-corpo.png': '/images/omni-lighting-luz-corpo.png',
  'omni-lighting-sombra-corpo.png': '/images/omni-lighting-sombra-corpo.png',
  
  // Branding
  'logo-pluria-white.svg': '/images/logo-pluria-white.svg'
} as const;

export type ImageKey = keyof typeof imageMapping;

export function getImagePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  
  // Extract filename from URL or path
  const filename = imageUrl.split('/').pop();
  if (!filename) return null;
  
  return imageMapping[filename as ImageKey] || null;
}