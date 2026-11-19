import { useEffect, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getActiveVehicleSummary,
  getRemoteStarterSummary,
  ActiveVehicleSummary,
  RemoteStarterStatus,
  RemoteStarterSummary,
} from "@/api/vehicle";

// ---------------------------------------------------------------------------
// Helper bersama
// ---------------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;

const formatRelative = (time: number) => {
  const diff = Date.now() - time;
  const days = Math.floor(diff / DAY);
  if (days >= 1) return `${days} hari lalu`;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  if (hours >= 1) return `${hours} jam lalu`;
  return `${Math.max(0, Math.floor(diff / 60000))} menit lalu`;
};

const CSV_SEPARATOR = ",";

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const formatDateTimeWib = (time: number) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(time));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
};

const downloadCsv = (
  filename: string,
  header: string[],
  rows: (string | number)[][],
) => {
  const csv =
    "﻿" +
    [header, ...rows]
      .map((row) => row.map(csvCell).join(CSV_SEPARATOR))
      .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const todayStamp = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Tab 1: Aktif 7/30 hari
// ---------------------------------------------------------------------------

type Filter = "all" | "7" | "30" | "inactive";

const getStatus = (last: number | null) => {
  if (last === null)
    return { label: "Belum ada data", cls: "bg-gray-100 text-gray-600" };
  if (last >= Date.now() - 7 * DAY)
    return { label: "Aktif 7 hari", cls: "bg-green-100 text-green-700" };
  if (last >= Date.now() - 30 * DAY)
    return { label: "Aktif 30 hari", cls: "bg-yellow-100 text-yellow-700" };
  return { label: "Tidak aktif", cls: "bg-red-100 text-red-700" };
};

function TabAktif({ companyId }: { companyId: number }) {
  const [data, setData] = useState<ActiveVehicleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getActiveVehicleSummary(companyId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat summary kendaraan.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const total = data?.totalVehicles ?? 0;
  const active7 = data?.active7Days ?? 0;
  const active30 = data?.active30Days ?? 0;

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: total },
    { key: "7", label: "Aktif 7 hari", count: active7 },
    { key: "30", label: "Aktif 30 hari", count: active30 },
    { key: "inactive", label: "Tidak aktif", count: total - active30 },
  ];

  const q = search.trim().toLowerCase();
  const listedVehicles = (data?.vehicles ?? []).filter((v) => {
    const last = v.lastDataAt ? new Date(v.lastDataAt).getTime() : null;
    if (q && !v.licensePlate.toLowerCase().includes(q)) return false;
    if (filter === "all") return true;
    if (filter === "inactive")
      return last === null || last < Date.now() - 30 * DAY;
    return last !== null && last >= Date.now() - Number(filter) * DAY;
  });

  const handleExportCsv = () => {
    if (listedVehicles.length === 0) return;
    downloadCsv(
      `summary-kendaraan-${filter}-${todayStamp()}.csv`,
      ["No", "Plat Nomor", "Last Data (WIB)", "Status"],
      listedVehicles.map((v, i) => {
        const last = v.lastDataAt ? new Date(v.lastDataAt).getTime() : null;
        return [
          i + 1,
          v.licensePlate,
          last !== null ? formatDateTimeWib(last) : "Belum ada data",
          getStatus(last).label,
        ];
      }),
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="py-6 text-center text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Aktif 7 hari terakhir", value: active7 },
          { label: "Aktif 30 hari terakhir", value: active30 },
        ].map((item) => (
          <div key={item.label} className="rounded-md border p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {item.value}
              <span className="ml-1 text-sm font-normal text-gray-500">
                / {total}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            type="button"
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === chip.key
                ? "border-blue-900 bg-blue-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari plat nomor"
          className="h-9 pl-8 text-sm"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleExportCsv}
        disabled={listedVehicles.length === 0}
      >
        <Download size={14} className="mr-1" />
        Export CSV
      </Button>

      <div className="max-h-80 divide-y overflow-y-auto rounded-md border">
        {listedVehicles.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-500">
            Tidak ada kendaraan.
          </p>
        ) : (
          listedVehicles.map((v) => {
            const last = v.lastDataAt ? new Date(v.lastDataAt).getTime() : null;
            const status = getStatus(last);
            return (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {v.licensePlate}
                  </p>
                  <p className="text-xs text-gray-500">
                    {last !== null
                      ? `${new Date(last).toLocaleString("id-ID")} · ${formatRelative(last)}`
                      : "Belum ada data"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${status.cls}`}
                >
                  {status.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: On/Off Jarak Jauh
// ---------------------------------------------------------------------------

type StarterFilter = "all" | RemoteStarterStatus | "never";

const STARTER_META: Record<
  RemoteStarterStatus,
  { label: string; cls: string }
> = {
  PROCESS_ON: { label: "Menyalakan", cls: "bg-yellow-100 text-yellow-700" },
  UPDATED_ON: { label: "Menyala", cls: "bg-green-100 text-green-700" },
  PROCESS_OFF: { label: "Mematikan", cls: "bg-orange-100 text-orange-700" },
  UPDATED_OFF: { label: "Mati", cls: "bg-red-100 text-red-700" },
};

const NEVER_META = {
  label: "Belum pernah dikontrol",
  cls: "bg-gray-100 text-gray-600",
};

const starterMeta = (status: RemoteStarterStatus | null) =>
  (status && STARTER_META[status]) || NEVER_META;

function TabOnOff({ companyId }: { companyId: number }) {
  const [data, setData] = useState<RemoteStarterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<StarterFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getRemoteStarterSummary(companyId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat summary on/off jarak jauh.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const total = data?.totalWithFeature ?? 0;
  const processOn = data?.processOn ?? 0;
  const updatedOn = data?.updatedOn ?? 0;
  const processOff = data?.processOff ?? 0;
  const updatedOff = data?.updatedOff ?? 0;
  const neverControlled = data?.neverControlled ?? 0;

  const chips: { key: StarterFilter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: total },
    { key: "PROCESS_ON", label: "Menyalakan", count: processOn },
    { key: "UPDATED_ON", label: "Menyala", count: updatedOn },
    { key: "PROCESS_OFF", label: "Mematikan", count: processOff },
    { key: "UPDATED_OFF", label: "Mati", count: updatedOff },
    { key: "never", label: "Belum pernah dikontrol", count: neverControlled },
  ];

  const q = search.trim().toLowerCase();
  const listedVehicles = (data?.vehicles ?? []).filter((v) => {
    if (q && !v.licensePlate.toLowerCase().includes(q)) return false;
    if (filter === "all") return true;
    if (filter === "never") return v.status === null;
    return v.status === filter;
  });

  const handleExportCsv = () => {
    if (listedVehicles.length === 0) return;
    downloadCsv(
      `summary-onoff-jarak-jauh-${filter}-${todayStamp()}.csv`,
      ["No", "Plat Nomor", "Status", "Kontrol Terakhir (WIB)"],
      listedVehicles.map((v, i) => [
        i + 1,
        v.licensePlate,
        starterMeta(v.status).label,
        v.lastControlAt
          ? formatDateTimeWib(new Date(v.lastControlAt).getTime())
          : "-",
      ]),
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="py-6 text-center text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Menyala", value: updatedOn },
          { label: "Mati", value: updatedOff },
          { label: "Sedang diproses", value: processOn + processOff },
        ].map((item) => (
          <div key={item.label} className="rounded-md border p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {item.value}
              <span className="ml-1 text-sm font-normal text-gray-500">
                / {total}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            type="button"
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === chip.key
                ? "border-blue-900 bg-blue-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari plat nomor"
          className="h-9 pl-8 text-sm"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleExportCsv}
        disabled={listedVehicles.length === 0}
      >
        <Download size={14} className="mr-1" />
        Export CSV
      </Button>

      <div className="max-h-80 divide-y overflow-y-auto rounded-md border">
        {listedVehicles.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-500">
            {total === 0
              ? "Belum ada kendaraan dengan fitur on/off jarak jauh."
              : "Tidak ada kendaraan."}
          </p>
        ) : (
          listedVehicles.map((v) => {
            const last = v.lastControlAt
              ? new Date(v.lastControlAt).getTime()
              : null;
            const meta = starterMeta(v.status);
            return (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {v.licensePlate}
                  </p>
                  <p className="text-xs text-gray-500">
                    {last !== null
                      ? `${new Date(last).toLocaleString("id-ID")} · ${formatRelative(last)}`
                      : "Belum pernah dikontrol"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${meta.cls}`}
                >
                  {meta.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dialog (satu tombol, dua tab)
// ---------------------------------------------------------------------------

type Tab = "aktif" | "onoff";

const TABS: { key: Tab; label: string }[] = [
  { key: "aktif", label: "Aktif 7/30 Hari" },
  { key: "onoff", label: "On/Off Jarak Jauh" },
];

export default function DialogSummaryAktif({
  companyId,
}: {
  companyId: number;
}) {
  const [tab, setTab] = useState<Tab>("aktif");

  return (
    <Dialog onOpenChange={(next) => next && setTab("aktif")}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Summary Kendaraan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Summary Kendaraan</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 border-b">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                tab === t.key
                  ? "border-blue-900 font-medium text-blue-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "aktif" ? (
          <TabAktif companyId={companyId} />
        ) : (
          <TabOnOff companyId={companyId} />
        )}
      </DialogContent>
    </Dialog>
  );
}