# Промпт для генерации спрайтов «Бадимка: Владыка Королевства»

Используй этот документ как техзадание для ChatGPT (или для генерации через DALL-E/Midjourney/Stable Diffusion напрямую — общую часть промпта можно копировать в любой генератор).

---

## ОБЩИЙ ПРОМПТ (вставлять перед каждым запросом на конкретный объект)

```
Create a single isometric game sprite for a medieval city-builder game
(in the visual style of Anno 1800 / Cossacks / StarCraft — hand-painted,
semi-realistic, warm and cozy lighting).

CRITICAL — CAMERA AND PROJECTION (must match exactly, this is the most
important constraint):
- TRUE 2:1 ISOMETRIC PROJECTION (classic RTS/city-builder "dimetric" view,
  like the original SimCity, Age of Empires, Stronghold, RimWorld) —
  NOT a 3D perspective render, NOT a 3/4 view with vanishing points
- The two visible side walls of the building must each be tilted at
  exactly 30 degrees from horizontal (so the roof ridge and the base
  of the building form a flat diamond/rhombus shape when viewed from
  directly above) — picture the building sitting on a diamond-shaped
  tile that is twice as wide as it is tall
- Camera looks straight down at this fixed angle — no perspective
  convergence, no vanishing point, parallel edges stay parallel
  (orthographic-style, not a photo-realistic camera lens)
- THE TWO VISIBLE WALLS MUST HAVE EQUAL VISIBLE DEPTH/LENGTH — this is
  the most commonly broken rule. If the building's footprint is square
  (equal width and depth), the front-left wall and the front-right wall
  must appear EXACTLY the same length in the image, meeting at a corner
  exactly in the horizontal center of the sprite. Do NOT make one wall
  look like a long facade and the other a short end-cap — both walls
  are the same physical size and must look the same size
- Roof ridge line runs either purely along the X-axis or purely along
  the Y-axis of the isometric grid (not at a random diagonal), and the
  apex of the roof sits directly above the corner where the two walls
  meet
- The building's front-left and front-right walls should be EQUALLY
  visible (symmetric corner-on view), both walls receiving light from
  the upper-left direction

STYLE REQUIREMENTS:
- Warm late-afternoon sunlight from the upper-left (sun-lit faces
  warmer/brighter, shadow faces cooler/darker — consistent across
  all sprites)
- Hand-painted / rendered look, NOT flat vector, NOT cartoon-flat-shaded.
  Visible material textures: brick, wood grain, roof tiles/shingles,
  thatch, stone
- Cozy medieval European village aesthetic: warm wood tones, terracotta
  roofs, whitewashed plaster walls with dark timber framing, glowing
  warm-lit windows, flower boxes, lanterns

TRANSPARENCY AND BACKGROUND (critical for game integration):
- Output as PNG-24 with a TRUE ALPHA TRANSPARENCY CHANNEL — the area
  around the building must be fully transparent, NOT black, NOT white,
  NOT a solid color
- Do NOT include any ground tile, grass patch, dirt patch, or base plate
  — the building/object must be floating with nothing underneath except
  a soft contact shadow baked directly onto the transparent background
- If the generator cannot produce true transparency, generate on a
  SOLID PURE WHITE (#FFFFFF) background instead (not black, not gradient)
  so it can be cleanly removed afterwards with a background-removal tool

OTHER REQUIREMENTS:
- No text, no UI elements, no watermarks, no characters/people unless
  specifically requested
- Single object, centered, fully visible, not cropped
- Square canvas, minimum 1024x1024px, with at least 10% empty margin
  around the object on all sides

OBJECT TO GENERATE:
[INSERT SPECIFIC OBJECT DESCRIPTION HERE]
```

---

## ЧТО НУЖНО СГЕНЕРИРОВАТЬ (полный список)

### 1. Дома — 7 уровней эволюции (от бедной хижины до дворянского дома)
Каждый уровень крупнее и богаче предыдущего. Постепенная эволюция: солома → черепица, один этаж → два этажа, голые стены → фахверк → камень → украшения.

1. **House Lvl 1 — Hovel**: tiny one-room wooden hut, thatched roof, single door, no windows, very poor and simple
2. **House Lvl 2 — Cottage**: small wooden house, thatched roof, one small shuttered window, simple door
3. **House Lvl 3 — Timber House**: slightly bigger wooden house, tiled roof, timber-frame walls, one window with flower box
4. **House Lvl 4 — Stone House**: stone-walled single-story house with
   a SQUARE footprint (equal width and depth — both visible walls must
   be the same length), red tile roof, chimney, two windows with
   shutters and flower boxes (one on each visible wall), lantern by the
   door, small cobblestone path. The door is on the left wall, a window
   is on the right wall, both walls equal length, meeting at a corner in
   the center of the image with the roof apex directly above that corner
