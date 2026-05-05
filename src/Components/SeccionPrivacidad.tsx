import React from 'react';
import { calcularTodos } from '../Services/privacy';

interface SeccionPrivacidadProps {
  titulo: string;
  descripcion: string;
  icon: React.FC;
  items: Record<string, boolean>;
  nombres: Record<string, string>;
  onToggleSeccion: (nuevoValor: boolean) => void;
  onToggleItem: (id: string, nuevoValor: boolean) => void;
}

const SeccionPrivacidad: React.FC<SeccionPrivacidadProps> = ({
  titulo,
  icon: Icon,
  items,
  nombres,
  onToggleSeccion,
  onToggleItem,
}) => {
  const ids           = Object.keys(items);
  const sinItems      = ids.length === 0;
  const todosActivo   = sinItems ? false : calcularTodos(items);
  const visiblesCount = ids.filter((id) => items[id]).length;

  return (
    <div style={{
      background: '#ffffff',
      border: '0.5px solid #dde1e7',
      borderRadius: '10px',
      overflow: 'hidden',
      opacity: sinItems ? 0.65 : 1,
    }}>
      {/* Header con toggle general */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        gap: '12px',
      }}>
        {/* Izquierda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: todosActivo && !sinItems ? '#e6f1fb' : '#f1f3f6',
            color: todosActivo && !sinItems ? '#185FA5' : '#8a96a3',
          }}>
            <Icon />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f1923' }}>{titulo}</span>
            <span style={{ fontSize: '11.5px', color: '#8a96a3' }}>
              {sinItems
                ? 'No hay elementos en esta sección'
                : `${visiblesCount} de ${ids.length} visible${ids.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {sinItems ? (
            <span style={{
              fontSize: '11px', padding: '3px 9px', borderRadius: '20px',
              fontWeight: 500, background: '#f1f3f6', color: '#8a96a3',
            }}>
              Sin elementos
            </span>
          ) : (
            <>
              <span style={{
                fontSize: '11px', padding: '3px 9px', borderRadius: '20px', fontWeight: 500,
                background: todosActivo ? '#eaf3de' : '#f1f3f6',
                color: todosActivo ? '#27500a' : '#8a96a3',
              }}>
                {todosActivo ? 'Visible' : 'Oculto'}
              </span>
              <button
                onClick={() => onToggleSeccion(!todosActivo)}
                role="switch"
                aria-checked={todosActivo}
                aria-label={`Toggle general ${titulo}`}
                style={{
                  width: '40px', height: '22px', borderRadius: '11px', border: 'none',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  background: todosActivo ? '#1D9E75' : '#c8cdd5',
                  transition: 'background 0.18s',
                }}
              >
                <span style={{
                  position: 'absolute', width: '16px', height: '16px',
                  borderRadius: '50%', background: '#ffffff', top: '3px',
                  left: todosActivo ? '21px' : '3px',
                  transition: 'left 0.18s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Items individuales */}
      {!sinItems && (
        <div style={{ borderTop: '0.5px solid #dde1e7' }}>
          {ids.map((id, i) => {
            const isOn   = items[id];
            const nombre = nombres[id] ?? `Elemento ${i + 1}`;
            return (
              <div
                key={id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 18px 9px 52px',
                  borderBottom: i === ids.length - 1 ? 'none' : '0.5px solid #f1f3f6',
                  gap: '10px',
                }}
              >
                {/* Izquierda del item */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                    background: isOn ? '#1D9E75' : '#c8cdd5',
                    transition: 'background 0.18s',
                  }} />
                  <span style={{
                    fontSize: '12.5px', color: '#4a5568',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {nombre}
                  </span>
                </div>

                {/* Derecha del item */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: 500,
                    background: isOn ? '#eaf3de' : '#f1f3f6',
                    color: isOn ? '#27500a' : '#8a96a3',
                  }}>
                    {isOn ? 'Visible' : 'Oculto'}
                  </span>
                  <button
                    onClick={() => onToggleItem(id, !isOn)}
                    role="switch"
                    aria-checked={isOn}
                    aria-label={`Toggle ${nombre}`}
                    style={{
                      width: '34px', height: '18px', borderRadius: '9px', border: 'none',
                      cursor: 'pointer', position: 'relative', flexShrink: 0,
                      background: isOn ? '#1D9E75' : '#c8cdd5',
                      transition: 'background 0.18s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', width: '12px', height: '12px',
                      borderRadius: '50%', background: '#ffffff', top: '3px',
                      left: isOn ? '19px' : '3px',
                      transition: 'left 0.18s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeccionPrivacidad;