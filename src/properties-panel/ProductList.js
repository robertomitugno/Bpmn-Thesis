import React from 'react';

const ProductList = ({ products, productName, onProductNameChange, onAddProduct }) => {
  return (
    <div>
      <h3>Products</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <input type="text" value={productName} onChange={onProductNameChange} />
        <button onClick={onAddProduct}>Add Product</button>
      </div>
    </div>
  );
};

export default ProductList;
