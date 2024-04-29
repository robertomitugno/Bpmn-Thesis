import React, { useState, useEffect } from 'react';
import './PropertiesView.css';
import ExecutorsList from '../ExecutorsList/ExecutorsList';
import ProductList from '../ProductList/ProductList';
import ElementProperties from '../ElementProperties/ElementProperties';

export default function PropertiesView({ modeler }) {
  const [selectedElements, setSelectedElements] = useState([]);
  const [element, setElement] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    modeler.on('selection.changed', handleSelectionChange);

    return () => {
      modeler.off('selection.changed', handleSelectionChange);
    };
  }, []);

  const handleSelectionChange = e => {
    setSelectedElements(e.newSelection);
    setElement(e.newSelection[0]);
  };

  const handleProductNameChange = event => {
    setProductName(event.target.value);
  };

  const handleAddProduct = (newProduct) => {
    if (newProduct) {
      setProducts(prevProducts => [...prevProducts, newProduct]);
    } else if (productName.trim() !== '') {
      const newProduct = { id: productId, name: productName };
      setProducts(prevProducts => [...prevProducts, newProduct]);
      setProductName('');
      setProductId(prevId => prevId + 1);
    }
  };

  return (
    <div>
      {selectedElements.length === 1 && (
        <div>
          <ElementProperties modeler={modeler} element={element} products={products} onAddProduct={handleAddProduct} />
        </div>
      )}
      {selectedElements.length === 0 && (
        <div>
          <ExecutorsList modeler={modeler} />
          <ProductList products={products} onAddProduct={handleAddProduct} /> {/* Pass products as a prop */}
        </div>
      )}
      {selectedElements.length > 1 && <span>Please select a single element.</span>}
    </div>
  );
}
