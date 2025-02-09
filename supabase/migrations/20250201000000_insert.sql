
DELETE FROM options;

INSERT INTO options (id_related_subcategory, id, active, is_default, `option`, zindex, image_url, view, strings, scale_length, price_usd) VALUES
(1, 699, true, true, 'Base specs', 'all', 'all', NULL, NULL, NULL, 1785),
(3, 369, true, true, '6 Strings', NULL, 'all', 30, 'omni-cordas-6.png', 'front', NULL, 8),
(3, 370, true, false, '7 Strings', NULL, 'all', 30, NULL, 'front', NULL, 17),
(4, 242, true, true, '25,5', 'all', NULL, NULL, NULL, NULL, 0),
(4, 243, true, false, '25,5 - 27 (Multiscale)', 'all', NULL, NULL, NULL, NULL, 43),
(6, 729, true, true, 'Bolt-on', 'all', 'all', NULL, NULL, 'back', 0),
(6, 21, true, false, 'Set', 'all', 'all', NULL, NULL, 'back', 31),
(7, 83, true, true, '1 pc - Pau Ferro', '6', 'all', 5, 'omni-braco-pau-ferro.png', 'front', NULL, 78),
(7, 989, true, true, '1 pc - Pau Ferro', '7', 'all', 5, NULL, 'front', NULL, 102),
(7, 86, true, false, '1 pc - Flamed Maple', '6', 'all', 5, NULL, 'front', NULL, 107),
(7, 982, true, false, '1 pc - Flamed Maple', '7', 'all', 5, NULL, 'front', NULL, 139),
(19, 91, true, true, 'Paulownia', 'all', 'all', 1, 'omni-corpo-paulownia.png', 'front', NULL, 29),
(19, 94, true, false, 'Mahogany', 'all', 'all', 1, 'omni-corpo-mogno.png', 'front', NULL, 50),
(19, 274, true, false, 'Freijó', 'all', 'all', 1, 'omni-corpo-freijo.png', 'front', NULL, 60),
(21, 244, true, true, 'Flamed Maple', 'all', 'all', 2, 'omni-tampo-flamed-maple.png', 'front', NULL, 146),
(29, 731, true, false, '1 Volume', 'all', 'all', 3, 'omni-knob-volume-preto.png', 'front', NULL, 23),
(29, 1011, true, true, 'Volume + Tone', 'all', 'all', NULL, 'omni-knobs-preto.png', 'front', NULL, 43),
(26, 112, true, true, 'Hipshot Bridge 6', '6', 'standard', 3, 'omni-ponte-fixa-6-preto.png', 'front', NULL, 111),
(27, 102, true, true, 'Hipshot Grip-lock Open', '6', 'all', 10, 'omni-tarraxas-6-preto.png', 'front', NULL, 110),
(38, 195, true, true, 'Switch Blade 5-way Oak Grigsby', 'all', 'all', 3, 'omni-switch-blade.png', 'front', NULL, 27);
