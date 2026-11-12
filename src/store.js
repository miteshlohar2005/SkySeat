import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAirport } from './data/airports.js'
import { DEMO_SEARCH, totalPrice, createRng } from './data/generator.js'
import {
  AIRCRAFT_LAYOUTS,
  getSeatFee,
  getAllSeatsForLayout,
  isValidSeatForLayout,
} from './data/aircraft.js'

export const takenSeats = (f, layoutId = '3-2') => {
  const t = new Set()
  if (!f) return t
  const all = getAllSeatsForLayout(layoutId)
  const r = createRng(f.id + 'seats-' + layoutId)
  for (const id of all) {
    if (r.chance(0.32)) t.add(id)
  }
  return t
}

export const planOf = (s) => {
  const one = [{ from: s.from, to: s.to, date: s.depart }]
  if (s.trip === 'round') return [one[0], { from: s.to, to: s.from, date: s.ret }]
  if (s.trip !== 'multi' || !s.legs) return one
  const L = s.legs
    .split(',')
    .map((x) => {
      const [from, to, y, m, d] = x.split('-')
      return { from, to, date: y && m && d ? `${y}-${m}-${d}` : '' }
    })
    .filter((l) => getAirport(l.from) && getAirport(l.to))
  return L.length ? L : one
}

export const seatFee = (id, layoutId = '3-2') => getSeatFee(id, layoutId)

export const addonFee = (a, n) =>
  (({ 0: 0, 10: 950, 20: 1800 })[a.bag] || 0) * n + (a.priority ? 450 * n : 0)

export const ADDONS = { bag: 0, meal: 'Standard', priority: false }

export const calcTotal = (b) => {
  const layout = b.layoutId || '3-2'
  const fare = totalPrice(b.flight, b.search)
  const extraFares = (b.extra || []).reduce((t, f) => t + totalPrice(f, b.search), 0)
  const seatFees = (b.seats || []).reduce((t, id) => t + (id ? seatFee(id, layout) : 0), 0)
  const addonsTotal = addonFee(b.addons || ADDONS, (b.search?.adults || 1) + (b.search?.children || 0))
  const fees = b.fees || 0
  return fare + extraFares + seatFees + addonsTotal + fees
}

