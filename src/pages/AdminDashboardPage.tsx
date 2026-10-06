import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital, AmbulanceUnit, EmergencyRequest } from '../types';
import {
  Shield,
  Users,
  Activity,
  Ambulance,
  Building2,
  PhoneCall,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Eye,
  CheckCircle2,
  RefreshCw,
  Plus,
  Bed,
} from 'lucide-react';

type AdminTab = 'overview' | 'requests' | 'hospitals' | 'ambulances' | 'contacts';

export const AdminDashboardPage: React.FC = () => {
  const {
    hospitals,
    ambulanceUnits,
    contacts,
    pastRequests,
    activeEmergency,
    deleteHospital,
    deleteContact,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Stats calculation
  const stats = useMemo(() => {
    return {
      totalUsers: 148,
      emergencyRequests: pastRequests.length,
      ambulanceRequests: pastRequests.filter((r) => !!r.ambulanceUnitCode).length,
      activeRequests: activeEmergency ? 1 : 0,
      totalHospitals: hospitals.length,
      totalAmbulances: ambulanceUnits.length,
      readyAmbulances: ambulanceUnits.filter((u) => u.status === 'Available').length,
    };
  }, [pastRequests, activeEmergency, hospitals, ambulanceUnits]);

  // SVG Chart: Emergency Requests by Type
  const chartCategories = [
    { label: 'Breathing', count: 18, color: '#0284c7' },
    { label: 'Cardiac', count: 24, color: '#e11d48' },
    { label: 'Trauma / Accident', count: 32, color: '#f59e0b' },
    { label: 'Acute Bleeding', count: 14, color: '#ea580c' },
    { label: 'Sudden Illness', count: 12, color: '#9333ea' },
  ];
  const maxCategoryCount = Math.max(...chartCategories.map((c) => c.count));

  // Table Data based on active tab
  const filteredData = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();

    if (activeTab === 'requests') {
      return pastRequests.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.categoryLabel.toLowerCase().includes(q) ||
          r.patientName.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'hospitals') {
      return hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.type && h.type.toLowerCase().includes(q)) ||
          h.address.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'ambulances') {
      return ambulanceUnits.filter(
        (a) =>
          a.unitCode.toLowerCase().includes(q) ||
          a.driverName.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'contacts') {
      return contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.relationship.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    return [];
  }, [activeTab, tableSearch, pastRequests, hospitals, ambulanceUnits, contacts]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Healthcare System Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Emergency Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor real-time dispatch capacity, trauma center beds, response telemetry, and fleet allocation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto self-start md:self-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'requests', label: 'Requests' },
            { id: 'hospitals', label: 'Hospitals' },
            { id: 'ambulances', label: 'Ambulances' },
            { id: 'contacts', label: 'Contacts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
                setPage(1);
                setTableSearch('');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Key Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Users</span>
          <p className="text-xl font-black font-mono text-slate-900">{stats.totalUsers}</p>
          <span className="text-[10px] text-teal-700 font-semibold">+12% this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Requests</span>
          <p className="text-xl font-black font-mono text-rose-600">{stats.emergencyRequests}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Priority 1 triage</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Ambulance Runs</span>
          <p className="text-xl font-black font-mono text-sky-600">{stats.ambulanceRequests}</p>
          <span className="text-[10px] text-sky-700 font-semibold">Avg ETA 4.5m</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Now</span>
          <p className="text-xl font-black font-mono text-amber-600">{stats.activeRequests}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Live in transit</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Trauma Centers</span>
          <p className="text-xl font-black font-mono text-teal-700">{stats.totalHospitals}</p>
          <span className="text-[10px] text-teal-700 font-semibold">100% online</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Fleet Ready</span>
          <p className="text-xl font-black font-mono text-emerald-600">
            {stats.readyAmbulances}/{stats.totalAmbulances}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">Operational</span>
        </div>
      </div>

      {/* OVERVIEW TAB: Charts & Visual Analytics */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart 1: Emergency Requests by Type (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Incident Volume by Emergency Classification
                </h3>
                <p className="text-xs text-slate-500">Aggregated historical incoming triage alerts</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Past 30 Days</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="space-y-3 pt-2">
              {chartCategories.map((item) => {
                const widthPercent = (item.count / maxCategoryCount) * 100;
                return (
                  <div key={item.label} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-mono text-slate-900">{item.count} incidents</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Regional Hospital Bed Utilization (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hospital ICU Bed Capacity</h3>
                <p className="text-xs text-slate-500">Live open ICU critical care beds</p>
              </div>
              <Bed className="w-4 h-4 text-teal-600" />
            </div>

            <div className="space-y-3">
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <strong className="text-slate-900 font-bold block truncate">{hosp.name}</strong>
                    <span className="text-slate-400 text-[11px]">{hosp.type}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-teal-700 font-mono font-bold block text-sm">
                      {hosp.icuBedsAvailable} Open
                    </span>
                    <span className="text-slate-400 text-[10px]">{hosp.totalBeds} total beds</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DATA TABLES (FOR TAB REQUESTS, HOSPITALS, AMBULANCES, CONTACTS) */}
      {activeTab !== 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          {/* Table Search & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search ${activeTab}...`}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Total {filteredData.length} records found
            </span>
          </div>

          {/* Render Active Table */}
          <div className="overflow-x-auto">
            {activeTab === 'requests' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Hospital</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                      <td className="py-3 px-4 font-semibold text-rose-700">{item.categoryLabel}</td>
                      <td className="py-3 px-4 text-slate-700">{item.patientName}</td>
                      <td className="py-3 px-4 text-slate-700">{item.hospitalName || 'Verified ER'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'hospitals' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Hospital Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Trauma Level</th>
                    <th className="py-3 px-4">Wait Time</th>
                    <th className="py-3 px-4">ICU Beds</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((hosp: any) => (
                    <tr key={hosp.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{hosp.name}</td>
                      <td className="py-3 px-4 text-slate-600">{hosp.type}</td>
                      <td className="py-3 px-4 text-teal-700 font-semibold">{hosp.traumaLevel}</td>
                      <td className="py-3 px-4 font-mono">~{hosp.erWaitTimeMinutes}m</td>
                      <td className="py-3 px-4 font-mono">{hosp.icuBedsAvailable} Open</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteHospital(hosp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Delete hospital"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'ambulances' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Unit Code</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Paramedic Lead</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Base Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((amb: any) => (
                    <tr key={amb.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{amb.unitCode}</td>
                      <td className="py-3 px-4 text-slate-600">{amb.type}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{amb.paramedicLead}</td>
                      <td className="py-3 px-4 text-slate-700">{amb.driverName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800">
                          {amb.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{amb.baseHospital}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'contacts' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Contact Name</th>
                    <th className="py-3 px-4">Relationship</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Primary Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((cnt: any) => (
                    <tr key={cnt.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{cnt.name}</td>
                      <td className="py-3 px-4 text-slate-600">{cnt.relationship}</td>
                      <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{cnt.phone}</td>
                      <td className="py-3 px-4">
                        {cnt.isPrimary ? (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                            PRIMARY
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">SECONDARY</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteContact(cnt.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-mono">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
