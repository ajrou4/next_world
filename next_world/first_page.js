document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent click if clicking the button
      if (e.target.classList.contains('start-button')) {
        return;
      }
      
      const mode = card.querySelector('.option-title').textContent.includes('Regular') 
        ? 'regular' 
        : 'extended';
        
      // window.location.href = `ping-pong.html?mode=${mode}`;
    });
  });