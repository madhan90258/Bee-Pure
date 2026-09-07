import { useParams } from "react-router-dom";

function ProductDetails() {
  const { id } = useParams();

  return (
    <main className="section">
      <div className="container">
        <h1>Product Details</h1>
        <p>Product ID: {id}</p>
      </div>
    </main>
  );
}

export default ProductDetails;