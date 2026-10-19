import React, { useState } from "react";
import { X, Search, ChevronRight, Layers, Sparkles } from "lucide-react";
import { ALL_50_PAGES, PageDefinition } from "../../pages/PageRegistry";

interface PagesDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onSelectPage: (pageId: string) => void;
}

export const PagesDirectoryModal: React.FC<PagesDirectoryModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  onSelectPage,
}) => {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");

  if (!isOpen) return null;

  const groups = [
    "All",
    "Marketplace",
    "Categories",
    "Catalog & Stores",
    "Checkout & Cart",
    "Buyer Hub",
    "Seller Suite",
    "Support & Chat",
    "Trust & Legal",
  ];

  const filteredPages = ALL_50_PAGES.filter((p) => {
    const matchesGroup = selectedGroup === "All" || p.group === selectedGroup;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.shortTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      String(p.number) === search.trim();
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0A0D1D] rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-blue-500/30 flex flex-col text-slate-100 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#101736] via-[#0A0D1D] to-[#101736] border-b border-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Marketplace Page Directory</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/40">
                  50 Full Pages
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore all 50 comprehensive buyer, seller, catalog, and platform pages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#151C3B] rounded-xl transition-colors border border-transparent hover:border-blue-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Search */}
        <div className="p-4 bg-[#070914] border-b border-blue-900/25 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by page name, number, or description..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#0F142A] border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all text-xs ${
                  selectedGroup === grp
                    ? "bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white shadow-md shadow-blue-900/30"
                    : "bg-[#0F142A] text-slate-400 hover:text-white hover:bg-[#151C3B] border border-blue-900/30"
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* 50 Pages Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPages.map((page) => {
            const Icon = page.icon;
            const isCurrent = currentPage === page.id;
            return (
              <div
                key={page.id}
                onClick={() => {
                  onSelectPage(page.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border group text-left flex items-start gap-3 ${
                  isCurrent
                    ? "bg-gradient-to-br from-[#101736] to-[#151C3B] border-blue-500/80 shadow-lg shadow-blue-950/60 ring-1 ring-blue-500"
                    : "bg-[#0F142A] hover:bg-[#131936] border-blue-900/30 hover:border-blue-500/50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isCurrent
                      ? "bg-gradient-to-br from-[#0066FF] to-[#7928CA] text-white shadow-md shadow-blue-900/40"
                      : "bg-[#151C3B] text-blue-400 border border-blue-800/30 group-hover:text-white group-hover:bg-[#0066FF]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      Page {page.number}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[80px]">
                      {page.group}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-blue-300 transition-colors">
                    {page.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-snug">
                    {page.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 flex-shrink-0 self-center transition-transform group-hover:translate-x-0.5" />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070914] border-t border-blue-900/25 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredPages.length} of 50 pages</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#151C3B] text-slate-300 hover:text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
