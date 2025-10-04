import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import Register from '../components/Register';
import Login from '../components/Login';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import AgentDashboard from '../components/AgentDashboard';

const Dashboard = () => {
    const { auth, logout } = useContext(AuthContext);
    const [newTicket, setNewTicket] = useState(null);

    const renderUserView = () => {
        if (!auth.isAuthenticated) {
            return (
                <div className="container">
                    <Register />
                    <Login />
                </div>
            );
        }
        if (auth.user?.role === 'agent' || auth.user?.role === 'admin') {
            return <AgentDashboard />;
        } else {
            return (
                <div>
                    <TicketForm onTicketCreated={setNewTicket} />
                    <TicketList newTicket={newTicket} />
                </div>
            );
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>HelpDesk Mini</h1>
                {auth.isAuthenticated && <button onClick={logout} className="logout-btn">Logout</button>}
            </header>
            <main>
                {renderUserView()}
            </main>
        </div>
    );
};

export default Dashboard;