// Database configuration
const DATABASE_NAME = "shopDB";
const DATABASE_VERSION = 1;
const STORE_KEY = "products";

// Initialize the IndexedDB connection
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;
      if (!dbInstance.objectStoreNames.contains(STORE_KEY)) {
        dbInstance.createObjectStore(STORE_KEY, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Database initialization failed");
  });
}

// Insert a new product into the store
async function insertProduct(product) {
  const dbInstance = await initializeDatabase();
  const transaction = dbInstance.transaction(STORE_KEY, "readwrite");
  const store = transaction.objectStore(STORE_KEY);
  store.add(product);
  // Optionally, you can return a promise that resolves on transaction complete:
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject("Failed to add product");
  });
}

// Retrieve all products from the store
async function fetchAllProducts() {
  const dbInstance = await initializeDatabase();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_KEY, "readonly");
    const store = transaction.objectStore(STORE_KEY);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error fetching products");
  });
}

// Update an existing product by id
async function updateProduct(productId, updateFields) {
  try {
    const dbInstance = await initializeDatabase();
    const transaction = dbInstance.transaction(STORE_KEY, "readwrite");
    const store = transaction.objectStore(STORE_KEY);
    const getRequest = store.get(productId);

    getRequest.onsuccess = () => {
      const currentProduct = getRequest.result;
      if (!currentProduct) {
        console.warn("No product found with id", productId);
        return;
      }
      const updatedProduct = { ...currentProduct, ...updateFields };
      store.put(updatedProduct);

      transaction.oncomplete = () =>
        console.log("Product updated successfully");
      transaction.onerror = (event) =>
        console.error("Update transaction error:", event.target.error);
    };

    getRequest.onerror = (event) =>
      console.error("Error retrieving product:", event.target.error);
  } catch (error) {
    console.error("Error during update:", error);
  }
}

// Delete a product by id
async function removeProduct(productId) {
  const dbInstance = await initializeDatabase();
  const transaction = dbInstance.transaction(STORE_KEY, "readwrite");
  const store = transaction.objectStore(STORE_KEY);
  store.delete(productId);
}
// Sample product insertions
insertProduct({ name: "Gaming Laptop", price: 1800, stock: 4 });
insertProduct({ name: "Smartphone", price: 900, stock: 12 });
insertProduct({ name: "Wireless Headphones", price: 250, stock: 20 });
insertProduct({ name: "Tablet", price: 600, stock: 8 });
insertProduct({ name: "Smartwatch", price: 300, stock: 15 });
insertProduct({ name: "Digital Camera", price: 1200, stock: 5 });
insertProduct({ name: "Bluetooth Speaker", price: 150, stock: 10 });
insertProduct({ name: "Gaming Console", price: 500, stock: 7 });
insertProduct({ name: "External Hard Drive", price: 100, stock: 25 });

// Retrieve and log all products
fetchAllProducts()
  .then((products) => console.log("All products:", products))
  .catch((error) => console.error(error));

// Uncomment below lines to test updating or deleting a product
// updateProduct(1, { price: 1700, stock: 3 });
removeProduct(2);
