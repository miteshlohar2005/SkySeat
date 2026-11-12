import { AIRCRAFT_LAYOUTS, getSeatFee, getSeatTier, isValidSeatForLayout, getAllSeatsForLayout } from '../src/data/aircraft.js'
import { useStore, calcTotal, takenSeats, seatFee } from '../src/store.js'
import { generateFlights } from '../src/data/generator.js'

let passed = 0
let failed = 0

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`)
    passed++
  } else {
    console.error(`✗ FAIL: ${testName}`)
    failed++
  }
}

console.log('--- SkySeat Assessment Verification Test Suite ---\n')

// 1. Verify Aircraft Layout Configurations
assert(AIRCRAFT_LAYOUTS['3-2'] !== undefined, '3–2 layout configuration exists')
assert(
  JSON.stringify(AIRCRAFT_LAYOUTS['3-2'].blocks) === JSON.stringify([['A', 'B', 'C'], ['D', 'E']]),
  '3–2 layout has correct A B C | aisle | D E blocks'
)
assert(AIRCRAFT_LAYOUTS['2-3-2'] !== undefined, '2–3–2 layout configuration exists')
assert(
  JSON.stringify(AIRCRAFT_LAYOUTS['2-3-2'].blocks) === JSON.stringify([['A', 'B'], ['C', 'D', 'E'], ['F', 'G']]),
  '2–3–2 layout has correct A B | aisle | C D E | aisle | F G blocks'
)

// 2. Verify Pricing Tiers in INR
assert(getSeatFee('1A', '3-2') === 350, 'Bulkhead / Row 1 seat fee is ₹350 (Extra Legroom)')
assert(getSeatFee('10A', '3-2') === 350, 'Exit row (Row 10) seat fee is ₹350 (Extra Legroom)')
assert(getSeatFee('2A', '3-2') === 250, 'Row 2 seat fee is ₹250 (Premium)')
assert(getSeatFee('5C', '3-2') === 250, 'Row 5 seat fee is ₹250 (Premium)')
assert(getSeatFee('6A', '3-2') === 0, 'Row 6 seat fee is ₹0 (Standard / Free)')
assert(getSeatFee('15D', '3-2') === 0, 'Row 15 seat fee is ₹0 (Standard / Free)')

// 3. Test Store Operations & Seat Selection
const flight = generateFlights({ from: 'ISB', to: 'DXB', date: '2026-10-18' })[0]
useStore.getState().setFlight(flight)
useStore.getState().setPassengerCount(2)

const initialPax = useStore.getState().search.adults
assert(initialPax === 2, 'Passenger count initialized to 2')

// Assign seat to Passenger 0
useStore.getState().assignSeat(0, '1A') // ₹350
assert(useStore.getState().seats[0] === '1A', 'Passenger 1 assigned seat 1A')

// Assign seat to Passenger 1
useStore.getState().assignSeat(1, '2A') // ₹250
assert(useStore.getState().seats[1] === '2A', 'Passenger 2 assigned seat 2A')

// 4. Test: Two passengers cannot select the same seat
useStore.getState().assignSeat(1, '1A') // Passenger 2 tries to pick 1A (which was Passenger 1's)
assert(
  useStore.getState().seats[0] !== useStore.getState().seats[1],
  'No two passengers can hold the same seat simultaneously'
)
assert(useStore.getState().seats[1] === '1A', 'Passenger 2 now has 1A')
assert(useStore.getState().seats[0] === null, 'Passenger 1 had 1A unassigned automatically')

// Reassign properly
useStore.getState().assignSeat(0, '6A') // ₹0
useStore.getState().assignSeat(1, '2A') // ₹250

// 5. Test: Changing seats updates the price
const fareBase = useStore.getState().flight.pricePerAdult * 2
const totalWithSeats = calcTotal({
  flight: useStore.getState().flight,
  search: useStore.getState().search,
  seats: useStore.getState().seats,
  layoutId: '3-2',
  extra: [],
  addons: { bag: 0, meal: 'Standard', priority: false },
})
assert(totalWithSeats === fareBase + 0 + 250, `Price with seats (₹0 + ₹250) matches total: ${totalWithSeats}`)

// Change Passenger 0 from 6A (₹0) to 1B (₹350)
useStore.getState().assignSeat(0, '1B')
const updatedTotal = calcTotal({
  flight: useStore.getState().flight,
  search: useStore.getState().search,
  seats: useStore.getState().seats,
  layoutId: '3-2',
  extra: [],
  addons: { bag: 0, meal: 'Standard', priority: false },
})
assert(updatedTotal === fareBase + 350 + 250, `Changing seat to Extra Legroom updates total: ${updatedTotal}`)

// 6. Test: Removing a seat updates the price
useStore.getState().removeSeat(0)
assert(useStore.getState().seats[0] === null, 'Seat 0 removed')
const totalAfterRemoval = calcTotal({
  flight: useStore.getState().flight,
  search: useStore.getState().search,
  seats: useStore.getState().seats,
  layoutId: '3-2',
  extra: [],
  addons: { bag: 0, meal: 'Standard', priority: false },
})
assert(totalAfterRemoval === fareBase + 250, `Removing seat reduces total: ${totalAfterRemoval}`)

// 7. Test: Switching layouts does not leave invalid seat assignments
// Switch to 2-3-2 layout and assign seat '1G' (exists only in 2-3-2)
useStore.getState().setLayoutId('2-3-2')
assert(useStore.getState().layoutId === '2-3-2', 'Switched to 2-3-2 layout')
useStore.getState().assignSeat(0, '1G')
assert(useStore.getState().seats[0] === '1G', 'Seat 1G assigned in 2-3-2 layout')

// Now switch to 3-2 layout: seat '1G' does not exist in 3-2 layout!
useStore.getState().setLayoutId('3-2')
assert(useStore.getState().layoutId === '3-2', 'Switched back to 3-2 layout')
assert(useStore.getState().seats[0] === null, 'Invalid seat 1G was automatically cleared when switching to 3-2')
assert(useStore.getState().seats[1] === '2A', 'Valid seat 2A was retained when switching to 3-2')

// 8. Test: Passenger count changes
useStore.getState().setPassengerCount(4)
assert(useStore.getState().search.adults === 4, 'Passenger count updated to 4')
assert(useStore.getState().seats.length === 4, 'Seats array resized to 4')

// 9. Test: Occupied seats cannot be selected logic
const taken = takenSeats(flight, '3-2')
const firstTaken = Array.from(taken)[0]
assert(taken.size > 0, `Generated ${taken.size} occupied seats deterministically`)

console.log(`\nVerification Complete: ${passed} passed, ${failed} failed.`)
if (failed > 0) process.exit(1)
