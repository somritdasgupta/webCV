export const metadata = {
  title: "Commit Activity - Somrit Dasgupta",
  description:
    "Real-time GitHub commit activity and contribution history. Track my latest commits, repositories, and development work across all projects.",
  openGraph: {
    title: "Commit Activity - Somrit Dasgupta",
    description: "Real-time GitHub commit activity and contribution history from all my repositories.",
    type: "website",
  },
};

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
