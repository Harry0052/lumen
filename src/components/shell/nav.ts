export type NavItem = {
  href: string;
  label: string;
  icon: "help" | "progress" | "saved" | "access";
};

export function shellNav(labels: { help: string; progress: string; saved: string; access: string }): NavItem[] {
  return [
    { href: "/", label: labels.help, icon: "help" },
    { href: "/progress", label: labels.progress, icon: "progress" },
    { href: "/saved", label: labels.saved, icon: "saved" },
    { href: "/accessibility", label: labels.access, icon: "access" },
  ];
}
