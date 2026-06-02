-- FanMap nations seed — the 48 teams of the 2026 tournament (hosts + drawn
-- qualifiers, groups A–L). Colors are an independent supporter palette + flag
-- colors; not official crests. Keep in sync with src/data/worldcup-2026-teams.ts.
--
-- Upsert so re-running updates names/colors. supporter_count is a seed value for
-- preview; live counts are maintained by triggers as supporters join.

insert into public.nations (slug, name, emoji, primary_color, secondary_color, supporter_count)
values
  ('mexico',             'Mexico',                '🇲🇽', '#006847', '#CE1126', 8700),
  ('south-africa',       'South Africa',          '🇿🇦', '#007A4D', '#FFB915', 2600),
  ('korea-republic',     'Korea Republic',        '🇰🇷', '#003478', '#CD2E3A', 5200),
  ('czechia',            'Czechia',               '🇨🇿', '#11457E', '#D7141A', 3300),
  ('canada',             'Canada',                '🇨🇦', '#D80621', '#FFFFFF', 7600),
  ('bosnia-herzegovina', 'Bosnia & Herzegovina',  '🇧🇦', '#001489', '#FECB00', 3100),
  ('qatar',              'Qatar',                 '🇶🇦', '#8A1538', '#FFFFFF', 2400),
  ('switzerland',        'Switzerland',           '🇨🇭', '#D52B1E', '#FFFFFF', 6800),
  ('brazil',             'Brazil',                '🇧🇷', '#009C3B', '#FFDF00', 14210),
  ('morocco',            'Morocco',               '🇲🇦', '#C1272D', '#006233', 8200),
  ('haiti',              'Haiti',                 '🇭🇹', '#00209F', '#D21034', 1800),
  ('scotland',           'Scotland',              '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '#0065BF', '#FFFFFF', 4200),
  ('usa',                'USA',                   '🇺🇸', '#3C3B6E', '#B22234', 9300),
  ('paraguay',           'Paraguay',              '🇵🇾', '#0038A8', '#D52B1E', 2900),
  ('australia',          'Australia',             '🇦🇺', '#00247D', '#FFCD00', 4100),
  ('turkiye',            'Türkiye',               '🇹🇷', '#E30A17', '#FFFFFF', 12480),
  ('germany',            'Germany',               '🇩🇪', '#111111', '#FFCE00', 11200),
  ('curacao',            'Curaçao',               '🇨🇼', '#002B7F', '#F9E814', 900),
  ('ivory-coast',        'Ivory Coast',           '🇨🇮', '#F77F00', '#009E60', 3600),
  ('ecuador',            'Ecuador',               '🇪🇨', '#034EA2', '#FFDD00', 3000),
  ('netherlands',        'Netherlands',           '🇳🇱', '#FF6B00', '#21468B', 7400),
  ('japan',              'Japan',                 '🇯🇵', '#BC002D', '#FFFFFF', 6100),
  ('sweden',             'Sweden',                '🇸🇪', '#005293', '#FECB00', 4300),
  ('tunisia',            'Tunisia',               '🇹🇳', '#E70013', '#FFFFFF', 3400),
  ('belgium',            'Belgium',               '🇧🇪', '#ED2939', '#FAE042', 5200),
  ('egypt',              'Egypt',                 '🇪🇬', '#CE1126', '#000000', 4800),
  ('iran',               'Iran',                  '🇮🇷', '#239F40', '#DA0000', 4000),
  ('new-zealand',        'New Zealand',           '🇳🇿', '#00247D', '#CC142B', 1700),
  ('spain',              'Spain',                 '🇪🇸', '#AA151B', '#F1BF00', 9600),
  ('cape-verde',         'Cape Verde',            '🇨🇻', '#003893', '#CF2027', 800),
  ('saudi-arabia',       'Saudi Arabia',          '🇸🇦', '#006C35', '#FFFFFF', 3900),
  ('uruguay',            'Uruguay',               '🇺🇾', '#0038A8', '#FCD116', 4600),
  ('france',             'France',                '🇫🇷', '#0055A4', '#EF4135', 11800),
  ('senegal',            'Senegal',               '🇸🇳', '#00853F', '#FDEF42', 4400),
  ('iraq',               'Iraq',                  '🇮🇶', '#CE1126', '#000000', 2700),
  ('norway',             'Norway',                '🇳🇴', '#BA0C2F', '#00205B', 4500),
  ('argentina',          'Argentina',             '🇦🇷', '#75AADB', '#F6B40E', 12600),
  ('algeria',            'Algeria',               '🇩🇿', '#006233', '#D21034', 4700),
  ('austria',            'Austria',               '🇦🇹', '#ED2939', '#FFFFFF', 3500),
  ('jordan',             'Jordan',                '🇯🇴', '#007A3D', '#CE1126', 2100),
  ('portugal',           'Portugal',              '🇵🇹', '#006600', '#FF0000', 9100),
  ('dr-congo',           'DR Congo',              '🇨🇩', '#007FFF', '#F7D618', 2300),
  ('uzbekistan',         'Uzbekistan',            '🇺🇿', '#0099B5', '#1EB53A', 1900),
  ('colombia',           'Colombia',              '🇨🇴', '#003893', '#FCD116', 5400),
  ('england',            'England',               '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '#CE1124', '#FFFFFF', 10800),
  ('croatia',            'Croatia',               '🇭🇷', '#FF0000', '#171796', 5600),
  ('ghana',              'Ghana',                 '🇬🇭', '#006B3F', '#FCD116', 3800),
  ('panama',             'Panama',                '🇵🇦', '#072357', '#D21034', 1600)
on conflict (slug) do update set
  name = excluded.name,
  emoji = excluded.emoji,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color;

-- Optional: remove previously-seeded nations that are NOT in the tournament.
-- (Cascades to their supporters — only run on a fresh/dev database.)
-- delete from public.nations
-- where slug not in (
--   'mexico','south-africa','korea-republic','czechia','canada','bosnia-herzegovina',
--   'qatar','switzerland','brazil','morocco','haiti','scotland','usa','paraguay',
--   'australia','turkiye','germany','curacao','ivory-coast','ecuador','netherlands',
--   'japan','sweden','tunisia','belgium','egypt','iran','new-zealand','spain',
--   'cape-verde','saudi-arabia','uruguay','france','senegal','iraq','norway',
--   'argentina','algeria','austria','jordan','portugal','dr-congo','uzbekistan',
--   'colombia','england','croatia','ghana','panama'
-- );
