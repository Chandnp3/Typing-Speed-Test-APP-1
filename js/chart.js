/**
 * chart.js - Canvas-based Chart Renderer
 * Renders WPM progression line chart using pure Canvas API (no external dependencies)
 */

const Chart = (() => {
  let _canvas = null;
  let _ctx = null;

  /**
   * Initialize chart on a canvas element
   * @param {HTMLCanvasElement} canvas 
   */
  function init(canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('2d');
  }

  /**
   * Render the WPM progression chart
   * @param {Array} timeline - Array of { second, wpm, errors }
   * @param {string} lineColor - CSS color for the line
   * @param {string} fillColor - CSS color for the fill area
   */
  function render(timeline, lineColor = '#88c0d0', fillColor = 'rgba(136,192,208,0.1)') {
    if (!_canvas || !_ctx || !timeline || timeline.length < 2) {
      if (_ctx && _canvas) {
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        _ctx.fillStyle = 'rgba(255,255,255,0.1)';
        _ctx.font = '14px sans-serif';
        _ctx.textAlign = 'center';
        _ctx.fillText('Not enough data to render chart', _canvas.width / 2, _canvas.height / 2);
      }
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = _canvas.getBoundingClientRect();
    _canvas.width = rect.width * dpr;
    _canvas.height = rect.height * dpr;
    _ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear
    _ctx.clearRect(0, 0, w, h);

    // Calculate scales
    const maxWpm = Math.max(10, ...timeline.map(d => d.wpm));
    const maxSecond = Math.max(1, ...timeline.map(d => d.second));

    const xScale = (second) => padding.left + (second / maxSecond) * chartW;
    const yScale = (wpm) => padding.top + chartH - (wpm / maxWpm) * chartH;

    // ---- Grid Lines ----
    _ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    _ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      _ctx.beginPath();
      _ctx.moveTo(padding.left, y);
      _ctx.lineTo(w - padding.right, y);
      _ctx.stroke();

      // Y-axis labels
      const val = Math.round(maxWpm - (maxWpm / gridLines) * i);
      _ctx.fillStyle = 'rgba(255,255,255,0.3)';
      _ctx.font = '11px sans-serif';
      _ctx.textAlign = 'right';
      _ctx.fillText(val, padding.left - 8, y + 4);
    }

    // X-axis labels
    _ctx.fillStyle = 'rgba(255,255,255,0.3)';
    _ctx.font = '11px sans-serif';
    _ctx.textAlign = 'center';
    const xLabelStep = Math.max(1, Math.ceil(maxSecond / 8));
    for (let s = 0; s <= maxSecond; s += xLabelStep) {
      const x = xScale(s);
      _ctx.fillText(s + 's', x, h - 8);
    }

    // ---- Fill Area ----
    _ctx.beginPath();
    _ctx.moveTo(xScale(timeline[0].second), yScale(0));
    timeline.forEach(point => {
      _ctx.lineTo(xScale(point.second), yScale(point.wpm));
    });
    _ctx.lineTo(xScale(timeline[timeline.length - 1].second), yScale(0));
    _ctx.closePath();

    const gradient = _ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, fillColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    _ctx.fillStyle = gradient;
    _ctx.fill();

    // ---- Line ----
    _ctx.beginPath();
    _ctx.strokeStyle = lineColor;
    _ctx.lineWidth = 2.5;
    _ctx.lineJoin = 'round';
    _ctx.lineCap = 'round';

    timeline.forEach((point, i) => {
      const x = xScale(point.second);
      const y = yScale(point.wpm);
      if (i === 0) {
        _ctx.moveTo(x, y);
      } else {
        _ctx.lineTo(x, y);
      }
    });
    _ctx.stroke();

    // ---- Data Points ----
    timeline.forEach(point => {
      const x = xScale(point.second);
      const y = yScale(point.wpm);

      _ctx.beginPath();
      _ctx.arc(x, y, 3, 0, Math.PI * 2);
      _ctx.fillStyle = lineColor;
      _ctx.fill();
      _ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      _ctx.lineWidth = 1;
      _ctx.stroke();
    });

    // ---- Peak WPM Label ----
    const peak = timeline.reduce((max, p) => p.wpm > max.wpm ? p : max, timeline[0]);
    const peakX = xScale(peak.second);
    const peakY = yScale(peak.wpm);

    _ctx.fillStyle = lineColor;
    _ctx.font = 'bold 12px sans-serif';
    _ctx.textAlign = 'center';
    _ctx.fillText(`${peak.wpm} WPM`, peakX, peakY - 10);
  }

  return { init, render };
})();

export default Chart;
