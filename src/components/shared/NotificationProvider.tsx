import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const token = Cookies.get('access_token');

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let wsUrl = '';
    if (import.meta.env.VITE_API_URL) {
      wsUrl = import.meta.env.VITE_API_URL.replace('http', 'ws');
    } else {
      wsUrl = window.location.origin.replace('http', 'ws');
    }

    // In dev:
    if (wsUrl.includes('localhost:5173') || wsUrl.includes('localhost:3000')) {
      wsUrl = 'ws://localhost:8000';
    }

    const ws = new WebSocket(`${wsUrl}/ws/notifications?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'ad_deactivated') {
          Swal.fire({
            icon: 'warning',
            title: 'Atenção: Link Offline!',
            html: `Seu anúncio <strong>${payload.data.title}</strong> foi desativado porque detectamos que o link está indisponível.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: true,
            confirmButtonText: 'Corrigir Agora',
            confirmButtonColor: '#ff5c00',
            showCancelButton: true,
            cancelButtonText: 'Fechar',
            background: '#0d1117',
            color: '#fff',
            timer: 10000,
            timerProgressBar: true
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = `/edit-link/${payload.data.ad_id}`;
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, token]);

  return <>{children}</>;
};
