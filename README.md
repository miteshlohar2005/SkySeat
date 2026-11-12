# SkySeat – Flight Seat Selection & Passenger Management

SkySeat is a React-based flight booking experience focused on dynamic aircraft seat selection and passenger management. It lets travelers search generated flight itineraries, compare options, select seats across multiple aircraft layouts, manage passenger meal preferences, review pricing, and complete a simulated booking flow.

The project demonstrates how reusable React components and centralized Zustand state can coordinate passenger-specific seat assignments, availability states, layout changes, pricing updates, validation, payment simulation, and persisted trips.

## Live Demo & Repository

- **Live demo:** [skyseat-six.vercel.app](https://skyseat-six.vercel.app/)
- **Repository:** [github.com/miteshlohar2005/SkySeat](https://github.com/miteshlohar2005/SkySeat)

## Key Features

### Flight discovery and booking workflow

- Search from a maintained airport dataset with keyboard-friendly airport autocomplete.
- Support one-way, round-trip, and multi-city searches.
- Select departure and return dates, cabin class, and passenger counts.
- Generate deterministic flight results for a route and date.
- Filter and sort flights by price, stops, airline, departure time, and duration.
- Compare up to three flights before selecting one.
- Continue through seat selection, passenger details, add-ons, payment simulation, confirmation, and My Trips.

### Dynamic aircraft seat layouts

- Supports a **3–2 layout**: `A B C | aisle | D E`.
- Supports a **2–3–2 layout**: `A B | aisle | C D E | aisle | F G`.
- Renders rows and seat blocks from aircraft configuration rather than hardcoded seat grids.
- Switches layouts while retaining valid assignments and clearing invalid ones.
- Displays cockpit, emergency-exit, bulkhead, aisle, galley, and rear-of-aircraft context.

### Passenger and seat management

- Adjusts the passenger count from 1 to 9.
- Tracks a seat for each adult or child passenger.
- Lets the user select an active passenger before assigning a seat.
- Prevents duplicate assignments by removing a seat from its previous passenger when reassigned.
- Supports individual seat removal.
- Stores individual meal preferences from the available meal options.
- Disables continuation until every passenger has a seat assignment.

### Availability and pricing

- Generates deterministic occupied seats for each flight and layout.
- Disables occupied seats in the seat map.
- Distinguishes standard, premium, extra-legroom, selected, and passenger-assigned seats.
- Updates seat fees and booking totals as seats are assigned, changed, or removed.
- Uses Indian Rupees (INR) throughout the booking and trip experience.

### Responsive premium interface

- Uses a dark charcoal, forest-green, and crimson visual system.
- Includes cinematic aviation, runway, and cabin imagery from local public assets.
- Provides responsive layouts for desktop, tablet, and mobile screens.
- Includes keyboard-accessible seat buttons, descriptive labels, disabled states, focus styles, and reduced-motion handling.

## Technology Stack

| Technology | Version | Role | Primary locations |
| --- | --- | --- | --- |
| React | `^19.3.0` | UI composition and page rendering | `src/` |
| React DOM | `^19.3.0` | Browser rendering | `src/main.jsx` |
| React Router DOM | `^7.18.4` | Client-side routes and navigation | `src/App.jsx`, `src/pages.jsx` |
| Zustand | `^5.0.15` | Central booking state and persistence | `src/store.js` |
| Vite | `^8.3.1` | Development server and production bundling | `vite.config.js` |
| Tailwind CSS | `^4.3.3` | Utility styling and theme integration | `src/index.css` |
| `@vitejs/plugin-react` | `^6.1.1` | React support for Vite | `vite.config.js` |
| `@tailwindcss/vite` | `^4.3.3` | Tailwind integration with Vite | `vite.config.js` |
| `qrcode.react` | `^4.2.0` | QR code rendering on boarding passes | `src/pages.jsx` |
| `html-to-image` | `^1.11.13` | Boarding-pass image export | `src/pages.jsx` |

The project uses JavaScript and ES modules. No additional animation or 3D runtime dependency is required; motion is implemented with CSS and existing browser capabilities.

## Application Architecture

The application separates route-level screens, reusable UI components, business state, and static data:

- `App.jsx` owns the navigation shell and route declarations.
- `pages.jsx` contains the booking screens and page-level workflow orchestration.
- `store.js` owns shared booking state, actions, persistence, assignment rules, and total calculations.
- `components/` contains reusable seat, passenger, and booking-summary components.
- `data/` contains aircraft configuration, airport and airline data, and deterministic flight generation.

```text
Browser
└── App.jsx
    ├── Navigation and footer
    └── React Router routes
        ├── Home              → search form and cheapest-days calendar
        ├── Results           → generated flights, filters, sorting, comparison
        ├── Compare           → side-by-side flight comparison
        ├── Seats             → SeatMap + PassengerSelector + BookingSummary
        ├── Passengers        → passenger and contact validation
        ├── Payment           → add-ons and payment simulation
        ├── Confirmation      → boarding pass and booking actions
        └── Dashboard         → persisted trips and booking management

Shared state: src/store.js
    ├── search, selected flight, extra flight legs
    ├── layoutId, seats, passengers, passengerMeals
    ├── addons, contact, comparison list, hold timer
    └── persisted bookings

Configuration and generators
    ├── data/aircraft.js
    ├── data/airports.js
    ├── data/airlines.js
    └── data/generator.js
```

## Zustand State Management

The shared store is defined in `src/store.js` with Zustand's `create` API and wrapped with the `persist` middleware. The persisted storage key is `skyseat-storage`, allowing confirmed bookings and trip-management data to survive page refreshes in a browser.

### State maintained by the store

- `search`: route, dates, trip type, passenger counts, and cabin.
- `flight`: the currently selected primary flight.
- `extra`: additional selected flights for round-trip or multi-city plans.
- `layoutId`: active aircraft layout, initially `3-2`.
- `seats`: seat IDs indexed by passenger index.
- `passengers`: passenger identity fields.
- `passengerMeals`: meal choice indexed by passenger index.
- `addons`: baggage, meal, and priority-boarding choices.
- `contact`: email and phone information.
- `compare`: flights selected for comparison.
- `holdUntil`: the ten-minute seat-hold timestamp.
- `bookings`: confirmed or reserved booking records.

### State update flow

The store exposes focused actions rather than requiring pages to mutate shared objects directly:

- `setSearch` updates search criteria.
- `setFlight` starts a new booking and resets booking-specific selections.
- `addLeg` appends an additional flight to a multi-leg itinerary.
- `setPassengerCount` updates the adult count, resizes `seats` and `passengers`, and keeps the count between 1 and 9.
- `setPassengers`, `setContact`, and `setPassengerMeal` synchronize form data with the shared booking.
- `setAddons` updates baggage, meal, and priority selections.
- `toggleCompare` maintains a maximum of three comparison flights.
- `confirm` creates a booking record and resets the active booking state.
- `updateBooking`, `payBooking`, and `cancel` manage saved trips.

### Seat and pricing synchronization

`assignSeat` builds an updated passenger-indexed seat array, removes the selected seat from any other passenger, toggles the active passenger's assignment, and starts the hold timer when a seat is assigned. `removeSeat` clears an individual passenger's seat.

`calcTotal` combines:

1. The primary flight fare from `totalPrice`.
2. Fares for any additional flights.
3. Seat fees based on `layoutId`.
4. Baggage and priority add-ons.
5. Any booking-level fees.

Because every booking page reads from the same store, seat selections, passenger data, meal preferences, add-ons, totals, and booking status remain consistent as the user moves through the workflow.

When `setLayoutId` changes the aircraft, it calls `isValidSeatForLayout` for every existing seat. Valid seats remain assigned; seats that do not exist in the new layout become `null`.

## Seat Assignment Logic

The seat selection flow is implemented by `Seats` in `src/pages.jsx`, `SeatMap` in `src/components/SeatMap.jsx`, and the assignment actions in `src/store.js`.

```text
Select flight
    ↓
Resolve the active aircraft layout
    ↓
Generate configured seat IDs from rows and seat blocks
    ↓
Generate deterministic occupied seats for this flight/layout
    ↓
Choose the active passenger
    ↓
Click an available seat
    ├── Occupied seat → disabled in SeatMap and ignored by the page handler
    ├── Active passenger already owns it → remove that assignment
    └── Otherwise → assign the seat and clear it from any other passenger
    ↓
Recalculate seat fees and booking totals
    ↓
Repeat until every passenger has a seat
    ↓
Enable “Continue to Passengers”
```

### Algorithm details and edge cases

1. **Dynamic seat generation:** `SeatMap` reads `AIRCRAFT_LAYOUTS[layoutId]`, iterates the configured row count, and renders each configured block.
2. **Availability:** `takenSeats` uses a seeded random generator based on the flight ID and layout ID, so occupied seats are repeatable for the same flight. `SeatMap` disables those buttons.
3. **Passenger selection:** `Seats` tracks the active passenger index locally and passes it to `SeatMap`.
4. **One seat per passenger:** `assignSeat` stores one value at each passenger index.
5. **Duplicate prevention:** before assigning a seat, `assignSeat` scans the passenger seat array and clears that seat from another passenger.
6. **Reassignment and removal:** clicking the active passenger's assigned seat removes it; `removeSeat` explicitly clears a passenger's assignment.
7. **Layout switching:** `setLayoutId` validates the requested layout against `AIRCRAFT_LAYOUTS`.
8. **Invalid assignment cleanup:** existing seat IDs are filtered with `isValidSeatForLayout` during a layout switch.
9. **Fee updates:** `seatFee` delegates to `getSeatFee`, which derives the tier from the seat row and layout.
10. **Continue validation:** `BookingSummary` creates a passenger-length seat list and disables continuation while any entry is empty.

The page-level click handler also checks the deterministic occupied-seat set before calling `assignSeat`. Store-level duplicate protection remains active even when the same seat is selected for a different passenger.

## Pricing System

Seat pricing is defined in `src/data/aircraft.js`:

| Seat tier | Configured fee | Assignment rule |
| --- | ---: | --- |
| Standard | ₹0 | Rows outside premium, bulkhead, and exit-row definitions |
| Premium | ₹250 | Rows 2–5 |
| Extra legroom | ₹350 | Bulkhead row 1 and exit row 10 |

Flight fares are generated by `generateFlights` and calculated for passenger composition by `totalPrice`. `calcTotal` then adds extra-leg fares, seat fees, baggage and priority add-ons, and any booking-level fees.

Illustrative example, using two passengers on a 3–2 aircraft:

```text
Flight fare for two passengers       ₹20,000
Passenger 1: standard seat              ₹0
Passenger 2: premium seat              ₹250
Seat charges                          ₹250
Example booking total               ₹20,250
```

The actual flight fare is generated from the selected route, date, cabin, airline, aircraft, and passenger counts, so the example is explanatory rather than a fixed application value.

## Project Structure

```text
skyseat/
├── public/
│   ├── _redirects
│   └── images/
│       ├── airport-runway.png
│       ├── aviation-hero.png
│       └── luxury-cabin.png
├── scripts/
│   ├── preview.mjs
│   ├── smoke.mjs
│   └── verify-assessment.mjs
├── src/
│   ├── components/
│   │   ├── BookingSummary.jsx
│   │   ├── PassengerSelector.jsx
│   │   └── SeatMap.jsx
│   ├── data/
│   │   ├── aircraft.js
│   │   ├── airlines.js
│   │   ├── airports.js
│   │   └── generator.js
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── pages.jsx
│   └── store.js
├── index.html
├── package.json
├── package-lock.json
├── TESTING.md
├── vercel.json
└── vite.config.js
```

### Important files

- `src/App.jsx`: application shell, navigation, footer, and route declarations.
- `src/pages.jsx`: search, results, comparison, seat selection, passenger, payment, confirmation, and dashboard screens.
- `src/store.js`: persisted Zustand state, seat assignment actions, booking lifecycle, and total calculations.
- `src/components/SeatMap.jsx`: dynamic seat-map rendering and accessible seat states.
- `src/components/PassengerSelector.jsx`: passenger count, active passenger, seat removal, and meal preferences.
- `src/components/BookingSummary.jsx`: seat breakdown, seat charges, total, and continuation guard.
- `src/data/aircraft.js`: layouts, seat tiers, prices, seat generation, and validation.
- `src/data/generator.js`: deterministic flight generation, sorting, fare calendar, and price trends.
- `scripts/verify-assessment.mjs`: automated layout, pricing, assignment, and state checks.
- `scripts/smoke.mjs`: server-side render checks across the application routes.

## Installation & Local Setup

### Clone the repository

```bash
git clone https://github.com/miteshlohar2005/SkySeat.git
cd SkySeat
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Run the automated tests

```bash
npm test
```

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Testing & Validation

The project currently uses two automated checks combined by `npm test`:

```text
verify-assessment.mjs
    ├── validates both aircraft layout definitions
    ├── validates ₹0, ₹250, and ₹350 seat fees
    ├── checks passenger count and seat-array resizing
    ├── checks one-seat-per-passenger duplicate prevention
    ├── checks seat reassignment and removal pricing
    ├── checks layout-switch assignment cleanup
    └── checks deterministic occupied-seat generation

smoke.mjs
    ├── starts Vite in middleware mode
    ├── renders search and results variants
    ├── renders comparison, seats, passengers, and payment pages
    ├── creates a sample booking
    ├── renders confirmation and dashboard pages
    └── checks the fallback route
```

The latest validation performed for this project completed successfully:

- `npm test`: **28 assessment assertions passed** and all smoke routes rendered.
- `npm run build`: **production build completed successfully**.

The test scripts run in a Node environment with a local-storage stub, so Zustand may report that browser storage is unavailable during the assessment checks. Those messages do not represent failed assertions.

## Responsive Design & Accessibility

The interface uses responsive utility classes and route-specific CSS to adapt the search, results, seat map, passenger forms, payment screens, and dashboard across desktop, tablet, and mobile widths.

Implemented accessibility details include:

- `aria-label`, `aria-pressed`, `aria-expanded`, and `role` attributes for interactive controls.
- Keyboard interaction for airport autocomplete.
- Descriptive seat labels containing seat ID, tier, price, and availability.
- Disabled occupied-seat buttons and disabled continuation when seats are incomplete.
- Visible `:focus-visible` styling.
- A `prefers-reduced-motion` media query that minimizes animations and transitions.
- Horizontal scrolling for the aircraft map where narrow screens require it.

## Technical Challenges & Solutions

| Challenge | Implemented solution |
| --- | --- |
| Supporting multiple aircraft layouts | `AIRCRAFT_LAYOUTS` stores rows, blocks, columns, exit rows, bulkhead rows, and premium rows; `SeatMap` renders those definitions dynamically. |
| Preventing duplicate seat assignments | `assignSeat` clears a selected seat from any other passenger before assigning it to the active passenger. |
| Keeping passenger state consistent | `setPassengerCount` resizes both `seats` and `passengers`; page forms read and write through the shared store. |
| Recalculating prices after seat changes | `getSeatFee`, `seatFee`, `calcTotal`, and the booking summary derive totals from the current assignments. |
| Preserving valid seats during layout changes | `setLayoutId` uses `isValidSeatForLayout` and replaces only invalid assignments with `null`. |
| Repeatable occupied-seat scenarios | `takenSeats` seeds its generator with the flight and layout identifiers, producing deterministic availability for a given scenario. |
| Managing multi-leg selections | `planOf`, `addLeg`, and `extra` track the active itinerary and additional selected flights. |

## Future Improvements

These are potential enhancements, not claims about the current implementation:

- Replace generated flight data with a production flight-search API.
- Add a backend for authenticated accounts and server-side booking persistence.
- Add real payment-provider integration and server-side payment verification.
- Add automated browser tests for keyboard navigation and responsive flows.
- Improve localization for currencies, dates, languages, and accessibility text.
- Add a formal component test suite for state transitions and page-level validation.

## Credits & Attribution

SkySeat is built upon the open-source **AeroLink** project by **Muhammad Faiz Alam**. The project retains the applicable original attribution and license requirements while extending the foundation with the SkySeat aircraft configuration, dynamic seat-selection, passenger-management, pricing, and booking-flow work.

Please review the repository's original license and attribution requirements before redistributing or reusing the project.
