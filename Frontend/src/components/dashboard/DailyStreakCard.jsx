import { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { aiService } from "../../services/aiService";

export default function DailyStreakCard() {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const data = await aiService.getStreak();
        setStreak(data);
      } catch (error) {
        setStreak(null);
      }
    };

    fetchStreak();
  }, []);

  if (!streak) return null;

  return (
    <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-sm">
          <Flame size={26} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-orange-700">
            Daily Learning Streak
          </p>
          <h2 className="text-3xl font-bold text-slate-950">
            {streak.current_streak} days
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Longest streak: {streak.longest_streak} days
          </p>
        </div>

        <div className="hidden rounded-2xl bg-white p-3 text-amber-500 shadow-sm sm:block">
          <Trophy size={24} />
        </div>
      </div>
    </section>
  );
}
