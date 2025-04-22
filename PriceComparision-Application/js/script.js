document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      const query = document.getElementById("searchInput").value.trim();
      if (query) {
        window.location.href = `comparison.html?query=${encodeURIComponent(
          query
        )}`;
      } else {
        alert("Please enter a product name to search.");
      }
    });
  }

  // Initialize comparison page if relevant
  if (document.getElementById("productsContainer")) {
    initComparisonPage();
  }

  // Initialize wishlist page if relevant
  if (document.getElementById("wishlistContainer")) {
    initWishlistPage();
  }

  // Initialize product detail page if relevant
  if (document.getElementById("productDetailContainer")) {
    initProductDetailPage();
  }
});

// Utility to get URL parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Fetch products from both APIs
async function fetchProducts() {
  try {
    const [fakeRes, dummyRes] = await Promise.all([
      fetch("https://fakestoreapi.com/products"),
      fetch("https://dummyjson.com/products?limit=50"),
    ]);

    const fakeData = await fakeRes.json();
    const dummyJson = await dummyRes.json();
    const dummyData = dummyJson.products;

    const mappedDummy = dummyData.map((item) => ({
      id: `dummy-${item.id}`,
      title: item.title || "No title",
      price: item.price ?? 0,
      image: item.thumbnail || "https://via.placeholder.com/150",
      description: item.description || "No description available.",
      category: item.category || "Misc",
      rating: {
        rate: item.rating ?? 0,
        count: item.stock ?? 0,
      },
    }));

    return [...fakeData, ...mappedDummy];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

function renderProducts(products) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
    <div class="card h-100">
      <img src="${
        product.image || "https://via.placeholder.com/150"
      }" class="card-img-top" alt="${
      product.title || "Product"
    }" style="height:200px; object-fit:contain;">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title || "No title available"}</h5>
        <p class="card-text">$${product.price ?? "0.00"}</p>
        <p class="card-text">Rating: ${product.rating?.rate ?? "N/A"} (${
      product.rating?.count ?? 0
    } reviews)</p>
        <div class="mt-auto">
          <button class="btn btn-primary btn-sm view-details" data-id="${
            product.id
          }">View Details</button>
          <button class="btn btn-secondary btn-sm add-wishlist" data-id="${
            product.id
          }">Add to Wishlist</button>
        </div>
      </div>
    </div>
  `;
    container.appendChild(col);
  });

  // Attach event listeners after rendering
  container.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      window.location.href = `product-details.html?id=${encodeURIComponent(
        id
      )}`;
    });
  });

  container.querySelectorAll(".add-wishlist").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      addToWishlist(id);
    });
  });
}

function addToWishlist(id) {
  fetchProducts().then((products) => {
    const product = products.find((p) => p.id == id);
    if (!product) return;

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (!wishlist.some((item) => item.id == product.id)) {
      wishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert("Added to wishlist!");
    } else {
      alert("Already in wishlist.");
    }
  });
}

function initWishlistPage() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const container = document.getElementById("wishlistContainer");

  if (wishlist.length === 0) {
    container.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }

  container.innerHTML = "";
  wishlist.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
    <div class="card h-100">
      <img src="${
        product.image || "https://via.placeholder.com/150"
      }" class="card-img-top" alt="${
      product.title || "Product"
    }" style="height:200px; object-fit:contain;">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title || "No title available"}</h5>
        <p class="card-text">$${product.price ?? "0.00"}</p>
        <p class="card-text">Rating: ${product.rating?.rate ?? "N/A"} (${
      product.rating?.count ?? 0
    } reviews)</p>
        <p class="card-text">${
          product.description || "No description available."
        }</p>
        <button class="btn btn-danger btn-sm mt-auto remove-wishlist" data-id="${
          product.id
        }">Remove</button>
      </div>
    </div>
  `;
    container.appendChild(col);
  });

  container.querySelectorAll(".remove-wishlist").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      removeFromWishlist(id);
    });
  });
}

function removeFromWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter((item) => item.id != id);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  initWishlistPage();
}

async function initComparisonPage() {
  let products = await fetchProducts();

  const query = getQueryParam("query");
  if (query) {
    products = products.filter((product) =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  let originalProducts = [...products];

  renderProducts(products);

  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", function () {
    let sortedProducts = [...originalProducts];
    if (this.value === "price-asc") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (this.value === "price-desc") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (this.value === "rating") {
      sortedProducts.sort(
        (a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0)
      );
    }
    renderProducts(sortedProducts);
  });

  const priceRange = document.getElementById("priceRange");
  const maxPriceLabel = document.getElementById("maxPriceLabel");
  priceRange.addEventListener("input", function () {
    maxPriceLabel.textContent = `$${this.value}`;
    const filtered = originalProducts.filter(
      (p) => p.price <= parseFloat(this.value)
    );
    renderProducts(filtered);
  });
}

async function initProductDetailPage() {
  const container = document.getElementById("productDetailContainer");
  const id = getQueryParam("id");

  if (!id) {
    container.innerHTML = "<p>Product ID not found.</p>";
    return;
  }

  const products = await fetchProducts();
  const product = products.find((p) => p.id == id);

  if (!product) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  container.innerHTML = `
  <div class="row">
    <div class="col-md-6">
      <img src="${product.image}" class="img-fluid" alt="${product.title}">
    </div>
    <div class="col-md-6">
      <h3>${product.title}</h3>
      <p><strong>Price:</strong> $${product.price}</p>
      <p><strong>Rating:</strong> ${product.rating?.rate ?? "N/A"} (${
    product.rating?.count ?? 0
  } reviews)</p>
      <p><strong>Description:</strong> ${product.description}</p>
      <button class="btn btn-secondary" onclick="addToWishlist('${
        product.id
      }')">Add to Wishlist</button>
    </div>
  </div>
`;
}
