import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };
  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div><input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required/></div>
        <div><input type="password" placeholder="Password" name="password" value={password} minLength="6" onChange={onChange} required/></div>
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};
export default Login;