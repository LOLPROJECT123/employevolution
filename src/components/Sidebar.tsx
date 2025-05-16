import { NavLink } from "react-router-dom";

const navSections = [
  { name: "Dashboard", to: "/dashboard" },
  { name: "Job Search", to: "/jobs" },
  { name: "Application Tracker", to: "/application-tracker" },
  { name: "Resume Tools", to: "/resume-tools" },
  { name: "ATS Optimizer", to: "/ats-optimizer" },
  { name: "Interview Practice", to: "/interview-practice" },
  { name: "Forums", to: "/forums" },
  { name: "Salary Negotiations", to: "/salary-negotiations" },
  { name: "Networking", to: "/networking" },
  { name: "Extension Manager", to: "/extension-manager" },
  { name: "Profile", to: "/profile" },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-60 bg-gray-900 text-white fixed top-0 left-0 shadow-lg flex flex-col">
      <div className="p-6 font-bold text-2xl tracking-tight border-b border-gray-800">
        Streamline
      </div>
      <nav className="flex-1 p-2 flex flex-col gap-1">
        {navSections.map(({ name, to }) => (
          <NavLink
            key={name}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-700 transition ${
                isActive ? "bg-gray-800 font-semibold" : ""
              }`
            }
          >
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}