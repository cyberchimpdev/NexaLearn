import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Layers3,
  Lightbulb,
  LineChart,
  Menu,
  MessageSquareText,
  School,
  ShieldCheck,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "Workflow", href: "#workflow" },
  { label: "For Teachers", href: "#teachers" },
  { label: "For Students", href: "#students" },
  { label: "Features", href: "#features" },
];

const painPoints = [
  {
    title: "Students miss the exact concept",
    text: "A wrong answer is often not just wrong. It shows a missing rule, weak formula use, poor wording, or careless reasoning.",
  },
  {
    title: "Teachers lose time checking patterns manually",
    text: "Finding repeated mistakes across a class takes time, especially when every student needs different support.",
  },
  {
    title: "Feedback is usually too general",
    text: "Marks alone do not tell students what to revise, why they lost marks, or how to recover before the next test.",
  },
];

const workflow = [
  {
    title: "Teacher creates a diagnostic test",
    text: "The teacher adds questions, marks, answers, class level, subject, and topic.",
  },
  {
    title: "Students submit answers",
    text: "Students answer from their dashboard in a simple, focused test interface.",
  },
  {
    title: "NexaLearn analyzes learning gaps",
    text: "The system identifies weak concepts, mistake types, score, and recovery actions.",
  },
  {
    title: "Teacher and student get clear reports",
    text: "Students receive revision tasks while teachers see patterns and remedial groups.",
  },
];

const teacherBenefits = [
  "Identify class-wide weak topics",
  "Group students for remedial teaching",
  "Reduce manual feedback workload",
  "Track improvement across attempts",
];

const studentBenefits = [
  "Understand what went wrong",
  "Get simple concept explanations",
  "Receive targeted recovery tasks",
  "Practice based on weak areas",
];

const features = [
  {
    icon: ClipboardList,
    title: "Diagnostic test system",
    text: "Teachers can create structured tests with marks, answers, topics, and difficulty levels.",
  },
  {
    icon: Target,
    title: "Weak concept detection",
    text: "Each wrong answer is mapped to the specific concept the student needs to revise.",
  },
  {
    icon: MessageSquareText,
    title: "Mistake explanation",
    text: "Students see why their answer was wrong and what the correct thinking should be.",
  },
  {
    icon: Layers3,
    title: "Recovery cards",
    text: "Every mistake becomes a short recovery plan with concept, explanation, and next task.",
  },
  {
    icon: UsersRound,
    title: "Remedial grouping",
    text: "Teachers can identify students who need help on similar topics.",
  },
  {
    icon: LineChart,
    title: "Progress reports",
    text: "Students and teachers can track attempts, average score, weak areas, and improvement.",
  },
];

function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <PublicNavbar />
      <HeroSection />
      <ProblemSection />
      <WorkflowSection />
      <TeacherStudentSection />
      <FeatureSection />
      <TrustSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  const dashboardPath =
    user?.role === "teacher"
      ? "/teacher"
      : user?.role === "student"
        ? "/student"
        : "/dashboard";

  function handleLogout() {
    logout();
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="container-xl flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black leading-none text-slate-950">
              NexaLearn
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Learning gap recovery platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-slate-600 transition hover:text-slate-950"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="btn-secondary py-2">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-primary bg-slate-950 py-2 hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2">
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary bg-slate-950 py-2 hover:bg-slate-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-xl space-y-2 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                {link.label}
              </a>
            ))}

            <div className="grid gap-2 pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-primary bg-slate-950 hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="btn-primary bg-slate-950 hover:bg-slate-800"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="container-xl py-10 sm:py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="badge-muted">
              <School className="mr-2 h-4 w-4" />
              Built for teachers, students, and real classrooms
            </div>

            <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              Turn every wrong answer into a clear learning recovery plan.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              NexaLearn helps teachers detect learning gaps from student
              answers, organize weak concepts, and guide students with precise
              revision tasks.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-dark px-6 py-4">
                Start Learning Recovery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <a href="#workflow" className="btn-secondary px-6 py-4">
                View Workflow
              </a>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric value="3x" label="Faster feedback loop" />
              <Metric value="24h" label="Hackathon-ready MVP" />
              <Metric value="2" label="Dashboards: teacher + student" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3 shadow-xl shadow-slate-200/70">
            <div className="rounded-[1.35rem] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Student Attempt Review
                  </p>
                  <h2 className="mt-2 text-lg font-black text-slate-950 sm:text-xl">
                    Physics: Electric Field
                  </h2>
                </div>

                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                  <p className="text-xs font-bold text-emerald-600">Score</p>
                  <p className="text-xl font-black text-emerald-700">6/10</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <InsightCard
                  label="Weak concept"
                  value="Formula application: E = F/q"
                  tone="amber"
                />

                <InsightCard
                  label="Mistake type"
                  value="Correct formula selected, wrong substitution step"
                  tone="red"
                />

                <InsightCard
                  label="Teacher action"
                  value="Group with students struggling in force-charge relation"
                  tone="blue"
                />

                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Recovery task
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Revise electric field formula, solve 3 substitution
                    questions, and compare units in each step.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <SmallStat value="18" label="Attempts" />
              <SmallStat value="5" label="Weak topics" />
              <SmallStat value="3" label="Groups" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function InsightCard({ label, value, tone }) {
  const tones = {
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-2xl p-4 ${tones[tone] || tones.blue}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-6">{value}</p>
    </div>
  );
}

function SmallStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function ProblemSection() {
  return (
    <section id="problem" className="py-16 sm:py-20">
      <div className="container-xl">
        <SectionHeader
          eyebrow="The real classroom problem"
          title="Wrong answers contain useful data, but most systems only show marks."
          text="NexaLearn focuses on the human learning process: what the student misunderstood, what the teacher should reteach, and what the student should practice next."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {painPoints.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="bg-white py-16 sm:py-20">
      <div className="container-xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeader
            align="left"
            eyebrow="How it works"
            title="A simple flow from test submission to learning recovery."
            text="The platform helps teachers keep control of learning while reducing repetitive analysis work."
          />

          <div className="space-y-4">
            {workflow.map((step, index) => (
              <article
                key={step.title}
                className="flex gap-5 rounded-[2rem] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                  {index + 1}
                </div>

                <div>
                  <h3 className="font-black text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeacherStudentSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <AudienceCard
            id="teachers"
            icon={School}
            title="For teachers"
            description="Understand which concepts need reteaching without checking every pattern manually."
            items={teacherBenefits}
            cta="Teacher Dashboard"
            to="/teacher"
          />

          <AudienceCard
            id="students"
            icon={BookOpenCheck}
            title="For students"
            description="Get feedback that explains what went wrong and what to revise next."
            items={studentBenefits}
            cta="Student Dashboard"
            to="/student"
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({ id, icon: Icon, title, description, items, cta, to }) {
  return (
    <article
      id={id}
      className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-slate-950 p-3 text-white">
        <Icon className="h-6 w-6" />
      </div>

      <h2 className="mt-6 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-700">{item}</span>
          </div>
        ))}
      </div>

      <Link
        to={to}
        className="mt-7 inline-flex items-center text-sm font-black text-slate-950 transition hover:text-blue-700"
      >
        {cta}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Link>
    </article>
  );
}

function FeatureSection() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20">
      <div className="container-xl">
        <SectionHeader
          eyebrow="Core platform features"
          title="Everything is designed around recovery, not just testing."
          text="The goal is to help students improve after mistakes and help teachers respond faster."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-black text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-slate-200">
                <ShieldCheck className="h-4 w-4" />
                Human intelligence first
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Technology supports the teacher. It does not replace the
                teacher.
              </h2>
            </div>

            <p className="text-base leading-8 text-slate-300">
              NexaLearn is designed as a decision-support platform for learning
              recovery. Teachers create the learning structure, students attempt
              the work, and the system helps organize feedback into useful
              actions.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <TrustItem
              title="Teacher-led"
              text="Teachers control tests and interventions."
            />
            <TrustItem
              title="Student-focused"
              text="Feedback is written for recovery."
            />
            <TrustItem
              title="Data-informed"
              text="Reports show patterns, not just marks."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function CtaSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-xl">
        <div className="rounded-[2rem] border border-slate-200 bg-[#f7f8fb] p-8 text-center shadow-sm sm:p-12">
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Build better feedback loops for every student attempt.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Start with a diagnostic test, identify weak areas, and guide
            students toward focused recovery.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-xl py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-lg font-black text-slate-950">NexaLearn</p>
                <p className="text-sm font-medium text-slate-500">
                  Learning gap recovery platform
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              NexaLearn helps schools turn assessment results into specific
              learning recovery actions.
            </p>
          </div>

          <div>
            <h3 className="font-black text-slate-950">Product</h3>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-500">
              <a href="#problem" className="block hover:text-slate-950">
                Problem
              </a>
              <a href="#workflow" className="block hover:text-slate-950">
                Workflow
              </a>
              <a href="#features" className="block hover:text-slate-950">
                Features
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-black text-slate-950">Platform</h3>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-500">
              <p>Teacher Dashboard</p>
              <p>Student Dashboard</p>
              <p>Reports & Recovery</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm font-medium text-slate-500">
          © {new Date().getFullYear()} NexaLearn. Built for classroom learning
          recovery.
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, text, align = "center" }) {
  const alignment =
    align === "left" ? "text-left" : "mx-auto max-w-3xl text-center";

  return (
    <div className={alignment}>
      <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700">
        {eyebrow}
      </span>

      <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>

      {text ? (
        <p className="mt-4 text-base leading-8 text-slate-600">{text}</p>
      ) : null}
    </div>
  );
}

export default Home;
