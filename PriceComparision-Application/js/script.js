document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
          window.location.href = `comparison.html?query=${encodeURIComponent(query)}`;
        } else {
          alert('Please enter a product name to search.');
        }
      });
    }
  });
// Utility to get URL parameter
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // Function to fetch products from FakeStore API
  async function fetchProducts() {
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
  
  // Function to render products
  function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = ''; // Clear previous products
    
    if(products.length === 0) {
      container.innerHTML = '<p>No products found.</p>';
      return;
    }
    
    products.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height:200px; object-fit:contain;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">$${product.price}</p>
            <p class="card-text">Rating: ${product.rating.rate} (${product.rating.count} reviews)</p>
            <div class="mt-auto">
              <button class="btn btn-primary btn-sm view-details" data-id="${product.id}">View Details</button>
              <button class="btn btn-secondary btn-sm add-wishlist" data-id="${product.id}">Add to Wishlist</button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }
  
  // Function to initialize comparison page functionalities
  async function initComparisonPage() {
    let products = await fetchProducts();
    
    // Get search query from URL parameter and filter products
    const query = getQueryParam('query');
    if(query) {
      products = products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Store original list for filtering/sorting
    let originalProducts = [...products];
    
    // Initial render
    renderProducts(products);
    
    // Sorting functionality
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', function () {
      let sortedProducts = [...originalProducts];
      if (this.value === 'price-asc') {
        sortedProducts.sort((a, b) => a.price - b.price);
      } else if (this.value === 'price-desc') {
        sortedProducts.sort((a, b) => b.price - a.price);
      } else if (this.value === 'rating') {
        sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
      }
      renderProducts(sortedProducts);
    });
    
    // Price range filter
    const priceRange = document.getElementById('priceRange');
    const maxPriceLabel = document.getElementById('maxPriceLabel');
    priceRange.addEventListener('input', function () {
      maxPriceLabel.textContent = `$${this.value}`;
      const filteredProducts = originalProducts.filter(product => product.price <= this.value);
      renderProducts(filteredProducts);
    });
    
    // Event delegation for "View Details" and "Add to Wishlist" buttons
    document.getElementById('productsContainer').addEventListener('click', function(e) {
      if(e.target.classList.contains('view-details')) {
        const id = e.target.getAttribute('data-id');
        window.location.href = `product.html?id=${id}`;
      } else if(e.target.classList.contains('add-wishlist')) {
        const id = e.target.getAttribute('data-id');
        addToWishlist(id, originalProducts);
      }
    });
  }
  
  // Initialize when DOM content is loaded for comparison page
  document.addEventListener('DOMContentLoaded', function () {
    if(document.getElementById('productsContainer')) {
      initComparisonPage();
    }
  });
// Wishlist functionality: Add product to wishlist in localStorage
function addToWishlist(productId, products) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    // Check if product is already in the wishlist
    if(wishlist.find(item => item.id == productId)) {
      alert('Product already in wishlist!');
      return;
    }
    const product = products.find(p => p.id == productId);
    if(product) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      alert('Product added to wishlist!');
    }
  }
  
  // Function to render wishlist items
  function renderWishlist() {
    const wishlistContainer = document.getElementById('wishlistContainer');
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlistContainer.innerHTML = '';
    
    if(wishlist.length === 0) {
      wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
      return;
    }
    
    wishlist.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height:200px; object-fit:contain;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">$${product.price}</p>
            <div class="mt-auto">
              <button class="btn btn-primary btn-sm view-details" data-id="${product.id}">View Details</button>
              <button class="btn btn-danger btn-sm remove-wishlist" data-id="${product.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
      wishlistContainer.appendChild(col);
    });
  }
  
  // Event delegation for wishlist removal and view details
  if(document.getElementById('wishlistContainer')) {
    document.getElementById('wishlistContainer').addEventListener('click', function(e) {
      if(e.target.classList.contains('remove-wishlist')) {
        const id = e.target.getAttribute('data-id');
        removeFromWishlist(id);
      } else if(e.target.classList.contains('view-details')) {
        const id = e.target.getAttribute('data-id');
        window.location.href = `product.html?id=${id}`;
      }
    });
  }
  
  // Function to remove item from wishlist
  function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(item => item.id != productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderWishlist();
    alert('Product removed from wishlist.');
  }
  
  // Initialize wishlist page
  document.addEventListener('DOMContentLoaded', function () {
    if(document.getElementById('wishlistContainer')) {
      renderWishlist();
    }
  });
// Function to fetch and display product details for the product page
async function loadProductDetails() {
    const productId = getQueryParam('id');
    const container = document.getElementById('productDetailContainer');
    if(!productId) {
      container.innerHTML = '<p>No product selected.</p>';
      return;
    }
    
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
      const product = await response.json();
      container.innerHTML = `
        <div class="row">
          <div class="col-md-5">
            <img src="${product.image}" class="img-fluid" alt="${product.title}">
          </div>
          <div class="col-md-7">
            <h2>${product.title}</h2>
            <p>${product.description}</p>
            <h4>Price: $${product.price}</h4>
            <p>Rating: ${product.rating.rate} (${product.rating.count} reviews)</p>
            <button class="btn btn-secondary" onclick="window.history.back()">Back</button>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = '<p>Error loading product details.</p>';
    }
  }
  
  // Initialize product detail page
  document.addEventListener('DOMContentLoaded', function () {
    if(document.getElementById('productDetailContainer')) {
      loadProductDetails();
    }
  });
  