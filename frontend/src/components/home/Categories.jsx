import { Link } from "react-router-dom";
import "./Categories.css";

/*
  Temporary category data.

  Later:
  These categories will come from Supabase.

  Seller/Admin will be able to:
  - Add category
  - Upload category image
  - Edit category
  - Delete category
  - Change category order
*/

const categories = [
  {
    id: 1,
    name: "Honey",
    description: "Pure & natural honey",
    image: "/categories/honey.png",
    slug: "honey",
  },
  {
    id: 2,
    name: "Natural Sweeteners",
    description: "Healthy alternatives",
    image: "/categories/organic foods.png",
    slug: "natural-sweeteners",
  },
  {
    id: 3,
    name: "Healthy Foods",
    description: "Wholesome & nutritious",
    image: "/categories/farm products.png",
    slug: "healthy-foods",
  },
  {
    id: 4,
    name: "Wellness",
    description: "For everyday wellbeing",
    image: "/categories/gift boxs.png",
    slug: "wellness",
  },
];

function Categories() {
  return (
    <section className="categories-section">

      <div className="container categories-container">

        {/* =========================================
            SECTION HEADER
        ========================================= */}

        <div className="categories-header">

          <div className="categories-heading">

            <h2>
              Shop By Categories
            </h2>

            <p className="categories-subtitle">
              Discover naturally good products, sourced
              directly from trusted farmers.
            </p>

          </div>


          <Link
            to="/shop"
            className="categories-view-all"
          >
            <span>View All</span>

            <span className="categories-view-arrow">
              →
            </span>
          </Link>

        </div>


        {/* =========================================
            CATEGORY GRID
        ========================================= */}

        <div className="categories-grid">

          {categories.map((category) => (

            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="category-card"
            >

              {/* Image */}

              <div className="category-image-wrapper">

                <img
                  src={category.image}
                  alt={category.name}
                  className="category-image"
                  loading="lazy"
                />

                <div className="category-image-overlay"></div>

              </div>


              {/* Content */}

              <div className="category-content">

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description}
                </p>

                <span className="category-explore">

                  Explore

                  <span className="category-explore-arrow">
                    →
                  </span>

                </span>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Categories;