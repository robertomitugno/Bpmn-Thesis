import React, { useState } from 'react';

const ProductSearchBar = ({ products, onProductSelect }) => {
  const [searchInput, setSearchInput] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search products"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
      />
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id} onClick={() => onProductSelect(product)}>
            {product.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductSearchBar;
