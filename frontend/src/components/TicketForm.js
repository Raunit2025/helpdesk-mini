import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TicketForm = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const { title, description } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/tickets', formData);
      toast.success('Ticket created successfully!'); 
      setFormData({ title: '', description: '' });
      onTicketCreated(res.data);
    } catch (err) {
      toast.error('Failed to create ticket.'); 
    }
  };
  return (
    <div className="form-container" style={{ margin: '2rem auto' }}>
      <h2>Create a New Ticket</h2>
      <form onSubmit={onSubmit}>
        <div><input type="text" placeholder="Ticket Title" name="title" value={title} onChange={onChange} required/></div>
        <div><textarea placeholder="Describe your issue" name="description" value={description} onChange={onChange} required/></div>
        <input type="submit" value="Submit Ticket" />
      </form>
    </div>
  );
};
export default TicketForm;