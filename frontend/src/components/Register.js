import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { name, email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/users/register', formData);
      console.log('Registration successful:', res.data);
      alert('Registration successful! Please log in.');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      alert('Registration failed. Check the console for details.');
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