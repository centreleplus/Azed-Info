import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

interface WeeklyStudyChartProps {
  theme: "light" | "dark";
}

const STUDY_DATA = [
  { day: "Lun", "Heures": 1.5, "Quiz Réussis": 2 },
  { day: "Mar", "Heures": 2.2, "Quiz Réussis": 4 },
  { day: "Mer", "Heures": 0.8, "Quiz Réussis": 1 },
  { day: "Jeu", "Heures": 3.0, "Quiz Réussis": 5 },
  { day: "Ven", "Heures": 1.8, "Quiz Réussis": 3 },
  { day: "Sam", "Heures": 4.5, "Quiz Réussis": 8 },
  { day: "Dim", "Heures": 2.5, "Quiz Réussis": 4 },
];

export default function WeeklyStudyChart({ theme }: WeeklyStudyChartProps) {
  const isDark = theme === "dark";

  return (
    <div id="weekly-study-chart" className="w-full h-full min-h-[220px] flex flex-col justify-between">
      <div className="mb-4">
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Suivi Hebdomadaire d'Activité
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
          Évolution des <span className="text-[#0f52ba] font-bold">Heures d'apprentissage</span> et <span className="text-[#00A859] font-bold">QCM terminés</span> sur les 7 derniers jours.
        </p>
      </div>

      <div className="flex-1 w-full min-h-[160px] relative">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={STUDY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0,0,0,0.05)"} 
              vertical={false}
            />
            <XAxis 
              dataKey="day" 
              tick={{ fill: isDark ? "#A0AEC0" : "#495057", fontSize: 10, fontWeight: "600" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: isDark ? "#A0AEC0" : "#495057", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "rgba(30, 38, 64, 0.85)" : "rgba(255, 255, 255, 0.85)",
                borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0,0,0,0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                fontSize: "11px",
                color: isDark ? "#E4E6EB" : "#212529",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
              }}
              cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={24} 
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }}
            />
            <Bar 
              name="Heures d'Étude" 
              dataKey="Heures" 
              fill="#0F52BA" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              name="Quiz Réussis" 
              dataKey="Quiz Réussis" 
              fill="#00A859" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
