'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 1000, fontFamily: 'var(--font-sans)' }}>
      {/* Botón Flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#0284C7',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          className="hover:scale-110 active:scale-95"
        >
          <MessageSquare size={30} />
        </button>
      )}

      {/* Ventana de Chat */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            backgroundColor: '#0284C7',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={24} />
              <span style={{ fontWeight: '700' }}>Asistente Técnico</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#64748B', marginTop: '40px', fontSize: '14px' }}>
                <p>¡Hola! 👋 Soy tu asistente industrial.</p>
                <p>¿En qué puedo ayudarte hoy?</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                backgroundColor: m.role === 'user' ? '#0284C7' : '#F1F5F9',
                color: m.role === 'user' ? 'white' : '#1E293B',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: '#64748B', fontSize: '12px' }}>
                Escribiendo...
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu consulta técnica..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#0284C7',
                color: 'white',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <style jsx="true">{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
