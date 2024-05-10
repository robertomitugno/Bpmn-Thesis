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

    const elementRegistry = modeler.get('elementRegistry');
    const executorElement = elementRegistry.find(element => element.type === 'custom:Executor');
    if (executorElement) {
      const productElement = executorElement.businessObject.get('custom:product');
      if (productElement) {
        const uniqueProductsSet = new Set(productElement.map(product => product.id));

        const uniqueProducts = Array.from(uniqueProductsSet).map(id => {
          return productElement.find(product => product.id === id);
        });

        setProducts(uniqueProducts);
      }
    }

    return () => {
      modeler.off('selection.changed', handleSelectionChange);
    };
  }, []);

  const handleSelectionChange = e => {
    setSelectedElements(e.newSelection);
    setElement(e.newSelection[0]);
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
    <div className="PropertiesView">
      {selectedElements.length === 1 && (
        <div>
          <ElementProperties modeler={modeler} element={element} products={products} onAddProduct={handleAddProduct} />
        </div>
      )}
      {selectedElements.length === 0 && (
        <>
          <div className="ExecutorsList">
            <ExecutorsList modeler={modeler} />
          </div>
          <div className="ProductList">
            <ProductList products={products} onAddProduct={handleAddProduct} />
          </div>
        </>
      )}
      {selectedElements.length > 1 && <span>Please select a single element.</span>}
    </div>
  );

}
