import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";

import "../styles/SellerCategories.css";

function SellerCategories() {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Honey",
      image: "/categories/honey.jpg",
      active: true,
      productCount: 3,
    },
    {
      id: 2,
      name: "Natural Sweeteners",
      image: "/categories/sweeteners.jpg",
      active: true,
      productCount: 1,
    },
    {
      id: 3,
      name: "Healthy Foods",
      image: "/categories/healthy-foods.jpg",
      active: true,
      productCount: 2,
    },
    {
      id: 4,
      name: "Farm Products",
      image: "/categories/farm-products.jpg",
      active: true,
      productCount: 0,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryName, setCategoryName] = useState("");

  const [categoryImage, setCategoryImage] = useState("");

  const [previewImage, setPreviewImage] = useState("");

  const [categoryActive, setCategoryActive] = useState(true);

  const [deleteCategory, setDeleteCategory] = useState(null);

  // =========================================
  // OPEN ADD MODAL
  // =========================================

  const handleAddCategory = () => {
    setEditingCategory(null);

    setCategoryName("");
    setCategoryImage("");
    setPreviewImage("");
    setCategoryActive(true);

    setIsModalOpen(true);
  };

  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const handleEditCategory = (category) => {
    setEditingCategory(category);

    setCategoryName(category.name);
    setCategoryImage(category.image);
    setPreviewImage(category.image);
    setCategoryActive(category.active);

    setIsModalOpen(true);
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setEditingCategory(null);

    setCategoryName("");
    setCategoryImage("");
    setPreviewImage("");
    setCategoryActive(true);
  };

  // =========================================
  // IMAGE UPLOAD
  // =========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setCategoryImage(imageUrl);
    setPreviewImage(imageUrl);
  };

  // =========================================
  // SAVE CATEGORY
  // =========================================

  const handleSaveCategory = (event) => {
    event.preventDefault();

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      alert("Please enter a category name.");
      return;
    }

    if (editingCategory) {
      setCategories((previousCategories) =>
        previousCategories.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name: trimmedName,
                image:
                  categoryImage ||
                  category.image,
                active: categoryActive,
              }
            : category
        )
      );
    } else {
      const newCategory = {
        id: Date.now(),
        name: trimmedName,
        image:
          categoryImage ||
          "/categories/default.jpg",
        active: categoryActive,
        productCount: 0,
      };

      setCategories((previousCategories) => [
        ...previousCategories,
        newCategory,
      ]);
    }

    handleCloseModal();
  };

  // =========================================
  // TOGGLE CATEGORY
  // =========================================

  const handleToggleCategory = (id) => {
    setCategories((previousCategories) =>
      previousCategories.map((category) =>
        category.id === id
          ? {
              ...category,
              active: !category.active,
            }
          : category
      )
    );
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDeleteRequest = (category) => {
    if (category.productCount > 0) {
      alert(
        "This category contains products. Move or remove those products before deleting the category."
      );

      return;
    }

    setDeleteCategory(category);
  };

  const handleConfirmDelete = () => {
    if (!deleteCategory) {
      return;
    }

    setCategories((previousCategories) =>
      previousCategories.filter(
        (category) =>
          category.id !== deleteCategory.id
      )
    );

    setDeleteCategory(null);
  };

  const handleCancelDelete = () => {
    setDeleteCategory(null);
  };

  // =========================================
  // SEARCH
  // =========================================

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // =========================================
  // UI
  // =========================================

  return (
    <main className="seller-categories-page">
      <div className="seller-categories-container">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="seller-categories-header">

          <div>
            <span className="seller-section-label">
              Seller Dashboard
            </span>

            <h1>Categories</h1>

            <p>
              Manage the categories available in
              your Bee Pure store.
            </p>
          </div>

          <button
            type="button"
            className="seller-add-category-btn"
            onClick={handleAddCategory}
          >
            <Plus size={18} />

            <span>
              Add Category
            </span>
          </button>

        </div>


        {/* =====================================
            TOOLBAR
        ===================================== */}

        <div className="seller-categories-toolbar">

          <div className="seller-category-search">

            <Search size={18} />

            <input
              type="search"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />

          </div>

          <div className="seller-category-count">
            {filteredCategories.length}{" "}
            {filteredCategories.length === 1
              ? "category"
              : "categories"}
          </div>

        </div>


        {/* =====================================
            CATEGORY GRID
        ===================================== */}

        {filteredCategories.length > 0 ? (
          <div className="seller-categories-grid">

            {filteredCategories.map(
              (category) => (
                <article
                  className={`seller-category-card ${
                    !category.active
                      ? "inactive"
                      : ""
                  }`}
                  key={category.id}
                >

                  {/* Image */}

                  <div className="seller-category-image">

                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                      />
                    ) : (
                      <div className="seller-category-image-placeholder">
                        <ImageIcon size={32} />
                      </div>
                    )}

                    <span
                      className={`seller-category-status ${
                        category.active
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {category.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>


                  {/* Content */}

                  <div className="seller-category-content">

                    <div>
                      <h2>
                        {category.name}
                      </h2>

                      <p>
                        {category.productCount}{" "}
                        {category.productCount === 1
                          ? "product"
                          : "products"}
                      </p>
                    </div>


                    {/* Actions */}

                    <div className="seller-category-actions">

                      <button
                        type="button"
                        className="seller-category-action toggle"
                        onClick={() =>
                          handleToggleCategory(
                            category.id
                          )
                        }
                        title={
                          category.active
                            ? "Disable category"
                            : "Enable category"
                        }
                      >
                        {category.active ? (
                          <ToggleRight
                            size={21}
                          />
                        ) : (
                          <ToggleLeft
                            size={21}
                          />
                        )}
                      </button>


                      <button
                        type="button"
                        className="seller-category-action edit"
                        onClick={() =>
                          handleEditCategory(
                            category
                          )
                        }
                        title="Edit category"
                      >
                        <Pencil size={17} />
                      </button>


                      <button
                        type="button"
                        className="seller-category-action delete"
                        onClick={() =>
                          handleDeleteRequest(
                            category
                          )
                        }
                        title="Delete category"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        ) : (
          <div className="seller-categories-empty">

            <div className="seller-empty-icon">
              <Search size={26} />
            </div>

            <h2>
              No categories found
            </h2>

            <p>
              Try another search term or add a
              new category.
            </p>

          </div>
        )}

      </div>


      {/* =======================================
          ADD / EDIT MODAL
      ======================================= */}

      {isModalOpen && (
        <div
          className="seller-category-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >

          <div className="seller-category-modal">

            {/* Modal Header */}

            <div className="seller-category-modal-header">

              <div>
                <span className="seller-section-label">
                  Category Management
                </span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <button
                type="button"
                className="seller-modal-close"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <X size={21} />
              </button>

            </div>


            {/* Form */}

            <form
              className="seller-category-form"
              onSubmit={handleSaveCategory}
            >

              {/* Name */}

              <div className="seller-form-group">

                <label htmlFor="category-name">
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(event) =>
                    setCategoryName(
                      event.target.value
                    )
                  }
                  required
                />

              </div>


              {/* Image */}

              <div className="seller-form-group">

                <label>
                  Category Image
                </label>

                <div className="seller-category-upload">

                  <label
                    htmlFor="category-image"
                    className="seller-upload-box"
                  >

                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Category preview"
                      />
                    ) : (
                      <>
                        <ImageIcon size={28} />

                        <span>
                          Choose image
                        </span>

                        <small>
                          JPG, PNG or WEBP
                        </small>
                      </>
                    )}

                  </label>

                  <input
                    id="category-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />

                </div>

              </div>


              {/* Status */}

              <div className="seller-form-group">

                <label>
                  Category Status
                </label>

                <button
                  type="button"
                  className={`seller-category-status-toggle ${
                    categoryActive
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCategoryActive(
                      (previous) =>
                        !previous
                    )
                  }
                >

                  {categoryActive ? (
                    <ToggleRight size={23} />
                  ) : (
                    <ToggleLeft size={23} />
                  )}

                  <span>
                    {categoryActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                </button>

              </div>


              {/* Form Actions */}

              <div className="seller-category-form-actions">

                <button
                  type="button"
                  className="seller-category-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="seller-category-save-btn"
                >
                  {editingCategory
                    ? "Update Category"
                    : "Add Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =======================================
          DELETE CONFIRMATION
      ======================================= */}

      {deleteCategory && (
        <div className="seller-delete-overlay">

          <div className="seller-delete-modal">

            <div className="seller-delete-icon">
              <Trash2 size={24} />
            </div>

            <h2>
              Delete Category?
            </h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deleteCategory.name}
              </strong>
              ?
            </p>

            <div className="seller-delete-actions">

              <button
                type="button"
                className="seller-delete-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                className="seller-delete-confirm"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default SellerCategories;