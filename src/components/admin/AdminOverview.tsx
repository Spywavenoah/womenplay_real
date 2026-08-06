import React from "react";
import { Users, DollarSign, Calendar, Award } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";

interface AdminOverviewProps {
  // reportData is `any` here to match the dashboard's untyped API report payload.
  reportData: any;
}

export default function AdminOverview({ reportData }: AdminOverviewProps) {
  return (
    <div className="space-y-10" id="panel-admin-overview">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Membership Growth Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <Users className="w-4.5 h-4.5 text-brand-pink" />
            <span>Membership Growth Index</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.growthTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="members" stroke="#DB2777" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <DollarSign className="w-4.5 h-4.5 text-brand-gold-dark" />
            <span>Monthly Revenue Index ($)</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Popularity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow col-span-1">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <Calendar className="w-4.5 h-4.5 text-slate-700" />
            <span>Event Registrations vs. Capacity</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.eventPopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registered" fill="#DB2777" name="Registrations" radius={[0, 4, 4, 0]} />
                <Bar dataKey="capacity" fill="#E2E8F0" name="Max Capacity" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Tier Distributions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Award className="w-4.5 h-4.5 text-brand-gold" />
              <span>Membership Tiers Allocation</span>
            </h3>
            <div className="space-y-4">
              {[
                { tier: "Basic Free Tier", count: reportData.distributions.basic, color: "bg-slate-400" },
                { tier: "Premium Tier", count: reportData.distributions.premium, color: "bg-brand-pink" },
                { tier: "Elite Sponsor Tier", count: reportData.distributions.elite, color: "bg-brand-gold" }
              ].map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${d.color}`} />
                    <span className="font-medium text-slate-600">{d.tier}</span>
                  </div>
                  <span className="font-bold text-slate-800">{d.count} Users</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-slate-50 pt-4 text-xs text-slate-400 italic">
            Sponsor tier allocations are tied directly to secure bank or card payments.
          </div>
        </div>
      </div>
    </div>
  );
}