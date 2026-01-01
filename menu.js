// Auto-rotate hero carousel images (desktop only) — 2 images
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('.carousel-image');
  const dots = document.querySelectorAll('.dot');

  // Exit early if no carousel found (e.g., mobile)
  if (images.length === 0 || dots.length === 0) return;

  let currentIndex = 0;

  function showImage(index) {
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    images[index].classList.add('active');
    dots[index].classList.add('active');
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length; // Cycles 0 → 1 → 0
    showImage(currentIndex);
  }

  // Start auto-rotation after 3 seconds
  setTimeout(() => {
    const intervalId = setInterval(nextImage, 4000); // Every 4 seconds

    // Optional: Pause on hover
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
      carousel.addEventListener('mouseleave', () => {
        clearInterval(intervalId);
        setTimeout(() => {
          intervalId = setInterval(nextImage, 4000);
        }, 2000);
      });
    }

    // Click dots to change image
    dots.forEach(dot => {
      dot.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        currentIndex = index;
        showImage(index);
      });
    });

  }, 3000); // Start after 3 seconds
});