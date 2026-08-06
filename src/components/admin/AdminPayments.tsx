import React from "react";
import { DollarSign, RefreshCw, Ticket } from "lucide-react";
import type { Payment, LaunchTicket } from "../../types";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "../../lib/swal";

interface AdminPaymentsProps {
  paymentsList: Payment[];
  launchTickets: LaunchTicket[];
  loadAdminData: () => Promise<void>;
}

export default function AdminPayments({ paymentsList, launchTickets, loadAdminData }: AdminPaymentsProps) {
  const [refundLoadingId, setRefundLoadingId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6" id="panel-admin-payments">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2 text-left">
            <DollarSign className="w-5 h-5 text-brand-pink" />
            <span>Financial Ledger & Stripe Refund Manager</span>
          </h2>
          <p className="text-slate-500 text-[11px] mt-1 text-left">
            View audit trails of membership fees and summit registrations. Issue instant Stripe refunds securely.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Transaction ID / Date</th>
                <th className="py-4 px-6">Member ID</th>
                <th className="py-4 px-6">Purpose & Details</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No financial records found in the database.
                  </td>
                </tr>
              ) : (
                paymentsList.map((payment) => {
                  const isStripeRefundable = payment.transactionId?.startsWith("TXN-STRIPE-");
                  return (
                    <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50" id={`payment-row-${payment.id}`}>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-800 block text-[11px]">{payment.transactionId || payment.id}</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5">{new Date(payment.createdAt).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-700">{payment.userId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 block">{payment.purpose}</span>
                        <span className="text-slate-400 text-[10px] font-mono block mt-0.5">Item: {payment.itemId}</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-full text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                          {payment.method}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${
                          payment.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : payment.status === "refunded"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {payment.status === "completed" ? (
                          <button
                            onClick={async () => {
                              const promptMsg = isStripeRefundable 
                                ? `Are you sure you want to issue a refund of $${payment.amount.toFixed(2)}? This will call Stripe's live Refund API.` 
                                : `Are you sure you want to refund this transaction for $${payment.amount.toFixed(2)}?`;
                              
                              const confirmed = await showConfirmDialog("Issue Refund?", promptMsg, "Yes, Issue Refund");
                              if (!confirmed) return;
                              
                              setRefundLoadingId(payment.id);
                              try {
                                const res = await fetch(`/api/payments/${payment.id}/refund`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" }
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  showSuccessAlert("Refund Processed", data.message || "Refund executed successfully!");
                                  loadAdminData();
                                } else {
                                  showErrorAlert("Refund Failed", data.error || "Failed to process refund.");
                                }
                              } catch (err) {
                                showErrorAlert("Error", "Network error processing refund.");
                              } finally {
                                setRefundLoadingId(null);
                              }
                            }}
                            disabled={refundLoadingId !== null}
                            className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40 rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            {refundLoadingId === payment.id ? "Refunding..." : "Issue Refund"}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LAUNCH EXPERIENCE TICKET SALES */}
      <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden text-left">
        <div className="px-6 pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Ticket className="w-4 h-4 text-brand-gold-dark" />
            <span>Launch Experience Ticket Sales</span>
          </h3>
          <p className="text-slate-500 text-[11px] mt-1">
            Stripe-confirmed ticket purchases with their access pass badge codes.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Attendee</th>
                <th className="py-4 px-6">Ticket</th>
                <th className="py-4 px-6">Qty</th>
                <th className="py-4 px-6">Paid</th>
                <th className="py-4 px-6">Access Pass Code</th>
                <th className="py-4 px-6">Team</th>
                <th className="py-4 px-6">Date</th>
              </tr>
            </thead>
            <tbody>
              {launchTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No Launch Experience ticket purchases yet.
                  </td>
                </tr>
              ) : (
                launchTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50/50" id={`launch-ticket-row-${ticket.id}`}>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 block">{ticket.attendeeName}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{ticket.attendeeEmail}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700">{ticket.ticketName}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">x{ticket.quantity}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">${ticket.amountPaid.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider">
                        {ticket.badgeCode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{ticket.teamPreference || "—"}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}