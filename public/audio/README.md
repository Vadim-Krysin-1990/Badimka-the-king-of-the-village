# Музыка для Бадимки

Игра ищет файл `./audio/music.mp3` (а также опционально `music2.mp3`, `music3.mp3` для случайного чередования). Положи сюда любой mp3 — игра подхватит и будет играть фоном.

Все SFX (звуки кликов, постройки, тревоги, победы) **уже встроены** в код через Web Audio API — никаких файлов скачивать не нужно для них.

## Где взять бесплатную музыку

### Kevin MacLeod — incompetech.com (бесплатно с атрибуцией)

Конкретные треки, идеально подходящие для средневекового сити-билдера:

- **Whisper of Ages** — спокойная атмосферная, идеально для фона города
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100254
- **Mining by Moonlight** — фолк, расслабляющая
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1500030
- **Bumbly March** — кельтская маршевая, оживлённая
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100271
- **Heroic Age** — эпическая, для драматических моментов
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100308
- **Achaidh Cheide** — кельтская танцевальная
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100225
- **Pippin the Hunchback** — средневековая, лёгкая
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100262

При использовании укажи в титрах/README игры:
> "Music: Kevin MacLeod (incompetech.com), licensed under CC BY 4.0"

### Pixabay Music — pixabay.com/music (бесплатно, без атрибуции)

Поиск по запросам:
- `medieval village`
- `medieval ambient`
- `tavern music`
- `fantasy village`
- `celtic instrumental`

Скачивать в mp3, никакая регистрация не нужна для большинства треков.

### Free Music Archive — freemusicarchive.org

Жанр Folk / Medieval — много вариантов, разные лицензии (CC BY часто).

## Как добавить

1. Скачай mp3 трек (один или несколько)
2. Положи рядом с этим README, переименовав в:
   - `music.mp3` (главный фон)
   - `music2.mp3` (второй трек, опционально — будут чередоваться)
   - `music3.mp3` (третий, опционально)
3. Запусти `npm run dev` или открой собранную игру — музыка стартует на первом клике

## Регулировка

В меню «❓ Помощь» внизу:
- Слайдер «Музыка» — громкость фоновой музыки
- Слайдер «SFX» — громкость звуков интерфейса
- Кнопка «🔇 Выключить всё» — мьют

Настройки сохраняются в localStorage.

## Размер

Один трек ~3-5 МБ в mp3 (128 kbps достаточно для фона). Если кладёшь 3 трека — общий размер билда вырастет на 10-15 МБ. Учитывай это при раздаче друзьям по сетям с лимитом.

Хочешь компактнее — конвертируй в 96 kbps mp3 или ogg, теряется качество минимально, размер падает в 2 раза.
