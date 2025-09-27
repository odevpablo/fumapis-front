import React from "react";

const MainApp = () => (
  <div>
    {/* Header */}
    <header>
      <div>
        <div>
          <i className="fas fa-vote-yea"></i>
          <span>FUMAPIS</span>
        </div>
        <nav>
          <button>
            <i className="fas fa-chart-dashboard"></i>
            <span>Dashboard</span>
          </button>
          <button>
            <i className="fas fa-search"></i>
            <span>Consultar</span>
          </button>
          <button>
            <i className="fas fa-user-plus"></i>
            <span>Cadastrar</span>
          </button>
          <button style={{ display: "none" }}>
            <i className="fas fa-upload"></i>
            <span>Importar</span>
          </button>
          <button style={{ display: "none" }}>
            <i className="fas fa-users-cog"></i>
            <span>Usuários</span>
          </button>
          <button>
            <i className="fas fa-chart-bar"></i>
            <span>Relatórios</span>
          </button>
        </nav>
      </div>
      <div>
        <div>
          <div>
            <i className="fas fa-user"></i>
          </div>
          <div>
            <span>Usuário</span>
            <span>Operador</span>
          </div>
          <div>
            <button>
              <i className="fas fa-chevron-down"></i>
            </button>
            <div>
              <a href="#">
                <i className="fas fa-user-circle"></i>
                Perfil
              </a>
              <a href="#">
                <i className="fas fa-key"></i>
                Alterar Senha
              </a>
              <hr />
              <a href="#">
                <i className="fas fa-sign-out-alt"></i>
                Sair
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main>
      <section>
        <div>
          <h2>Dashboard</h2>
          <p>Visão geral do sistema eleitoral</p>
        </div>
        <div>
          <div>
            <div>
              <i className="fas fa-users"></i>
            </div>
            <div>
              <h3>0</h3>
              <p>Total de Eleitores</p>
            </div>
          </div>
          <div>
            <div>
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <h3>0</h3>
              <p>Elegíveis</p>
            </div>
          </div>
          <div>
            <div>
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <h3>0</h3>
              <p>Pendentes</p>
            </div>
          </div>
          <div>
            <div>
              <i className="fas fa-vote-yea"></i>
            </div>
            <div>
              <h3>0</h3>
              <p>Votaram</p>
            </div>
          </div>
        </div>
        <div>
          <div>
            <h3>Distribuição por Bairros</h3>
            <div></div>
          </div>
          <div>
            <h3>Atividades Recentes</h3>
            <div>
              <div>
                <i className="fas fa-info-circle"></i>
                <span>Sistema inicializado com sucesso</span>
                <time>Agora</time>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
);

export default MainApp;
