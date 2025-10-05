import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { name, email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, formData);
      toast.success('Registration successful! Please log in.');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed.';
      toast.error(errorMsg); 
    }
  };
  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div><input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required/></div>
        <div><input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required/></div>
        <div><input type="password" placeholder="Password" name="password" value={password} minLength="6" onChange={onChange} required/></div>
        <input type="submit" value="Register" />
      </form>
    </div>
  );
};
export default Register;