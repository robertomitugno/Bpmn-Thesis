import React, { useState, useEffect } from 'react';
import './PropertiesMain.css';
import ExecutorsList from './ExecutorsList/ExecutorsList';
import ProductList from './ProductList/ProductList';
import ElementProperties from '../PropertiesSection/ElementProperties';

export default function PropertiesMain({ modeler }) {
  const [selectedElements, setSelectedElements] = useState([]);
  const [element, setElement] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    modeler.on('selection.changed', handleSelectionChange);

    const elementRegistry = modeler.get('elementRegistry');
    const executorElement = elementRegistry.find(element => element.type === 'factory:Executor');
    if (executorElement) {
      const productElement = executorElement.businessObject.get('factory:product');

      // Remove duplicates products from the list
      if (productElement) {
        const uniqueProductsSet = new Set(productElement.map(product => product.id));

        const uniqueProducts = Array.from(uniqueProductsSet).map(id => {
          return productElement.find(product => product.id === id);
        });

        setProducts(uniqueProducts);
      }
    }
  }, []);


  const handleSelectionChange = e => {
    setSelectedElements(e.newSelection);
    setElement(e.newSelection[0]);
  };

  // Add a new product to the list
  const onAddProduct = (newProduct) => {
    if (newProduct) {
      setProducts(prevProducts => [...prevProducts, newProduct]);
    } else if (productName.trim() !== '') {
      const newProduct = { id: productId, name: productName };
      setProducts(prevProducts => [...prevProducts, newProduct]);
    }
  };

  return (
    <div className="PropertiesMain">
      {selectedElements.length === 1 && (
        <div>
          <ElementProperties modeler={modeler} element={element} products={products}/>
        </div>
      )}
      {selectedElements.length === 0 && (
        <>
          <div className="ExecutorsList">
            <ExecutorsList modeler={modeler} />
          </div>
          <div className="ProductList">
            <ProductList products={products} onAddProduct={onAddProduct} />
          </div>
        </>
      )}
      {selectedElements.length > 1 && <span>Please select a single element.</span>}
    </div>
  );

}
