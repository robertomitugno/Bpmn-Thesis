import React, { useState, useEffect, useMemo } from 'react';
import './PropertiesMain.css';
import ExecutorsList from './ExecutorsList/ExecutorsList';
import ProductList from './ProductList/ProductList';
import ElementProperties from '../PropertiesSection/ElementProperties';

export default function PropertiesMain({ modeler }) {
  const [selectedElements, setSelectedElements] = useState([]);
  const [element, setElement] = useState(null);
  const [products, setProducts] = useState([]);
  const memoizedProducts = useMemo(() => products, [products]);

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

      const newP = moddle.create("factory:Product");
      newP.name = newProduct.name;
      newP.id = newProduct.id;
      extensionElements.get("values").push(newP);

      fetchProducts();
    }
  };


  const onDeleteProduct = (productId) => {
    const elementRegistry = modeler.get('elementRegistry');
    const processElement = elementRegistry.find(element => element.type === 'bpmn:Process');
    const modeling = modeler.get('modeling');

    if (processElement) {
      const extensionElements = processElement.businessObject.get('extensionElements');
      if (extensionElements) {
        // Remove product from extensionElements in Process
        const newValues = extensionElements.get("values").filter(product => product.id !== productId);
        extensionElements.values = newValues;
        modeling.updateProperties(processElement, { extensionElements });

        // Remove product from factory:Executor
        const executors = elementRegistry.filter(element => element.type === 'factory:Executor');
        executors.forEach(executor => {
          const productList = executor.businessObject.get('product');
          if (productList && Array.isArray(productList)) {
            const updatedProductList = productList.filter(product => product.id !== productId);
            executor.businessObject.product = updatedProductList;
            modeling.updateProperties(executor, { product: updatedProductList });
          }
        });

        fetchProducts();
        
        //Update batch elements to check gear icon
        const customRenderer = modeler.get('customRenderer');
        const batches = elementRegistry.filter(element => element.type === 'factory:Batch');
        batches.forEach(batch => {
          const parent = modeler.get('canvas').getGraphics(batch);
          customRenderer.drawShape(parent, batch);
        });
      }
    }
  };


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
            <ProductList products={memoizedProducts} onAddProduct={onAddProduct} onDeleteProduct={onDeleteProduct} />
          </div>
        </>
      )}
      {selectedElements.length > 1 && <span>Please select a single element.</span>}
    </div>
  );
}
