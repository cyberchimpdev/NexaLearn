import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Gamepad2,
  GraduationCap,
  Layers3,
  LineChart,
  Menu,
  Sparkles,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Personalization", href: "#personalization" },
  { label: "Features", href: "#features" },
  { label: "Class-wise", href: "#class-wise" },
];

const features = [
  {
    icon: ClipboardCheck,
    title: "Teacher test creation",
    text: "Teachers create class-wise diagnostic tests with questions, answers, marks, and difficulty.",
  },
  {
    icon: BrainCircuit,
    title: "Python AI Agent",
    text: "The backend AI detects mistake type, weak concept, reason, score, and revision task.",
  },
  {
    icon: Sparkles,
    title: "Interest-based learning",
    text: "Weak concepts are explained through anime, cricket, gaming, movies, or real-life examples.",
  },
  {
    icon: UsersRound,
    title: "Remedial groups",
    text: "Students with similar weaknesses are grouped so teachers can reteach faster.",
  },
  {
    icon: Layers3,
    title: "Student recovery card",
    text: "Students get clear feedback: what went wrong, why, correct solution, and what to revise.",
  },
  {
    icon: LineChart,
    title: "Teacher analytics",
    text: "Teachers see class average, weak topics, mistake patterns, and suggested teaching actions.",
  },
];

const classLevels = [
  {
    level: "Class 6–8",
    style: "Simple, story-based, visual examples",
    example:
      "Force means push or pull, like pushing a door or hitting a cricket ball.",
  },
  {
    level: "Class 9–10 / SEE",
    style: "Concept + formula + daily-life examples",
    example:
      "Pressure increases when area decreases, like a sharp knife cutting easily.",
  },
  {
    level: "Class 11–12 / NEB",
    style: "Exam-focused explanation with formula, steps, units",
    example:
      "Electric field: E = F/q. Substitute values and write the final unit.",
  },
  {
    level: "SAT / IELTS / PTE",
    style: "Test strategy, mistake pattern, practice plan",
    example: "Find the clue, predict the answer, then eliminate trap choices.",
  },
];

function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32rem),radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_30rem),#f8fafc] text-slate-950">
      <PublicNavbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <PersonalizationSection />
      <FeatureSection />
      <ClassWiseSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="container-xl flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black leading-none text-slate-950">
              NexaLearn
            </p>
            <p className="text-xs font-semibold text-slate-500">
              AI Learning Gap Detector
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-slate-600 transition hover:text-blue-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-secondary py-2">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-primary py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-xl space-y-2 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              >
                {link.label}
              </a>
            ))}

            <div className="grid gap-2 pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-primary"
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
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="container-xl grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="badge mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            Human-centered AI for learning recovery
          </div>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Students do not hate learning. They hate learning that does not
            connect.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            NexaLearn detects weak concepts from test answers and explains them
            through contexts students already understand: anime, cricket,
            gaming, movies, and real life.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary">
              Start Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <a href="#how-it-works" className="btn-secondary">
              See How It Works
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Detect mistake type",
              "Generate revision task",
              "Group weak students",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-bold text-slate-600"
              >
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="rounded-[1.7rem] bg-slate-950 p-5 text-white sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500 p-3">
                <Brain className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-slate-300">AI diagnosis</p>
                <h2 className="text-lg font-black sm:text-xl">
                  Formula mistake detected
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <ResultBlock
                label="Weak concept"
                value="Electric field formula application"
              />

              <ResultBlock
                label="Student interest"
                value="Cricket strategy explanation"
              />

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Personalized explanation
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Like a batter choosing the right shot after reading the ball,
                  first identify force and charge, then apply E = F/q.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-500 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
                  Revision task
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Revise E = F/q and solve 3 similar numerical questions.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["12", "Class"],
              ["3", "Mistake groups"],
              ["AI", "Recovery"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white p-4 text-center">
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultBlock({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function ProblemSection() {
  const problems = [
    {
      title: "Low engagement",
      text: "Students may understand complex game or anime systems, but lose interest when textbook content feels disconnected.",
    },
    {
      title: "Abstract concepts feel difficult",
      text: "Many topics feel hard because examples are not connected to real life, hobbies, or familiar stories.",
    },
    {
      title: "Teachers lack time",
      text: "Teachers cannot manually personalize explanations for every student under classroom and exam pressure.",
    },
  ];

  return (
    <section id="problem" className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge">The education pain point</span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Students are not always weak. Often, the explanation format is weak.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {problems.map((problem) => (
            <article key={problem.title} className="glass-card p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {problem.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {problem.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    "Teacher creates class-wise test",
    "Student submits answers",
    "Python AI Agent analyzes mistakes",
    "Student gets recovery card and teacher gets remedial groups",
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <span className="badge">Workflow</span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              From test answers to learning recovery.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              NexaLearn is not a normal chatbot. The main engine is a Python AI
              Agent that converts mistakes into useful learning data.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step} className="glass-card flex gap-5 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-black text-slate-950">{step}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    This step keeps teachers in control while AI reduces manual
                    diagnosis workload.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PersonalizationSection() {
  return (
    <section id="personalization" className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="glass-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-slate-950 p-8 text-white sm:p-10">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-200">
                Unique hook
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Teach the same concept in the student’s language.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                NexaLearn explains weak concepts through interests while keeping
                the original academic meaning correct.
              </p>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
              {[
                ["Anime", "Power systems, abilities, battles", Brain],
                ["Cricket", "Strategy, shots, fielding zones", Trophy],
                ["Gaming", "Levels, skills, checkpoints", Gamepad2],
                [
                  "Real life",
                  "Daily examples and practical logic",
                  GraduationCap,
                ],
              ].map(([title, text, Icon]) => (
                <div key={title} className="rounded-3xl bg-white p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge">MVP features</span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Built for students and teachers, not just for AI hype.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="glass-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
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

function ClassWiseSection() {
  return (
    <section id="class-wise" className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge">Class-wise adaptation</span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Same topic. Different explanation depth.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {classLevels.map((item) => (
            <div key={item.level} className="glass-card p-6">
              <h3 className="text-xl font-black text-slate-950">
                {item.level}
              </h3>
              <p className="mt-4 text-sm font-bold text-slate-700">
                {item.style}
              </p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Example
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-xl">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Turn wrong answers into personalized learning recovery.
            </h2>
            <p className="mt-4 text-base leading-8 text-blue-100">
              Create a test, let the student answer, then watch NexaLearn detect
              gaps and generate revision tasks.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 transition hover:-translate-y-0.5"
              >
                Create Account
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="container-xl py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-black">NexaLearn</p>
                <p className="text-sm text-slate-400">
                  Human-centered AI for learning recovery.
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              NexaLearn helps teachers detect learning gaps and helps students
              understand weak concepts through examples connected to their
              interests.
            </p>
          </div>

          <div>
            <h3 className="font-black">Product</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <a href="#problem" className="block hover:text-white">
                Problem
              </a>
              <a href="#how-it-works" className="block hover:text-white">
                How it works
              </a>
              <a href="#features" className="block hover:text-white">
                Features
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-black">Stack</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>React + Tailwind CSS</p>
              <p>Django REST Framework</p>
              <p>Python AI Agent</p>
              <p>JWT Authentication</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-400">
          © {new Date().getFullYear()} NexaLearn. Built for education impact.
        </div>
      </div>
    </footer>
  );
}

export default Home;
