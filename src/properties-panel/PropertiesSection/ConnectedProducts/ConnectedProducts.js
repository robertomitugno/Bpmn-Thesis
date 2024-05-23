import { is } from 'bpmn-js/lib/util/ModelUtil';
import '../ElementProperties.css';
import './ConnectedProducts.css';
import React, { useCallback, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons'

function ConnectedProducts({ element, modeler }) {

    const [selectedProducts, setSelectedProducts] = useState({});

    const [productExpanded, setProductExpanded] = useState({});



    const getConnectedExecutors = useCallback(() => {
        const connectedExecutors = [];
        const elementRegistry = modeler.get('elementRegistry');

        elementRegistry.filter(element => is(element, 'custom:Connection')).forEach(sequenceFlow => {
            if (sequenceFlow.source === element || sequenceFlow.target === element) {
                const connectedElement = sequenceFlow.source === element ? sequenceFlow.target : sequenceFlow.source;

                if (is(connectedElement, 'custom:Executor')) {
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
        if (element.type === 'custom:Executor') {
            const productElement = element.businessObject.get('custom:product');
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
        const newTime = e.target.value;
        const newProducts = { ...selectedProducts };
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

    return (
        <div className="element-properties" key={element ? element.id : ''}>
            {element && (
                <>
                    <div className="properties">
                        <div className="properties-title">
                            <label>Connected Products</label>
                        </div>
                        <div className="product-container">
                            {Object.values(selectedProducts).map((obj, index) => (
                                <React.Fragment key={index}>
                                    <div>
                                        <div className="selection" onClick={() => handleProductExpansion(selectedProducts[index]?.id, selectedProducts[index]?.idActivity)}>
                                            <FontAwesomeIcon
                                                icon={productExpanded[`${selectedProducts[index]?.id}-${selectedProducts[index]?.idActivity}`] ? faAngleDown : faAngleRight}
                                                className="expand-icon"
                                            />
                                            <span>{selectedProducts[index]?.name} - {getActivityName(selectedProducts[index]?.idActivity)}</span>
                                        </div>

                                        {productExpanded[`${selectedProducts[index]?.id}-${selectedProducts[index]?.idActivity}`] && (
                                            <div key={index} className="products">
                                                <div className="time-input">
                                                    <span>Time : </span>
                                                    <input type="number"
                                                        value={selectedProducts[index]?.time || 0}
                                                        onChange={(e) => handleTimeChange(e, index)} />

                                                    <select value={selectedProducts[index]?.timeUnit || 's'} onChange={(e) => handleTimeUnitChange(e, index)}>
                                                        <option value="s">s</option>
                                                        <option value="m">m</option>
                                                        <option value="h">h</option>
                                                        <option value="d">d</option>
                                                    </select>

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                </>
            )}
        </div>
    );
}

export default ConnectedProducts;