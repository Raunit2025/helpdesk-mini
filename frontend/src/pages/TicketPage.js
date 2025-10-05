import React, { useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const TicketPage = () => {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/${id}`);
        setTicket(res.data.ticket);
        setComments(res.data.comments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ticket data:', err);
        setLoading(false);
      }
    };
    fetchTicketData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/tickets/${id}/comments`, {
        text: newComment,
      });
      setComments([...comments, res.data]);
      setNewComment('');
      toast.success('Comment posted!'); 
    } catch (err) {
      toast.error('Failed to post comment.'); 
    }
  };

  if (loading) return <Spinner />;
  if (!ticket) return <p>Ticket not found.</p>;

  const isSlaBreached = new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'closed';

  return (
    <div className="ticket-list" style={{ maxWidth: '900px' }}>
      <Link to="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Dashboard</Link>

      {/* Ticket Details */}
      <div className="ticket">
        <h3>{ticket.title}</h3>
        <p><strong>Status:</strong> <span className={`ticket-status ticket-status-${ticket.status}`}>{ticket.status}</span></p>
        <p>
          <strong>SLA Deadline:</strong> {new Date(ticket.slaDeadline).toLocaleString()}
          {isSlaBreached && (
            <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '10px' }}>
              (SLA BREACHED)
            </span>
          )}
        </p>
        <p>{ticket.description}</p>
        <small>Created on: {new Date(ticket.createdAt).toLocaleString()}</small>
      </div>

      {/* Comments Section */}
      <div className="ticket" style={{ marginTop: '2rem' }}>
        <h4>Comments</h4>
        {comments.map(comment => (
          <div key={comment._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
            <p>{comment.text}</p>
            <small>By <strong>{comment.user.name}</strong> on {new Date(comment.createdAt).toLocaleString()}</small>
          </div>
        ))}
        {comments.length === 0 && <p>No comments yet.</p>}
      </div>

      {/* Add Comment Form */}
      <div className="form-container" style={{ margin: '2rem auto' }}>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <input type="submit" value="Add Comment" />
        </form>
      </div>
    </div>
  );
};

export default TicketPage;