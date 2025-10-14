export default function DemoFrame({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="rounded-xl overflow-hidden border">
      <iframe src={url} className="w-full h-72" />
    </div>
  );
}
