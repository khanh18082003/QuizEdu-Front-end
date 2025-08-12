import { useEffect, useMemo, useState } from "react";
import type React from "react";

import {
  FaSearch,
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaBell,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import { PAGE_TITLES, usePageTitle } from "../../utils/title";
import {
  getClassrooms,
  getQuizSessionsInClassroom,
  joinClassroom,
  type ClassRoomResponse,
} from "../../services/classroomService";
import {
  getAllNotifications,
  type Notification,
} from "../../services/notificationService";
import type { QuizSessionDetailResponse } from "../../services/quizSessionService";
import { Link } from "react-router-dom";
import {
  getStudentQuizSessionScores,
  computeStudentScoreStats,
  type StudentQuizSessionScore,
  type StudentScoreStats,
} from "../../services/quizSessionService";
// Recharts for a more engaging score visualization
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  ReferenceLine,
  type TooltipProps,
} from "recharts";

// Custom tooltip for the score chart (light/dark aware via Tailwind classes)
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload as
    | { label?: string; name?: string; date?: string }
    | undefined;
  const score = (payload[0]?.value as number) ?? undefined;
  const dateStr = d?.date
    ? new Date(d.date).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : undefined;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-gray-600 dark:bg-gray-800">
      <div className="font-medium text-gray-800 dark:text-gray-100">
        {d?.label || d?.name}
      </div>
      {dateStr && (
        <div className="text-[10px] text-gray-500 dark:text-gray-400">
          {dateStr}
        </div>
      )}
      <div className="mt-1">
        <span className="text-gray-600 dark:text-gray-300">Score: </span>
        <span className="font-semibold text-indigo-600 dark:text-cyan-300">
          {typeof score === "number" ? score : "—"}
        </span>
      </div>
    </div>
  );
};

