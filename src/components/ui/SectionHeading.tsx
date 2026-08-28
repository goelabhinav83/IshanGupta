export default function SectionHeading({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string;
  title: string;
  id?: string;
}) {
  return (
    <div className="mb-8 sm:mb-12" id={id}>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal-500 mb-3">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-semibold text-teal-900 leading-tight">{title}</h2>
    </div>
  );
}
