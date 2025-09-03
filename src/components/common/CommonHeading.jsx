export default function CommonHeading({ heading, title, subtitle }) {
  return (
    <div className="text-center mb-10">
      <h6 className="text-primary text-xl font-bold uppercase mb-2">
        {heading}
      </h6>
      <h1 className="text-4xl font-bold text-secondary">
        {subtitle}{" "}
        <span className="text-primary uppercase">{title}</span>
      </h1>
    </div>
  );
}