const StudentHome = () => {
  // Join class state
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Dashboard data state
  const [isLoading, setIsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<ClassRoomResponse[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<
    QuizSessionDetailResponse[]
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // New: scores and stats
  const [scoreStats, setScoreStats] = useState<StudentScoreStats | null>(null);
  // New: chart type selector
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area");

  // Set page title
  usePageTitle(PAGE_TITLES.STUDENT_HOME);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const clsRes = await getClassrooms(1, 9);
        const cls = clsRes.data.data || [];
        setClassrooms(cls);

        const topClasses = cls.slice(0, 3);
        const [sessionsPerClass, notifsPerClass, scoreRes] = await Promise.all([
          Promise.all(
            topClasses.map(async (c) => {
              try {
                const res = await getQuizSessionsInClassroom(c.id, 1, 5);
                return res.data.data || [];
              } catch {
                return [] as QuizSessionDetailResponse[];
              }
            }),
          ),
          Promise.all(
            topClasses.map(async (c) => {
              try {
                const res = await getAllNotifications(c.id);
                return res.data || [];
              } catch {
                return [] as Notification[];
              }
            }),
          ),
          // Fetch student's scores across sessions
          (async () => {
            try {
              const res = await getStudentQuizSessionScores();
              return res;
            } catch {
              return {
                code: "",
                status: 0,
                message: "",
                data: [] as StudentQuizSessionScore[],
              };
            }
          })(),
        ]);

        const flatSessions: QuizSessionDetailResponse[] =
          sessionsPerClass.flat();
        const now = new Date();
        const upcoming = flatSessions.filter((s) => {
          const start = s.start_time ? new Date(s.start_time) : null;
          const end = s.end_time ? new Date(s.end_time) : null;
          return (
            (start && start.getTime() > now.getTime()) ||
            (!end && (s.status || "").toLowerCase().includes("wait"))
          );
        });
        upcoming.sort(
          (a, b) =>
            new Date(a.start_time || 0).getTime() -
            new Date(b.start_time || 0).getTime(),
        );
        // keep state for potential future use, but UI section will be removed per request
        setUpcomingSessions(upcoming.slice(0, 6));

        const flatNotifs: Notification[] = notifsPerClass.flat();
        flatNotifs.sort((a, b) => {
          const aTime = new Date(a.created_at || 0).getTime();
          const bTime = new Date(b.created_at || 0).getTime();
          return bTime - aTime;
        });
        setNotifications(flatNotifs.slice(0, 6));

        // Scores
        const scores = (scoreRes?.data || []) as StudentQuizSessionScore[];
        setScoreStats(computeStudentScoreStats(scores));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const totalClasses = classrooms.length;
    const activeClasses = classrooms.filter((c) => c.active).length;
    const totalUpcoming = upcomingSessions.length;
    const totalNotifs = notifications.length;
    return { totalClasses, activeClasses, totalUpcoming, totalNotifs };
  }, [classrooms, upcomingSessions, notifications]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = roomCode.toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError("Room code must be 6 characters (A-Z, 0-9)");
      return;
    }

    try {
      setIsJoining(true);
      setError("");
      const res = await joinClassroom(code);
      if (res.code === "M000") {
        setRoomCode("");
        const clsRes = await getClassrooms(1, 9);
        setClassrooms(clsRes.data.data || []);
      } else {
        setError(res.message || "Failed to join class");
      }
    } catch {
      setError("Failed to join class");
    } finally {
      setIsJoining(false);
    }
  };

  const recentActivities = useMemo(() => {
    const sessionActivities = upcomingSessions.slice(0, 4).map((s) => ({
      id: s.id,
      type: "session" as const,
      title: s.name || "Upcoming Quiz Session",
      date: s.start_time || s.end_time || "",
    }));
    const notifActivities = notifications.slice(0, 4).map((n) => ({
      id: n.id,
      type: "notification" as const,
      title: n.description || "Class update",
      date: (n.created_at || n.updated_at || "") as string,
    }));

    return [...sessionActivities, ...notifActivities]
      .filter((x) => x.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [upcomingSessions, notifications]);

  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";

  // Engaging score chart using Recharts
  const ScoreTrendChart = ({
    data,
    chartType,
  }: {
    data: StudentScoreStats | null;
    chartType: "area" | "line" | "bar";
  }) => {
    // Determine dark mode for colors
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");

    const colors = isDark
      ? {
          axis: "#cbd5e1", // slate-300
          grid: "rgba(148,163,184,0.25)", // slate-400 @ 25%
          line: "#8b5cf6", // violet-500
          areaFrom: "#6366f1", // indigo-500
          areaTo: "#06b6d4", // cyan-500
          bar: "#22d3ee", // cyan-400
        }
      : {
          axis: "#334155", // slate-700
          grid: "rgba(203,213,225,0.6)", // slate-300 @ 60%
          line: "#6366f1", // indigo-500
          areaFrom: "#6366f1", // indigo-500
          areaTo: "#06b6d4", // cyan-500
          bar: "#0ea5e9", // sky-500
        };

    const avg = data?.avgScore ?? undefined;

    // Build full data set safely even when data is null/empty
    const chartDataFull = (data?.trend || []).map((pt, i) => {
      const dateLabel = pt.t
        ? new Date(pt.t).toLocaleDateString(undefined, {
            month: "short",
            day: "2-digit",
          })
        : `#${i + 1}`;
      return {
        idx: i + 1,
        label: pt.label,
        date: pt.t,
        name: dateLabel,
        score: typeof pt.score === "number" ? pt.score : undefined,
      } as const;
    });

    // Downsample for large datasets (keep max ~150 points)
    const MAX_POINTS = 150;
    const step = Math.ceil(chartDataFull.length / MAX_POINTS) || 1;
    const chartData =
      chartDataFull.length > MAX_POINTS
        ? chartDataFull.filter((_, i) => i % step === 0)
        : chartDataFull;

    // Sliding window + drag-to-pan state (hooks must run every render)
    const DEFAULT_WINDOW = 50;
    const [windowStart, setWindowStart] = useState(0);
    const [windowSize, setWindowSize] = useState(0);
    const [drag, setDrag] = useState<
      | { dragging: true; startAbsIdx: number; startWindowStart: number }
      | { dragging: false }
    >({ dragging: false });

    // Initialize/reset window when data length changes
    useEffect(() => {
      const size = Math.min(DEFAULT_WINDOW, chartData.length);
      setWindowSize(size);
      setWindowStart(Math.max(0, chartData.length - size));
      setDrag({ dragging: false });
    }, [chartData.length]);

    const clamp = (n: number, min: number, max: number) =>
      Math.max(min, Math.min(max, n));

    const visibleData = useMemo(
      () => chartData.slice(windowStart, windowStart + windowSize),
      [chartData, windowStart, windowSize],
    );

    const handleMouseDown = (state: { activeTooltipIndex?: number }) => {
      if (typeof state?.activeTooltipIndex === "number") {
        // Track absolute index relative to the full downsampled array
        const startAbsIdx = windowStart + state.activeTooltipIndex;
        setDrag({
          dragging: true,
          startAbsIdx,
          startWindowStart: windowStart,
        });
      }
    };

    const handleMouseMove = (state: { activeTooltipIndex?: number }) => {
      if (!("dragging" in drag) || !drag.dragging) return;
      if (typeof state?.activeTooltipIndex !== "number") return;
      // Current absolute index in the full downsampled array
      const currentAbsIdx = windowStart + state.activeTooltipIndex;
      const delta = (drag.startAbsIdx as number) - currentAbsIdx;
      const nextStart = clamp(
        (drag.startWindowStart as number) + delta,
        0,
        Math.max(0, chartData.length - windowSize),
      );
      if (nextStart !== windowStart) setWindowStart(nextStart);
    };

    const endDrag = () => setDrag({ dragging: false });

    // If no data, still render a placeholder to keep hooks order stable
    if (!data || (data.trend || []).length === 0 || chartData.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No score data yet.
        </div>
      );
    }

    return (
      <div
        className={`h-56 w-full ${
          "dragging" in drag && drag.dragging
            ? "cursor-grabbing"
            : "cursor-grab"
        }`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={visibleData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors.areaFrom}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={colors.areaTo}
                  stopOpacity={0.06}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: colors.axis }}
              stroke={colors.axis}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: colors.axis }}
              stroke={colors.axis}
            />
            <ReTooltip
              content={<CustomTooltip />}
              cursor={{ stroke: colors.grid, strokeDasharray: "4 4" }}
            />
            {typeof avg === "number" && (
              <ReferenceLine
                y={avg}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: `Avg ${avg}`,
                  position: "right",
                  fill: colors.axis,
                  fontSize: 10,
                }}
              />
            )}
            {chartType === "area" && (
              <Area
                type="monotone"
                dataKey="score"
                stroke={colors.line}
                strokeWidth={2}
                fill="url(#colorScore)"
                connectNulls
              />
            )}
            {chartType === "line" && (
              <Line
                type="monotone"
                dataKey="score"
                stroke={colors.line}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            )}
            {chartType === "bar" && (
              <Bar dataKey="score" fill={colors.bar} radius={[4, 4, 0, 0]} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero / Join section - refined */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-indigo-500 to-cyan-500 p-6 shadow-lg md:p-8 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/15 blur-3xl dark:bg-white/5" />
        <div className="pointer-events-none absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl dark:bg-white/5" />
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-2 text-white">
            <p className="text-xs tracking-wide text-white/80 uppercase">
              Your learning hub
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
              Welcome back!
            </h1>
            <form
              onSubmit={handleJoinRoom}
              className="mt-6 flex max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-stretch"
            >
              {/* Compact inline input to align with button */}
              <label htmlFor="roomCodeInput" className="sr-only">
                Enter 6-character class code (A-Z, 0-9)
              </label>
              <div className="relative flex-1 sm:max-w-xs">
                <FaSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-cyan-200" />
                <input
                  id="roomCodeInput"
                  value={roomCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                    setRoomCode(val);
                    setError("");
                  }}
                  maxLength={6}
                  placeholder="Enter 6-character class code"
                  className="h-12 w-full rounded-xl bg-white/95 pr-4 pl-10 text-sm text-gray-900 shadow-sm ring-0 outline-none placeholder:text-gray-500 focus:shadow-md focus:ring-2 focus:ring-white/50 dark:bg-white/10 dark:text-white"
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="h-12 shrink-0 cursor-pointer rounded-xl px-4 text-sm whitespace-nowrap"
                disabled={!roomCode || isJoining}
                isLoading={isJoining}
                loadingText="Joining..."
              >
                Join class
              </Button>
            </form>
            {error && <p className="mt-2 text-xs text-red-100/90">{error}</p>}
          </div>
          <div className="col-span-1 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-sm backdrop-blur-sm dark:bg-gray-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:bg-cyan-400/15 dark:text-cyan-300">
                <FaChalkboardTeacher className="text-2xl" />
              </div>
              <div>
                <div className="text-[11px] leading-4 text-gray-500 dark:text-gray-400">
                  Classes
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalClasses}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-sm backdrop-blur-sm dark:bg-gray-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:bg-cyan-400/15 dark:text-cyan-300">
                <FaCalendarCheck className="text-2xl" />
              </div>
              <div>
                <div className="text-[11px] leading-4 text-gray-500 dark:text-gray-400">
                  Upcoming
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalUpcoming}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>Active Classes</span>
            <FaChalkboardTeacher className="text-2xl" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.activeClasses}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            of {stats.totalClasses} total
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>Notifications</span>
            <FaBell className="text-2xl" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.totalNotifs}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            latest updates
          </div>
        </div>
      </div>

      {/* Score overview and Classes + Announcements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Score Overview (wider) */}
        <div className="col-span-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Your Performance
            </h2>
            <div className="flex items-center gap-2">
              {!isLoading && scoreStats && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {scoreStats.completed}/{scoreStats.attempts} completed
                </span>
              )}
              <div className="hidden items-center gap-1 rounded-md bg-gray-100 p-1 sm:flex dark:bg-gray-700">
                {(
                  [
                    ["area", "Area"],
                    ["line", "Line"],
                    ["bar", "Bar"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setChartType(val)}
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${chartType === val ? "bg-white text-indigo-600 shadow dark:bg-gray-800 dark:text-cyan-300" : "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Average
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {scoreStats?.avgScore ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Best
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {scoreStats?.bestScore ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Worst
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {scoreStats?.worstScore ?? "—"}
                  </div>
                </div>
              </div>
              <ScoreTrendChart data={scoreStats} chartType={chartType} />
            </>
          )}
        </div>

        {/* Your Classes (narrower) */}
        <div className="col-span-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Your Classes
            </h2>
            <Link
              to="/student/classrooms"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-cyan-300"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              ))}
            </div>
          ) : classrooms.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classrooms.slice(0, 6).map((c) => (
                <Link
                  to={`/student/classroom/${c.id}`}
                  key={c.id}
                  className="group rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <p className="line-clamp-1 font-semibold text-gray-800 dark:text-white">
                      {c.name || "Classroom"}
                    </p>
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.active ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-300"}`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                      Code:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {c.class_code}
                      </span>
                    </div>
                    <div className="mt-1">
                      Teacher:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {c.teacher?.display_name ||
                          [c.teacher?.first_name, c.teacher?.last_name]
                            .filter(Boolean)
                            .join(" ") ||
                          "—"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You haven’t joined any classes yet. Enter a class code above to
              get started.
            </p>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="col-span-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Announcements
          </h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {notifications.length} new
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            ))}
          </div>
        ) : notifications.length ? (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:bg-cyan-400/15 dark:text-cyan-300">
                  <FaBell />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                    {n.description || "Class update"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fmt(n.created_at || n.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No announcements yet.
          </p>
        )}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent */}
        <div className="col-span-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-white">
            Recent Activity
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              ))}
            </div>
          ) : recentActivities.length ? (
            <div className="space-y-3">
              {recentActivities.map((a) => (
                <div
                  key={`${a.type}-${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {fmt(a.date)}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-cyan-400/10 dark:text-cyan-300">
                    {a.type === "session" ? "Session" : "Notice"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nothing new yet. Join a class to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
