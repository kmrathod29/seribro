// src/components/studentComponent/EarningsChart.jsx
// Earnings Chart Component - Phase 5.5
// Uses simple SVG-based chart to avoid additional dependencies

import React, { useMemo } from 'react';

const EarningsChart = ({ data, type = 'bar' }) => {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Format data for chart display - use last 12 months
    const formatted = data.slice(-12).map(item => ({
      month: item.month,
      total: item.total || 0,
      label: new Date(item.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    }));

    return formatted;
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        <p>No data available for the chart</p>
      </div>
    );
  }

  // Calculate dimensions
  const maxValue = Math.max(...chartData.map(d => d.total), 1);
  const padding = { top: 30, right: 30, bottom: 60, left: 60 };
  const width = 800;
  const height = 400;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / (chartData.length * 1.5);
  const barSpacing = chartWidth / chartData.length;

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        className="min-h-80"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - chartHeight * ratio;
          const value = Math.round((maxValue * ratio) / 1000) * 1000;
          
          return (
            <g key={`grid-${ratio}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="rgba(156, 163, 175, 0.8)"
              >
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />

        {/* Bar/Line Chart */}
        {type === 'bar' ? (
          <>
            {/* Bars */}
            {chartData.map((item, index) => {
              const x = padding.left + index * barSpacing + (barSpacing - barWidth) / 2;
              const barHeight = (item.total / maxValue) * chartHeight;
              const y = padding.top + chartHeight - barHeight;

              return (
                <g key={`bar-${index}`} className="hover-group">
                  {/* Tooltip background (hidden by default) */}
                  <rect
                    x={x}
                    y={y - 30}
                    width={barWidth}
                    height="25"
                    fill="rgba(0, 0, 0, 0.8)"
                    rx="4"
                    opacity="0"
                    className="hover-tooltip"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fill="rgba(255, 255, 255, 0.9)"
                    opacity="0"
                    className="hover-tooltip-text"
                  >
                    {formatCurrency(item.total)}
                  </text>

                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#barGradient)"
                    rx="4"
                    className="transition-all duration-200 cursor-pointer hover-bar"
                  />
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </>
        ) : (
          <>
            {/* Line */}
            <polyline
              points={chartData
                .map((item, index) => {
                  const x = padding.left + index * barSpacing + barSpacing / 2;
                  const barHeight = (item.total / maxValue) * chartHeight;
                  const y = padding.top + chartHeight - barHeight;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Area under line */}
            <polygon
              points={`
                ${padding.left + barSpacing / 2},${padding.top + chartHeight}
                ${chartData
                  .map((item, index) => {
                    const x = padding.left + index * barSpacing + barSpacing / 2;
                    const barHeight = (item.total / maxValue) * chartHeight;
                    const y = padding.top + chartHeight - barHeight;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                ${padding.left + (chartData.length - 1) * barSpacing + barSpacing / 2},${padding.top + chartHeight}
              `}
              fill="url(#lineGradient)"
              opacity="0.3"
            />

            {/* Data points */}
            {chartData.map((item, index) => {
              const x = padding.left + index * barSpacing + barSpacing / 2;
              const barHeight = (item.total / maxValue) * chartHeight;
              const y = padding.top + chartHeight - barHeight;

              return (
                <g key={`point-${index}`}>
                  {/* Tooltip */}
                  <g className="hover-group">
                    <rect
                      x={x - 40}
                      y={y - 35}
                      width="80"
                      height="25"
                      fill="rgba(0, 0, 0, 0.8)"
                      rx="4"
                      opacity="0"
                      className="hover-tooltip"
                    />
                    <text
                      x={x}
                      y={y - 17}
                      textAnchor="middle"
                      fontSize="12"
                      fill="rgba(255, 255, 255, 0.9)"
                      opacity="0"
                      className="hover-tooltip-text"
                    >
                      {formatCurrency(item.total)}
                    </text>
                  </g>

                  {/* Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                    className="transition-all duration-200 cursor-pointer hover:r-6"
                  />
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </>
        )}

        {/* X-axis labels */}
        {chartData.map((item, index) => {
          const x = padding.left + index * barSpacing + barSpacing / 2;
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={height - padding.bottom + 25}
              textAnchor="middle"
              fontSize="12"
              fill="rgba(156, 163, 175, 0.8)"
              transform={`rotate(-45 ${x} ${height - padding.bottom + 25})`}
            >
              {item.label}
            </text>
          );
        })}

        {/* Y-axis label */}
        <text
          x={20}
          y={padding.top - 10}
          fontSize="12"
          fill="rgba(156, 163, 175, 0.8)"
        >
          Amount (₹)
        </text>
      </svg>

      {/* Hover effects with CSS */}
      <style>{`
        [class*="hover"] {
          transition: all 0.2s ease;
        }
        .hover-group:hover .hover-tooltip {
          opacity: 1 !important;
        }
        .hover-group:hover .hover-tooltip-text {
          opacity: 1 !important;
        }
        .hover-bar:hover {
          filter: brightness(1.2);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default EarningsChart;
