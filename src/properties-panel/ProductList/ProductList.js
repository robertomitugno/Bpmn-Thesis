import React, { useState } from 'react';

const ProductList = ({ products, onAddProduct }) => {
  const [productName, setProductName] = useState('');

  const handleProductNameChange = (event) => {
    setProductName(event.target.value);
  };

  const handleAddProduct = () => {
    if (productName.trim() !== '') {
      const newProduct = { id: Date.now(), name: productName };
      onAddProduct(newProduct);
      setProductName('');
    }
  };

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
          {products.map((product) => ( 
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <input type="text" value={productName} onChange={handleProductNameChange} />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>
    </div>
  );
};

export default ProductList;
