import React from "react";
import { User, SupportTicket } from "../types";

interface PortalSupportProps {
  currentUser: User;
}

export default function PortalSupport({ currentUser }: PortalSupportProps) {
  const [myTickets, setMyTickets] = React.useState<SupportTicket[]>([]);
  const [ticketSubject, setTicketSubject] = React.useState("");
  const [ticketMessage, setTicketMessage] = React.useState("");
  const [ticketCategory, setTicketCategory] = React.useState("Membership");
  const [submittingTicket, setSubmittingTicket] = React.useState(false);
  const [ticketSuccess, setTicketSuccess] = React.useState(false);
  const [ticketReplies, setTicketReplies] = React.useState<Record<string, string>>({});

  const loadTickets = async () => {
    try {
      const res = await fetch(`/api/support?userId=${currentUser.id}`);
      if (res.ok) setMyTickets(await res.json());
    } catch {}
  };

  React.useEffect(() => { loadTickets(); }, [currentUser.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmittingTicket(true);
    setTicketSuccess(false);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, subject: ticketSubject, message: ticketMessage, category: ticketCategory })
      });
      if (res.ok) {
        const data = await res.json();
        setMyTickets(prev => [data.ticket, ...prev]);
        setTicketSubject("");
        setTicketMessage("");
        setTicketSuccess(true);
        setTimeout(() => setTicketSuccess(false), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSubmittingTicket(false); }
  };

  const handleReplyTicket = async (ticketId: string) => {
    const replyMsg = ticketReplies[ticketId];
    if (!replyMsg || !replyMsg.trim()) return;
    try {
      const res = await fetch(`/api/support/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "USER", message: replyMsg })
      });
      if (res.ok) {
        const updated = await res.json();
        setMyTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        setTicketReplies(prev => ({ ...prev, [ticketId]: "" }));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-display font-extrabold text-slate-900">WomenPlay Executive Helpdesk & Complaints</h2>
        <p className="text-slate-500 text-xs">Submit support tickets, report compliance concerns or track active inquiries directly below.</p>
      </div>

      {ticketSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium animate-pulse">
          Support ticket filed successfully! An operations lead will respond shortly.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleCreateTicket} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Category</label>
              <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none">
                <option value="Membership">Membership / Setup</option>
                <option value="Billing">Billing & Subscription</option>
                <option value="Event">Event Pass Registration</option>
                <option value="Abuse">Abuse or Safety Report</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Subject</label>
              <input type="text" required placeholder="Access Code mismatch"
                value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Your Detailed Query</label>
            <textarea required rows={4} placeholder="Provide context for faster response..."
              value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none" />
          </div>
          <button type="submit" disabled={submittingTicket}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase shadow-md transition">
            File Complaint
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">My Ticket Statuses</h3>
          {myTickets.length > 0 ? (
            <div className="space-y-4 h-[300px] overflow-y-auto pr-2">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{ticket.subject}</span>
                    <span className={`py-0.5 px-2 rounded-full text-[9px] font-bold uppercase ${
                      ticket.status === "open" ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : ticket.status === "in_progress" ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>{ticket.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-slate-500 italic">"{ticket.message}"</p>

                  <div className="space-y-2 border-t border-slate-200 pt-2 text-[10px]">
                    {ticket.responses.map((rep, idx) => (
                      <div key={idx} className={`p-2 rounded-lg ${
                        rep.sender === "ADMIN" ? "bg-brand-pink-light/30 border border-brand-pink/10 text-left" : "bg-white text-right"
                      }`}>
                        <span className="font-bold block text-slate-700">{rep.sender === "ADMIN" ? "Concierge Support" : "Me"}</span>
                        <p className="text-slate-600 mt-0.5">{rep.message}</p>
                      </div>
                    ))}
                  </div>

                  {ticket.status !== "resolved" && (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Type reply..."
                        value={ticketReplies[ticket.id] || ""}
                        onChange={(e) => setTicketReplies({ ...ticketReplies, [ticket.id]: e.target.value })}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                      <button onClick={() => handleReplyTicket(ticket.id)}
                        className="p-1 px-3 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-lg transition">
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs italic">No support tickets found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
