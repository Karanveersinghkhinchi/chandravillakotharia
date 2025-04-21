const firebaseConfig = {
    apiKey: "AIzaSyBh7_G44BemcmSqaY8clanTysWy70b713A",
    authDomain: "chandravillakotharia-1859c.firebaseapp.com",
    databaseURL: "https://chandravillakotharia-1859c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chandravillakotharia-1859c",
    storageBucket: "chandravillakotharia-1859c.firebasestorage.app",
    messagingSenderId: "210995485996",
    appId: "1:210995485996:web:9a905efa520d5b1e60a089",
    measurementId: "G-VM2T3VWLBG"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Mobile Navbar Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  menuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    menuToggle.textContent = mobileNav.classList.contains('active') ? '×' : '☰';
  });
  
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            window.scrollTo({
                top: targetElement.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        }
        mobileNav.classList.remove('active');
        menuToggle.textContent = '☰';
    });
  });
  
  document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            window.scrollTo({
                top: targetElement.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        }
    });
  });
  
  // Gallery Slider with Auto-Slide
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
  }
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  setInterval(nextSlide, 5000);
  showSlide(currentSlide);
  
  // Gallery Modal
  const exploreMoreBtn = document.getElementById('explore-more');
  const galleryModal = document.getElementById('gallery-modal');
  const closeModal = document.querySelector('.close-modal');
  exploreMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    galleryModal.classList.add('active');
  });
  closeModal.addEventListener('click', () => {
    galleryModal.classList.remove('active');
  });
  
  // Gallery Hover Effect
  document.querySelectorAll('.hover-img').forEach(img => {
    img.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.classList.add('image-modal');
        modal.innerHTML = `
            <span class="close-image-modal">×</span>
            <img src="${img.src}" alt="${img.alt}" class="full-img">
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-image-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
  });
  
  // Games Modal
  const gamesFacility = document.getElementById('games-facility');
  const gamesModal = document.getElementById('games-modal');
  const closeGamesModal = document.querySelector('.close-games-modal');
  gamesFacility.addEventListener('click', () => {
    gamesModal.classList.add('active');
  });
  closeGamesModal.addEventListener('click', () => {
    gamesModal.classList.remove('active');
  });
  
  // Experiences Slider with Auto-Slide
  let currentExperienceSlide = 0;
  const experienceSlides = document.querySelectorAll('.experience-slide');
  function showExperienceSlide(index) {
    experienceSlides.forEach(slide => slide.classList.remove('active'));
    experienceSlides[index].classList.add('active');
  }
  function nextExperienceSlide() {
    currentExperienceSlide = (currentExperienceSlide + 1) % experienceSlides.length;
    showExperienceSlide(currentExperienceSlide);
  }
  setInterval(nextExperienceSlide, 5000);
  showExperienceSlide(currentExperienceSlide);
  
  // Dynamic Pricing (Fetch rate from Firebase)
  const checkinDateInput = document.getElementById('checkin-date');
  const checkoutDateInput = document.getElementById('checkout-date');
  const adultsInput = document.getElementById('booking-details').querySelector('input[name="adults"]');
  const kidsInput = document.getElementById('booking-details').querySelector('input[name="kids"]');
  const totalPriceElement = document.getElementById('total-price');
  let nightRate = 19999; // Default rate, Firebase se overwrite hoga
  
  database.ref('villaRate').on('value', (snapshot) => {
    const rate = snapshot.val();
    console.log('Fetched villaRate:', rate);
    if (rate) {
        nightRate = parseInt(rate);
        calculateTotalPrice();
    } else {
        console.warn('villaRate not found in Firebase, using default:', nightRate);
        alert('Rate fetch nahi hua, default rate use ho raha hai. Support se contact karo.');
    }
  }, (error) => {
    console.error("Error fetching villaRate:", error);
    alert('Rate fetch mein error: ' + error.message + '. Default rate use ho raha hai.');
  });
  
  function calculateTotalPrice() {
    const checkin = new Date(checkinDateInput.value);
    const checkout = new Date(checkoutDateInput.value);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)) || 1;
    const total = nightRate * nights;
    totalPriceElement.textContent = total || nightRate;
    console.log('Calculated total:', total, 'nights:', nights, 'nightRate:', nightRate);
    return total || nightRate; // Return total for payment
  }
  
  checkinDateInput.addEventListener('change', calculateTotalPrice);
  checkoutDateInput.addEventListener('change', calculateTotalPrice);
  
  // Book Now Buttons
  function scrollToBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    const headerHeight = document.querySelector('header').offsetHeight || 0;
    window.scrollTo({ top: bookingForm.offsetTop - headerHeight, behavior: 'smooth' });
  }
  
  document.getElementById('book-now-hero-btn').addEventListener('click', scrollToBookingForm);
  document.getElementById('sticky-book-now-btn').addEventListener('click', scrollToBookingForm);
  document.getElementById('book-now-about-btn').addEventListener('click', scrollToBookingForm);
  document.getElementById('book-now-contact-btn').addEventListener('click', scrollToBookingForm);
  
  // Scroll to Top Button
  const scrollToTopBtn = document.querySelector('.scroll-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
  });
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // Razorpay Payment with Backend Integration
  document.getElementById('proceed-to-pay').addEventListener('click', async function (e) {
    e.preventDefault();
    const form = document.getElementById('booking-details');
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const phone = form.querySelector('input[name="phone"]').value.trim();
    const checkin = checkinDateInput.value;
    const checkout = checkoutDateInput.value;
    const adults = parseInt(adultsInput.value) || 1; // Fallback to 1
    const kids = parseInt(kidsInput.value) || 0; // Fallback to 0
    const termsAgree = document.getElementById('terms-agree').checked;
  
    // Validation
    if (!form.checkValidity() || !name || !email || !phone || !checkin || !checkout) {
        alert('Saare required fields bharo!');
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        alert('Phone number 10 digits ka hona chahiye.');
        return;
    }
    if (!termsAgree) {
        alert('Terms & Conditions accept karo.');
        return;
    }
    if (adults > 8 || kids > 4) {
        alert('Max 8 adults aur 4 kids allowed hain.');
        return;
    }
    if (new Date(checkin) >= new Date(checkout)) {
        alert('Check-in date checkout se pehle honi chahiye.');
        return;
    }
  
    // Calculate total amount
    const totalAmount = calculateTotalPrice();
    if (!totalAmount || totalAmount <= 0) {
        alert('Amount calculate mein error hai, dobara try karo.');
        return;
    }
  
    // Loading state
    const payButton = document.getElementById('proceed-to-pay');
    payButton.disabled = true;
    payButton.textContent = 'Processing...';
  
    try {
        // Dynamic base URL
        const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
        console.log('Calling /create-order with baseUrl:', baseUrl);
  
        // Fetch Razorpay key
        const keyResponse = await fetch(`${baseUrl}/get-razorpay-key`);
        if (!keyResponse.ok) {
            throw new Error(`Key fetch nahi hua: ${keyResponse.status} ${keyResponse.statusText}`);
        }
        const keyData = await keyResponse.json();
        const razorpayKey = keyData.key;
        if (!razorpayKey) {
            throw new Error('Razorpay key nahi mili, server configuration check karo.');
        }
  
        // Create order
        const response = await fetch(`${baseUrl}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: totalAmount * 100,
                name,
                email,
                phone,
                checkin,
                checkout,
                adults,
                kids
            })
        });
  
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            throw new Error(`Order create nahi hua: ${errorData.error || 'No details provided'} - Amount: ${errorData.amount || 'N/A'}, Expected: ${errorData.expectedAmount || 'N/A'}`);
        }
  
        const order = await response.json();
  
        // Razorpay options
        const options = {
            key: razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name: 'Chandra Villa',
            description: '4BHK Villa Booking with Meals',
            order_id: order.id,
            handler: async function (response) {
                try {
                    // Verify payment
                    const verifyResponse = await fetch(`${baseUrl}/verify-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });
  
                    const verifyData = await verifyResponse.json();
  
                    if (verifyData.status === 'success') {
                        // Save to Firebase
                        const bookingRef = database.ref('bookings').push();
                        await bookingRef.set({
                            name,
                            email,
                            phone,
                            checkin,
                            checkout,
                            adults,
                            kids,
                            paymentId: response.razorpay_payment_id,
                            totalAmount,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        });
  
                        // Formspree
                        await fetch('https://formspree.io/f/mgvapbel', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name,
                                email,
                                phone,
                                checkin,
                                checkout,
                                adults,
                                kids,
                                totalAmount,
                                paymentId: response.razorpay_payment_id,
                                timestamp: new Date().toISOString()
                            })
                        });
  
                        // Google Analytics
                        if (typeof gtag === 'function') {
                            gtag('event', 'booking_completed', {
                                'event_category': 'Booking',
                                'event_label': name,
                                'value': totalAmount
                            });
                        }
  
                        // Success
                        alert(`Payment ho gaya! Booking confirm hai. Payment ID: ${response.razorpay_payment_id}. Hum WhatsApp pe jaldi contact karenge.`);
                        window.location.href = '/thank-you';
                    } else {
                        alert('Payment verify nahi hua. Support se contact karo.');
                    }
                } catch (error) {
                    console.error('Payment verify mein error:', error);
                    alert('Payment verify mein error: ' + error.message);
                }
            },
            prefill: {
                name,
                email,
                contact: phone
            },
            theme: {
                color: '#D4AF37'
            }
        };
  
        // Open Razorpay
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
            alert('Payment fail ho gaya: ' + response.error.description);
            payButton.disabled = false;
            payButton.textContent = `Proceed to Pay ₹${totalAmount}`;
        });
        rzp.open();
    } catch (error) {
        console.error('Order create mein error:', error);
        alert(`Error: ${error.message}`);
        payButton.disabled = false;
        payButton.textContent = `Proceed to Pay ₹${totalAmount}`;
    }
  });