export const useStore = create(
  persist(
    (set, get) => ({
      search: (({ return: r, ...d }) => ({ ...d, trip: 'round', ret: r }))(DEMO_SEARCH),
      extra: [],
      addLeg: (f) => set({ extra: [...get().extra, f], compare: [] }),
      updateBooking: (ref, patch) =>
        set({
          bookings: get().bookings.map((b) => (b.ref === ref ? { ...b, ...patch } : b)),
        }),
      setSearch: (p) => set({ search: { ...get().search, ...p } }),
      flight: null,
      layoutId: '3-2',
      setLayoutId: (layoutId) => {
        const validLayout = AIRCRAFT_LAYOUTS[layoutId] ? layoutId : '3-2'
        const currentSeats = get().seats || []
        // Sanitize: ensure no invalid seats persist when switching layouts
        const sanitizedSeats = currentSeats.map((seat) =>
          seat && isValidSeatForLayout(seat, validLayout) ? seat : null
        )
        set({ layoutId: validLayout, seats: sanitizedSeats })
      },
      setFlight: (flight) => {
        const layout = flight?.layout && AIRCRAFT_LAYOUTS[flight.layout] ? flight.layout : '3-2'
        set({
          flight,
          layoutId: layout,
          extra: [],
          compare: [],
          seats: [],
          passengers: [],
          passengerMeals: {},
          holdUntil: null,
          addons: { ...ADDONS },
        })
      },
      holdUntil: null,
      startHold: () => {
        if (!get().holdUntil) set({ holdUntil: Date.now() + 600000 })
      },
      clearHold: () => set({ holdUntil: null, seats: [] }),
      addons: { ...ADDONS },
      setAddons: (addons) => set({ addons }),
      contact: null,
      setContact: (contact) => set({ contact }),
      compare: [],
      toggleCompare: (f) => {
        const c = get().compare
        set({
          compare: c.some((x) => x.id === f.id)
            ? c.filter((x) => x.id !== f.id)
            : c.length < 3
            ? [...c, f]
            : c,
        })
      },
      seats: [],
      setSeats: (seats) => set({ seats }),
      assignSeat: (passengerIndex, seatId) => {
        const { seats, layoutId, startHold } = get()
        const totalPax = (get().search?.adults || 1) + (get().search?.children || 0)
        const updated = Array.from({ length: totalPax }, (_, i) => seats[i] || null)

        // If seat was assigned to another passenger, unassign them first (prevent duplicate seats)
        for (let i = 0; i < updated.length; i++) {
          if (updated[i] === seatId && i !== passengerIndex) {
            updated[i] = null
          }
        }

        // Toggle or assign
        if (updated[passengerIndex] === seatId) {
          updated[passengerIndex] = null
        } else {
          updated[passengerIndex] = seatId
          startHold()
        }
        set({ seats: updated })
      },
      removeSeat: (passengerIndex) => {
        const { seats } = get()
        const updated = [...seats]
        if (passengerIndex < updated.length) {
          updated[passengerIndex] = null
          set({ seats: updated })
        }
      },
      passengerMeals: {},
      setPassengerMeal: (passengerIndex, meal) => {
        const current = { ...get().passengerMeals }
        current[passengerIndex] = meal
        set({ passengerMeals: current })
      },
      setPassengerCount: (count) => {
        const safeCount = Math.max(1, Math.min(9, count))
        const { search, seats, passengers } = get()
        const newSearch = { ...search, adults: safeCount, children: 0 }
        const newSeats = Array.from({ length: safeCount }, (_, i) => seats[i] || null)
        const newPassengers = Array.from({ length: safeCount }, (_, i) => passengers[i] || { first: '', last: '', dob: '', passport: '' })
        set({ search: newSearch, seats: newSeats, passengers: newPassengers })
      },
      passengers: [],
      setPassengers: (passengers) => set({ passengers }),
      bookings: [],
      confirm: (method = 'card') => {
        const { flight, extra, seats, search, bookings, passengers, contact, addons, layoutId, passengerMeals } = get()
        const ref = 'SK' + Math.floor(10000 + Math.random() * 89999)
        const allSeats = getAllSeatsForLayout(layoutId)
        const extraSeats = extra.map((f) => {
          const t = takenSeats(f, layoutId)
          const used = new Set()
          return seats.map((id) => {
            let pick = id
            if (!pick || t.has(pick) || used.has(pick)) {
              pick = allSeats.find((x) => !t.has(x) && !used.has(x))
            }
            used.add(pick)
            return pick
          })
        })
        const nb = {
          ref,
          flight,
          layoutId,
          extra,
          extraSeats,
          seats,
          passengers,
          passengerMeals,
          contact,
          search,
          addons,
          total: 0,
          status: 'upcoming',
          payStatus: method === 'later' ? 'unpaid' : 'paid',
          payDue: method === 'later' ? Date.now() + 864e5 : null,
        }
        nb.total = calcTotal(nb)
        set({
          bookings: [nb, ...bookings],
          extra: [],
          compare: [],
          flight: null,
          seats: [],
          passengers: [],
          passengerMeals: {},
          holdUntil: null,
          addons: { ...ADDONS },
        })
        return ref
      },
      payBooking: (ref) =>
        set({
          bookings: get().bookings.map((b) =>
            b.ref === ref ? { ...b, payStatus: 'paid', payDue: null } : b
          ),
        }),
      expireUnpaid: () => {
        const now = Date.now()
        const late = (b) => b.status === 'upcoming' && b.payStatus === 'unpaid' && b.payDue < now
        if (get().bookings.some(late)) {
          set({
            bookings: get().bookings.map((b) =>
              late(b) ? { ...b, status: 'cancelled', refund: 0, expired: true } : b
            ),
          })
        }
      },
      cancel: (ref) =>
        set({
          bookings: get().bookings.map((b) => (b.ref === ref ? { ...b, status: 'cancelled' } : b)),
        }),
    }),
    { name: 'skyseat-storage' }
  )
)
