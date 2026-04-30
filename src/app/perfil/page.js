export default function PerfilPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: 700 }}>
                Mi Perfil
            </h1>
            <div style={{
                padding: '24px',
                background: 'white',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <p>Inicia sesión para ver tus datos.</p>
                {/* TODO: Login Form */}
            </div>
        </div>
    );
}
