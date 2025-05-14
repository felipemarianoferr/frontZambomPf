import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton'
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const [token, setToken] = useState(null)
  const [emailAluno, setEmailAluno] = useState()
  const [idCurso, setIdCurso] = useState()
  const [status, setStatus] = useState()
  const [motivoCancelamento, setMotivoCancelamento] = useState()
  const [cursos, setCursos] = useState([])
  const [matriculas, setMatriculas] = useState([])
  const [roles, setRoles] = useState([])

  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Email:', payload['https://musica-insper.com/email'])
      console.log('Roles:', payload['https://musica-insper.com/roles'])
      setRoles(payload['https://musica-insper.com/roles'])

      fetch('http://54.232.22.180:8080/api/cursos', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(response => { 
        return response.json()
      }).then(data => { 
        setCursos(data)
      }).catch(error => {
        alert(error)
      })
    }
  }, [token])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      } catch (e) {
        console.error('Erro ao buscar token:', e);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  function salvarMatricula() {

    fetch('http://54.94.157.137:8082/matricula', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        'emailAluno': emailAluno,
        'idCurso': idCurso,
        'status': status
      })
    }).then(response => { 
      return response.json()
    }).catch(error => {
      alert(error)
    })

  }

  function listarMatriculas(idCurso) {
    fetch('http://54.94.157.137:8082/matricula/curso/' + idCurso, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(response => { 
      return response.json()
    }).then(data => { 
      setMatriculas(data)
    }).catch(error => {
      alert(error)
    })
  }

  function cancelarMatricula(id, motivo) {
    fetch('http://54.94.157.137:8082/matricula/cancelar/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        'motivoCancelamento': motivo
      })
    }).then(response => { 
      return response.json()
    }).catch(error => {
      alert(error)
    })
  }

  function excluir(id) {

    fetch('http://54.94.157.137:8082/matricula/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(response => { 
      return response.json()
    }).catch(error => {
      alert(error)
    })

  }

  return (
    <>
  <div>
    <img src={user.picture} alt={user.name} />
    <h2>{user.name}</h2>
    <p>{user.email}</p>
    <LogoutButton />
  </div>

  <h3>Nova Matrícula</h3>
  <div>
    <input
      type="email"
      placeholder="Email do Aluno"
      value={emailAluno || ''}
      onChange={(e) => setEmailAluno(e.target.value)}
    />
    <select value={idCurso || ''} onChange={(e) => setIdCurso(e.target.value)}>
      <option value="">Selecione um curso</option>
      {cursos.map((curso) => (
        <option key={curso.id} value={curso.id}>
          {curso.titulo}
        </option>
      ))}
    </select>
    <select value={status || ''} onChange={(e) => setStatus(e.target.value)}>
      <option value="">Selecione o status</option>
      <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
      <option value="CONCLUIDO">CONCLUIDO</option>
    </select>
    <button onClick={salvarMatricula}>Salvar Matrícula</button>
  </div>

  <h3>Listar Matrículas por Curso</h3>
  <div>
    <select onChange={(e) => listarMatriculas(e.target.value)}>
      <option value="">Selecione um curso</option>
      {cursos.map((curso) => (
        <option key={curso.id} value={curso.id}>
          {curso.titulo}
        </option>
      ))}
    </select>
  </div>

  <table border="1" style={{ marginTop: '20px' }}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Email Aluno</th>
        <th>Curso</th>
        <th>Data Matrícula</th>
        <th>Status</th>
        <th>Motivo Cancelamento</th>
        <th>Data Cancelamento</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {matriculas.map((matricula) => (
        <tr key={matricula.id}>
          <td>{matricula.id}</td>
          <td>{matricula.emailAluno}</td>
          <td>{matricula.idCurso}</td>
          <td>{matricula.dataMatricula}</td>
          <td>{matricula.status}</td>
          <td>{matricula.motivoCancelamento}</td>
          <td>{matricula.dataCancelamento}</td>
          <td>
            <button onClick={() => excluir(matricula.id)}>Excluir</button>
            <button onClick={() => {
              const motivo = prompt("Informe o motivo do cancelamento:");
              if (motivo) {
                cancelarMatricula(matricula.id, motivo);
              }
            }}>
              Cancelar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</>
  );
}

export default App;