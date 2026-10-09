# Pizzateig-Rechner

Angular app that calculates pizza dough (direct, poolish, biga, sourdough) from number and weight of dough balls.
Yeast is derived from the fermentation schedule (time + temperature); the pizza diameter is estimated from the style.

## Sourdough model
With sourdough, a starter replaces the yeast. The starter amount (% of total flour) comes from the schedule:

- Each phase counts as equivalent hours at 22 °C; activity doubles every 8 °C (cold slows sourdough more than yeast).
- Starter % = 20 × (equivalent hours / 8)^-2.25, clamped to 2–30 %.
- Examples: 8 h at 22 °C → 20 %, 12 h at 22 °C → 8 %, 2 h + 24 h at 4 °C + 4 h → 9.7 %, same with 48 h → 4.2 %, 72 h → 2.2 %.
- Starter flour and water count toward total flour and hydration (starter hydration 50–200 %, default 100 %).

## Requirements
- Node.js 22.12+ (Angular 21)

## Commands
```bash
npm install
npm start      # dev server on http://localhost:4200
npm test       # unit tests (Vitest)
npm run build  # production build
```
