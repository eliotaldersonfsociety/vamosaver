'use client'; // Marca el componente como del lado del cliente

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      // Guardar el token en localStorage (o en cookies)
      localStorage.setItem('token', data.token); // Asegúrate de que el backend devuelva un token
      // Redirigir al dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Iniciar Sesión</h1>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleLogin}>Iniciar Sesión</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}