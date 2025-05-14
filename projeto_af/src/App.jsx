import { useEffect, useState } from 'react'
import './App.css'
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton'
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const [token, setToken] = useState(null);
  const [tokenPronto, setTokenPronto] = useState(false);
  const [roles, setRoles] = useState([]);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [emailCriador, setEmailCriador] = useState('');
  const [tarefas, setTarefas] = useState([]);

  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
        console.log("TOKEN:", accessToken);
        setTokenPronto(true);
      } catch (e) {
        console.error('Erro ao buscar token:', e);
        setTokenPronto(true); // evita travar app se falhar
      }
    };

    if (isAuthenticated) {
      fetchToken();
    } else {
      setTokenPronto(true); // mostra login se não autenticado
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Email:', payload['https://musica-insper.com/email']);
      console.log('Roles:', payload['https://musica-insper.com/roles']);
      setRoles(payload['https://musica-insper.com/roles']);
      setEmailCriador(payload['https://musica-insper.com/email']);

      fetch('http://54.207.148.33:8080/tarefa', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(res => res.json())
        .then(data => setTarefas(data))
        .catch(error => alert(error));
    }
  }, [token]);

  if (isLoading || !tokenPronto) return <div>Carregando...</div>;
  if (!isAuthenticated) return <LoginButton />;

  function salvarTarefa() {
    fetch('http://54.207.148.33:8080/tarefa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        titulo,
        descricao,
        prioridade,
        emailCriador
      })
    }).then(res => res.json())
      .then(() => {
        listarTarefas();
        setTitulo('');
        setDescricao('');
        setPrioridade('');
      })
      .catch(error => alert(error));
  }

  function listarTarefas() {
    fetch('http://54.207.148.33:8080/tarefa', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(res => res.json())
      .then(data => setTarefas(data))
      .catch(error => alert(error));
  }

  function excluirTarefa(id) {
    fetch('http://54.207.148.33:8080/tarefa/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(() => listarTarefas())
      .catch(error => alert(error));
  }

  return (
    <>
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <LogoutButton />
      </div>

      <h3>Nova Tarefa</h3>
      {roles.includes('ADMIN') ? (
        <div>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
            <option value="">Selecione a prioridade</option>
            <option value="BAIXA">BAIXA</option>
            <option value="MEDIA">MÉDIA</option>
            <option value="ALTA">ALTA</option>
          </select>
          <button onClick={salvarTarefa}>Salvar Tarefa</button>
        </div>
      ) : (
        <p>Somente ADMIN pode criar tarefas.</p>
      )}

      <h3>Lista de Tarefas</h3>
      <table border="1" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Descrição</th>
            <th>Prioridade</th>
            <th>Criador</th>
            {roles.includes('ADMIN') && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tarefas) ? (
            tarefas.map((tarefa) => (
              <tr key={tarefa.id}>
                <td>{tarefa.id}</td>
                <td>{tarefa.titulo}</td>
                <td>{tarefa.descricao}</td>
                <td>{tarefa.prioridade}</td>
                <td>{tarefa.emailCriador}</td>
                {roles.includes('ADMIN') && (
                  <td>
                    <button onClick={() => excluirTarefa(tarefa.id)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr><td colSpan="6">Erro ao carregar tarefas</td></tr>
          )}
        </tbody>

      </table>
    </>
  );
}

export default App;
