
  
//navbar
window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    console.log('Scroll event triggered. Current scroll position: ', window.scrollY);
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scroll');
    } else {
        navbar.classList.remove('navbar-scroll');
    }
});

// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init();
});


// IntersectionObserver for section animations
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const options = {
        threshold: 0.5
    };

    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view');
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });
});

const images = [
    'https://i.postimg.cc/XJXGG887/crop-fuild.jpg',
    'https://i.postimg.cc/VNKDnmx9/crop-fuild2-1.jpg',
    'https://i.postimg.cc/VNKDnmx9/crop-fuild2-2.jpg'
];

let currentIndex = 0;

function updateBackgroundImage() {
    const hero = document.querySelector('.hero');
    hero.style.backgroundImage = `url(${images[currentIndex]})`;
}

function moveSlide(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    updateBackgroundImage();
}

// Initial image
updateBackgroundImage();

// Auto-play (optional)
setInterval(() => moveSlide(1), 5000);

