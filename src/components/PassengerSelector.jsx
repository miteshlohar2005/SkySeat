import React from 'react'
import { getSeatFee, getSeatTierLabel } from '../data/aircraft.js'

export const MEAL_OPTIONS = [
  { id: 'Standard', label: 'Standard Meal', desc: 'Chef inspired hot meal' },
  { id: 'Vegetarian', label: 'Vegetarian (Lacto-Ovo)', desc: 'Dairy and plant-based' },
  { id: 'Vegan', label: 'Vegan Plant-Based', desc: '100% plant foods, dairy-free' },
  { id: 'Jain', label: 'Jain Meal', desc: 'Pure vegetarian, no root vegetables' },
  { id: 'Halal', label: 'Halal / Asian Meal', desc: 'Halal certified meal' },
  { id: 'GlutenFree', label: 'Gluten-Free / Diabetic', desc: 'Special dietary consideration' },
  { id: 'Child', label: 'Child Friendly Meal', desc: 'Kids favorite meal box' },
]

/**
 * Passenger Selector & Manager Component:
 * - Controls passenger count (+ / -)
 * - Displays individual passenger tabs
 * - Allows seat switching, removal, and meal preference per passenger
 */
export function PassengerSelector({
  passengerCount,
  onPassengerCountChange,
  activePassengerIndex,
  onSelectPassenger,
  assignedSeats,
  layoutId = '3-2',
  onRemoveSeat,
  passengerMeals = {},
  onMealChange,
}) {
  return (
    <div className="space-y-4">
      {/* Passenger Count Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3">
        <div>
          <span className="font-semibold text-ink">Number of Passengers</span>
          <span className="block text-xs text-muted">
            Each passenger requires exactly one assigned seat.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={passengerCount <= 1}
            onClick={() => onPassengerCountChange(passengerCount - 1)}
            aria-label="Decrease passenger count"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 font-bold text-ink transition hover:bg-line disabled:opacity-40"
          >
            −
          </button>
          <span className="w-8 text-center font-bold text-ink">{passengerCount}</span>
          <button
            type="button"
            disabled={passengerCount >= 9}
            onClick={() => onPassengerCountChange(passengerCount + 1)}
            aria-label="Increase passenger count"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 font-bold text-ink transition hover:bg-line disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {/* Passenger Cards */}
      <div className="space-y-2.5">
        {Array.from({ length: passengerCount }, (_, idx) => {
          const seat = assignedSeats[idx]
          const isActive = idx === activePassengerIndex
          const fee = seat ? getSeatFee(seat, layoutId) : 0
          const tierLabel = seat ? getSeatTierLabel(seat, layoutId) : null
          const currentMeal = passengerMeals[idx] || 'Standard'

          return (
            <div
              key={`pax-${idx}`}
              onClick={() => onSelectPassenger(idx)}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                isActive
                  ? 'border-sky-brand bg-surface-2/80 ring-2 ring-sky-brand/30 shadow-md'
                  : 'border-line bg-surface hover:border-muted/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-sky-brand text-navy-950 ring-2 ring-sky-brand/50'
                        : 'bg-line text-muted'
                    }`}
                  >
                    P{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-ink text-sm">
                      <span>Passenger {idx + 1}</span>
                      {isActive && (
                        <span className="rounded-full bg-sky-brand/20 px-2 py-0.5 text-[10px] font-bold text-sky-brand uppercase tracking-wider">
                          Selecting
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {seat ? (
                        <span className="flex items-center gap-1.5 text-ink font-medium">
                          <span>Seat <b className="text-sky-brand">{seat}</b></span>
                          <span>·</span>
                          <span>{tierLabel}</span>
                          <span>·</span>
                          <span className={fee > 0 ? 'text-amber-brand font-bold' : 'text-success'}>
                            {fee > 0 ? `+₹${fee}` : 'Free'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-amber-brand">No seat assigned · Tap any available seat</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {seat && (
                    <button
                      type="button"
                      onClick={() => onRemoveSeat(idx)}
                      title="Remove assigned seat"
                      aria-label={`Remove seat ${seat} for Passenger ${idx + 1}`}
                      className="rounded-lg border border-line px-2 py-1 text-xs text-muted hover:border-danger hover:bg-danger/10 hover:text-danger transition"
                    >
                      ✕ Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectPassenger(idx)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-sky-brand text-navy-950'
                        : 'border border-line hover:bg-surface-2'
                    }`}
                  >
                    {isActive ? 'Current' : 'Select'}
                  </button>
                </div>
              </div>

              {/* Bonus: In-line Meal Selector */}
              <div
                className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <label htmlFor={`meal-${idx}`} className="text-muted flex items-center gap-1">
                  <span>🍽 Meal:</span>
                </label>
                <select
                  id={`meal-${idx}`}
                  value={currentMeal}
                  onChange={(e) => onMealChange(idx, e.target.value)}
                  className="rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink focus:border-sky-brand focus:outline-none"
                >
                  {MEAL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
