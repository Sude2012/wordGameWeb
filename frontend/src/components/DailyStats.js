"use client";
import { useEffect, useState } from "react";
import { getTodayStats } from "../lib/dailyStats";

export default function DailyStats() {
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    const data = getTodayStats();
    setStats(data);
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow bg-white text-black dark:bg-gray-800 dark:text-white">
      <h3 className="text-lg font-semibold mb-2">📊 Bugünkü Performans</h3>
      <p>✅ Doğru: {stats.correct}</p>
      <p>❌ Yanlış: {stats.incorrect}</p>
    </div>
  );
}