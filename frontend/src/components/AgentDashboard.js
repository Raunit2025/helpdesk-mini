import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [nextOffset, setNextOffset] = useState(0);

  const fetchAllTickets = async (offset) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/all?offset=${offset}`);
      setTickets(prev => (offset === 0 ? res.data.items : [...prev, ...res.data.items]));
      setNextOffset(res.data.next_offset);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchAllTickets(0);
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const ticketToUpdate = tickets.find(t => t._id === ticketId);
      if (!ticketToUpdate) return;

      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL}/tickets/${ticketId}/status`,
        { status: newStatus, version: ticketToUpdate.version }
      );

      setTickets(
        tickets.map((ticket) => (ticket._id === ticketId ? res.data : ticket))
      );
    } catch (err) {
      console.error('Error updating status:', err.response?.data);
      alert(err.response?.data?.error?.message || 'Failed to update status. Please refresh and try again.');
      if (err.response?.status === 409) {
        fetchAllTickets(0);
      }
    }
  };

  const handleLoadMore = () => {
    if (nextOffset !== null) {
      fetchAllTickets(nextOffset);
    }
  };

  return (
    <div className="ticket-list">
      <h2>Agent Dashboard</h2>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        tickets.map((ticket) => {
          const isBreached = new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'closed';
          return (
            <div key={ticket._id} className="ticket">
              <h3>
                <Link to={`/ticket/${ticket._id}`} style={{color: '#007bff', textDecoration: 'none'}}>{ticket.title}</Link>
                {isBreached && <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '10px' }}>● SLA BREACHED</span>}
              </h3>
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
          );
        })
      )}
      {nextOffset !== null && (
        <button onClick={handleLoadMore} style={{ marginTop: '20px' }}>Load More</button>
      )}
    </div>
  );
};

export default AgentDashboard;