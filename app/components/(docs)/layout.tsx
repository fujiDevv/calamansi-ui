import SidebarShell from "@/components/Sidebar/SidebarShell";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarShell>{children}</SidebarShell>;
}
