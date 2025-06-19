"use client";

import { useState } from "react";
import RawDataTab from "@/components/tabs/rawDataTab";
import StructuredHistoryTab from "@/components/tabs/structuredHistoryTab";

export default function BackgroundPage() {
  const [activeTab, setActiveTab] = useState("rawData");

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Background Submission</h1>
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "rawData" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab("rawData")}
          >
            Raw Data
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "structuredHistory" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab("structuredHistory")}
          >
            Structured History
          </button>
        </div>
        <div>
          {activeTab === "rawData" && <RawDataTab />}
          {activeTab === "structuredHistory" && <StructuredHistoryTab />}
        </div>
      </div>
    </div>
  );
}
