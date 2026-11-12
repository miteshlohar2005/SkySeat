import React from 'react'
import { getSeatFee, getSeatTierLabel } from '../data/aircraft.js'

/**
 * Reusable Booking Summary component.
 * Displays:
 * - Passenger number/name
 * - Assigned seat
 * - Individual seat fee
 * - Total seat charges
 * - Disables confirmation until every passenger has a valid seat.
 */
export function BookingSummary({
  passengerCount,
  assignedSeats,
  layoutId = '3-2',
  baseFare = 0,
  onContinue,
  passengerMeals = {},
}) {
  const currentSeats = Array.from({ length: passengerCount }, (_, i) => assignedSeats[i] || null)
  const allAssigned = currentSeats.every(Boolean)
  const unassignedCount = currentSeats.filter((s) => !s).length

  // Calculate individual seat fees and total
  const passengerBreakdown = currentSeats.map((seat, i) => {
    const fee = seat ? getSeatFee(seat, layoutId) : 0
    const tier = seat ? getSeatTierLabel(seat, layoutId) : 'No seat'
    const meal = passengerMeals[i] || 'Standard'
    return {
      passengerIndex: i,
      seat,
      fee,
      tier,
      meal,
    }
  })

  const totalSeatCharges = passengerBreakdown.reduce((sum, item) => sum + item.fee, 0)
  const grandTotal = baseFare + totalSeatCharges

  return (
    <aside className="space-y-4 rounded-2xl border border-line bg-surface p-4 shadow-sm lg:sticky lg:top-20">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="text-lg font-bold text-ink">Booking Summary</h2>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
          {passengerCount} {passengerCount === 1 ? 'Traveler' : 'Travelers'}
        </span>
      </div>

      {/* Itemized Passenger Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">
          Seat Assignments & Fees
        </div>

        {passengerBreakdown.map((p) => (
          <div
            key={`summary-pax-${p.passengerIndex}`}
            className="flex items-center justify-between rounded-lg bg-surface-2/60 px-3 py-2 text-xs"
          >
            <div>
              <div className="font-semibold text-ink">
                Passenger {p.passengerIndex + 1}
              </div>
              <div className="text-muted">
                {p.seat ? (
                  <span>
                    Seat <b className="text-sky-brand">{p.seat}</b> ({p.tier})
                  </span>
                ) : (
                  <span className="text-amber-brand font-medium">Seat required</span>
                )}
                {p.meal && <span className="block text-[11px] text-muted">Meal: {p.meal}</span>}
              </div>
            </div>

            <div className="text-right">
              <span className={`font-semibold ${p.fee > 0 ? 'text-amber-brand' : 'text-success'}`}>
                {p.seat ? (p.fee > 0 ? `+₹${p.fee.toLocaleString('en-IN')}` : '₹0 (Free)') : '–'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2 border-t border-line pt-3 text-sm">
        <div className="flex justify-between text-muted">
          <span>Flight Base Fare</span>
          <span className="text-ink font-medium">₹{baseFare.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-muted">
          <span>Total Seat Charges</span>
          <span className={`font-semibold ${totalSeatCharges > 0 ? 'text-amber-brand' : 'text-ink'}`}>
            ₹{totalSeatCharges.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
          <span>Total Payable</span>
          <span className="text-sky-brand">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Call to action & validation state */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          disabled={!allAssigned}
          onClick={onContinue}
          className="w-full rounded-xl bg-sky-brand px-4 py-2.5 font-semibold text-navy-950 shadow-md transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allAssigned ? 'Continue to Passengers' : `Assign All Seats (${unassignedCount} left)`}
        </button>

        {!allAssigned && (
          <p className="text-center text-xs text-amber-brand" role="alert">
            Please assign a seat to every passenger before continuing.
          </p>
        )}
      </div>
    </aside>
  )
}
