import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/SellerProducts.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const STORAGE_BUCKET = "product-images";

const emptyForm = {
  id: null,
  name: "",
  slug: "",
  description: "",
  category_id: "",
  farmer_id: "",
  price: "",
  old_price: "",
  stock_quantity: "",
  rating: "0",
  is_active: true,
};

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Your session has expired. Please login again.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
};

const getImageUrl = (storagePath) => {
  if (!storagePath) return "";

  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://")
  ) {
    return storagePath;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return publicUrl;
};

const slugify = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const getCategoryName = (product) => {
  return (
    product?.categories?.name ||
    product?.category?.name ||
    "Uncategorized"
  );
};

const getFarmerName = (product) => {
  return product?.farmers?.name || "No farmer";
};

const getProductImages = (product) => {
  const images = Array.isArray(product?.product_images)
    ? [...product.product_images]
    : [];

  images.sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

  return images;
};

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [farmers, setFarmers] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [selectedVideos, setSelectedVideos] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadFarmers(),
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load seller products.");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/api/seller/products`,
      {
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch products."
      );
    }

    setProducts(data.products || []);
  };

  const loadCategories = async () => {
    const response = await fetch(
      `${API_URL}/api/categories`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch categories."
      );
    }

    setCategories(data.categories || []);
  };

  const loadFarmers = async () => {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/api/farmers`,
      {
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch farmers."
      );
    }

    setFarmers(data.farmers || []);
  };

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name?.toLowerCase().includes(searchValue) ||
        product.slug?.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category_id === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      ...emptyForm,
      farmer_id: farmers[0]?.id || "",
    });

    setSelectedImages([]);
    setSelectedVideos([]);

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      category_id: product.category_id || "",
      farmer_id: product.farmer_id || "",
      price: product.price ?? "",
      old_price: product.old_price ?? "",
      stock_quantity: product.stock_quantity ?? 0,
      rating: product.rating ?? 0,
      is_active:
        product.is_active === undefined
          ? true
          : product.is_active,
    });

    setSelectedImages([]);
    setSelectedVideos([]);

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setSelectedImages([]);
    setSelectedVideos([]);
    setForm(emptyForm);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleNameChange = (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      name: value,
      slug:
        current.id || current.slug
          ? current.slug
          : slugify(value),
    }));
  };

  const handleImageSelection = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const mappedFiles = validFiles.map(
      (file) => ({
        id:
          `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      })
    );

    setSelectedImages((current) => [
      ...current,
      ...mappedFiles,
    ]);

    event.target.value = "";
  };

  const removeSelectedImage = (id) => {
    setSelectedImages((current) => {
      const image = current.find(
        (item) => item.id === id
      );

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter(
        (item) => item.id !== id
      );
    });
  };

  const handleVideoSelection = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    const validFiles = files.filter((file) =>
      file.type.startsWith("video/")
    );

    const mappedFiles = validFiles.map(
      (file) => ({
        id:
          `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      })
    );

    setSelectedVideos((current) => [
      ...current,
      ...mappedFiles,
    ]);

    event.target.value = "";
  };

  const removeSelectedVideo = (id) => {
    setSelectedVideos((current) => {
      const video = current.find(
        (item) => item.id === id
      );

      if (video?.preview) {
        URL.revokeObjectURL(video.preview);
      }

      return current.filter(
        (item) => item.id !== id
      );
    });
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        throw new Error("Product name is required.");
      }

      if (!form.category_id) {
        throw new Error("Please select a category.");
      }

      if (!form.farmer_id) {
        throw new Error("Please select a farmer.");
      }

      if (!form.price || Number(form.price) <= 0) {
        throw new Error(
          "Price must be greater than ₹0."
        );
      }

      if (
        form.old_price !== "" &&
        form.old_price !== null &&
        Number(form.old_price) < 0
      ) {
        throw new Error(
          "Old price cannot be negative."
        );
      }

      if (
        form.stock_quantity === "" ||
        Number(form.stock_quantity) < 0 ||
        !Number.isInteger(
          Number(form.stock_quantity)
        )
      ) {
        throw new Error(
          "Stock quantity must be a non-negative integer."
        );
      }

      const headers = await getAuthHeaders();

      const payload = {
        name: form.name.trim(),
        slug:
          form.slug.trim() ||
          slugify(form.name),
        description:
          form.description?.trim() || null,
        category_id: form.category_id,
        farmer_id: form.farmer_id,
        price: Number(form.price),
        old_price:
          form.old_price === "" ||
          form.old_price === null
            ? null
            : Number(form.old_price),
        stock_quantity: Number(
          form.stock_quantity
        ),
        rating:
          form.rating === ""
            ? 0
            : Number(form.rating),
        is_active: Boolean(form.is_active),
      };

      let response;

      if (editingProduct?.id) {
        response = await fetch(
          `${API_URL}/api/seller/products/${editingProduct.id}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/api/seller/products`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save product."
        );
      }

      const savedProduct =
        data.product;

      /*
       * Upload selected images only after the
       * product has been successfully created.
       */
      if (
        selectedImages.length > 0 &&
        savedProduct?.id
      ) {
        await uploadProductImages(
          savedProduct.id
        );
      }

      await loadProducts();

      setSuccess(
        editingProduct
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadProductImages = async (
    productId
  ) => {
    if (!selectedImages.length) {
      return;
    }

    try {
      setUploadingImages(true);

      for (
        let index = 0;
        index < selectedImages.length;
        index++
      ) {
        const selected =
          selectedImages[index];

        const formData = new FormData();

        formData.append(
          "image",
          selected.file
        );

        formData.append(
          "is_primary",
          String(index === 0)
        );

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/seller/products/${productId}/images`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to upload product image."
          );
        }
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const deleteProduct = async () => {
    if (!productToDelete?.id) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const headers =
        await getAuthHeaders();

      const response = await fetch(
        `${API_URL}/api/seller/products/${productToDelete.id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to deactivate product."
        );
      }

      await loadProducts();

      setShowDeleteModal(false);
      setProductToDelete(null);

      setSuccess(
        "Product deactivated successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to deactivate product."
      );
    } finally {
      setSaving(false);
    }
  };

  const openImageManager = (product) => {
    setSelectedProduct(product);
    setSelectedImages([]);
    setShowImageModal(true);
  };

  const closeImageManager = () => {
    if (uploadingImages) return;

    setShowImageModal(false);
    setSelectedProduct(null);
    setSelectedImages([]);
  };

  const uploadImagesFromManager = async () => {
    if (
      !selectedProduct?.id ||
      selectedImages.length === 0
    ) {
      return;
    }

    try {
      setUploadingImages(true);
      setError("");
      setSuccess("");

      /*
       * When adding images through the manager,
       * make the first uploaded image primary only
       * when the product currently has no images.
       */
      const existingImages =
        getProductImages(
          selectedProduct
        );

      for (
        let index = 0;
        index < selectedImages.length;
        index++
      ) {
        const selected =
          selectedImages[index];

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        const formData =
          new FormData();

        formData.append(
          "image",
          selected.file
        );

        formData.append(
          "is_primary",
          String(
            existingImages.length === 0 &&
              index === 0
          )
        );

        const response =
          await fetch(
            `${API_URL}/api/seller/products/${selectedProduct.id}/images`,
            {
              method: "POST",
              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to upload image."
          );
        }
      }

      await loadProducts();

      const updatedProduct =
        products.find(
          (item) =>
            item.id ===
            selectedProduct.id
        );

      if (updatedProduct) {
        setSelectedProduct(
          updatedProduct
        );
      }

      setSelectedImages([]);

      setSuccess(
        "Product images uploaded successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to upload images."
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const deleteProductImage = async (
    imageId
  ) => {
    if (
      !selectedProduct?.id ||
      !imageId
    ) {
      return;
    }

    try {
      setUploadingImages(true);
      setError("");

      const headers =
        await getAuthHeaders();

      const response =
        await fetch(
          `${API_URL}/api/seller/products/${selectedProduct.id}/images/${imageId}`,
          {
            method: "DELETE",
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete image."
        );
      }

      await loadProducts();

      setSelectedProduct(
        (current) => {
          if (!current) {
            return null;
          }

          return {
            ...current,
            product_images:
              getProductImages(
                current
              ).filter(
                (image) =>
                  image.id !==
                  imageId
              ),
          };
        }
      );

      setSuccess(
        "Product image deleted successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to delete image."
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const setPrimaryImage = async (
    imageId
  ) => {
    if (
      !selectedProduct?.id ||
      !imageId
    ) {
      return;
    }

    try {
      setUploadingImages(true);
      setError("");

      const headers =
        await getAuthHeaders();

      const response =
        await fetch(
          `${API_URL}/api/seller/products/${selectedProduct.id}/images/${imageId}/primary`,
          {
            method: "PATCH",
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to set primary image."
        );
      }

      await loadProducts();

      setSelectedProduct(
        (current) => {
          if (!current) {
            return null;
          }

          return {
            ...current,
            product_images:
              getProductImages(
                current
              ).map((image) => ({
                ...image,
                is_primary:
                  image.id ===
                  imageId,
              })),
          };
        }
      );

      setSuccess(
        "Primary image updated successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to update primary image."
      );
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="seller-products-page">
      <div className="seller-products-header">
        <div>
          <h1>Products</h1>
          <p>
            Manage your products,
            inventory and product images.
          </p>
        </div>

        <button
          type="button"
          className="seller-primary-btn"
          onClick={openAddModal}
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="seller-alert seller-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="seller-alert seller-alert-success">
          {success}
        </div>
      )}

      <div className="seller-products-toolbar">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search products..."
        />

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="seller-products-table-wrapper">
        {loading ? (
          <div className="seller-products-loading">
            Loading products...
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="seller-products-empty">
            <h3>No products found</h3>
            <p>
              Add your first product to
              get started.
            </p>
          </div>
        ) : (
          <table className="seller-products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(
                (product) => {
                  const images =
                    getProductImages(
                      product
                    );

                  const primaryImage =
                    images.find(
                      (image) =>
                        image.is_primary
                    ) ||
                    images[0];

                  return (
                    <tr
                      key={product.id}
                    >
                      <td>
                        <div className="seller-product-name-cell">
                          {primaryImage ? (
                            <img
                              src={getImageUrl(
                                primaryImage.storage_path
                              )}
                              alt={
                                product.name
                              }
                              className="seller-product-thumb"
                            />
                          ) : (
                            <div className="seller-product-thumb seller-product-thumb-empty">
                              No image
                            </div>
                          )}

                          <div>
                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <span>
                              {
                                product.slug
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {
                          getCategoryName(
                            product
                          )
                        }
                      </td>

                      <td>
                        {formatPrice(
                          product.price
                        )}

                        {product.old_price !==
                          null &&
                          product.old_price !==
                            undefined && (
                            <span className="seller-old-price">
                              {formatPrice(
                                product.old_price
                              )}
                            </span>
                          )}
                      </td>

                      <td>
                        <span
                          className={
                            Number(
                              product.stock_quantity
                            ) <= 5
                              ? "seller-stock-low"
                              : "seller-stock-ok"
                          }
                        >
                          {
                            product.stock_quantity
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            product.is_active
                              ? "seller-status-active"
                              : "seller-status-inactive"
                          }
                        >
                          {product.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="seller-secondary-btn"
                          onClick={() =>
                            openImageManager(
                              product
                            )
                          }
                        >
                          Manage (
                          {
                            images.length
                          }
                          )
                        </button>
                      </td>

                      <td>
                        <div className="seller-action-buttons">
                          <button
                            type="button"
                            className="seller-edit-btn"
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="seller-delete-btn"
                            onClick={() =>
                              confirmDelete(
                                product
                              )
                            }
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="seller-modal-overlay">
          <div className="seller-modal">
            <div className="seller-modal-header">
              <div>
                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  Enter the product
                  information below.
                </p>
              </div>

              <button
                type="button"
                className="seller-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveProduct}
              className="seller-product-form"
            >
              <div className="seller-form-grid">
                <div className="seller-form-group">
                  <label>
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleNameChange
                    }
                    placeholder="Product name"
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>
                    Product Slug
                  </label>

                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={
                      handleFormChange
                    }
                    placeholder="product-slug"
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>
                    Category
                  </label>

                  <select
                    name="category_id"
                    value={
                      form.category_id
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="seller-form-group">
                  <label>
                    Farmer
                  </label>

                  <select
                    name="farmer_id"
                    value={
                      form.farmer_id
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  >
                    <option value="">
                      Select farmer
                    </option>

                    {farmers.map(
                      (farmer) => (
                        <option
                          key={
                            farmer.id
                          }
                          value={
                            farmer.id
                          }
                        >
                          {farmer.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="seller-form-group">
                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={
                      handleFormChange
                    }
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>
                    Old Price
                  </label>

                  <input
                    type="number"
                    name="old_price"
                    min="0"
                    step="0.01"
                    value={
                      form.old_price
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="seller-form-group">
                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stock_quantity"
                    min="0"
                    step="1"
                    value={
                      form.stock_quantity
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>
                    Rating
                  </label>

                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={
                      handleFormChange
                    }
                  />
                </div>

                <div className="seller-form-group seller-form-group-full">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleFormChange
                    }
                    rows="5"
                    placeholder="Product description"
                  />
                </div>

                <div className="seller-form-group seller-form-group-full">
                  <label className="seller-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        form.is_active
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                    Product is active
                  </label>
                </div>

                <div className="seller-form-group seller-form-group-full">
                  <label>
                    Product Images
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImageSelection
                    }
                  />

                  <small>
                    Images will be
                    uploaded to Supabase
                    Storage after the
                    product is saved.
                  </small>

                  {selectedImages.length >
                    0 && (
                    <div className="seller-image-preview-grid">
                      {selectedImages.map(
                        (image) => (
                          <div
                            key={
                              image.id
                            }
                            className="seller-image-preview"
                          >
                            <img
                              src={
                                image.preview
                              }
                              alt={
                                image.file
                                  .name
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedImage(
                                  image.id
                                )
                              }
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="seller-form-group seller-form-group-full">
                  <label>
                    Product Videos
                  </label>

                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={
                      handleVideoSelection
                    }
                  />

                  <small>
                    Video preview is kept
                    in the browser for
                    now. Persistent
                    product video storage
                    will be added separately.
                  </small>

                  {selectedVideos.length >
                    0 && (
                    <div className="seller-video-preview-list">
                      {selectedVideos.map(
                        (video) => (
                          <div
                            key={
                              video.id
                            }
                            className="seller-video-preview"
                          >
                            <video
                              src={
                                video.preview
                              }
                              controls
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedVideo(
                                  video.id
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="seller-modal-footer">
                <button
                  type="button"
                  className="seller-secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="seller-primary-btn"
                  disabled={
                    saving ||
                    uploadingImages
                  }
                >
                  {saving
                    ? "Saving..."
                    : uploadingImages
                    ? "Uploading..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="seller-modal-overlay">
          <div className="seller-confirm-modal">
            <h2>
              Deactivate Product?
            </h2>

            <p>
              Are you sure you want to
              deactivate "
              {productToDelete?.name}"
              ?
            </p>

            <div className="seller-modal-footer">
              <button
                type="button"
                className="seller-secondary-btn"
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="seller-delete-btn"
                onClick={
                  deleteProduct
                }
                disabled={saving}
              >
                {saving
                  ? "Processing..."
                  : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal &&
        selectedProduct && (
          <div className="seller-modal-overlay">
            <div className="seller-modal seller-image-manager-modal">
              <div className="seller-modal-header">
                <div>
                  <h2>
                    Product Images
                  </h2>

                  <p>
                    {
                      selectedProduct.name
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="seller-modal-close"
                  onClick={
                    closeImageManager
                  }
                  disabled={
                    uploadingImages
                  }
                >
                  ×
                </button>
              </div>

              <div className="seller-image-manager">
                <div className="seller-form-group">
                  <label>
                    Add Images
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImageSelection
                    }
                  />
                </div>

                {selectedImages.length >
                  0 && (
                  <div className="seller-image-preview-grid">
                    {selectedImages.map(
                      (image) => (
                        <div
                          key={
                            image.id
                          }
                          className="seller-image-preview"
                        >
                          <img
                            src={
                              image.preview
                            }
                            alt={
                              image.file
                                .name
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedImage(
                                image.id
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="seller-primary-btn"
                  onClick={
                    uploadImagesFromManager
                  }
                  disabled={
                    uploadingImages ||
                    selectedImages.length ===
                      0
                  }
                >
                  {uploadingImages
                    ? "Uploading..."
                    : "Upload Images"}
                </button>

                <div className="seller-existing-images">
                  <h3>
                    Existing Images
                  </h3>

                  {getProductImages(
                    selectedProduct
                  ).length === 0 ? (
                    <p>
                      No images uploaded
                      yet.
                    </p>
                  ) : (
                    <div className="seller-image-manager-grid">
                      {getProductImages(
                        selectedProduct
                      ).map(
                        (image) => (
                          <div
                            key={
                              image.id
                            }
                            className={`seller-managed-image ${
                              image.is_primary
                                ? "seller-managed-image-primary"
                                : ""
                            }`}
                          >
                            <img
                              src={getImageUrl(
                                image.storage_path
                              )}
                              alt={`${selectedProduct.name} product`}
                            />

                            {image.is_primary && (
                              <span className="seller-primary-image-badge">
                                Primary
                              </span>
                            )}

                            <div className="seller-managed-image-actions">
                              {!image.is_primary && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPrimaryImage(
                                      image.id
                                    )
                                  }
                                  disabled={
                                    uploadingImages
                                  }
                                >
                                  Set Primary
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteProductImage(
                                    image.id
                                  )
                                }
                                disabled={
                                  uploadingImages
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default SellerProducts;