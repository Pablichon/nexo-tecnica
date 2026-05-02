export default function NuevoComercioPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: 700 }}>
                Alta de Comercio
            </h1>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input placeholder="Nombre del Comercio" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <option>Seleccionar Rubro</option>
                    <option value="mecanizado">Mecanizado y CNC</option>
                    <option value="mantenimiento">Mantenimiento Industrial</option>
                    <option value="automatizacion">Automatización y Control</option>
                    <option value="suministros">Suministros Industriales</option>
                    <option value="servicios-tecnicos">Ingeniería y Consultoría</option>
                </select>
                <button
                    style={{
                        padding: '16px',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Guardar Comercio
                </button>
            </form>
        </div>
    );
}
