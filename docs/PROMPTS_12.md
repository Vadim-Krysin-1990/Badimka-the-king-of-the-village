# Промпты для 12 недостающих зданий «Бадимки»

Каждый блок — самодостаточный промпт: копируй целиком, по одному за раз.

Имя файла на выходе должно начинаться с ID (колонка ID) — тогда игра подхватит его автоматически.

Leonardo: модель Kino XL / AlbedoBase XL, Guidance 6-8, Steps 35-40, 1:1 1024+, Alchemy/PhotoReal off; ChatGPT/DALL-E: проси PNG на чистом белом фоне.


---


## №24 — Плавильня  (ID файла: `smelter`, размер в игре 2x2)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval SMELTER / iron foundry. A squat heavy fieldstone furnace building with thick walls and a TALL stone chimney stack giving off a thin wisp of smoke; a glowing orange furnace mouth at the front radiates warm light. A small slag heap, piled iron ore and black coal to one side, a wheelbarrow. Timber-framed roof in blue-grey slate. Square footprint, both visible walls equal length.
```


## №26 — Оружейная  (ID файла: `weaponsm`, размер в игре 2x2)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval WEAPONSMITH. A stone-and-timber forge with an open work bay: a glowing forge fire, an anvil, and prominent WEAPON RACKS outside displaying swords, spears and a round shield. A wooden hanging sign with a crossed-swords emblem. Slate roof, timber framing. Square footprint, both visible walls equal length.
```


## №27 — Ткацкая мастерская  (ID файла: `weaver`, размер в игре 2x2)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval WEAVER'S WORKSHOP. A half-timbered building with whitewashed plaster panels; through a large open front window a big wooden LOOM is clearly visible, and lengths of woven cloth plus skeins of dyed wool hang on a rail outside to dry. Bundles of raw wool by the door. Square footprint, both visible walls equal length.
```


## №28 — Портной  (ID файла: `tailor`, размер в игре 2x2)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval TAILOR'S SHOP. A cozy half-timbered shop; the front display window shows bolts of colorful fabric and finished garments on a rack, with a tailor's dressform/mannequin beside it. A small hanging sign with needle-and-thread. Warm glowing interior. Square footprint, both visible walls equal length.
```


## №29 — Ювелир  (ID файла: `jeweler`, размер в игре 2x2)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval JEWELER'S SHOP. A small ornate stone shop with fine neat masonry and a GOLDEN hanging sign; the arched front display window glitters with gemstones and gold rings on dark velvet. A lantern by the door, carved decorative trim. Square footprint, both visible walls equal length.
```


## №31 — Колодец  (ID файла: `well`, размер в игре 1x1)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval village WELL. A round stone well with a small peaked WOODEN ROOF on four posts, a rope-and-bucket on a hand crank, and a wooden pail resting on the rim. A compact SINGLE-TILE object, nothing else around it.
```


## №38 — Ярмарочная площадь  (ID файла: `fair`, размер в игре 4x4)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval FAIR GROUND / festival square. A lively cluster of several colorful striped market TENTS and stalls with cloth awnings, bunting flags strung on ropes, barrels and crates of goods, a small wooden stage. Festive. A LARGE sprawling, roughly square footprint.
```


## №41 — Стена (модульный сегмент)  (ID файла: `wall`, размер в игре 1x1)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A single modular STONE WALL SEGMENT with crenellated battlements (merlons and a walkway on top). A straight grey fieldstone piece designed to TILE SEAMLESSLY edge-to-edge with copies of itself. Exactly ONE square tile wide, perfectly symmetric. NO towers, NO gate, NO arch, NO end caps — just a plain repeatable straight wall run.
```


## №42 — Арсенал  (ID файла: `arsenal`, размер в игре 2x2)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval ARSENAL / armory. A fortified squat stone storage building with a heavy iron-banded DOUBLE DOOR standing open to reveal RACKS of weapons and suits of armor inside. A small banner above the door, a couple of supply barrels outside. Square footprint, both visible walls equal length.
```


## №43 — Ратуша  (ID файла: `townhall`, размер в игре 3x3)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A grand medieval TOWN HALL. A large multi-story stone-and-timber civic building with a prominent CLOCK TOWER, an ornate tiled roof, colorful pennant flags, and a carved COAT-OF-ARMS shield above the grand arched entrance. The most dignified civic building in the village. Roughly square footprint, clearly larger and taller than a house.
```


## №45 — Суд  (ID файла: `court`, размер в игре 2x2)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval COURTHOUSE. A dignified, symmetric stone building with a small PORTICO of columns at the entrance, a triangular pediment above, and a SCALES-OF-JUSTICE emblem over the door. Solemn and official. Square footprint, both visible walls equal length.
```


## №46 — Торговый пост  (ID файла: `tradepost`, размер в игре 3x3)

```
Create a single isometric game sprite for a medieval city-builder
(hand-painted, semi-realistic, warm and cozy — same art style as a village of
stone-and-timber houses with terracotta and blue-grey slate roofs, whitewashed
plaster with dark timber framing, glowing warm windows, lanterns and flower boxes).

CAMERA / PROJECTION (most important, must match exactly):
- TRUE 2:1 ISOMETRIC (classic RTS/city-builder dimetric view, like Age of Empires
  / Stronghold) — NOT a 3D perspective render, NOT a high 3/4 camera with vanishing
  points. Parallel edges stay parallel (orthographic).
- The two visible side walls are each tilted 30 degrees from horizontal; they meet
  at a corner in the exact horizontal centre of the sprite and MUST appear the SAME
  length (equal visible depth). Roof apex sits directly above that corner.
- Light: warm late-afternoon sun from the upper-left; sun-lit faces warmer/brighter,
  shadow faces cooler/darker. Keep this identical across every sprite.

BACKGROUND / TRANSPARENCY (critical for game integration):
- Output on a SOLID PURE WHITE (#FFFFFF) background.
- NO ground tile, NO grass patch, NO dirt or cobblestone base plate, NO platform
  under the building, NO baked drop-shadow on the ground. The object floats on plain
  white so it can be cut out cleanly.
- NO text, NO numbers, NO labels, NO UI frame, NO watermark, NO people.
- Single object, centred, fully visible, not cropped, square canvas >=1024px,
  ~12% empty margin on all sides.

NEGATIVE: cartoon flat colors, vector, cel-shading, 3D clay render, photo lens
perspective, green grass platform, cobblestone base, ground tile, drop shadow,
text, labels, border, frame, watermark, people, characters.

OBJECT TO GENERATE:
A medieval TRADING POST. A busy timber-and-stone trade building with a cloth awning, stacks of wooden CRATES and barrels of goods, sacks, a loaded wooden CART out front, and a signpost with trade-route markers — a hint of a caravan/pack-animal trade theme. Lively commerce. Roughly square footprint.
```
