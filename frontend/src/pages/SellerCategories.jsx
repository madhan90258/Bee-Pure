import {
  FolderTree,
  Plus,
  Search,
  Edit3,
  Trash2,
  Power,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import "../styles/SellerCategories.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const CATEGORY_BUCKET =
  "category-images";

// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
  name: "",
  description: "",
  image_path: "",
  is_active: true,
};

// =====================================================
// COMPONENT
// =====================================================

function SellerCategories() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [categoryToDelete, setCategoryToDelete] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [imagePreview, setImagePreview] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const fileInputRef =
    useRef(null);

  // ===================================================
  // GET ACCESS TOKEN
  // ===================================================

  const getAccessToken = async () => {
    const {
      data,
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const token =
      data?.session?.access_token;

    if (!token) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    return token;
  };

  // ===================================================
  // CLEAR MESSAGES
  // ===================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/categories/seller/all`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load categories."
        );
      }

      setCategories(
        result?.categories || []
      );

    } catch (error) {
      console.error(
        "Load categories error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load categories."
      );

    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadCategories();
  }, []);

  // ===================================================
  // FILTER
  // ===================================================

  const filteredCategories =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category?.name
            ?.toLowerCase()
            .includes(search) ||

          category?.description
            ?.toLowerCase()
            .includes(search) ||

          category?.slug
            ?.toLowerCase()
            .includes(search)
      );

    }, [
      categories,
      searchTerm,
    ]);

  // ===================================================
  // OPEN ADD
  // ===================================================

  const handleAddCategory = () => {
    clearMessages();

    setEditingCategory(null);

    setFormData({
      ...emptyForm,
    });

    setImagePreview("");

    setSelectedImage(null);

    setShowModal(true);
  };

  // ===================================================
  // OPEN EDIT
  // ===================================================

  const handleEditCategory = (
    category
  ) => {
    clearMessages();

    setEditingCategory(category);

    setFormData({
      name:
        category?.name || "",

      description:
        category?.description || "",

      image_path:
        category?.image_path || "",

      is_active:
        category?.is_active ??
        true,
    });

    setSelectedImage(null);

    if (
      category?.image_path &&
      (
        category.image_path.startsWith(
          "http://"
        ) ||
        category.image_path.startsWith(
          "https://"
        )
      )
    ) {
      setImagePreview(
        category.image_path
      );
    } else {
      setImagePreview("");
    }

    setShowModal(true);
  };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    if (
      saving ||
      uploadingImage
    ) {
      return;
    }

    setShowModal(false);

    setEditingCategory(null);

    setFormData({
      ...emptyForm,
    });

    setImagePreview("");

    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ===================================================
  // FORM INPUT
  // ===================================================

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ===================================================
  // IMAGE SELECT
  // ===================================================

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    clearMessages();

    // -----------------------------------------------
    // TYPE CHECK
    // -----------------------------------------------

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";

      return;
    }

    // -----------------------------------------------
    // SIZE CHECK
    // -----------------------------------------------

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image must be smaller than 5 MB."
      );

      event.target.value = "";

      return;
    }

    // -----------------------------------------------
    // STORE FILE
    // -----------------------------------------------

    setSelectedImage(file);

    // -----------------------------------------------
    // LOCAL PREVIEW
    // -----------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl
    );
  };

  // ===================================================
  // UPLOAD IMAGE
  // ===================================================

  const uploadCategoryImage =
    async (file) => {

      if (!file) {
        return null;
      }

      setUploadingImage(true);

      try {
        // -------------------------------------------
        // GET CURRENT USER
        // -------------------------------------------

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user?.id) {
          throw new Error(
            "Unable to identify your account."
          );
        }

        // -------------------------------------------
        // SAFE FILE EXTENSION
        // -------------------------------------------

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        // -------------------------------------------
        // UNIQUE FILE NAME
        // -------------------------------------------

        const fileName =
          `${crypto.randomUUID()}.${extension}`;

        // -------------------------------------------
        // STORAGE PATH
        // -------------------------------------------

        const filePath =
          `categories/${user.id}/${fileName}`;

        // -------------------------------------------
        // UPLOAD
        // -------------------------------------------

        const {
          data,
          error: uploadError,
        } =
          await supabase.storage
            .from(
              CATEGORY_BUCKET
            )
            .upload(
              filePath,
              file,
              {
                cacheControl:
                  "3600",

                contentType:
                  file.type,

                upsert: false,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        if (!data?.path) {
          throw new Error(
            "Image upload completed but no storage path was returned."
          );
        }

        // -------------------------------------------
        // PUBLIC URL
        // -------------------------------------------

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              CATEGORY_BUCKET
            )
            .getPublicUrl(
              data.path
            );

        const publicUrl =
          publicUrlData?.publicUrl;

        if (!publicUrl) {
          throw new Error(
            "Unable to generate the category image URL."
          );
        }

        return publicUrl;

      } catch (error) {
        console.error(
          "Category image upload error:",
          error
        );

        throw new Error(
          error?.message ||
            "Unable to upload category image."
        );

      } finally {
        setUploadingImage(false);
      }
    };

  // ===================================================
  // STATUS
  // ===================================================

  const handleFormStatusToggle =
    () => {
      setFormData(
        (previous) => ({
          ...previous,

          is_active:
            !previous.is_active,
        })
      );
    };

  // ===================================================
  // CREATE / UPDATE
  // ===================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    clearMessages();

    const name =
      formData.name.trim();

    const description =
      formData.description.trim();

    if (!name) {
      setError(
        "Please enter a category name."
      );

      return;
    }

    try {
      setSaving(true);

      const token =
        await getAccessToken();

      // ---------------------------------------------
      // UPLOAD NEW IMAGE
      // ---------------------------------------------

      let imagePath =
        formData.image_path
          .trim() || null;

      if (selectedImage) {
        imagePath =
          await uploadCategoryImage(
            selectedImage
          );
      }

      // ---------------------------------------------
      // PAYLOAD
      // ---------------------------------------------

      const payload = {
        name,

        description:
          description || null,

        image_path:
          imagePath,

        is_active:
          formData.is_active,
      };

      // ---------------------------------------------
      // URL
      // ---------------------------------------------

      const url =
        editingCategory
          ? `${API_URL}/api/categories/${editingCategory.id}`
          : `${API_URL}/api/categories`;

      // ---------------------------------------------
      // METHOD
      // ---------------------------------------------

      const method =
        editingCategory
          ? "PATCH"
          : "POST";

      // ---------------------------------------------
      // API
      // ---------------------------------------------

      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            (
              editingCategory
                ? "Unable to update category."
                : "Unable to create category."
            )
        );
      }

      setSuccess(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully."
      );

      closeModal();

      await loadCategories();

    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      setError(
        error?.message ||
          "Unable to save category."
      );

    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // TOGGLE STATUS
  // ===================================================

  const handleToggleStatus =
    async (category) => {

      clearMessages();

      try {
        const token =
          await getAccessToken();

        const response =
          await fetch(
            `${API_URL}/api/categories/${category.id}`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  is_active:
                    !category.is_active,
                }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to update category status."
          );
        }

        setSuccess(
          category.is_active
            ? "Category deactivated successfully."
            : "Category activated successfully."
        );

        await loadCategories();

      } catch (error) {
        console.error(
          "Toggle category error:",
          error
        );

        setError(
          error?.message ||
            "Unable to update category status."
        );
      }
    };

  // ===================================================
  // DELETE CLICK
  // ===================================================

  const handleDeleteClick =
    (category) => {

      clearMessages();

      setCategoryToDelete(
        category
      );

      setShowDeleteModal(
        true
      );
    };

  // ===================================================
  // CLOSE DELETE
  // ===================================================

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(
      false
    );

    setCategoryToDelete(
      null
    );
  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDeleteConfirm =
    async () => {

      if (!categoryToDelete) {
        return;
      }

      clearMessages();

      try {
        setDeleting(true);

        const token =
          await getAccessToken();

        const response =
          await fetch(
            `${API_URL}/api/categories/${categoryToDelete.id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to delete category."
          );
        }

        setSuccess(
          "Category deleted successfully."
        );

        closeDeleteModal();

        await loadCategories();

      } catch (error) {
        console.error(
          "Delete category error:",
          error
        );

        setError(
          error?.message ||
            "Unable to delete category."
        );

      } finally {
        setDeleting(false);
      }
    };

  // ===================================================
  // GET IMAGE URL
  // ===================================================

  const getImageUrl =
    (imagePath) => {

      if (!imagePath) {
        return "";
      }

      if (
        imagePath.startsWith(
          "http://"
        ) ||
        imagePath.startsWith(
          "https://"
        )
      ) {
        return imagePath;
      }

      return "";
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <main className="seller-categories-page">

        <div className="seller-categories-container">

          <div className="seller-categories-empty">

            <Loader2
              size={32}
              className="seller-account-spinner"
            />

            <h2>
              Loading Categories
            </h2>

            <p>
              Please wait while we load your categories.
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <main className="seller-categories-page">

      <div className="seller-categories-container">

        {/* HEADER */}

        <header className="seller-categories-header">

          <div>

            <span className="seller-section-label">
              SELLER PANEL
            </span>

            <h1>
              Categories
            </h1>

            <p>
              Manage the product categories available
              in your store.
            </p>

          </div>

          <button
            type="button"
            className="seller-add-category-btn"
            onClick={
              handleAddCategory
            }
          >

            <Plus size={17} />

            <span>
              Add Category
            </span>

          </button>

        </header>


        {/* SUCCESS */}

        {success && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#eaf6ed",
              color: "#176437",
              fontSize: "0.82rem",
              fontWeight: "600",
            }}
          >

            <CheckCircle size={17} />

            <span>
              {success}
            </span>

          </div>
        )}


        {/* ERROR */}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#fff0ee",
              color: "#a33d35",
              fontSize: "0.82rem",
              fontWeight: "600",
            }}
          >

            <AlertCircle size={17} />

            <span>
              {error}
            </span>

          </div>
        )}


        {/* TOOLBAR */}

        <div className="seller-categories-toolbar">

          <div className="seller-category-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

          <span className="seller-category-count">

            {filteredCategories.length}{" "}

            {filteredCategories.length === 1
              ? "category"
              : "categories"}

          </span>

        </div>


        {/* GRID */}

        {filteredCategories.length === 0 ? (

          <div className="seller-categories-empty">

            <div className="seller-empty-icon">
              <FolderTree size={25} />
            </div>

            <h2>
              No categories found
            </h2>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "Create your first category to get started."}
            </p>

          </div>

        ) : (

          <div className="seller-categories-grid">

            {filteredCategories.map(
              (category) => {

                const imageUrl =
                  getImageUrl(
                    category.image_path
                  );

                return (
                  <article
                    key={category.id}
                    className={`seller-category-card ${
                      category.is_active
                        ? ""
                        : "inactive"
                    }`}
                  >

                    {/* IMAGE */}

                    <div className="seller-category-image">

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={
                            category.name
                          }
                        />

                      ) : (

                        <div className="seller-category-image-placeholder">

                          <ImageIcon
                            size={38}
                          />

                        </div>

                      )}

                      <span
                        className={`seller-category-status ${
                          category.is_active
                            ? "active"
                            : "inactive"
                        }`}
                      >

                        {category.is_active
                          ? "Active"
                          : "Inactive"}

                      </span>

                    </div>


                    {/* CONTENT */}

                    <div className="seller-category-content">

                      <div>

                        <h2>
                          {category.name}
                        </h2>

                        <p>
                          {category.description ||
                            "No description added"}
                        </p>

                      </div>


                      <div className="seller-category-actions">

                        <button
                          type="button"
                          className="seller-category-action toggle"
                          onClick={() =>
                            handleToggleStatus(
                              category
                            )
                          }
                          title={
                            category.is_active
                              ? "Deactivate"
                              : "Activate"
                          }
                        >

                          <Power
                            size={16}
                          />

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

                          <Edit3
                            size={16}
                          />

                        </button>


                        <button
                          type="button"
                          className="seller-category-action delete"
                          onClick={() =>
                            handleDeleteClick(
                              category
                            )
                          }
                          title="Delete category"
                        >

                          <Trash2
                            size={16}
                          />

                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>


      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="seller-category-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="seller-category-modal">

            <div className="seller-category-modal-header">

              <h2>
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <button
                type="button"
                className="seller-modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  saving ||
                  uploadingImage
                }
              >

                <X size={18} />

              </button>

            </div>


            <form
              className="seller-category-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* NAME */}

              <div className="seller-form-group">

                <label>
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter category name"
                  maxLength={100}
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="seller-form-group">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter category description"
                  maxLength={500}
                  disabled={
                    saving ||
                    uploadingImage
                  }

                />

              </div>


              {/* IMAGE */}

              <div className="seller-form-group">

                <label>
                  Category Image
                </label>

                <div className="seller-category-upload">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    disabled={
                      saving ||
                      uploadingImage
                    }
                    style={{
                      display: "none",
                    }}
                  />

                  <button
                    type="button"
                    className="seller-upload-box"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      saving ||
                      uploadingImage
                    }
                  >

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Category preview"
                      />

                    ) : (

                      <>

                        <Upload
                          size={25}
                        />

                        <span>
                          Upload category image
                        </span>

                        <small>
                          JPG, PNG, WEBP · Max 5 MB
                        </small>

                      </>

                    )}

                  </button>

                </div>

              </div>


              {/* STATUS */}

              <div className="seller-form-group">

                <label>
                  Status
                </label>

                <button
                  type="button"
                  className={`seller-category-status-toggle ${
                    formData.is_active
                      ? "active"
                      : ""
                  }`}
                  onClick={
                    handleFormStatusToggle
                  }
                  disabled={
                    saving ||
                    uploadingImage
                  }
                >

                  <Power size={16} />

                  <span>
                    {formData.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </button>

              </div>


              {/* ACTIONS */}

              <div className="seller-category-form-actions">

                <button
                  type="button"
                  className="seller-category-cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving ||
                    uploadingImage
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="seller-category-save-btn"
                  disabled={
                    saving ||
                    uploadingImage
                  }
                >

                  {uploadingImage ? (

                    <>
                      <Loader2
                        size={16}
                        className="seller-account-spinner"
                      />

                      Uploading image...

                    </>

                  ) : saving ? (

                    <>
                      <Loader2
                        size={16}
                        className="seller-account-spinner"
                      />

                      Saving...

                    </>

                  ) : (

                    editingCategory
                      ? "Save Changes"
                      : "Create Category"

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {showDeleteModal &&
        categoryToDelete && (

          <div
            className="seller-delete-overlay"
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeDeleteModal();
              }

            }}
          >

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
                  {categoryToDelete.name}
                </strong>

                ?

                <br />

                This action cannot be undone.

              </p>

              <div className="seller-delete-actions">

                <button
                  type="button"
                  className="seller-delete-cancel"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    deleting
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="seller-delete-confirm"
                  onClick={
                    handleDeleteConfirm
                  }
                  disabled={
                    deleting
                  }
                >

                  {deleting ? (

                    <>
                      <Loader2
                        size={15}
                        className="seller-account-spinner"
                      />

                      Deleting...

                    </>

                  ) : (

                    "Delete"

                  )}

                </button>

              </div>

            </div>

          </div>
        )}

    </main>
  );
}

export default SellerCategories;