export default function Card({ title, children, icon }) {
  return (
    <section className="card">
      <div className="card-title"><span>{icon}</span><h2>{title}</h2></div>
      {children}
    </section>
  );
}
