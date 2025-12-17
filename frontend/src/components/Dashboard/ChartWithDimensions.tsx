import Plot from "react-plotly.js";
import type { Data, Layout } from 'plotly.js';

export interface DataPoint {
	id: string;
	specimen_reference_id: string;
	stiffness: number;
	yield_force: number;
	ductility: number;
}

interface Plotly3DProps {
	data: DataPoint[];
	width?: number;
	height?: number;
}

export const Plotly3DScatterPlot: React.FC<Plotly3DProps> = ({
    data,
  width = 1000,
  height = 700
}) => {
  // Convert your typed DataPoint[] to Plotly Data[]
  const plotlyData: Data[] = [{
    type: 'scatter3d' as const,
    x: data.map(d => d.stiffness),
    y: data.map(d => d.yield_force),
    z: data.map(d => d.ductility),
    mode: 'markers+text',
    text: data.map(d => d.specimen_reference_id),
    textposition: 'top center',
    marker: {
      size: 10,
      color: data.map((_, i) => `hsl(${i * 36}, 70%, 60%)`),
      line: { color: 'white', width: 2 }
    },
    hovertemplate:
      '<b>%{text}</b><br>' +
      'Stiffness: %{x:.2f} kN/mm<br>' +
      'Yield Force: %{y:.1f} kN<br>' +
      'Ductility: %{z:.2f}<br>' +
      '<extra></extra>',
    textfont: {
      size: 12,
      color: 'white'
    }
  }];

  const layout: Partial<Layout> = {
    title: {
      text: 'Timber Connections: Stiffness vs Yield Force vs Ductility',
      font: { size: 24, color: 'white' }
    },
    scene: {
      xaxis: {
        title: 'Stiffness (kN/mm)',
        backgroundcolor: '#1a1a2e',
        gridcolor: '#444',
        titlefont: { color: '#e74c3c', size: 14 },
        tickfont: { color: '#ccc', size: 12 }
      },
      yaxis: {
        title: 'Yield Force (kN)',
        backgroundcolor: '#1a1a2e',
        gridcolor: '#444',
        titlefont: { color: '#27ae60', size: 14 },
        tickfont: { color: '#ccc', size: 12 }
      },
      zaxis: {
        title: 'Ductility',
        backgroundcolor: '#1a1a2e',
        gridcolor: '#444',
        titlefont: { color: '#3498db', size: 14 },
        tickfont: { color: '#ccc', size: 12 }
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.2 }
      }
    },
    width,
    height,
    paper_bgcolor: '#0f0f23',
    plot_bgcolor: '#1a1a2e',
    font: { color: 'white' },
    margin: { l: 0, r: 0, t: 50, b: 0 }
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
  };

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(145deg, #1e3a8a, #3b82f6)',
      borderRadius: '20px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
    }}>
      <Plot
        data={plotlyData}
        layout={layout}
        config={config}
      />
      <div style={{
        color: '#e2e8f0',
        marginTop: '15px',
        textAlign: 'center',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        🔴 Stiffness | 🟢 Yield Force | 🔵 Ductility
      </div>
    </div>
  );
};

