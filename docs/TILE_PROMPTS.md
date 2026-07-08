# Промпты для 10 тайлов земли «Бадимки»

Каждый блок самодостаточен: копируй целиком, генерируй по одному.
Итоговый файл называй точно как в заголовке (например `tile_grass.png`) и клади в `./sprites/` —
игра врежет текстуру в изометрический ромб сама.

**Порядок важности:** grass → water → forest → road → fert → sand → hill → mtn → river → swamp.
Трава — 80% экрана: сначала добейся её, остальные подгоняй к ней по насыщенности.

**Проверка бесшовности:** в Leonardo включи Tiling (если есть); в ChatGPT попроси 'seamless, edges wrap'.
Быстрый тест: открой PNG, мысленно сложи 2×2 — если видна сетка или пятно яркости, перегенерируй.

---


## `tile_grass.png` — Трава (основной тайл, 80% карты)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Lush medieval meadow GRASS, top-down. Base color a warm mid-green (around #5d8a3c). Dense short painted grass blades with subtle tonal variation, a few tiny scattered wildflowers (red, yellow, white — very small, sparse) and occasional tiny clover patches. Soft, cozy, storybook feel. Even color balance so it reads calm from far away.
```


## `tile_fert.png` — Плодородная земля (пашня)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Fertile dark PLOUGHED SOIL, top-down. Rich warm brown earth (around #6f5733) with subtle straight furrow lines running diagonally (bottom-left to top-right), tiny green sprout dots in some furrows, small soil clumps. The furrows must align at the edges so the pattern tiles seamlessly.
```


## `tile_sand.png` — Песок (пляжи и отмели)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Warm beach SAND, top-down. Pale golden-tan (around #cbb27a) with fine painted grain, faint ripple lines left by water, a few tiny pebbles and shell fragments (very small and sparse). Soft and clean.
```


## `tile_water.png` — Море / озеро (глубокая вода)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Deep calm WATER, top-down. Rich dark teal-blue (around #27537a) with soft painted wave ripples, gentle darker depth patches and a few subtle lighter ripple highlights. NO foam edges, NO shoreline — pure open water only (the game draws shorelines itself). Low contrast so it stays calm.
```


## `tile_river.png` — Река (мелкая пресная вода)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Shallow RIVER water, top-down. Lighter blue-teal than the sea (around #3a6f9a), livelier: gentle current streaks flowing diagonally, small ripple glints, a hint of sandy riverbed showing through in places. NO banks, NO stones breaking the surface — just flowing water.
```


## `tile_forest.png` — Лесная подстилка (земля под деревьями)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Forest floor UNDERGROWTH, top-down. Darker cool green (around #37602b): shaded moss, small ferns, fallen leaves, tiny twigs, patches of bare dark earth. IMPORTANT: this is only the GROUND under trees — the game draws the trees themselves as separate sprites on top, so NO tree trunks, NO canopies, NO stumps.
```


## `tile_hill.png` — Холмы (травянисто-каменистая земля)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Dry HILL ground, top-down. Olive grass-and-earth mix (around #827e60): shorter dry grass, exposed dusty soil patches, scattered small flat stones and gravel. Slightly rougher and paler than the meadow grass so hills read clearly at a distance.
```


## `tile_mtn.png` — Горы (скальная порода)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Bare MOUNTAIN ROCK ground, top-down. Grey stone (around #6e6e74): cracked rock plates, gravel, small scree fragments, faint cool-toned mineral veins. IMPORTANT: only the flat rocky ground — the game draws boulders as separate sprites on top, so NO large 3D-looking rocks, NO cliffs, NO snow.
```


## `tile_swamp.png` — Болото

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Murky SWAMP ground, top-down. Desaturated dark green (around #4e6b4a): wet mud, stagnant shallow puddles with a dull sheen, moss clumps, sparse reed stubble and tiny algae patches. Uninviting but painterly; keep puddle shapes small so they don't visibly repeat.
```


## `tile_road.png` — Дорога (утоптанный тракт)

```
Create a SEAMLESS TILEABLE ground texture for a medieval city-builder game
(hand-painted, semi-realistic, warm and cozy — same painterly style as the
building sprites: soft brushwork, rich color, no photo textures).

CRITICAL — FORMAT (must match exactly):
- TOP-DOWN VIEW, camera looking STRAIGHT DOWN at flat ground (90 degrees).
  NO perspective, NO isometric angle, NO horizon — a flat overhead texture.
- PERFECTLY SEAMLESS / TILEABLE: the left edge must continue into the right
  edge and the top into the bottom with no visible seam when repeated.
- EVEN, UNIFORM LIGHTING across the whole image: no vignette, no light spots,
  no directional shadows, no gradient from corner to corner — any brightness
  drift becomes an ugly grid pattern when the tile repeats.
- FINE, SMALL-SCALE detail only: no large recognizable shapes, no single big
  rock/flower/log that would visibly repeat. Think «carpet», not «scene».
- NO objects, NO buildings, NO trees, NO animals, NO people, NO borders,
  NO frames, NO text, NO watermark.
- Square canvas 1024x1024. The game engine squashes the texture 2:1 into an
  isometric diamond, so slightly vertically-stretched detail is fine.

NEGATIVE: perspective, 3D render, isometric view, horizon, vignette,
directional shadow, large objects, border, frame, text, watermark, photo.

TEXTURE TO GENERATE:
Packed DIRT ROAD surface, top-down. Dusty grey-brown (around #9c9078): hard-trodden earth, faint wheel-rut streaks running diagonally (bottom-left to top-right, matching the isometric direction), small embedded pebbles, thin dry cracks. Edges must tile seamlessly; NO grass verges — the road tile is drawn on top of terrain by the game.
```
