import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TicketList = ({ newTicket }) => {
  const [tickets, setTickets] = useState([]);
  const [nextOffset, setNextOffset] = useState(0);

  const fetchTickets = async (offset) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/tickets?offset=${offset}`);
      setTickets(prev => (offset === 0 ? res.data.items : [...prev, ...res.data.items]));
      setNextOffset(res.data.next_offset);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets(0);
  }, []);

  useEffect(() => {
    if (newTicket) {
      setTickets(prevTickets => [newTicket, ...prevTickets]);
    }
  }, [newTicket]);

  const handleLoadMore = () => {
    if (nextOffset !== null) {
      fetchTickets(nextOffset);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'ticket-status-open';
      case 'closed': return 'ticket-status-closed';
      case 'in-progress': return 'ticket-status-in-progress';
      default: return '';
    }
  };

  return (
    <div className="ticket-list">
      <h2>Your Tickets</h2>
      {tickets.length === 0 ? (
        <p>You have not created any tickets yet.</p>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket._id} className="ticket">
            <h3><Link to={`/ticket/${ticket._id}`} style={{color: '#007bff', textDecoration: 'none'}}>{ticket.title}</Link></h3>
            <p><strong>Status:</strong> <span className={`ticket-status ${getStatusClass(ticket.status)}`}>{ticket.status}</span></p>
            <p>{ticket.description}</p>
            <small>Created on: {new Date(ticket.createdAt).toLocaleString()}</small>
          </div>
        ))
      )}
      {nextOffset !== null && (
        <button onClick={handleLoadMore} style={{ marginTop: '20px' }}>Load More</button>
      )}
    </div>
  );
};

export default TicketList;