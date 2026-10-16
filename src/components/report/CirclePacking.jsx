import React from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';

/**
 * CirclePacking – visualizza la gerarchia Famiglia → Natura.
 * `data` deve avere la forma:
 * {
 *   name: string,
 *   children: [
 *     { name: string, children: [{ name: string, value: number }, ...] },
 *     ...
 *   ]
 * }
 */
export default function CirclePacking({ data }) {
  if (!data || !Array.isArray(data.children) || data.children.length === 0) {
    return null;
  }

  return (
    <ResponsiveCirclePacking
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      identity="name"
      value="value"
      colors={{ scheme: 'nivo' }}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
      // Show only leaf labels (nature level)
      labelsFilter={node => node.depth === 2}
      labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      tooltip={({ node }) => (
        <div style={{ padding: '6px 9px', background: '#222', color: '#fff' }}>
          {node.id}: {node.value}
        </div>
      )}
    />
  );
}
