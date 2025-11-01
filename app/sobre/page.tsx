import Header from "@/components/Header"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-bgLight">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-wine rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-3xl">D</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-textDark text-center mb-4">Sobre o Desedux</h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
            Uma plataforma desenvolvida para melhorar a comunicação entre alunos e professores universitários
          </p>
        </div>

        {/* Project Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-textDark mb-4">O Projeto</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              O Desedux é um projeto acadêmico desenvolvido por alunos de <strong>Ciência da Computação</strong> da{" "}
              <strong>Newton Paiva</strong>, no curso de <strong>Engenharia de Software</strong>.
            </p>
            <p>
              Nossa missão é resolver um problema comum no ambiente universitário: a dificuldade de comunicação entre
              alunos e professores. Muitas vezes, dúvidas importantes ficam sem resposta, informações importantes não
              chegam a todos os estudantes, e o diálogo entre a comunidade acadêmica é fragmentado.
            </p>
            <p>
              Com o Desedux, criamos um espaço centralizado onde alunos podem fazer perguntas, compartilhar
              conhecimento, e receber respostas oficiais da instituição. A plataforma promove transparência, colaboração
              e facilita o acesso à informação para toda a comunidade universitária.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-textDark mb-6">Funcionalidades</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-wine/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-textDark mb-2">Perguntas e Respostas</h3>
                <p className="text-gray-600 text-sm">
                  Faça perguntas e receba respostas da comunidade e respostas oficiais da instituição
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-wine/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-textDark mb-2">Anonimato Opcional</h3>
                <p className="text-gray-600 text-sm">
                  Faça perguntas de forma anônima quando necessário, garantindo sua privacidade
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-wine/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-textDark mb-2">Categorias Organizadas</h3>
                <p className="text-gray-600 text-sm">
                  Navegue por categorias específicas para encontrar informações relevantes rapidamente
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-wine/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-textDark mb-2">Respostas Oficiais</h3>
                <p className="text-gray-600 text-sm">
                  Identificação clara de respostas oficiais da instituição para maior confiabilidade
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-textDark mb-4">Equipe de Desenvolvimento</h2>
          <p className="text-gray-700 mb-6">
            Este projeto foi desenvolvido como parte do curso de Engenharia de Software na Newton Paiva, aplicando
            conceitos de desenvolvimento ágil, design de interfaces e arquitetura de software.
          </p>
          <div className="bg-wine/5 border border-wine/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="font-semibold text-textDark">Newton Paiva</h3>
            </div>
            <p className="text-gray-700">
              <strong>Curso:</strong> Ciência da Computação
              <br />
              <strong>Disciplina:</strong> Engenharia de Software
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-wine to-wine/90 rounded-lg shadow-sm p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Faça Parte da Comunidade</h2>
          <p className="mb-6 text-white/90">
            Junte-se a nós e ajude a construir uma comunidade universitária mais conectada e colaborativa
          </p>
          <a
            href="/"
            className="inline-block bg-white text-wine px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Começar Agora
          </a>
        </div>
      </main>
    </div>
  )
}
