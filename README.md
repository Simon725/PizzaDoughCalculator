# Pizzateig-Rechner

Angular app that calculates pizza dough (direct, poolish, biga, sourdough) from number and weight of dough balls.
Yeast is derived from the fermentation schedule (time + temperature); the pizza diameter is estimated from the style.

## Sourdough model
With sourdough, a starter replaces the yeast. The starter amount (% of total flour) comes from the schedule:

- Each phase counts as equivalent hours at 22 °C; activity doubles every 8 °C (cold slows sourdough more than yeast).
- Starter % = 20 × (equivalent hours / 8)^-2.25, clamped to 2–30 %.
- Examples: 8 h at 22 °C → 20 %, 12 h at 22 °C → 8 %, 2 h + 24 h at 4 °C + 4 h → 9.7 %, same with 48 h → 4.2 %, 72 h → 2.2 %.
- Starter flour and water count toward total flour and hydration (starter hydration 50–200 %, default 100 %).
- Manual override: the switch "Calculated / Manual" in the sourdough panel lets you set the starter % yourself (2–30 %, step 0.5). Switching to manual starts from the calculated value, snapped to the step; the calculated value stays visible as a hint.
- In manual mode the schedule warnings for the starter amount (clamped, no fermentation time) are not shown. Mode and manual % are stored with the settings (`starterMode`, `manualStarterPercent`); older saved settings load in calculated mode.

## Water temperature
The water temperature for the main dough uses the desired dough temperature method (all values in °C):

- Direct: water = 3 × target − room − flour − friction.
- Poolish, biga, sourdough: water = 4 × target − room − flour − pre-ferment − friction.
- Pre-ferment is the temperature of the poolish, biga or sourdough starter when it goes into the main dough (field "Pre-ferment temperature" / "Starter temperature", 0–35 °C, shown only for these methods).
- Until it is edited, the pre-ferment temperature follows the room temperature. An edited value stays independent; "Same as room temperature" makes it follow the room again. It is stored as an optional `preFermentC`, so older saved settings still load.
- The fermentation temperature of the poolish/biga (e.g. 4 °C in the fridge) is not used: take the pre-ferment out in time or enter its actual temperature.
- Friction rise while mixing: by hand 2 °C, stand mixer 12 °C (`WATER_TEMPERATURE_MODEL` in `src/app/dough/water-temperature.ts`).
- The result is clamped to 0–45 °C. Below 0 °C the app suggests ice water, above 45 °C a lower target temperature.
- Example: direct, target 24 °C, room 22 °C, flour 22 °C, stand mixer → 3 × 24 − 22 − 22 − 12 = 16 °C.

## Bake schedule
Optionally, the schedule is planned backwards from a bake date and time (default: tomorrow at 19:00):

- The last main fermentation phase ends at the bake time; each phase starts its duration earlier. Mixing the dough is the start of the first phase.
- Poolish and biga start their pre-ferment time before mixing. Feeding a sourdough starter is not planned.
- Every clock time shows weekday, date and 24-hour time (German `Fr 10.10. 13:00`, English `Fri 10/10 13:00`), so schedules longer than a week stay unambiguous. This applies to the timeline, the recipe step list, the copied recipe text and print. The parts are built with `Intl.DateTimeFormat.formatToParts` in the app locale, so the output is the same in Node and browsers.
- Durations are real elapsed hours (millisecond arithmetic), so across a daylight saving change the wall-clock times shift by one hour (e.g. 24 h before Sun 19:00 after the October change is Sat 20:00).
- The bake time is stored as an ISO string with the on/off flag. A stored bake time in the past is kept as is; the recipe then warns that the first step has passed.

## Units
Metric or imperial is a separate setting (header toggle, saved in the browser), independent of the language:

- Calculation and stored values always use g, °C and cm. Imperial values are converted only for display and input.
- Imperial: ball weight, flour, water, starter, totals and bowl loss in oz (1 decimal); salt, yeast, oil and sugar stay in g; temperatures in whole °F; pizza diameter in whole inches.
- Imperial inputs use steps of 0.5 oz and 1 °F. The store keeps the ball weight in whole grams and temperatures to 0.1 °C, so an imperial value shows unchanged after it is stored.
- Metric fields and texts show whole grams and whole °C. This rounding is display only; it never changes the stored value.

## Requirements
- Node.js 22.12+ (Angular 21)

## Commands
```bash
npm install
npm start      # dev server on http://localhost:4200
npm test       # unit tests (Vitest)
npm run build  # production build
```