5. **House Lvl 5 — Half-Timbered House**: two-story half-timbered (Tudor-style) house, tiled roof, multiple windows with flower boxes, chimney, lantern, firewood pile
6. **House Lvl 6 — Manor**: larger two-wing manor house, combination of stone ground floor and timber-framed upper floor, multiple chimneys, several windows, lush flower boxes, two lanterns
7. **House Lvl 7 — Noble Mansion**: grand two-story stone mansion with a small corner tower, slate roof, large windows with shutters, decorative flag, flower boxes, two lanterns, cobblestone courtyard

### 2. Производство еды
8. **Farm**: ploughed crop field with rows of crops, small wooden storage shed at the edge
9. **Garden**: small fenced vegetable garden plot with neat rows of vegetables
10. **Pasture**: fenced grassy pasture with a few sheep grazing, small wooden fence
11. **Fisher's Hut**: small wooden hut on stilts at the water's edge with a fishing dock and nets drying
12. **Hunter's Lodge**: rustic wooden lodge with animal pelts hanging outside, antlers mounted on the wall
13. **Windmill**: classic stone-base windmill with wooden sails/blades, thatched cap
14. **Bakery**: cozy stone building with a large brick oven chimney, warm glow from the oven, bread loaves visible in the window
15. **Dairy / Cheesemaker**: timber-framed building with milk barrels and cheese wheels stacked outside
16. **Vineyard**: rows of grapevines on wooden trellises with a small stone storage shed

### 3. Сырьевая добыча
17. **Lumberjack's Camp**: open-sided wooden shed with stacked logs, axe stuck in a stump, sawhorse
18. **Quarry**: open stone quarry pit with cut stone blocks and mining equipment
19. **Clay Pit**: muddy clay extraction pit with wooden tools and clay piles
20. **Iron Mine**: mine entrance built into a rocky hillside with wooden support beams and ore carts
21. **Coal Mine**: dark mine entrance with coal piles and wooden support structure

### 4. Переработка
22. **Sawmill**: wooden building with a large water-wheel-powered saw, stacked planks
23. **Carpenter's Workshop**: timber building with woodworking tools, furniture pieces, sawdust visible outside
24. **Smelter**: stone furnace building with a tall chimney, glowing orange furnace opening, smoke
25. **Blacksmith**: stone-and-timber forge with anvil, glowing forge fire, hanging tools, horseshoes
26. **Weaponsmith**: similar to blacksmith but with weapon racks (swords, spears) displayed outside
27. **Weaver's Workshop**: timber-framed building with a large loom visible through the window, hanging fabric
28. **Tailor's Shop**: cozy shop with colorful fabric bolts and finished garments displayed in the window
29. **Jeweler's Shop**: small ornate stone shop with a golden sign, sparkling gem display in window
30. **Scriptorium**: stone building with tall arched windows, quill-and-scroll sign, warm candlelit interior

### 5. Инфраструктура и культура
31. **Well**: stone well with wooden roof structure and bucket on a rope
32. **Market**: open-air market square with colorful awnings/stalls, baskets of goods, barrels
33. **Church**: stone chapel with a bell tower, stained-glass rose window, wooden cross, arched doorway
34. **School**: cozy timber-framed building with a small bell on the roof and a chalkboard visible
35. **Hospital**: whitewashed building with a red cross symbol, herb garden beside it
36. **Tavern**: warm and inviting two-story timber-framed building, hanging wooden sign with a beer mug, glowing windows, barrels and firewood outside
37. **Theatre**: colorful tent-like wooden structure with banners and a small stage area
38. **Fair Grounds**: cluster of colorful market tents and stalls with flags

### 6. Оборона
39. **Barracks**: sturdy stone-and-timber military building with weapon racks and a flag
40. **Watchtower**: tall round stone tower with a conical roof and a flag on top
41. **Wall Segment**: stone defensive wall segment with battlements, modular (straight piece)
42. **Arsenal**: fortified stone storage building with weapon and armor racks visible through open doors

### 7. Администрация
43. **Town Hall**: grand multi-story building with a clock tower, ornate roof, flags, coat-of-arms shield above the entrance
44. **Tax Office**: official-looking stone building with a coin/currency sign
45. **Courthouse**: dignified stone building with columns at the entrance and a justice scale symbol
46. **Trading Post**: busy building with goods crates, a cart, and trade route signage
47. **Royal Palace**: large, ornate multi-towered castle/palace with banners, golden accents, grand entrance — the most impressive building in the game

