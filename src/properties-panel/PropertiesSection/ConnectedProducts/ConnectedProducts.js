import { is } from 'bpmn-js/lib/util/ModelUtil';
import '../ElementProperties.css';
import './ConnectedProducts.css';
import React, { useCallback, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons'

function ConnectedProducts({ element, modeler, products }) {

    const [selectedProducts, setSelectedProducts] = useState({});

    const [productExpanded, setProductExpanded] = useState({});

    const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(false);


    const getConnectedExecutors = useCallback(() => {
        const connectedExecutors = [];
        const elementRegistry = modeler.get('elementRegistry');

        elementRegistry.filter(element => is(element, 'factory:Connection')).forEach(sequenceFlow => {
            if (sequenceFlow.source === element || sequenceFlow.target === element) {
                const connectedElement = sequenceFlow.source === element ? sequenceFlow.target : sequenceFlow.source;

                if (is(connectedElement, 'factory:Executor')) {
                    connectedExecutors.push(connectedElement);
                }
            }
        });

        return connectedExecutors;
    }, [element]);

    useEffect(() => {
        if (element) {
            setSelectedProducts({});
        }
        if (element.type === 'factory:Executor') {
            const productElement = element.businessObject.get('factory:product');
            setSelectedProducts(productElement);
        }
    }, [element, getConnectedExecutors]);


    const handleProductExpansion = useCallback((id, idActivity) => {
        setProductExpanded(prevState => ({
            ...prevState,
            [`${id}-${idActivity}`]: !prevState[`${id}-${idActivity}`]
        }));
    }, []);



    const getActivityName = useCallback((idActivity) => {
        const elementRegistry = modeler.get('elementRegistry');
        const activityElement = elementRegistry.get(idActivity);
        return activityElement?.businessObject.name || '';
    }, [modeler, modeler.get]);


    function handleTimeChange(e, index) {
        let newTime = e.target.value;

        let newProducts = { ...selectedProducts };
        if (newTime.startsWith('0')) {
            newTime = newTime.substring(1);
        }
        newProducts[index].time = newTime;

        const modeling = modeler.get('modeling');
        const executorElement = modeler.get('elementRegistry').get(element.id);

        const productArray = executorElement.businessObject.product;

        if (productArray) {
            modeling.updateProperties(executorElement, {
                product: productArray
            });
        }

        setSelectedProducts(newProducts);
    }



    function handleTimeUnitChange(e, index) {
        const newTimeUnit = e.target.value;
        const newProducts = { ...selectedProducts };
        newProducts[index].timeUnit = newTimeUnit;

        const modeling = modeler.get('modeling');
        const executorElement = modeler.get('elementRegistry').get(element.id);

        const productArray = executorElement.businessObject.product;

        if (productArray) {
            productArray[index].timeUnit = newTimeUnit;
            modeling.updateProperties(executorElement, {
                product: productArray
            });
        }

        setSelectedProducts(newProducts);
    }


    function handleBatchChange(e, index, oldBatch) {
        let newBatch = e.target.value;
        if (oldBatch === '1' && e.nativeEvent.data !== '1' && e.nativeEvent.data !== '0') {
            newBatch = newBatch.substring(1);
        }
        if (newBatch < 1) {
            newBatch = 1;
        }

        const newProducts = { ...selectedProducts };
        newProducts[index].batch = newBatch;

        const modeling = modeler.get('modeling');
        const elementRegistry = modeler.get('elementRegistry');

        const executorElement = elementRegistry.get(element.id);

        const productArray = executorElement.businessObject.product;

        if (productArray) {
            modeling.updateProperties(executorElement, {
                product: productArray
            });
        }

        setSelectedProducts(newProducts);

      //Update batch elements to check gear icon
        const batches = elementRegistry.filter(element => element.type === 'factory:Batch');
        batches.forEach(batch => {
            const customRenderer = modeler.get('customRenderer');
            const parent = modeler.get('canvas').getGraphics(batch);
            customRenderer.drawShape(parent, batch);
        });
    };


    return (
        <div className="element-properties" key={element ? element.id : ''}>
            {element && (
                <>
                    <div className="properties" onClick={() => setIsPropertiesExpanded(!isPropertiesExpanded)}>
                        <div className="properties-title">
                            <label>Connected Products</label>
                            <FontAwesomeIcon icon={isPropertiesExpanded ? faAngleDown : faAngleRight} />
                        </div>
                        {isPropertiesExpanded && (
                            <div className="product-container">
                                {Object.values(selectedProducts).map((obj, index) => (
                                    <React.Fragment key={index}>
                                        <div>
                                            <div className="selection" onClick={(event) => {
                                                handleProductExpansion(selectedProducts[index]?.id, selectedProducts[index]?.idActivity);
                                                event.stopPropagation();
                                            }}>

                                                <FontAwesomeIcon
                                                    icon={productExpanded[`${selectedProducts[index]?.id}-${selectedProducts[index]?.idActivity}`] ? faAngleDown : faAngleRight}
                                                    className="expand-icon"
                                                />
                                                <span>{products.find(p => p.id === selectedProducts[index]?.id)?.name || selectedProducts[index]?.name} - {getActivityName(selectedProducts[index]?.idActivity)}</span>                                            </div>

                                            {productExpanded[`${selectedProducts[index]?.id}-${selectedProducts[index]?.idActivity}`] && (
                                                <div key={index} className="products">
                                                    <div className="time-input">
                                                        <span>Time : </span>
                                                        <input type="number"
                                                            value={selectedProducts[index]?.time || 0}
                                                            onClick={(event) => event.stopPropagation()}
                                                            onChange={(e) => handleTimeChange(e, index)} />

                                                        <select value={selectedProducts[index]?.timeUnit || 's'} onChange={(e) => handleTimeUnitChange(e, index)}>
                                                            <option value="s">s</option>
                                                            <option value="m">m</option>
                                                            <option value="h">h</option>
                                                            <option value="d">d</option>
                                                        </select>

                                                    </div>
                                                    {is(modeler.get('elementRegistry').get(selectedProducts[index]?.idActivity), 'factory:Batch') && (
                                                        <div className="time-input">
                                                            <span>Number of element for batch: </span>
                                                            <input type="number"
                                                                value={selectedProducts[index]?.batch}
                                                                onClick={(event) => event.stopPropagation()}
                                                                onChange={(e) => handleBatchChange(e, index, selectedProducts[index]?.batch)} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>

                </>
            )}
        </div>
    );
}

export default ConnectedProducts;
