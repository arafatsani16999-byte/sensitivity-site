// ডিভাইস মডেল থেকে ডিটারমিনিস্টিক হ্যাশ তৈরি
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ভ্যালু ক্ল্যাম্প করার হেল্পার
function clamp(val, min, max) {
  return Math.min(Math.max(Math.round(val), min), max);
}

// মূল ক্যালকুলেশন ফাংশন
function calculateSensitivity() {
  const brand = document.getElementById('brand').value;
  const model = document.getElementById('model').value.trim();
  const ram = parseInt(document.getElementById('ram').value);
  const refresh = parseInt(document.getElementById('refresh').value);
  const style = document.querySelector('input[name="style"]:checked').value;

  // ভ্যালিডেশন
  if (!brand || !model) {
    alert('⚠️ ব্র্যান্ড এবং মডেল উভয়ই পূরণ করুন');
    return;
  }

  // ডিভাইস হ্যাশ
  const deviceHash = hashString(brand + model);

  // হার্ডওয়্যার মাল্টিপ্লায়ার
  const ramFactor = 0.85 + (ram / 20); // 3GB = 1.0, 16GB = 1.65
  const refreshFactor = refresh >= 120 ? 1.08 : (refresh >= 90 ? 1.03 : 1.0);
  const base = (deviceHash % 15) - 7; // -7 থেকে +7 পর্যন্ত

  // প্লে স্টাইল অনুযায়ী ওয়েট
  const styles = {
    headshot:  { general: -5, redDot: +8, s2x: +3, s4x: -2, sniper: -5, freeLook: -3 },
    balanced:  { general: 0, redDot: 0, s2x: 0, s4x: 0, sniper: 0, freeLook: 0 },
    sniper:    { general: -8, redDot: -5, s2x: -3, s4x: +10, sniper: +12, freeLook: +5 },
    rusher:    { general: +8, redDot: +3, s2x: -2, s4x: -5, sniper: -8, freeLook: +10 }
  };

  const w = styles[style];

  // বেস ভ্যালু (RAM ও refresh অনুযায়ী scaled)
  const scale = ramFactor * refreshFactor;

  const result = {
    general:  clamp(90 * scale + base + w.general, 80, 100),
    redDot:   clamp(85 * scale + base + w.redDot, 60, 100),
    scope2x:  clamp(78 * scale + base + w.s2x, 50, 95),
    scope4x:  clamp(68 * scale + base + w.s4x, 40, 85),
    sniper:   clamp(30 * scale + base + w.sniper, 10, 55),
    freeLook: clamp(75 * scale + base + w.freeLook, 55, 95)
  };

  renderResult(result);
}

// রেজাল্ট রেন্ডার
function renderResult(data) {
  const labels = {
    general: '🎯 General',
    redDot: '🔴 Red Dot',
    scope2x: '🔍 2x Scope',
    scope4x: '🎯 4x Scope',
    sniper: '🔭 Sniper Scope',
    freeLook: '👀 Free Look'
  };

  let html = '';
  for (const [key, value] of Object.entries(data)) {
    const pct = (value / 100) * 100;
    html += `
      <div class="sensi-card">
        <div class="label">${labels[key]}</div>
        <div class="value">${value}</div>
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
      </div>
    `;
  }

  document.getElementById('resultGrid').innerHTML = html;
  const resultBox = document.getElementById('result');
  resultBox.classList.remove('hidden');
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// FAQ টগল
function toggleFaq(el) {
  const item = el.parentElement;
  item.classList.toggle('active');
}

// স্মুথ স্ক্রল
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});