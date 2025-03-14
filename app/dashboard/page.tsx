'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);


  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify', {
          method: 'POST',
          credentials: 'include', // Incluir cookies en la solicitud
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        setLoading(false); // Mostrar el dashboard
      } catch (error) {
        console.error('Error al verificar el token:', error);
        router.push('/login');
      }
    };

    verifyToken();
  }, [router]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/login");
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bienvenido al Dashboard</h1>
      <p>Has iniciado sesión correctamente.</p>
      <button onClick={handleLogout} disabled={logoutLoading}>
        {logoutLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
      </button>
    </div>
  );
}