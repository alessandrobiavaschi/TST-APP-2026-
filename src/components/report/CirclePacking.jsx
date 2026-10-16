import { useMemo } from 'react'
import { hierarchy, pack } from 'd3-hierarchy'
import { radarFamiglie } from '../../design-tokens.ts'

const SIZE = 420

/** Circle Packing Famiglia → Natura: area dei cerchi = punti grezzi delle nature. */
export default function CirclePacking({ sottocorrenti = [] }) {
  const nodes = useMemo(() => {
    const children = radarFamiglie
      .map((fam) => ({
        name: fam.subject,
        color: fam.color,
        children: sottocorrenti
          .filter((s) => s.familyKey === fam.key && Number(s.valore) > 0)
          .map((s) => ({ name: s.nome, value: Number(s.valore), color: fam.color })),
      }))
      .filter((fam) => fam.children.length > 0)
    if (children.length === 0) return []
    const root = hierarchy({ name: 'root', children }).sum((d) => d.value || 0)
    return pack().size([SIZE, SIZE]).padding(6)(root).descendants().slice(1)
  }, [sottocorrenti])

  if (nodes.length === 0) {
    return <p className="grafici-modal-slide-subtitle">Nessun punteggio disponibile.</p>
  }

  return (
    <svg className="circle-packing" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img"
      aria-label="Famiglie e nature: area proporzionale ai punti">
      {nodes.map((n) => (
        <g key={`${n.depth}-${n.data.name}`} transform={`translate(${n.x},${n.y})`}>
          <title>{`${n.data.name}: ${n.value} punti`}</title>
          <circle r={n.r} fill={n.data.color} fillOpacity={n.depth === 1 ? 0.12 : 0.7}
            stroke={n.data.color} strokeOpacity={n.depth === 1 ? 0.5 : 0} />
          {n.depth === 2 && n.r > 22 && (
            <text className="circle-packing__label" textAnchor="middle" dy="0.35em">
              {n.data.name.length * 6 < n.r * 2 ? n.data.name : n.value}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
