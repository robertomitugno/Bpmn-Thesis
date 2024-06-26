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
    const process = elementRegistry.find(element => element.type === 'bpmn:Process');
    if (process) {
      const productElement = process.businessObject.get('extensionElements')?.values;
      if (productElement) {
        setProducts(productElement);
      }
    }
  }, []);


  const handleSelectionChange = e => {
    setSelectedElements(e.newSelection);
    setElement(e.newSelection[0]);
  };

  // Add a new product to the list
  const onAddProduct = (newProduct) => {
    const moddle = modeler.get('moddle');

    const elementRegistry = modeler.get('elementRegistry');
    const processElement = elementRegistry.find(element => element.type === 'bpmn:Process');

    if (processElement) {

      let extensionElements = processElement.businessObject.get('extensionElements');
      
      if (!extensionElements) {
        // If it doesn't exist, create a new ExtensionElements instance
        extensionElements = moddle.create("bpmn:ExtensionElements");
        processElement.businessObject.extensionElements = extensionElements;
      }

      // create the custom element (according to our json config)
      const newP = moddle.create("custom:Product");
      newP.name = newProduct.name;
      newP.id = newProduct.id;

      // put the custom element into the extensionElements
      extensionElements.get("values").push(newP);

    }
  };


  return (
    <div className="PropertiesMain">
      {selectedElements.length === 1 && (
        <div>
          <ElementProperties modeler={modeler} element={element} products={products} />
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
