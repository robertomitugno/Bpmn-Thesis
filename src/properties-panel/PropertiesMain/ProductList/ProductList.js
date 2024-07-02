import React, { useState } from 'react';
import './ProductList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'


const ProductList = ({ products, onAddProduct, onDeleteProduct }) => {
  const [productName, setProductName] = useState('');

  const handleProductNameChange = (event) => {
    setProductName(event.target.value);
  };

  const handleAddProduct = () => {
    if (productName.trim() !== '') {
      const newProduct = { id: generateUniqueId(), name: productName };
      onAddProduct(newProduct);
      setProductName('');
    }
  };

  const handleDeleteProduct = (productId) => {
    onDeleteProduct(productId);
  };

  const generateUniqueId = () => {
    const randomString = Math.random().toString(36).substring(2, 9);
    return `Product_${randomString}`;
  };

  return (
    <div className="product-list">
      <h3 className="title">Products</h3>
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
              <td>
                <div className="product-id">{product.id}</div>
                <div className="delete">
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="delete-icon"
                    onClick={() => handleDeleteProduct(product.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="add-product-container">
        <input
          type="text"
          value={productName}
          onChange={handleProductNameChange}
          className="product-input"
        />
        <button onClick={handleAddProduct} className="add-button">
          Add Product
        </button>
      </div>
    </div>
  );
};

export default ProductList;
