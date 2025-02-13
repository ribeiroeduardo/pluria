-- Insert solid color options for subcategory 48
INSERT INTO options (
    id_related_subcategory,
    id,
    active,
    is_default,
    option,
    strings,
    scale_length,
    zindex,
    image_url,
    view,
    color_hardware,
    price_usd
) VALUES
    (48, 2001, true, false, 'Neon Yellow', 'standard', 'standard', 1.0, 'omni-corpo-amarelo-neon.png', 'front', null, 0),
    (48, 2002, true, false, 'Neon Blue', 'standard', 'standard', 1.0, 'omni-corpo-azul-neon.png', 'front', null, 0),
    (48, 2003, true, false, 'Neon Green', 'standard', 'standard', 1.0, 'omni-corpo-verde-neon.png', 'front', null, 0),
    (48, 2004, true, false, 'Neon Purple', 'standard', 'standard', 1.0, 'omni-corpo-roxo-neon.png', 'front', null, 0),
    (48, 2005, true, false, 'Neon Red', 'standard', 'standard', 1.0, 'omni-corpo-vermelho-neon.png', 'front', null, 0),
    (48, 2006, true, false, 'Blue', 'standard', 'standard', 1.0, 'omni-corpo-azul.png', 'front', null, 0),
    (48, 2007, true, false, 'White', 'standard', 'standard', 1.0, 'omni-corpo-branco.png', 'front', null, 0),
    (48, 2008, true, false, 'Black', 'standard', 'standard', 1.0, 'omni-corpo-preto.png', 'front', null, 0),
    (48, 2009, true, false, 'Green', 'standard', 'standard', 1.0, 'omni-corpo-verde.png', 'front', null, 0),
    (48, 2010, true, false, 'Purple', 'standard', 'standard', 1.0, 'omni-corpo-roxo.png', 'front', null, 0),
    (48, 2011, true, false, 'Yellow', 'standard', 'standard', 1.0, 'omni-corpo-amarelo.png', 'front', null, 0); 