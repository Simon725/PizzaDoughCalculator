# Pizzateig-Rechner

Angular app that calculates pizza dough (direct, poolish, biga, sourdough) from number and weight of dough balls.
Yeast is derived from the fermentation schedule (time + temperature); the pizza diameter is estimated from the style.

## Sourdough model
With sourdough, a starter replaces the yeast. The starter amount (% of total flour) comes from the schedule:

- Each phase counts as equivalent hours at 22 °C; activity doubles every 8 °C (cold slows sourdough more than yeast).
- Starter % = 20 × (equivalent hours / 8)^-2.25, clamped to 2–30 %.
- Examples: 8 h at 22 °C → 20 %, 12 h at 22 °C → 8 %, 2 h + 24 h at 4 °C + 4 h → 9.7 %, same with 48 h → 4.2 %, 72 h → 2.2 %.
- Starter flour and water count toward total flour and hydration (starter hydration 50–200 %, default 100 %).

## Water temperature
The water temperature for the main dough uses the desired dough temperature method (all values in °C):

- Direct: water = 3 × target − room − flour − friction.
- Poolish, biga, sourdough: water = 4 × target − room − flour − pre-ferment − friction.
- The pre-ferment temperature is the poolish/biga fermentation temperature; a sourdough starter is assumed to be at room temperature.
- Friction rise while mixing: by hand 2 °C, stand mixer 12 °C (`WATER_TEMPERATURE_MODEL` in `src/app/dough/water-temperature.ts`).
- The result is clamped to 0–45 °C. Below 0 °C the app suggests ice water, above 45 °C a lower target temperature.
- Example: direct, target 24 °C, room 22 °C, flour 22 °C, stand mixer → 3 × 24 − 22 − 22 − 12 = 16 °C.

## Requirements
- Node.js 22.12+ (Angular 21)

## Commands
```bash
npm install
npm start      # dev server on http://localhost:4200
npm test       # unit tests (Vitest)
npm run build  # production build
```
