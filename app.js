// -----------------------------
// Animated Background - Floating Leaves
// -----------------------------
function createLeaves() {
  const bg = document.getElementById('background-animation');
  const numLeaves = 10; // adjust for more or fewer leaves
  for (let i = 0; i < numLeaves; i++) {
    const leaf = document.createElement('div');
    leaf.classList.add('leaf');
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = 8 + Math.random() * 5 + 's';
    leaf.style.animationDelay = Math.random() * 5 + 's';
    leaf.style.transform = `scale(${0.5 + Math.random() * 0.8})`;
    bg.appendChild(leaf);

    leaf.addEventListener('animationend', () => {
      leaf.remove();
      createSingleLeaf(); // keep animation continuous
    });
  }
}

function createSingleLeaf() {
  const bg = document.getElementById('background-animation');
  const leaf = document.createElement('div');
  leaf.classList.add('leaf');
  leaf.style.left = Math.random() * 100 + 'vw';
  leaf.style.animationDuration = 8 + Math.random() * 5 + 's';
  leaf.style.transform = `scale(${0.5 + Math.random() * 0.8})`;
  bg.appendChild(leaf);

  leaf.addEventListener('animationend', () => {
    leaf.remove();
    createSingleLeaf();
  });
}

createLeaves();

// -----------------------------
// Smooth scroll to pledge form
// -----------------------------
document.getElementById('takePledgeBtn').addEventListener('click', () => {
  document.getElementById('pledge-form').scrollIntoView({ behavior: 'smooth' });
});

// -----------------------------
// Handle form submission
// -----------------------------
document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  const f = new FormData(this);
  const name = f.get('name').trim();
  const email = f.get('email').trim();
  const mobile = f.get('mobile').trim();
  const state = f.get('state').trim();
  const profile = f.get('profile');
  const commits = f.getAll('commit');

  if (!name || !email || !mobile) {
    alert('Please fill required fields.');
    return;
  }

  const entry = {
    id: 'P' + Date.now(),
    name,
    email,
    mobile,
    state,
    profile,
    commits,
    date: new Date().toISOString(),
  };

  const all = JSON.parse(localStorage.getItem('pledges') || '[]');
  all.unshift(entry);
  localStorage.setItem('pledges', JSON.stringify(all));

  renderPledges();
  animateKPIs();
  showCertificate(entry);

  this.reset();
});

// -----------------------------
// Render pledge table
// -----------------------------
function renderPledges(filter = 'all') {
  const all = JSON.parse(localStorage.getItem('pledges') || '[]');
  const tbody = document.querySelector('#pledgeTable tbody');
  tbody.innerHTML = '';

  const filtered = all.filter(p => (filter === 'all' ? true : p.profile === filter));

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${new Date(p.date).toLocaleDateString()}</td>
      <td>${p.state || ''}</td>
      <td>${p.profile}</td>
      <td>${'🌱'.repeat(Math.min(3, p.commits.length))}</td>
    `;
    tbody.appendChild(tr);
  });
}

// -----------------------------
// KPI animations
// -----------------------------
function animateCount(id, target) {
  const el = document.getElementById(id);
  const start = parseInt(el.textContent.replace(/,/g, '')) || 0;
  const duration = 1000;
  const startTime = performance.now();

  function update(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function animateKPIs() {
  const all = JSON.parse(localStorage.getItem('pledges') || '[]');
  const achieved = all.length;
  const students = all.filter(p => p.profile === 'Student').length;

  animateCount('kpi-achieved', achieved);
  animateCount('kpi-students', students);
}

// -----------------------------
// Filter handling
// -----------------------------
const filterSelect = document.getElementById('filterProfile');
filterSelect.addEventListener('change', e => {
  renderPledges(e.target.value);
});

// -----------------------------
// Chart.js - Profile Summary Chart
// -----------------------------
let pledgeChart; // global chart variable

function updateChart() {
  const all = JSON.parse(localStorage.getItem('pledges') || '[]');
  const studentCount = all.filter(p => p.profile === 'Student').length;
  const proCount = all.filter(p => p.profile === 'Working Professional').length;
  const otherCount = all.filter(p => p.profile === 'Other').length;

  const ctx = document.getElementById('pledgeChart').getContext('2d');
  const data = {
    labels: ['Students', 'Working Professionals', 'Others'],
    datasets: [{
      label: 'Pledges',
      data: [studentCount, proCount, otherCount],
      backgroundColor: ['#66bb6a', '#43a047', '#2e7d32'],
      borderRadius: 8
    }]
  };

  if (pledgeChart) {
    pledgeChart.data = data;
    pledgeChart.update();
  } else {
    pledgeChart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
}


// -----------------------------
// Certificate Generator
// -----------------------------
function showCertificate(entry) {
  const section = document.getElementById('certificate');
  const canvas = document.getElementById('certCanvas');
  const ctx = canvas.getContext('2d');
  section.style.display = 'block';

  // Background
  ctx.fillStyle = '#f0fff4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Title
  ctx.fillStyle = '#2e7d32';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Climate Action Pledge Certificate', canvas.width / 2, 100);

  // Name
  ctx.fillStyle = '#000';
  ctx.font = '28px Arial';
  ctx.fillText('This is to certify that', canvas.width / 2, 200);

  ctx.font = 'bold 36px Arial';
  ctx.fillText(entry.name.toUpperCase(), canvas.width / 2, 260);

  ctx.font = '24px Arial';
  ctx.fillText(
    `has pledged to take meaningful actions towards a greener planet.`,
    canvas.width / 2,
    320
  );

  // Date
  ctx.font = '20px Arial';
  ctx.fillText(
    `Date: ${new Date(entry.date).toLocaleDateString()}`,
    canvas.width / 2,
    380
  );

  ctx.fillText('Let’s make every action count! 🌍', canvas.width / 2, 430);

  // Signature line
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 150, 500);
  ctx.lineTo(canvas.width / 2 + 150, 500);
  ctx.stroke();

  ctx.font = 'italic 18px Arial';
  ctx.fillText('Climate Initiative Coordinator', canvas.width / 2, 530);

  // Smooth scroll to certificate
  section.scrollIntoView({ behavior: 'smooth' });
}

// -----------------------------
// Download Certificate Button
// -----------------------------
document.getElementById('downloadCertBtn').addEventListener('click', () => {
  const canvas = document.getElementById('certCanvas');
  const link = document.createElement('a');
  link.download = 'Climate_Pledge_Certificate.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// -----------------------------
// Live Environmental Tips
// -----------------------------
const tips = [
  "Turn off lights when you leave a room 💡",
  "Carry a reusable water bottle 🚰",
  "Plant a tree this weekend 🌳",
  "Switch to public transport or cycle 🚴‍♀️",
  "Reduce food waste – take only what you need 🍽️",
  "Unplug chargers when not in use 🔌",
  "Buy local and seasonal produce 🥕",
  "Use both sides of paper 📄",
  "Compost your kitchen waste 🌱",
  "Say no to single-use plastics 🛍️"
];

function rotateTips() {
  const tipEl = document.getElementById("ecoTip");
  let index = 0;
  setInterval(() => {
    tipEl.textContent = tips[index];
    index = (index + 1) % tips.length;
  }, 4000); // change every 4 seconds
}
rotateTips();


// -----------------------------
// Initialize on load
// -----------------------------
renderPledges();
animateKPIs();
updateChart();

