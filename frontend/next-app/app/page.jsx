export default function Page() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 md:px-12 lg:px-20">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="bg-red-700 px-6 py-12 text-white sm:px-10 md:px-16">
          <p className="text-xs font-bold tracking-[.2em] opacity-80">PROJETO ACADÊMICO</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">SOS Emergência</h1>
          <p className="mt-4 max-w-2xl text-base opacity-90 sm:text-lg">Uma interface web inspirada em um aplicativo de emergência, desenvolvida para demonstrar os conceitos de Front-end Full Stack.</p>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 md:p-10 lg:grid-cols-3">
          {[
            ['Acionamento SOS','Interface para simular um pedido de emergência.'],
            ['Contatos','Cadastro e gerenciamento de até cinco contatos.'],
            ['Acessibilidade','Tema escuro e recursos visuais de acessibilidade.'],
            ['Tecnologias','React, Vite, SCSS, Axios e React Router.'],
            ['API pública','Exemplo de consumo de dados externos com Axios.'],
            ['Evolução','Estrutura pronta para integração com back-end no próximo módulo.']
          ].map(([title,text]) => (
            <article key={title} className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-lg font-extrabold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
        <footer className="border-t border-slate-200 px-6 py-6 text-center text-sm text-slate-500">
          Front-end acadêmico • 2026
        </footer>
      </section>
    </main>
  );
}
