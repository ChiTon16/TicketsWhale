import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import SectionCard from "@/components/features/matches/SectionCard";
import StadiumMap, { type StandKey } from "@/components/features/matches/StadiumMap";
import BlockSelectionModal from "@/components/features/matches/BlockSelectionModal";
import { matchApi } from "@/api/match.api";
import { formatMatchDateTimeVN } from "@/utils/DateUtils";
import type { Match, Section, Block, CreateBookingPayload, ApiError, PaginatedResponse } from "@/types";

// ─── AI Summary Card ──────────────────────────────────────────────────────────

const AISummaryCard: React.FC<{ summary: string }> = ({ summary }) => (
  <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5">
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

    <div className="flex items-start gap-3 relative z-10">
      <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
        <MaterialIcon name="auto_awesome" className="text-primary text-base" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
          Phân tích AI
        </p>
        <p className="text-sm text-on-surface leading-relaxed font-medium">
          {summary}
        </p>
      </div>
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Alias để dùng trong JSX
const formatMatchDateTime = formatMatchDateTimeVN;

function toStandKey(stand: string): StandKey | null {
  const u = stand.toUpperCase();
  if (u.includes("NORTH")) return "NORTH";
  if (u.includes("EAST")) return "EAST";
  if (u.includes("SOUTH")) return "SOUTH";
  if (u.includes("WEST")) return "WEST";
  return null;
}

const STAND_ORDER: StandKey[] = ["NORTH", "EAST", "SOUTH", "WEST"];
const STAND_LABEL: Record<StandKey, string> = {
  NORTH: "Khán đài Bắc",
  EAST: "Khán đài Đông",
  SOUTH: "Khán đài Nam",
  WEST: "Khán đài Tây",
};

function groupByStand(sections: Section[]): Map<StandKey, Section[]> {
  const map = new Map<StandKey, Section[]>();
  for (const s of sections) {
    const key = toStandKey(s.stand);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const PageSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
    <div className="lg:col-span-5 space-y-4">
      <div className="h-5 w-24 rounded bg-surface-container-high" />
      <div className="h-9 w-3/4 rounded bg-surface-container-high" />
      <div className="h-4 w-1/2 rounded bg-surface-container-high" />
      {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-surface-container-high" />)}
    </div>
    <div className="lg:col-span-7 h-[520px] rounded-3xl bg-surface-container-high" />
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const MatchDetailPage: React.FC = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [activeStand, setActiveStand] = useState<StandKey | null>(null);

  useEffect(() => {
    if (!matchId) { navigate("/", { replace: true }); return; }
    let cancelled = false;

    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const [matchRes, sectionsRes] = await Promise.all([
          matchApi.getById(matchId),
          matchApi.getSections(matchId),
        ]);
        if (cancelled) return;
        setMatch(matchRes.data);
        const raw = sectionsRes.data as Section[] | PaginatedResponse<Section>;
        setSections(Array.isArray(raw) ? raw : raw.content ?? []);
      } catch (err) {
        if (cancelled) return;
        setError((err as ApiError).message ?? "Không thể tải thông tin trận đấu");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [matchId]);

  const handleStandClick = (stand: StandKey) => {
    setActiveStand((prev) => (prev === stand ? null : stand));
    // Bỏ chọn nếu section không thuộc stand mới
    if (selectedSection && toStandKey(selectedSection.stand) !== stand) {
      setSelectedSection(null);
      setSelectedBlock(null);
    }
  };

  const handleSelectBlock = (section: Section, block: Block) => {
    setSelectedSection(section);
    setSelectedBlock(block);
  };

  const handleDeselect = () => {
    setSelectedSection(null);
    setSelectedBlock(null);
  };

  const handleCheckout = (payload: CreateBookingPayload) => {
    setSelectedSection(null);
    setSelectedBlock(null);
    navigate(`/booking/${payload.matchId}`, { state: payload });
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="bg-background text-on-background min-h-screen">
      <Navbar /><PageSkeleton />
    </div>
  );

  if (error || !match) return (
    <div className="bg-background text-on-background min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-8">
        <MaterialIcon name="error_outline" className="text-6xl text-error/50" />
        <p className="text-xl font-bold text-on-surface">{error ?? "Không tìm thấy trận đấu"}</p>
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary font-bold hover:underline">
          <MaterialIcon name="arrow_back" className="text-sm" />Về trang chủ
        </button>
      </div>
    </div>
  );

  const { date, time } = formatMatchDateTime(match.matchTime);
  const grouped = groupByStand(sections);
  const standsToShow = activeStand
    ? (grouped.has(activeStand) ? [activeStand] : [])
    : STAND_ORDER.filter((s) => grouped.has(s));

  return (
    <div className="bg-background text-on-background antialiased">
      <Navbar />

      {/* Normal page scroll — map sticky bên phải */}
      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* ── Left: danh sách sections, scroll tự nhiên ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Match header */}
          <div className="space-y-2">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              <MaterialIcon name="arrow_back" className="text-sm" />Quay lại
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${match.status === "ONGOING"
                ? "bg-tertiary-container text-on-tertiary-container"
                : "bg-surface-container-highest text-on-surface-variant"
                }`}>
                {match.status === "ONGOING" && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                {match.status === "ONGOING" ? "ĐANG DIỄN RA"
                  : match.status === "SCHEDULED" ? "SẮP DIỄN RA"
                    : match.status === "FINISHED" ? "ĐÃ KẾT THÚC" : "ĐÃ HUỶ"}
              </span>
              {match.matchday && (
                <span className="text-[10px] font-bold text-on-surface-variant">Vòng {match.matchday}</span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {match.homeCrest && <img src={match.homeCrest} alt={match.homeTeam} className="w-9 h-9 object-contain" />}
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                {match.homeTeam} vs {match.awayTeam}
              </h1>
              {match.awayCrest && <img src={match.awayCrest} alt={match.awayTeam} className="w-9 h-9 object-contain" />}
            </div>

            <p className="text-on-surface-variant text-sm flex items-center gap-2">
              <MaterialIcon name="calendar_today" className="text-sm" />
              {date} · {time}{match.stadiumName && ` · ${match.stadiumName}`}
            </p>

            {/* AI Summary — chỉ hiện khi có dữ liệu */}
            {match.aiSummary && <AISummaryCard summary={match.aiSummary} />}

            {/* Filter chip */}
            {activeStand && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-on-surface-variant">Đang lọc:</span>
                <span className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">
                  {STAND_LABEL[activeStand]}
                  <button onClick={() => setActiveStand(null)} className="hover:opacity-70">
                    <MaterialIcon name="close" className="text-sm" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Sections */}
          {sections.length === 0 ? (
            <p className="text-center py-12 text-on-surface-variant font-medium">Hiện chưa có khu vực nào.</p>
          ) : standsToShow.length === 0 ? (
            <p className="text-center py-12 text-on-surface-variant font-medium">Không có khu vực nào cho hướng này.</p>
          ) : (
            standsToShow.map((stand) => (
              <div key={stand} className="space-y-3">
                {/* Stand heading */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                    {STAND_LABEL[stand]}
                  </span>
                  <div className="flex-1 h-px bg-outline-variant/30" />
                  <span className="text-xs text-on-surface-variant/60">
                    {grouped.get(stand)!.length} khu
                  </span>
                </div>

                {grouped.get(stand)!.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    selectedBlockId={selectedBlock?.id ?? null}
                    onSelectBlock={handleSelectBlock}
                    onDeselectBlock={handleDeselect}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* ── Right: stadium map sticky ── */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <div className="flex flex-col justify-center items-center bg-surface-container-low rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative z-10 w-full">
              <StadiumMap activeStand={activeStand} onStandClick={handleStandClick} />
            </div>
          </div>
        </div>

      </div>

      <Footer />

      {/* Block selection modal */}
      {selectedSection && selectedBlock && (
        <BlockSelectionModal
          match={match}
          section={selectedSection}
          block={selectedBlock}
          onClose={handleDeselect}
        />
      )}
    </div>
  );
};

export default MatchDetailPage;