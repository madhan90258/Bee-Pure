import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Video,
  Upload,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import {
  getProducts,
  saveProducts,
  removeProductFromCustomerData,
} from "../utils/products";

import {
  Link,
} from "react-router-dom";

import "../styles/SellerProducts.css";


// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  oldPrice: "",
  stockStatus: "in-stock",
  stockCount: "",
};


// =====================================================
// COMPONENT
// =====================================================

function SellerProducts() {

  // ===================================================
  // STATE
  // ===================================================

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("All");

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    editingProductId,
    setEditingProductId,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(emptyForm);

  const [
    imageFiles,
    setImageFiles,
  ] = useState([]);

  const [
    imagePreviews,
    setImagePreviews,
  ] = useState([]);

  const [
    videoFiles,
    setVideoFiles,
  ] = useState([]);

  const [
    videoPreviews,
    setVideoPreviews,
  ] = useState([]);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    deleteProductId,
    setDeleteProductId,
  ] = useState(null);


  const imageInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);


  // ===================================================
  // LOAD + LISTEN FOR PRODUCT CHANGES
  // ===================================================

  useEffect(() => {

    const loadProducts = () => {

      setProducts(
        getProducts()
      );

    };


    // Initial load

    loadProducts();


    // Same browser/tab updates

    window.addEventListener(
      "beePureProductsUpdated",
      loadProducts
    );


    // Other browser tabs

    window.addEventListener(
      "storage",
      loadProducts
    );


    return () => {

      window.removeEventListener(
        "beePureProductsUpdated",
        loadProducts
      );

      window.removeEventListener(
        "storage",
        loadProducts
      );

    };

  }, []);


  // ===================================================
  // CATEGORIES
  // ===================================================

  const categories = [
    "Honey",
    "Natural Sweeteners",
    "Healthy Foods",
    "Farm Products",
    "Gift Boxes",
  ];


  // ===================================================
  // SAVE PRODUCTS
  // ===================================================

  const handleSaveProducts = (
    updatedProducts
  ) => {

    const savedProducts =
      saveProducts(
        updatedProducts
      );

    setProducts(
      savedProducts
    );

  };


  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );


    setFormError("");

  };


  // ===================================================
  // OPEN ADD MODAL
  // ===================================================

  const openAddModal = () => {

    setEditingProductId(null);

    setForm(
      emptyForm
    );

    setImageFiles([]);

    setImagePreviews([]);

    setVideoFiles([]);

    setVideoPreviews([]);

    setFormError("");

    setIsModalOpen(true);

  };


  // ===================================================
  // OPEN EDIT MODAL
  // ===================================================

  const openEditModal = (
    product
  ) => {

    setEditingProductId(
      product.id
    );


    setForm({

      name:
        product.name || "",

      description:
        product.description || "",

      category:
        product.category || "",

      price:
        product.price ?? "",

      oldPrice:
        product.oldPrice ?? "",

      stockStatus:
        product.stockStatus ||
        "in-stock",

      stockCount:
        product.stockCount ??
        "",

    });


    setImageFiles([]);

    setImagePreviews(
      product.images || []
    );

    setVideoFiles([]);

    setVideoPreviews(
      product.videos || []
    );

    setFormError("");

    setIsModalOpen(true);

  };


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {

    setIsModalOpen(false);

    setEditingProductId(null);

    setForm(
      emptyForm
    );

    setImageFiles([]);

    setImagePreviews([]);

    setVideoFiles([]);

    setVideoPreviews([]);

    setFormError("");

  };


  // ===================================================
  // IMAGE SELECT
  // ===================================================

  const handleImageChange = (
    event
  ) => {

    const files =
      Array.from(
        event.target.files || []
      );


    if (!files.length) {
      return;
    }


    const validFiles =
      files.filter(
        (file) =>
          file.type.startsWith(
            "image/"
          )
      );


    if (!validFiles.length) {

      setFormError(
        "Please select valid image files."
      );

      return;
    }


    const newPreviews =
      validFiles.map(
        (file) =>
          URL.createObjectURL(
            file
          )
      );


    setImageFiles(
      (previous) => [
        ...previous,
        ...validFiles,
      ]
    );


    setImagePreviews(
      (previous) => [
        ...previous,
        ...newPreviews,
      ]
    );


    event.target.value = "";

  };


  // ===================================================
  // VIDEO SELECT
  // ===================================================

  const handleVideoChange = (
    event
  ) => {

    const files =
      Array.from(
        event.target.files || []
      );


    if (!files.length) {
      return;
    }


    const validFiles =
      files.filter(
        (file) =>
          file.type.startsWith(
            "video/"
          )
      );


    if (!validFiles.length) {

      setFormError(
        "Please select valid video files."
      );

      return;
    }


    const newPreviews =
      validFiles.map(
        (file) =>
          URL.createObjectURL(
            file
          )
      );


    setVideoFiles(
      (previous) => [
        ...previous,
        ...validFiles,
      ]
    );


    setVideoPreviews(
      (previous) => [
        ...previous,
        ...newPreviews,
      ]
    );


    event.target.value = "";

  };


  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  const removeImage = (
    index
  ) => {

    setImagePreviews(
      (previous) =>
        previous.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
    );


    setImageFiles(
      (previous) => {

        if (
          index >=
          previous.length
        ) {
          return previous;
        }


        return previous.filter(
          (_, fileIndex) =>
            fileIndex !== index
        );

      }
    );

  };


  // ===================================================
  // REMOVE VIDEO
  // ===================================================

  const removeVideo = (
    index
  ) => {

    setVideoPreviews(
      (previous) =>
        previous.filter(
          (_, videoIndex) =>
            videoIndex !== index
        )
    );


    setVideoFiles(
      (previous) => {

        if (
          index >=
          previous.length
        ) {
          return previous;
        }


        return previous.filter(
          (_, fileIndex) =>
            fileIndex !== index
        );

      }
    );

  };


  // ===================================================
  // SUBMIT PRODUCT
  // ===================================================

  const handleSubmit = (
    event
  ) => {

    event.preventDefault();

    setFormError("");


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!form.name.trim()) {

      setFormError(
        "Product name is required."
      );

      return;
    }


    if (
      !form.description.trim()
    ) {

      setFormError(
        "Product description is required."
      );

      return;
    }


    if (!form.category) {

      setFormError(
        "Please select a category."
      );

      return;
    }


    if (
      form.price === "" ||
      Number(form.price) <= 0
    ) {

      setFormError(
        "Please enter a valid product price."
      );

      return;
    }


    if (
      form.stockCount === "" ||
      Number(form.stockCount) < 0
    ) {

      setFormError(
        "Please enter a valid stock count."
      );

      return;
    }


    if (
      imagePreviews.length === 0
    ) {

      setFormError(
        "Please add at least one product image."
      );

      return;
    }


    // -----------------------------------------------
    // PRODUCT DATA
    // -----------------------------------------------

    const productData = {

      name:
        form.name.trim(),

      description:
        form.description.trim(),

      category:
        form.category,

      price:
        Number(form.price),

      oldPrice:
        form.oldPrice === ""
          ? null
          : Number(form.oldPrice),

      images:
        imagePreviews,

      videos:
        videoPreviews,

      stockStatus:
        form.stockStatus,

      stockCount:
        Number(form.stockCount),

    };


    // -----------------------------------------------
    // EDIT
    // -----------------------------------------------

    if (
      editingProductId !==
      null
    ) {

      const updatedProducts =
        products.map(
          (product) => {

            if (
              String(product.id) ===
              String(
                editingProductId
              )
            ) {

              return {
                ...product,
                ...productData,
              };

            }


            return product;

          }
        );


      handleSaveProducts(
        updatedProducts
      );


      setSuccessMessage(
        "Product updated successfully."
      );

    }


    // -----------------------------------------------
    // ADD
    // -----------------------------------------------

    else {

      const newProduct = {

        id:
          Date.now(),

        rating:
          5,

        ...productData,

      };


      handleSaveProducts([
        ...products,
        newProduct,
      ]);


      setSuccessMessage(
        "Product added successfully."
      );

    }


    closeModal();


    setTimeout(() => {

      setSuccessMessage("");

    }, 3000);

  };


  // ===================================================
  // DELETE PRODUCT
  // ===================================================

  const handleDelete = () => {

    if (
      deleteProductId ===
      null
    ) {
      return;
    }


    const updatedProducts =
      products.filter(
        (product) =>
          String(product.id) !==
          String(deleteProductId)
      );


    // -----------------------------------------------
    // SAVE PRODUCT LIST
    // -----------------------------------------------

    handleSaveProducts(
      updatedProducts
    );


    // -----------------------------------------------
    // REMOVE FROM CART/FAVORITES
    // -----------------------------------------------

    removeProductFromCustomerData(
      deleteProductId
    );


    // -----------------------------------------------
    // CLOSE DELETE MODAL
    // -----------------------------------------------

    setDeleteProductId(null);


    setSuccessMessage(
      "Product deleted successfully."
    );


    setTimeout(() => {

      setSuccessMessage("");

    }, 3000);

  };


  // ===================================================
  // FILTER PRODUCTS
  // ===================================================

  const filteredProducts =
    products.filter(
      (product) => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        const matchesSearch =
          !query ||
          String(
            product.name
          )
            .toLowerCase()
            .includes(query) ||
          String(
            product.description
          )
            .toLowerCase()
            .includes(query) ||
          String(
            product.category
          )
            .toLowerCase()
            .includes(query);


        const matchesCategory =
          categoryFilter ===
            "All" ||
          product.category ===
            categoryFilter;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  // ===================================================
  // FORMAT PRICE
  // ===================================================

  const formatPrice = (
    price
  ) => {

    return Number(
      price || 0
    ).toLocaleString(
      "en-IN"
    );

  };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <main className="seller-products-page">

      <div className="seller-products-container">


        {/* ============================================
            HEADER
        ============================================= */}

        <div className="seller-products-header">

          <div>

            <p className="seller-products-eyebrow">
              SELLER DASHBOARD
            </p>

            <h1>
              Products
            </h1>

            <p className="seller-products-subtitle">
              Add, edit and manage your Bee Pure
              products and inventory.
            </p>

          </div>


          <div className="seller-products-header-actions">

            <Link
              to="/seller/account"
              className="seller-products-back-account"
            >

              <ArrowLeft size={17} />

              <span>
                Back to Account
              </span>

            </Link>


            <button
              type="button"
              className="seller-add-product-button"
              onClick={openAddModal}
            >

              <Plus size={18} />

              Add Product

            </button>

          </div>

        </div>


        {/* ============================================
            SUCCESS
        ============================================= */}

        {successMessage && (

          <div className="seller-product-success">

            <CheckCircle size={18} />

            <span>
              {successMessage}
            </span>

          </div>

        )}


        {/* ============================================
            TOOLBAR
        ============================================= */}

        <div className="seller-products-toolbar">

          <div className="seller-product-search">

            <Search size={17} />

            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />


            {searchQuery && (

              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                aria-label="Clear search"
              >
                <X size={15} />
              </button>

            )}

          </div>


          <select
            className="seller-product-category-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Categories
            </option>


            {categories.map(
              (category) => (

                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>

              )
            )}

          </select>

        </div>


        {/* ============================================
            PRODUCT COUNT
        ============================================= */}

        <div className="seller-product-count">

          <Package size={16} />

          <span>

            {filteredProducts.length}{" "}

            {filteredProducts.length === 1
              ? "product"
              : "products"}

          </span>

        </div>


        {/* ============================================
            PRODUCT TABLE
        ============================================= */}

        {filteredProducts.length > 0 ? (

          <div className="seller-products-table-wrapper">

            <table className="seller-products-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Media
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProducts.map(
                  (product) => (

                    <tr
                      key={product.id}
                    >

                      {/* PRODUCT */}

                      <td>

                        <div className="seller-product-info">

                          <div className="seller-product-thumbnail">

                            {product.images?.[0] ? (

                              <img
                                src={
                                  product.images[0]
                                }
                                alt={
                                  product.name
                                }
                              />

                            ) : (

                              <ImageIcon
                                size={22}
                              />

                            )}

                          </div>


                          <div>

                            <h3>
                              {product.name}
                            </h3>

                            <p>
                              {product.description}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        <span className="seller-product-category">

                          {product.category}

                        </span>

                      </td>


                      {/* PRICE */}

                      <td>

                        <div className="seller-product-price">

                          <strong>

                            ₹
                            {formatPrice(
                              product.price
                            )}

                          </strong>


                          {product.oldPrice && (

                            <del>

                              ₹
                              {formatPrice(
                                product.oldPrice
                              )}

                            </del>

                          )}

                        </div>

                      </td>


                      {/* STOCK */}

                      <td>

                        <div className="seller-stock-cell">

                          <span
                            className={`seller-stock-status ${
                              product.stockStatus ===
                              "in-stock"
                                ? "in"
                                : "out"
                            }`}
                          >

                            {product.stockStatus ===
                            "in-stock" ? (

                              <>
                                <CheckCircle
                                  size={13}
                                />

                                In Stock
                              </>

                            ) : (

                              <>
                                <AlertCircle
                                  size={13}
                                />

                                Out of Stock
                              </>

                            )}

                          </span>


                          <small>
                            {product.stockCount} units
                          </small>

                        </div>

                      </td>


                      {/* MEDIA */}

                      <td>

                        <div className="seller-product-media-count">

                          <span>

                            <ImageIcon
                              size={14}
                            />

                            {
                              product.images
                                ?.length || 0
                            }

                          </span>


                          <span>

                            <Video
                              size={14}
                            />

                            {
                              product.videos
                                ?.length || 0
                            }

                          </span>

                        </div>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="seller-product-actions">

                          <button
                            type="button"
                            className="seller-edit-button"
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                            title="Edit product"
                          >

                            <Pencil
                              size={16}
                            />

                            <span>
                              Edit
                            </span>

                          </button>


                          <button
                            type="button"
                            className="seller-delete-button"
                            onClick={() =>
                              setDeleteProductId(
                                product.id
                              )
                            }
                            title="Delete product"
                          >

                            <Trash2
                              size={16}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="seller-products-empty">

            <div className="seller-products-empty-icon">

              <Package size={30} />

            </div>

            <h2>
              No products found
            </h2>

            <p>
              Try changing your search or
              category filter.
            </p>

          </div>

        )}

      </div>


      {/* =================================================
          ADD / EDIT MODAL
      ================================================== */}

      {isModalOpen && (

        <div
          className="seller-product-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeModal();

            }

          }}
        >

          <div className="seller-product-modal">


            {/* MODAL HEADER */}

            <div className="seller-product-modal-header">

              <div>

                <p className="seller-products-eyebrow">

                  {editingProductId !== null
                    ? "UPDATE PRODUCT"
                    : "NEW PRODUCT"}

                </p>

                <h2>

                  {editingProductId !== null
                    ? "Edit Product"
                    : "Add Product"}

                </h2>

              </div>


              <button
                type="button"
                className="seller-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >

                <X size={21} />

              </button>

            </div>


            {/* FORM */}

            <form
              className="seller-product-form"
              onSubmit={handleSubmit}
            >


              {/* ERROR */}

              {formError && (

                <div className="seller-product-error">

                  <AlertCircle
                    size={17}
                  />

                  <span>
                    {formError}
                  </span>

                </div>

              )}


              {/* PRODUCT INFORMATION */}

              <div className="seller-form-section">

                <div className="seller-form-section-title">

                  <h3>
                    Product Information
                  </h3>

                  <span>
                    Required
                  </span>

                </div>


                <div className="seller-form-grid">


                  {/* NAME */}

                  <div className="seller-form-field full">

                    <label htmlFor="product-name">
                      Product Name
                    </label>

                    <input
                      id="product-name"
                      type="text"
                      name="name"
                      placeholder="Enter product name"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* CATEGORY */}

                  <div className="seller-form-field">

                    <label htmlFor="product-category">
                      Category
                    </label>

                    <select
                      id="product-category"
                      name="category"
                      value={form.category}
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select category
                      </option>


                      {categories.map(
                        (category) => (

                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* PRICE */}

                  <div className="seller-form-field">

                    <label htmlFor="product-price">
                      Price (₹)
                    </label>

                    <input
                      id="product-price"
                      type="number"
                      name="price"
                      min="0"
                      step="1"
                      placeholder="499"
                      value={form.price}
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* OLD PRICE */}

                  <div className="seller-form-field">

                    <label htmlFor="product-old-price">

                      Original Price (₹)

                      <small>
                        Optional
                      </small>

                    </label>

                    <input
                      id="product-old-price"
                      type="number"
                      name="oldPrice"
                      min="0"
                      step="1"
                      placeholder="599"
                      value={form.oldPrice}
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* DESCRIPTION */}

                  <div className="seller-form-field full">

                    <label htmlFor="product-description">
                      Description
                    </label>

                    <textarea
                      id="product-description"
                      name="description"
                      rows="4"
                      placeholder="Describe the product..."
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

              </div>


              {/* =================================================
                  IMAGES
              ================================================== */}

              <div className="seller-form-section">

                <div className="seller-form-section-title">

                  <div>

                    <h3>
                      Product Images
                    </h3>

                    <p>
                      Add multiple product images.
                    </p>

                  </div>

                  <span>
                    Required
                  </span>

                </div>


                <div className="seller-media-grid">

                  {imagePreviews.map(
                    (image, index) => (

                      <div
                        className="seller-media-preview"
                        key={`${image}-${index}`}
                      >

                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                        />


                        <button
                          type="button"
                          className="seller-media-remove"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          aria-label="Remove image"
                        >

                          <X size={15} />

                        </button>


                        {index === 0 && (

                          <span className="seller-main-media-label">
                            Main
                          </span>

                        )}

                      </div>

                    )
                  )}


                  <button
                    type="button"
                    className="seller-media-upload"
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                  >

                    <Upload size={22} />

                    <span>
                      Add Images
                    </span>

                    <small>
                      JPG, PNG, WEBP
                    </small>

                  </button>

                </div>


                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={
                    handleImageChange
                  }
                />

              </div>


              {/* =================================================
                  VIDEOS
              ================================================== */}

              <div className="seller-form-section">

                <div className="seller-form-section-title">

                  <div>

                    <h3>
                      Product Videos
                    </h3>

                    <p>
                      Add product demonstration videos.
                    </p>

                  </div>

                  <span className="optional-label">
                    Optional
                  </span>

                </div>


                <div className="seller-media-grid seller-video-grid">

                  {videoPreviews.map(
                    (video, index) => (

                      <div
                        className="seller-media-preview seller-video-preview"
                        key={`${video}-${index}`}
                      >

                        <video
                          src={video}
                          controls
                          preload="metadata"
                        />


                        <button
                          type="button"
                          className="seller-media-remove"
                          onClick={() =>
                            removeVideo(
                              index
                            )
                          }
                          aria-label="Remove video"
                        >

                          <X size={15} />

                        </button>

                      </div>

                    )
                  )}


                  <button
                    type="button"
                    className="seller-media-upload seller-video-upload"
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                  >

                    <Video size={23} />

                    <span>
                      Add Videos
                    </span>

                    <small>
                      MP4, WEBM, MOV
                    </small>

                  </button>

                </div>


                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  hidden
                  onChange={
                    handleVideoChange
                  }
                />

              </div>


              {/* =================================================
                  INVENTORY
              ================================================== */}

              <div className="seller-form-section">

                <div className="seller-form-section-title">

                  <div>

                    <h3>
                      Inventory
                    </h3>

                    <p>
                      Manage the current product stock.
                    </p>

                  </div>

                </div>


                <div className="seller-form-grid">


                  <div className="seller-form-field">

                    <label htmlFor="product-stock-status">
                      Stock Status
                    </label>

                    <select
                      id="product-stock-status"
                      name="stockStatus"
                      value={
                        form.stockStatus
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="in-stock">
                        In Stock
                      </option>

                      <option value="out-of-stock">
                        Out of Stock
                      </option>

                    </select>

                  </div>


                  <div className="seller-form-field">

                    <label htmlFor="product-stock-count">
                      Stock Count
                    </label>

                    <input
                      id="product-stock-count"
                      type="number"
                      name="stockCount"
                      min="0"
                      step="1"
                      placeholder="25"
                      value={
                        form.stockCount
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

              </div>


              {/* FORM ACTIONS */}

              <div className="seller-product-form-actions">

                <button
                  type="button"
                  className="seller-form-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="seller-form-submit"
                >

                  {editingProductId !== null ? (

                    <>
                      <Pencil size={16} />
                      Update Product
                    </>

                  ) : (

                    <>
                      <Plus size={17} />
                      Add Product
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          DELETE CONFIRMATION
      ================================================== */}

      {deleteProductId !== null && (

        <div className="seller-delete-overlay">

          <div className="seller-delete-modal">

            <div className="seller-delete-icon">

              <Trash2 size={23} />

            </div>


            <h2>
              Delete Product?
            </h2>


            <p>
              This product will be removed from
              your seller product list. This action
              cannot be undone.
            </p>


            <div className="seller-delete-actions">

              <button
                type="button"
                className="seller-delete-cancel"
                onClick={() =>
                  setDeleteProductId(
                    null
                  )
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="seller-delete-confirm"
                onClick={
                  handleDelete
                }
              >
                Delete Product
              </button>

            </div>

          </div>

        </div>

      )}

    </main>

  );
}

export default SellerProducts;