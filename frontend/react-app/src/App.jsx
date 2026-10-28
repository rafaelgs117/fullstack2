import { useCallback, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SosButton from './components/SosButton';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { api, contatoDaApi } from './api';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsError, setContactsError] = useState('');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sos_user') || 'null'); } catch { return null; }
  });
  const [sosCount, setSosCount] = useState(0);

  const logout = () => {
    localStorage.removeItem('sos_token');
    localStorage.removeItem('sos_user');
    setUser(null);
    setContacts([]);
  };

  const onLogin = (loggedUser) => {
    localStorage.setItem('sos_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const loadContacts = useCallback(async () => {
    try {
      const { data } = await api.get('/api/contatos');
      setContacts(data.map(contatoDaApi));
      setContactsError('');
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        return;
      }
      setContactsError('Não foi possível carregar os contatos. Confira se o PostgreSQL e a API estão funcionando.');
    }
  }, []);

  useEffect(() => {
    if (user && localStorage.getItem('sos_token')) loadContacts();
  }, [user, loadContacts]);

  const addContact = async (contact) => {
    if (contacts.length >= 5) return false;
    try {
      const { data } = await api.post('/api/contatos', {
        nome: contact.name, telefone: contact.phone, parentesco: contact.relation,
      });
      setContacts(prev => [...prev, contatoDaApi(data)]);
      setContactsError('');
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.mensagem || 'Falha ao salvar contato no PostgreSQL.');
    }
  };

  const removeContact = async (id) => {
    try {
      await api.delete(`/api/contatos/${id}`);
      setContacts(prev => prev.filter(c => c.id !== id));
      setContactsError('');
    } catch (error) {
      const message = error.response?.data?.mensagem || 'Não foi possível remover o contato.';
      setContactsError(message);
      throw new Error(message);
    }
  };

  const sendSos = () => setSosCount(c => c + 1);

  if (!user || !localStorage.getItem('sos_token')) {
    return <Login onLogin={onLogin} />;
  }

  return <div className={darkMode ? 'app dark' : 'app'}>
    <Header user={{ name: user.nome_completo || user.name || 'Luna' }} />
    <main className="page">
      <div className="session-bar">
        <span>Sessão: <strong>{user.nome_completo || 'Luna'}</strong></span>
        <button type="button" className="logout-btn" onClick={logout}>Sair</button>
      </div>
      {contactsError && <div role="alert" className="form-message">{contactsError}</div>}
      <Routes>
        <Route path="/" element={<Home contacts={contacts} onSendSos={sendSos} sosCount={sosCount} />} />
        <Route path="/contatos" element={<Contacts contacts={contacts} onAdd={addContact} onRemove={removeContact} />} />
        <Route path="/perfil" element={<Profile user={user} onSave={setUser} />} />
        <Route path="/configuracoes" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
      </Routes>
    </main>
    <BottomNav />
    <SosButton onSend={sendSos} />
  </div>;
}
