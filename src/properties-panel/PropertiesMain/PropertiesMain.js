import React, { useState, useEffect, useMemo } from 'react';
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
    fetchProducts();
  }, []);

  const handleSelectionChange = e => {
    setSelectedElements(e.newSelection);
    setElement(e.newSelection[0]);
  };

  const fetchProducts = () => {
    const elementRegistry = modeler.get('elementRegistry');
    const process = elementRegistry.find(element => element.type === 'bpmn:Process');
    const productElement = process?.businessObject.get('extensionElements')?.values;
    if (productElement) {
      setProducts(productElement);
    }
  };

  const onAddProduct = (newProduct) => {
    const moddle = modeler.get('moddle');
    const elementRegistry = modeler.get('elementRegistry');
    const processElement = elementRegistry.find(element => element.type === 'bpmn:Process');

    if (processElement) {
      let extensionElements = processElement.businessObject.get('extensionElements');
      if (!extensionElements) {
        extensionElements = moddle.create("bpmn:ExtensionElements");
        processElement.businessObject.extensionElements = extensionElements;
      }

      const newP = moddle.create("custom:Product");
      newP.name = newProduct.name;
      newP.id = newProduct.id;
      extensionElements.get("values").push(newP);

      fetchProducts();
    }
  };

  const memoizedProducts = useMemo(() => products, [products]);

  return (
    <div className="PropertiesMain">
      {selectedElements.length === 1 && (
        <div>
          <ElementProperties modeler={modeler} element={element} products={memoizedProducts} />
        </div>
      )}
      {selectedElements.length === 0 && (
        <>
          <div className="ExecutorsList">
            <ExecutorsList modeler={modeler} />
          </div>
          <div className="ProductList">
            <ProductList products={memoizedProducts} onAddProduct={onAddProduct} />
          </div>
        </>
      )}
      {selectedElements.length > 1 && <span>Please select a single element.</span>}
    </div>
  );
}
