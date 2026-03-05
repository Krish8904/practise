import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X, TrendingUp, TrendingDown, BookOpen,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";

const fmt = (num) =>
  num == null ? "0.00"
    : Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const toISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const monthRangeOf = (expense) => {
  if (!expense?.date) {
    const today = new Date();
    return {
      from: toISO(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: toISO(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    };
  }
  const d = new Date(expense.date);
  return {
    from: toISO(new Date(d.getFullYear(), d.getMonth(), 1)),
    to: toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  };
};

const CompanyLedgerModal = ({ company, allExpenses, onClose, sourceExpense }) => {
  const initialRange = monthRangeOf(sourceExpense);
  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);
  const [applied, setApplied] = useState(initialRange);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const overlayRef = useRef(null);

  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  const companyExpenses = useMemo(
    () => allExpenses.filter((e) => e.company === company),
    [allExpenses, company]
  );

  const previousBalance = useMemo(() => {
    if (!applied.from) return 0;
    const from = new Date(applied.from); from.setHours(0, 0, 0, 0);
    return companyExpenses
      .filter((e) => e.date && new Date(e.date) < from)
      .reduce((s, e) => s + (e.inrAmount ?? 0), 0);
  }, [companyExpenses, applied.from]);

  const rangeRows = useMemo(() => {
    let list = companyExpenses;
    if (applied.from) {
      const from = new Date(applied.from); from.setHours(0, 0, 0, 0);
      list = list.filter((e) => e.date && new Date(e.date) >= from);
    }
    if (applied.to) {
      const to = new Date(applied.to); to.setHours(23, 59, 59, 999);
      list = list.filter((e) => e.date && new Date(e.date) <= to);
    }
    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [companyExpenses, applied]);

  const ledgerRows = useMemo(() => {
    let running = previousBalance;
    return rangeRows.map((e) => {
      const amt = e.inrAmount ?? 0;
      running += amt;
      return { ...e, ledgerAmount: amt, closingBalance: running };
    });
  }, [rangeRows, previousBalance]);

  const invoiceAmount = ledgerRows.filter(r => r.ledgerAmount < 0).reduce((s, r) => s + Math.abs(r.ledgerAmount), 0);
  const paymentAmount = ledgerRows.filter(r => r.ledgerAmount > 0).reduce((s, r) => s + r.ledgerAmount, 0);

  const closingBalance = ledgerRows.length > 0
    ? ledgerRows[ledgerRows.length - 1].closingBalance
    : previousBalance;

  const totalPages = Math.max(1, Math.ceil(ledgerRows.length / pageSize));
  const paginated = ledgerRows.slice((page - 1) * pageSize, page * pageSize);
  const showFrom = ledgerRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showTo = Math.min(page * pageSize, ledgerRows.length);

  const handleSearch = () => { setApplied({ from: fromDate, to: toDate }); setPage(1); };
  const handleReset = () => {
    const r = monthRangeOf(sourceExpense);
    setFromDate(r.from); setToDate(r.to); setApplied(r); setPage(1);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // accent border-bottom color per card
  const cardAccents = [
    "border-b-indigo-500",
    "border-b-red-500",
    "border-b-emerald-500",
    closingBalance < 0 ? "border-b-red-500" : "border-b-slate-800",
  ];

  const cards = [
    { label: "Previous Balance", value: previousBalance },
    { label: "Total Invoiced", value: -invoiceAmount },
    { label: "Total Payments", value: paymentAmount },
    { label: "Closing Balance", value: closingBalance },
  ];

  const amtCls = (v) => v < 0 ? "text-red-600" : v > 0 ? "text-emerald-600" : "text-gray-700";

  return (
    <>
      <style>{`
        .ldg-row:hover td { background: #F8FAFC !important; }
        .ldg-src td { background: #EFF6FF !important }
        .ldg-src:hover td { background: #DBEAFE !important; }
        .ldg-scroll::-webkit-scrollbar { width: 5px; }
        .ldg-scroll::-webkit-scrollbar-track { background: #F1F5F9; }
        .ldg-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        .ldg-scroll::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        input[type="date"] { color-scheme: light; }
      `}</style>

      <div
        ref={overlayRef}
        onClick={handleOverlay}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="bg-white w-full max-w-[1200px] h-full max-h-[93vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden rounded-sm">

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-6 border-b border-slate-700 bg-slate-900 flex-shrink-0" style={{ height: 52 }}>
            <div className="flex w-full items-center gap-3">
              <BookOpen size={15} className="text-slate-400" />
              <span className="text-slate-100 text-[13px] font-semibold tracking-wide">
                Account Ledger
              </span>

              <span className="text-slate-600 text-s">-</span>
              <span className="text-slate-400 text-[15px] font-medium font-mono">
                {company}
              </span>

              {sourceExpense?.transactionId && (
                <>
                  <span className="text-slate-700 text-xs">·</span>
                  <span className="ml-auto mr-5 border p-1 rounded-4xl px-2 border-slate-600 bg-slate-800 text-slate-300 text-xs font-mono">
                    {sourceExpense.transactionId}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center border border-slate-700 text-slate-500 hover:border-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-transparent rounded-sm"
            >
              <X size={13} />
            </button>
          </div>

          {/* ── SUMMARY CARDS ── */}
          <div className="grid grid-cols-4 border-b border-slate-200 flex-shrink-0">
            {cards.map((c, i) => (
              <div
                key={i}
                className={`px-5 py-4 border-b-2 ${cardAccents[i]} ${i < 3 ? "border-r border-r-slate-200" : "bg-slate-50"}`}
              >
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {c.label}
                </p>
                <p className={`text-[1.65rem] font-bold font-mono ${amtCls(c.value)}`}>
                  {c.value < 0 ? "−" : ""}₹{fmt(Math.abs(c.value))}
                </p>
              </div>
            ))}
          </div>

          {/* ── FILTER BAR ── */}
          <div className="flex items-center gap-3 px-6 py-2.5 border-b border-slate-200 bg-slate-50 flex-shrink-0 flex-wrap">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Period</span>

            {[
              { label: "From", val: fromDate, set: setFromDate, max: toDate, min: undefined },
              { label: "To", val: toDate, set: setToDate, max: undefined, min: fromDate },
            ].map(({ label, val, set, max, min }) => (
              <div key={label} className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium">{label}</label>
                <input
                  type="date"
                  value={val}
                  max={max}
                  min={min}
                  onChange={e => set(e.target.value)}
                  className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-poppins bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                />
              </div>
            ))}

            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-700 transition-colors font-poppins cursor-pointer"
            >
              <Search size={11} /> Apply
            </button>

            <button
              onClick={handleReset}
              className="flex items-center font-poppins px-3 py-1.5 bg-white text-slate-600 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ↺ Reset
            </button>

            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{ledgerRows.length} records</span>
              {ledgerRows.length > 0 && <span className="text-slate-300">·</span>}
              {ledgerRows.length > 0 && <span>{showFrom}–{showTo} shown</span>}
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="ldg-scroll overflow-y-auto flex-1">
            <table className="w-full border-collapse" style={{ minWidth: 720 }}>
              <thead>
                <tr className="bg-slate-50 sticky top-0 z-10">
                  {["#", "Transaction ID", "Date", "Description", "Type", "Amount (INR)", "Running Balance"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-2.5 text-[13px] font-bold text-slate-500 tracking-wider border-b border-slate-200 whitespace-nowrap ${i >= 5 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {/* Opening balance row */}
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-300 font-mono">—</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-xs text-slate-400 font-poppins">
                    {applied.from ? fmtDate(applied.from) : "—"}
                  </td>
                  <td className="px-4 py-3" colSpan={2}>
                    <span className="text-xs font-semibold text-indigo-500 tracking-wide">Opening Balance</span>
                  </td>
                  <td className="px-4 py-3 text-right" />
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold font-mono ${amtCls(previousBalance)}`}>
                      {previousBalance < 0 ? "−" : ""}₹{fmt(Math.abs(previousBalance))}
                    </span>
                  </td>
                </tr>

                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen size={24} className="text-slate-200" />
                        <span className="text-sm text-slate-400 font-medium">No transactions in this period</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, idx) => {
                    const rowNum = (page - 1) * pageSize + idx + 1;
                    const isCredit = row.ledgerAmount > 0;
                    const isDebit = row.ledgerAmount < 0;
                    const isSource = sourceExpense && row._id === sourceExpense._id;

                    return (
                      <tr
                        key={row._id}
                        className={isSource ? "ldg-src" : "ldg-row"}
                        style={{ borderBottom: "1px solid #F1F5F9" }}
                      >
                        <td className="px-4 py-3 text-xs text-slate-300 font-mono">{rowNum}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold font-mono ${isSource ? "text-blue-600" : "text-slate-800"}`}>
                              {row.transactionId || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-poppins whitespace-nowrap">{fmtDate(row.date)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[220px]">
                          <span className="block truncate" title={row.description}>{row.description || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          {(row.typeLabel || row.type) ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap  tracking-wide
                              ${isCredit ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isDebit ? "bg-red-50 text-red-600 border-red-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                              {isCredit ? <TrendingUp size={9} /> : isDebit ? <TrendingDown size={9} /> : null}
                              {row.typeLabel || row.type}
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-semibold font-mono ${isCredit ? "text-emerald-600" : isDebit ? "text-red-600" : "text-slate-600"}`}>
                            {isDebit ? "−" : "+"}₹{fmt(Math.abs(row.ledgerAmount))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold font-mono ${amtCls(row.closingBalance)}`}>
                            {row.closingBalance < 0 ? "−" : ""}₹{fmt(Math.abs(row.closingBalance))}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── FOOTER ── */}
          {ledgerRows.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-2.5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 font-mono bg-white focus:outline-none cursor-pointer"
                >
                  {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">Page {page} / {totalPages}</span>
                <div className="flex gap-1">
                  {[
                    { label: "← Prev", fn: () => setPage(p => p - 1), off: page === 1 },
                    { label: "Next →", fn: () => setPage(p => p + 1), off: page === totalPages },
                  ].map(({ label, fn, off }) => (
                    <button
                      key={label}
                      onClick={fn}
                      disabled={off}
                      className={`px-3 py-1 text-xs font-semibold rounded border transition-colors
                        ${off
                          ? "border-slate-200 text-slate-300 cursor-not-allowed bg-white"
                          : "border-slate-300 text-slate-600 bg-white hover:bg-slate-100 cursor-pointer"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default CompanyLedgerModal;