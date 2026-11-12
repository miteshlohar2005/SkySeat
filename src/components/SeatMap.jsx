import React from 'react'
import {
  AIRCRAFT_LAYOUTS,
  getSeatTier,
  getSeatFee,
  getSeatTierLabel,
} from '../data/aircraft.js'

/**
 * Reusable dynamic SeatMap component.
 * Renders any aircraft layout without hardcoded columns or static grids.
 * Supports configurable 3-2 and 2-3-2 layouts with aisles, exit rows, and accessible buttons.
 */
export function SeatMap({
  layoutId = '3-2',
  takenSeats = new Set(),
  assignedSeats = [],
  activePassengerIndex = 0,
  onSeatSelect,
}) {
  const layout = AIRCRAFT_LAYOUTS[layoutId] || AIRCRAFT_LAYOUTS['3-2']
  const rows = Array.from({ length: layout.rows }, (_, i) => i + 1)

  // Find passenger index for a seat if assigned
  const getPassengerForSeat = (seatId) => {
    const idx = assignedSeats.indexOf(seatId)
    return idx >= 0 ? idx : null
  }

  return (
    <div className="flex flex-col items-center">
      {/* Visual Aircraft Fuselage Container */}
      <div className="relative w-full max-w-xl rounded-t-[100px] rounded-b-[40px] border-2 border-line bg-surface-2/70 p-4 pt-10 shadow-inner sm:px-8">
        {/* Cockpit Indicator */}
        <div className="mx-auto mb-6 flex flex-col items-center">
          <div className="h-2 w-16 rounded-full bg-line" />
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
            <span>✈</span> Front of Aircraft / Cockpit
          </div>
        </div>

        {/* Dynamic Column Headers with Aisles */}
        <div className="mb-3 flex items-center justify-center gap-2 sm:gap-4">
          <div className="w-7 text-center text-xs font-bold text-muted">Row</div>
          <div className="flex items-center gap-3 sm:gap-6">
            {layout.blocks.map((block, blockIndex) => (
              <React.Fragment key={`header-block-${blockIndex}`}>
                {blockIndex > 0 && (
                  <div
                    className="w-5 text-center text-[10px] font-bold uppercase tracking-wider text-muted sm:w-8"
                    title="Aisle"
                  >
                    Aisle
                  </div>
                )}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {block.map((col) => (
                    <div
                      key={`col-${col}`}
                      className="w-8 text-center text-xs font-bold text-muted sm:w-9"
                    >
                      {col}
                    </div>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dynamic Rows */}
        <div className="space-y-1.5" role="group" aria-label={`Aircraft seat layout ${layout.name}`}>
          {rows.map((rowNumber) => {
            const isExitRow = layout.exitRows.includes(rowNumber)
            const isBulkhead = layout.bulkheadRows.includes(rowNumber)

            return (
              <React.Fragment key={`row-${rowNumber}`}>
                {/* Emergency Exit Row Banner */}
                {isExitRow && (
                  <div className="my-2 flex items-center justify-between rounded-lg border border-amber-brand/30 bg-amber-brand/10 px-3 py-1 text-[11px] font-semibold text-amber-brand">
                    <span>⬅ Emergency Exit Door</span>
                    <span>Row {rowNumber} · Extra Legroom (+₹350)</span>
                    <span>Emergency Exit Door ➡</span>
                  </div>
                )}

                <div
                  className={`flex items-center justify-center gap-2 rounded-lg p-0.5 transition-colors sm:gap-4 ${
                    isExitRow ? 'bg-amber-brand/5' : isBulkhead ? 'bg-sky-brand/5' : ''
                  }`}
                >
                  {/* Row Number Badge */}
                  <div
                    className={`w-7 text-center text-xs font-bold ${
                      isExitRow
                        ? 'text-amber-brand'
                        : isBulkhead
                        ? 'text-sky-brand'
                        : 'text-muted'
                    }`}
                  >
                    {rowNumber}
                  </div>

                  {/* Seat Blocks with Aisles */}
                  <div className="flex items-center gap-3 sm:gap-6">
                    {layout.blocks.map((block, blockIndex) => (
                      <React.Fragment key={`row-${rowNumber}-block-${blockIndex}`}>
                        {/* Aisle Divider */}
                        {blockIndex > 0 && (
                          <div
                            className="flex w-5 items-center justify-center text-[10px] text-line sm:w-8"
                            aria-hidden="true"
                          >
                            <div className="h-6 w-px border-r border-dashed border-line" />
                          </div>
                        )}

                        {/* Seats in this block */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {block.map((col) => {
                            const seatId = `${rowNumber}${col}`
                            const isOccupied = takenSeats.has(seatId)
                            const assignedPassenger = getPassengerForSeat(seatId)
                            const isSelectedByActive = assignedPassenger === activePassengerIndex
                            const isSelectedByOther =
                              assignedPassenger !== null && !isSelectedByActive
                            const tier = getSeatTier(rowNumber, col, layoutId)
                            const fee = getSeatFee(seatId, layoutId)
                            const tierLabel = getSeatTierLabel(seatId, layoutId)

                            // State styling
                            let stateStyle = ''
                            let badgeContent = col
                            let accessibleLabel = `Seat ${seatId}, ${tierLabel}, `

                            if (isOccupied) {
                              stateStyle =
                                'bg-line/60 border border-line text-muted/50 cursor-not-allowed opacity-50 shadow-none'
                              accessibleLabel += 'Occupied, unavailable'
                            } else if (isSelectedByActive) {
                              stateStyle =
                                'bg-sky-brand border-2 border-emerald-400 text-navy-950 font-bold scale-105 shadow-md ring-2 ring-sky-brand/40 animate-pulse'
                              badgeContent = `P${activePassengerIndex + 1}`
                              accessibleLabel += `Selected for Passenger ${activePassengerIndex + 1}`
                            } else if (isSelectedByOther) {
                              stateStyle =
                                'bg-sky-700 border-2 border-sky-400 text-white font-bold scale-100 shadow-sm'
                              badgeContent = `P${assignedPassenger + 1}`
                              accessibleLabel += `Selected for Passenger ${assignedPassenger + 1}`
                            } else if (tier === 'extraLegroom') {
                              stateStyle =
                                'border border-amber-brand/80 bg-amber-500/10 text-amber-brand hover:bg-amber-500/25 hover:border-amber-brand'
                              accessibleLabel += `Extra legroom, fee ₹${fee}`
                            } else if (tier === 'premium') {
                              stateStyle =
                                'border border-indigo-400/80 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/25 hover:border-indigo-400'
                              accessibleLabel += `Premium seat, fee ₹${fee}`
                            } else {
                              stateStyle =
                                'border border-line bg-surface text-ink hover:border-sky-brand hover:bg-surface-2'
                              accessibleLabel += 'Standard seat, free'
                            }

                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isOccupied}
                                aria-label={accessibleLabel}
                                aria-pressed={isSelectedByActive || isSelectedByOther}
                                title={`Seat ${seatId} (${tierLabel} - ₹${fee})${
                                  isOccupied
                                    ? ' · Occupied'
                                    : assignedPassenger !== null
                                    ? ` · Passenger ${assignedPassenger + 1}`
                                    : ' · Available'
                                }`}
                                onClick={() => onSeatSelect(seatId)}
                                className={`relative h-9 w-8 sm:h-9 sm:w-9 rounded-md text-xs font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-sky-brand active:scale-95 ${stateStyle}`}
                              >
                                {badgeContent}
                                {/* Subtle price indicator for paid seats when available */}
                                {!isOccupied && !isSelectedByActive && !isSelectedByOther && fee > 0 && (
                                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-brand text-[8px] font-bold text-navy-950">
                                    ★
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Galley & Rear of Plane */}
        <div className="mx-auto mt-6 flex flex-col items-center border-t border-dashed border-line pt-4">
          <div className="flex gap-4 text-xs font-medium text-muted">
            <span>🚻 Lavatory</span>
            <span>☕ Galley</span>
            <span>🚻 Lavatory</span>
          </div>
          <div className="mt-2 text-[11px] uppercase tracking-wider text-muted">Rear of Aircraft</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Reusable Seat Legend with prices in INR
 */
export function SeatLegend() {
  return (
    <div
      className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-surface p-3 text-xs sm:grid-cols-5"
      role="region"
      aria-label="Seat Legend"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-line bg-surface font-semibold text-ink">
          A
        </span>
        <span>
          <b>Free (₹0)</b>
          <span className="block text-[11px] text-muted">Standard</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-indigo-400 bg-indigo-500/15 font-semibold text-indigo-400">
          ★
        </span>
        <span>
          <b>Premium (₹250)</b>
          <span className="block text-[11px] text-muted">Rows 2–5</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-amber-brand bg-amber-500/15 font-semibold text-amber-brand">
          ★
        </span>
        <span>
          <b>Legroom (₹350)</b>
          <span className="block text-[11px] text-muted">Bulkhead & Exit</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border-2 border-emerald-400 bg-sky-brand font-bold text-navy-950">
          P1
        </span>
        <span>
          <b>Selected</b>
          <span className="block text-[11px] text-muted">Your choice</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-line bg-line/60 font-semibold text-muted/40">
          ✕
        </span>
        <span>
          <b>Occupied</b>
          <span className="block text-[11px] text-muted">Unavailable</span>
        </span>
      </div>
    </div>
  )
}
