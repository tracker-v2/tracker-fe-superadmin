import { useState } from "react";

// page
import Ringkasan from "./ringkasan";
import Detail from "./detail";

export default function Laporan() {
  const [activeTab, setActiveTab] = useState("ringkasan");

  return (
    <main className="bg-white h-full rounded-md p-6 flex flex-col space-y-4">
      <div className="w-fit space-x-2 bg-gray-100 rounded-md p-1">
        <button
          className={`focus:outline-none w-36 px-3 py-1.5 rounded-md transition-colors hover:bg-blue-800 ${
            activeTab === "ringkasan"
              ? "bg-blue-900 text-white"
              : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("ringkasan")}
        >
          Ringkasan
        </button>
        <button
          className={`focus:outline-none w-36 px-3 py-1.5 rounded-md transition-colors hover:bg-blue-800 ${
            activeTab === "detail"
              ? "bg-blue-900 text-white"
              : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("detail")}
        >
          Detail
        </button>
      </div>
      <div>
        <div>{activeTab === "ringkasan" && <Ringkasan />}</div>
        <div>{activeTab === "detail" && <Detail />}</div>
      </div>
    </main>
  );
}
