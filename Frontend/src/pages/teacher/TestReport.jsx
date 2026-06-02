import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Lightbulb,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// removed duplicate imports
import { DashboardLayout } from "../../layouts/DashboardLayout";
import {
  getClassReport,
  getRemedialGroups,
  getWeaknessHeatmap,
} from "../../services/reportService";

export function TestReport() {
  const { testId } = useParams();

  const [classReport, setClassReport] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [classData, heatmapData, groupsData] = await Promise.all([
        getClassReport(testId),
        getWeaknessHeatmap(testId),
        getRemedialGroups(testId),
      ]);

      setClassReport(classData);
      setHeatmap(heatmapData);
      setGroups(groupsData);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load report. Make sure students have attempted this test.",
      );
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) {
    return (
      <DashboardLayout title="Class Report">
        <div className="glass-card p-8 text-center text-sm font-bold text-slate-500">
          Loading report...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Class Report">
      <div className="space-y-6">
        <Link
          to="/teacher"
          className="inline-flex items-center text-sm font-black text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {classReport && (
          <>
            <section className="glass-card p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="badge">Teacher analytics</span>
                  <h2 className="mt-4 text-3xl font-black text-slate-950">
                    {classReport.summary.test_title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {classReport.summary.subject} • {classReport.summary.topic}{" "}
                    • Class {classReport.summary.class_level}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <MiniStat
                    label="Attempts"
                    value={classReport.summary.total_attempts}
                  />
                  <MiniStat
                    label="Avg Score"
                    value={classReport.summary.average_score}
                  />
                  <MiniStat
                    label="Avg %"
                    value={`${classReport.summary.average_percentage}%`}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-blue-50 p-5">
                <div className="flex gap-3">
                  <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                  <div>
                    <p className="font-black text-blue-950">
                      Suggested teacher action
                    </p>
                    <p className="mt-2 text-sm leading-7 text-blue-900/80">
                      {classReport.summary.suggested_teacher_action ||
                        "No major weakness detected yet."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Mistake Type Distribution"
                icon={Brain}
                data={heatmap?.mistake_types || []}
                dataKey="count"
                nameKey="mistake_type"
              />

              <ChartCard
                title="Weak Concept Frequency"
                icon={BarChart3}
                data={heatmap?.weak_topics || []}
                dataKey="count"
                nameKey="weak_concept"
              />
            </section>

            <section className="glass-card p-6">
              <div className="mb-5">
                <span className="badge">
                  <UsersRound className="mr-2 h-4 w-4" />
                  Remedial groups
                </span>
                <h2 className="mt-4 text-2xl font-black text-slate-950">
                  Students grouped by similar weaknesses.
                </h2>
              </div>

              {!groups?.remedial_groups?.length ? (
                <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-slate-500">
                  No remedial groups yet. Students may not have attempted this
                  test.
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.remedial_groups.map((group) => (
                    <article
                      key={group.id}
                      className="rounded-3xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-950">
                            {group.group_name}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            {group.suggested_action}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                          {group.student_count} student(s)
                        </span>
                      </div>

                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                        <table className="w-full min-w-180 text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Student</th>
                              <th className="px-4 py-3">Question</th>
                              <th className="px-4 py-3">Student Answer</th>
                              <th className="px-4 py-3">Revision Task</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {group.students.map((student) => (
                              <tr
                                key={`${student.student_id}-${student.question_text}`}
                              >
                                <td className="px-4 py-3">
                                  <p className="font-bold text-slate-950">
                                    {student.student_name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {student.student_email}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {student.question_text}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {student.student_answer}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {student.revision_task}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-card p-6">
              <h2 className="text-2xl font-black text-slate-950">
                Student Results
              </h2>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full min-w-170 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Percentage</th>
                      <th className="px-4 py-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {classReport.student_results.map((student) => (
                      <tr key={student.attempt_id}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-950">
                            {student.student_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.student_email}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {student.score}/{student.total_marks}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {student.percentage}%
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(student.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function ChartCard({ title, icon: Icon, data, dataKey, nameKey }) {
  return (
    <section className="glass-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>

      {!data?.length ? (
        <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-slate-500">
          No chart data yet.
        </div>
      ) : (
        <div className="h-72 rounded-3xl bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey={dataKey} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