### 8. Природа и декор (отдельные мелкие спрайты)
48. **Deciduous Tree (variant 1)**: rounded leafy tree, medieval-fantasy style
49. **Deciduous Tree (variant 2)**: slightly different shape/color leafy tree for variety
50. **Pine Tree**: tall conical evergreen pine tree
51. **Rock/Boulder cluster**: small cluster of grey rocks for decoration

### 9. Персонажи (опционально, отдельный набор)
52. **Villager — male, walking**: simple medieval peasant, 4-directional or single south-west facing pose
53. **Villager — female, walking**: same, female variant
54. **Soldier**: medieval guard/soldier with spear and shield
55. **Hero/Mayor character**: slightly more ornate clothing, distinguishing feature (cloak, chain of office)

---

## ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ К ГОТОВЫМ ФАЙЛАМ

Попроси также (это важно для интеграции в игру, но генератор может не выполнить это сам —
проверяй и дорабатывай вручную при необходимости):

- **Формат**: PNG-24 с альфа-каналом (прозрачный фон)
- **Разрешение**: минимум 1024×1024px на объект (с запасом по краям) — потом
  спрайты будут масштабироваться вниз под тайл игры (тайл = 128×64px,
  крупные здания — кратно больше)
- **Единый угол освещения** на ВСЕХ спрайтах — свет с юго-запада/слева-сверху,
  иначе сцена будет выглядеть рассогласованной. В каждом запросе явно
  повторяй фразу про направление света
- **Единая цветовая температура** — тёплая, закатная, во всех спрайтах
- **Единый масштаб людей относительно домов** — сгенерируй сначала один
  "эталонный" дом (например House Lvl 4) и одного villager, и в
  последующих промптах ссылайся: "the same scale as [house lvl 4],
  proportionally sized"
- **Базовая точка крепления (anchor point)**: после генерации все спрайты
  нужно будет обрезать так, чтобы нижняя центральная точка объекта
  (та, что касается земли) была на одной условной линии — это нужно для
  правильного размещения в изометрической сетке. Сама нейросеть это не
  сделает, обрезка — отдельный шаг в Photoshop/GIMP/коде

---

## КАК ИСПОЛЬЗОВАТЬ ЭТОТ ДОКУМЕНТ

1. **Сначала сгенерируй ОДИН объект и проверь угол.** Лучше всего —
   House Lvl 4 (он самый "опорный"). Сравни его с диаграммой ниже:
   крыша должна образовывать плоский ромб (вид сверху на ромбовидный
   тайл 2:1), обе видимые стены — под одинаковым углом ~30° от
   горизонта, без перспективного схождения линий к точке. Если похоже
   на 3D-рендер камерой "сверху-сбоку под 35-45°" с лёгкой перспективой
   (как в первой партии домов 1-3) — попроси переделать с явным
   акцентом на "orthographic 2:1 dimetric, no perspective convergence,
   flat diamond roof outline when viewed from directly above"

   ```
   Эталонный ромб тайла (вид сверху, отношение сторон 2:1):

          /\
         /  \
        /    \
        \    /
         \  /
          \/
   ```

2. Скопируй ОБЩИЙ ПРОМПТ
3. Вставь описание конкретного объекта из списка вместо
   `[INSERT SPECIFIC OBJECT DESCRIPTION HERE]`
4. Сгенерируй, посмотри результат — если стиль/освещение не совпадает
   с другими объектами, добавь в промпт явную ссылку на референс
   ("match the lighting, color palette AND camera angle of [previous
   image]")
5. Сохраняй файлы с понятными именами по списку выше (например
   `house_lvl4_stone.png`, `tavern.png`) — это совпадает с ID построек
   в коде игры (`house`, `tavern`, `church`, `townhall`, и т.д. — см.
   `BUILD` в badimka.html), что упростит интеграцию

После того как набор спрайтов готов — принеси мне файлы (или архив),
и я перепишу графический движок игры так, чтобы он использовал готовые
PNG вместо процедурной генерации (`mkIso`), сохранив всю симуляцию,
экономику и логику без изменений.

---

## ПРО УЖЕ СГЕНЕРИРОВАННЫЕ ДОМА 1-3

Текстуры и стиль (солома, дерево, черепица, цветочные ящики, дровяная
поленница) отличные — этот художественный уровень и направление
освещения подходят. Но угол камеры на них ближе к 3D-перспективному
рендеру "сверху-сбоку", чем к классической 2:1 изометрии RTS. Прежде
чем перегенерировать всю партию, попробуй один раз перегенерировать
House Lvl 4 с уточнённым промптом (см. выше) и сравни с диаграммой
ромба — если угол выправится, можно продолжать в том же стиле для
остальных 50+ объектов.
