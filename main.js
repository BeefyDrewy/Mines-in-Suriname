// Show disclaimer modal on page load
document.addEventListener('DOMContentLoaded', function() {
  const disclaimerModal = document.getElementById('disclaimerModal');
  const closeBtn = document.getElementById('closeDisclaimer');
  const acceptBtn = document.getElementById('acceptDisclaimer');
  const menuToggle = document.getElementById('menuToggle');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const backBtn = document.getElementById('backBtn');
  const helpBtn = document.getElementById('helpBtn');
  const mapContainer = document.getElementById('mapContainer');
  const mapLegend = document.getElementById('mapLegend');
  
  // Show modal if not previously accepted
  const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
  if (!disclaimerAccepted) {
    disclaimerModal.classList.remove('hidden');
  } else {
    disclaimerModal.classList.add('hidden');
  }
  
  // Close modal when clicking close button
  closeBtn.addEventListener('click', function() {
    disclaimerModal.classList.add('hidden');
    localStorage.setItem('disclaimerAccepted', 'true');
  });
  
  // Close modal when clicking accept button
  acceptBtn.addEventListener('click', function() {
    disclaimerModal.classList.add('hidden');
    localStorage.setItem('disclaimerAccepted', 'true');
  });
  
  // Close modal when clicking outside the modal content
  window.addEventListener('click', function(event) {
    if (event.target === disclaimerModal) {
      disclaimerModal.classList.add('hidden');
      localStorage.setItem('disclaimerAccepted', 'true');
    }
  });

  // Menu toggle functionality
  menuToggle.addEventListener('click', function() {
    console.log('Menu toggle clicked');
    // Add functionality here for what the menu should do
    // For example, you could toggle a sidebar, show options, etc.
  });

  // Fullscreen button functionality
  fullscreenBtn.addEventListener('click', function() {
    mapContainer.classList.add('fullscreen');
    document.body.classList.add('fullscreen-active');
    fullscreenBtn.style.display = 'none';
    backBtn.style.display = 'block';
    map.invalidateSize();
  });

  // Back button functionality
  backBtn.addEventListener('click', function() {
    mapContainer.classList.remove('fullscreen');
    document.body.classList.remove('fullscreen-active');
    backBtn.style.display = 'none';
    fullscreenBtn.style.display = 'block';
    map.invalidateSize();
  });

  // Help/Legend button functionality
  helpBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (mapLegend.style.display === 'none') {
      mapLegend.style.display = 'block';
    } else {
      mapLegend.style.display = 'none';
    }
  });

  // Close legend when clicking outside of it
  document.addEventListener('click', function(event) {
    if (!mapLegend.contains(event.target) && event.target !== helpBtn) {
      mapLegend.style.display = 'none';
    }
  });
});

// Initialize map with scroll wheel disabled by default
var map = L.map('map', {
  scrollWheelZoom: false,
  zoomControl: false,
  touchZoom: true
}).setView([4.0, -56.0], 7);

// Add zoom control with specific position
L.control.zoom({
  position: 'topright'
}).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Disable map zoom when scrolling page
map.scrollWheelZoom.disable();

// Load mining sites data
fetch('mining_sites.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(site => {
      var markerColor = site.type === 'legal' ? 'green' : 'red';
      var marker = L.circleMarker([site.lat, site.lng], {
        radius: 8,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.8
      }).addTo(map);
      marker.bindPopup(`<strong>${site.name}</strong><br>Type: ${site.type}`);
    });
  })
  .catch(err => console.error('Error loading mining sites:', err));

// Gradient pollution zones around key sites (squares fading out)
function createRiskSquare(lat, lng, sizeKm, color, opacity) {
  const latOffset = sizeKm / 111;
  const lngOffset = sizeKm / (111 * Math.cos(lat * Math.PI / 180));
  const bounds = [
    [lat - latOffset, lng - lngOffset],
    [lat + latOffset, lng + lngOffset]
  ];
  L.rectangle(bounds, { color, weight: 1, fillColor: color, fillOpacity: opacity }).addTo(map);
}

// Example for Brownsberg & Lawa
[ {lat:5.0, lng:-55.167}, {lat: 5.077, lng: -55.157}, {lat: 4.592, lng: -54.404}, {lat: 4.900, lng: -56.500}, {lat: 5.000, lng: -55.367}, {lat: 4.800, lng: -56.000}, {lat: 5.000, lng: -54.600} ].forEach(center => {
  [5, 10, 15, 20].forEach((r, i) => {
    const colors = ['#800000','#cc3300','#ff6600','#ff9933'];
    createRiskSquare(center.lat, center.lng, r, colors[i], 0.4 - (i * 0.1));
  });
});

// Heatmap layer using estimated mercury data
const heatPoints = [
  [5.0, -55.167, 0.9], // Brownsberg high contamination
  [4.4, -54.0, 1.0],   // Lawa illegal dredging hotspot
  [5.077, -55.157, 0.4], // Rosebel industrial
];
L.heatLayer(heatPoints, {
  radius: 30,
  blur: 20,
  gradient: {0.2:'yellow',0.5:'orange',1:'red'},
  maxZoom: 12
}).addTo(map);

// Contact form handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };
  
  console.log('Form submitted:', formData);
  
  const responseDiv = document.getElementById('formResponse');
  responseDiv.textContent = 'Thank you for your message! I will get back to you soon.';
  responseDiv.style.display = 'block';
  
  this.reset();
  
  setTimeout(() => {
    responseDiv.style.display = 'none';
  }, 5000);
});

// Make sure map doesn't interfere with page scrolling
document.getElementById('map').addEventListener('wheel', function(e) {
  if (!map.scrollWheelZoom.enabled()) {
    e.stopPropagation();
  }
});

// Contact form handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
    to: 'andrewisjeatmo@gmail.com',
    subject: 'Message from Suriname Mining Map'
  };
  
  // In a real application, you would send this to a server
  // Here's a simulated version that would work with a server:
  console.log('Email would be sent to:', formData.to);
  console.log('Subject:', formData.subject);
  console.log('From:', formData.email);
  console.log('Message:', formData.message);
  
  // Show success message
  const responseDiv = document.getElementById('formResponse');
  responseDiv.textContent = 'Thank you for your message! I will get back to you soon.';
  responseDiv.style.display = 'block';
  responseDiv.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
  responseDiv.style.borderLeft = '4px solid #4CAF50';
  
  // Reset form
  this.reset();
  
  // Hide message after 5 seconds
  setTimeout(() => {
    responseDiv.style.display = 'none';
  }, 5000);
});