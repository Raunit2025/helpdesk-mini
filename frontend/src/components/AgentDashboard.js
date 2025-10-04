import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);

  const fetchAllTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/tickets/all');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await axios.patch(
        `http://localhost:5001/api/tickets/${ticketId}/status`,
        { status: newStatus }
      );
      // Update the ticket in the local state to reflect the change immediately
      setTickets(
        tickets.map((ticket) => (ticket._id === ticketId ? res.data : ticket))
      );
    } catch (err) {
      console.error('Error updating status:', err.response?.data);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="ticket-list">
      <h2>Agent Dashboard</h2>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket._id} className="ticket">
            <h3><Link to={`/ticket/${ticket._id}`} style={{color: '#007bff', textDecoration: 'none'}}>{ticket.title}</Link></h3>
            <p>{ticket.description}</p>
            <p><strong>Submitter ID:</strong> {ticket.user}</p>
            <small>Created on: {new Date(ticket.createdAt).toLocaleString()}</small>
            <div style={{ marginTop: '10px' }}>
              <strong>Status: </strong>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                style={{ padding: '5px' }}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AgentDashboard;