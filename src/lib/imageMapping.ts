import type { Tables } from '@/integrations/supabase/types';

export const imageMapping = {
  // Body options
  'omni-corpo-paulownia.png': '/images/omni-corpo-paulownia.png',
  'omni-corpo-mogno.png': '/images/omni-corpo-mogno.png',
  'omni-corpo-freijo.png': '/images/omni-corpo-freijo.png',
  
  // Neck options
  'omni-braco-pau-ferro.png': '/images/omni-braco-pau-ferro.png',
  'omni-braco-trastes-padrao.png': '/images/omni-braco-trastes-padrao.png',
  'omni-escala-flamed-maple.png': '/images/omni-escala-flamed-maple.png',
  'omni-escala-pale-moon.png': '/images/omni-escala-pale-moon.png',
  'omni-escala-pau-ferro.png': '/images/omni-escala-pau-ferro.png',
  
  // Hardware options
  'captador-humbucker-preto.png': '/images/captador-humbucker-preto.png',
  'captador-humbucker-branco.png': '/images/captador-humbucker-branco.png',
  'omni-spokewheel-preto.png': '/images/omni-spokewheel-preto.png',
  
  // Top options
  'omni-tampo-buckeye-burl-azul.png': '/images/omni-tampo-buckeye-burl-azul.png',
  'omni-tampo-buckeye-burl-roxo.png': '/images/omni-tampo-buckeye-burl-roxo.png',
  'omni-tampo-buckeye-burl-amarelo.png': '/images/omni-tampo-buckeye-burl-amarelo.png',
  'omni-tampo-buckeye-burl-natural.png': '/images/omni-tampo-buckeye-burl-natural.png',
  'omni-tampo-buckeye-burl-vermelho.png': '/images/omni-tampo-buckeye-burl-vermelho.png',
  'omni-tampo-flamed-maple.png': '/images/omni-tampo-flamed-maple.png',
  'omni-tampo-burst-preto.png': '/images/omni-tampo-burst-preto.png',
  'omni-tampo-mun-ebony.png': '/images/omni-tampo-mun-ebony.png',
  
  // Other components
  'omni-ponte-fixa-6-preto.png': '/images/omni-ponte-fixa-6-preto.png',
  'omni-ponte-fixa-6-cromado.png': '/images/omni-ponte-fixa-6-cromado.png',
  'omni-switch-blade.png': '/images/omni-switch-blade.png',
  'omni-knob-tone-preto.png': '/images/omni-knob-tone-preto.png',
  'omni-knob-tone-cromado.png': '/images/omni-knob-tone-cromado.png',
  'omni-knob-volume-preto.png': '/images/omni-knob-volume-preto.png',
  'omni-knob-volume-cromado.png': '/images/omni-knob-volume-cromado.png',
  'omni-tarraxas-6-preto.png': '/images/omni-tarraxas-6-preto.png',
  'omni-tarraxas-6-cromado.png': '/images/omni-tarraxas-6-cromado.png',
  'omni-braco-inlays-constelacoes-preto.png': '/images/omni-braco-inlays-constelacoes-preto.png',
  'omni-braco-inlays-constelacoes-branco.png': '/images/omni-braco-inlays-constelacoes-branco.png',
  'omni-cordas-6.png': '/images/omni-cordas-6.png',
  'omni-lighting-luz-corpo.png': '/images/omni-lighting-luz-corpo.png',
  'omni-lighting-sombra-corpo.png': '/images/omni-lighting-sombra-corpo.png'
} as const;

export type ImageKey = keyof typeof imageMapping;

export function getImagePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  
  // Extract filename from URL or path
  const filename = imageUrl.split('/').pop();
  if (!filename) return null;
  
  return imageMapping[filename as ImageKey] || null;
}