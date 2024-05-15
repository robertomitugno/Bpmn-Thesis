import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GrSearchAdvanced } from "react-icons/gr";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleRight, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import { getMid } from 'diagram-js/lib/layout/LayoutUtil.js';

function ElementProperties({ element, modeler, products }) {

    const searchBarRef = useRef(null);

    const [executorSearchResults, setExecutorSearchResults] = useState([]);
    const [executorSearchInput, setExecutorSearchInput] = useState('');
    const [selectedExecutors, setSelectedExecutors] = useState([]);
    const [executors, setExecutors] = useState([]);
    const [showInputExecutor, setshowInputExecutor] = useState(false);
    const [showInputProduct, setshowInputProduct] = useState(false);


    const [productSearchInput, setProductSearchInput] = useState({});
    const [selectedProducts, setSelectedProducts] = useState({});
    const [productSearchResults, setProductSearchResults] = useState([]);

    const [executorDropdownOpen, setExecutorDropdownOpen] = useState(false);
    const [productDropdownOpen, setProductDropdownOpen] = useState({});

    const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(false);
    const [executorExpanded, setExecutorExpanded] = useState({});
    const [productExpanded, setProductExpanded] = useState({});
    const [productExpandedExec, setProductExpandedExec] = useState({});



    const [name, setName] = useState(() => {
        if (element) {
            return element.businessObject.name || '';
        }
        return '';
    });

    if (element && element.labelTarget) {
        element = element.labelTarget;
    }


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
            setName(element.businessObject.name || '');
            setSelectedExecutors(getConnectedExecutors());
            setSelectedProducts({});
            setshowInputExecutor(false);
            setProductDropdownOpen(false);
            setExecutorDropdownOpen(false);
        }
        if (element.type === 'custom:Executor') {
            const productElement = element.businessObject.get('custom:product');
            setSelectedProducts(productElement);
        }
    }, [element, getConnectedExecutors]);


    const handleOutsideClick = useCallback((event) => {
        if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
            setProductDropdownOpen(false);
            setExecutorDropdownOpen(false);
        }
    }, []);


    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [handleOutsideClick]);

    useEffect(() => {
        const allExecutors = modeler.get('elementRegistry').filter(element => is(element, 'custom:Executor'));
        setExecutors(allExecutors);
    }, []);

    const getElementType = useCallback(() => {
        if (element && element.type) {
            return element.type.replace('bpmn:', '').replace('custom:', '');
        }
        return 'Process';
    }, [element]);


    const handleSearchExecutor = useCallback((event) => {
        const input = event.target.value;
        setExecutorSearchInput(input);
        if (!input) {
            setExecutorSearchResults([]);
        } else {
            const filteredExecutors = executors.filter(executor =>
                (executor.businessObject && executor.businessObject.name)
                    ? executor.businessObject.name.toLowerCase().includes(input.toLowerCase())
                    : false
            );
            setExecutorSearchResults(filteredExecutors.filter(executor => !selectedExecutors.includes(executor)));
        }
        setExecutorDropdownOpen(true);
    }, [executors, selectedExecutors]);


    const handleSelectExecutor = useCallback((event, executor) => {
        event.stopPropagation();
        setSelectedExecutors(prevSelectedExecutors => [...prevSelectedExecutors, executor]);
        setExecutorSearchInput('');
        setshowInputExecutor(false);
        setExecutors(prevExecutors => prevExecutors.filter(t => t !== executor));
        setExecutorSearchResults([]);
        setExecutorDropdownOpen(false);
        setProductDropdownOpen(false);
    }, [modeler]);


    const handleSearchProducts = useCallback((event, executorId) => {
        const input = event.target.value;
        setProductSearchInput(prevState => ({
            ...prevState,
            [executorId]: input
        }));
        if (!input) {
            setProductSearchResults([]);
        } else {
            const filteredProducts = products.filter(product => product.name.toLowerCase().includes(input.toLowerCase()));
            const selectedProductIds = selectedProducts[executorId]?.map(p => p.id) || [];
            setProductSearchResults(prevState => ({
                ...prevState,
                [executorId]: filteredProducts.filter(product => !selectedProductIds.includes(product.id))
            }));
        }
        setProductDropdownOpen(prevState => ({
            ...prevState,
            [executorId]: true
        }));
    }, [products, selectedProducts]);


    const handleSelectProduct = useCallback((event, product, executorId) => {
        event.stopPropagation();
        setSelectedProducts(prevSelectedProducts => ({
            ...prevSelectedProducts,
            [executorId]: [...(prevSelectedProducts[executorId] || []), product]
        }));
        setProductSearchInput('');

        setProductSearchResults(prevResults => ({
            ...prevResults,
            [executorId]: prevResults[executorId].filter(p => p !== product)
        }));

        if (productSearchInput) {
            setProductDropdownOpen(prevState => ({
                ...prevState,
                [executorId]: true
            }));
        } else {
            setProductDropdownOpen(prevState => ({
                ...prevState,
                [executorId]: false
            }));
        }

        setshowInputExecutor(false);

        const modeling = modeler.get('modeling');
        const moddle = modeler.get('moddle');
        const executor = modeler.get('elementRegistry').filter(element => is(element, 'custom:Executor')).find(executor => executor.id === executorId);

        if (executor) {
            let extensionElements = executor.businessObject.product;
            if (!extensionElements) {
                extensionElements = moddle.create("custom:Products", { values: [] });
                modeling.updateProperties(executor, { extensionElements });
            }

            const newProduct = moddle.create("custom:Product");
            newProduct.id = product.id;
            newProduct.name = product.name;
            newProduct.time = 0;
            newProduct.idActivity = element.id;

            extensionElements.push(newProduct);

        }
    }, []);



    const handleDeleteProduct = useCallback((product, executorId, idActivity) => {

        setSelectedProducts(prevSelectedProducts => ({
            ...prevSelectedProducts,
            [executorId]: prevSelectedProducts[executorId].filter(p => p !== product)
        }));

        const elementRegistry = modeler.get('elementRegistry');
        const executorElement = elementRegistry.get(executorId);

        if (executorElement) {
            const modeling = modeler.get('modeling');
            const moddle = modeler.get('moddle');
            const currentProducts = executorElement.businessObject.product || [];
            const updatedProducts = currentProducts.filter(p => p.id !== product.id || p.idActivity !== idActivity);
            modeling.updateProperties(executorElement, {
                product: updatedProducts.length > 0 ? updatedProducts : moddle.create('custom:Products', { values: [] })
            });
        }
    }, [modeler, setSelectedProducts]);



    const handleDeleteExecutor = useCallback((executor) => {
        setSelectedExecutors(prevSelectedExecutors => prevSelectedExecutors.filter(t => t !== executor));
        setSelectedProducts(prevSelectedProducts => {
            const newSelectedProducts = { ...prevSelectedProducts };
            delete newSelectedProducts[executor.id];
            return newSelectedProducts;
        });
        setExecutors(prevExecutors => [...prevExecutors, executor]);
    }, []);

    const handleNameChange = useCallback((event) => {
        const newName = event.target.value;
        setName(newName);
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            name: newName
        });
    }, [element, modeler]);


    const handleExecutorClick = useCallback((event, executor) => {
        event.stopPropagation();
        setExecutorExpanded(prevState => {
            // Close all other executors
            const newState = {};
            for (let key in prevState) {
                if (key !== executor.id) {
                    newState[key] = false;
                }
            }
            // Toggle the current executor
            newState[executor.id] = !prevState[executor.id];
            return newState;
        });

        const productElement = executor.businessObject.get('custom:product');
        let selectedProductsUpdate = {};

        if (productElement && productElement.length > 0) {
            const filteredProducts = productElement.filter(product => element.id === product.idActivity);
            selectedProductsUpdate = {
                ...selectedProductsUpdate,
                [executor.id]: [
                    ...(selectedProductsUpdate[executor.id] || []),
                    ...filteredProducts.map(product => ({
                        id: product.id,
                        name: product.name,
                        time: product.time,
                        idActivity: product.idActivity
                    }))
                ]
            };
        }

        setSelectedProducts(prevSelectedProducts => ({
            ...prevSelectedProducts,
            ...selectedProductsUpdate
        }));
    }, [element]);




    const handleProductExpansion = useCallback((id, idActivity) => {
        setProductExpanded(prevState => ({
            ...prevState,
            [`${id}-${idActivity}`]: !prevState[`${id}-${idActivity}`]
        }));
    }, []);


    const handleProductExpansionExec = useCallback((event, id, idActivity, executorId) => {
        event.stopPropagation();
        setProductExpandedExec(prevState => ({
            ...prevState,
            [`${executorId}-${id}-${idActivity}`]: !prevState[`${executorId}-${id}-${idActivity}`]
        }));
    }, []);


    const getActivityName = useCallback((idActivity) => {
        const elementRegistry = modeler.get('elementRegistry');
        const activityElement = elementRegistry.get(idActivity);
        return activityElement?.businessObject.name || '';
    }, [modeler, modeler.get]);


    const handleToggleSearchInput = useCallback((executorId) => {
        setshowInputProduct((prevState) => ({
            ...prevState,
            [executorId]: !prevState[executorId],
        }));
    }, []);


    function handleTimeChange(e, index) {
        const newTime = e.target.value;
        const newProducts = { ...selectedProducts };
        newProducts[index].time = newTime;

        const modeling = modeler.get('modeling');
        const executorElement = modeler.get('elementRegistry').get(element.id);

        const productArray = executorElement.businessObject.product;

        // Aggiorna la proprietà time del prodotto
        if (productArray) {
            modeling.updateProperties(executorElement, {
                product: productArray
            });
        }

        setSelectedProducts(newProducts);
    }


    const handleTimeChangeExe = useCallback((e, index, executorId, productId) => {
        const newTime = e.target.value;
        let newProducts = { ...selectedProducts };

        setSelectedProducts(prevSelectedProducts => {
            if (!prevSelectedProducts[executorId]) {
                return prevSelectedProducts; // Or handle this case as needed
            }
            newProducts[executorId] = [...prevSelectedProducts[executorId]];
            newProducts[executorId][index] = { ...newProducts[executorId][index], time: newTime };
            return newProducts;
        });

        // Update the time of the selected product in the corresponding executor's product property in the modeler
        const modeling = modeler.get("modeling");
        const executorElement = modeler.get("elementRegistry").get(executorId);
        const productArray = executorElement.businessObject.product;

        // Find the product in the productArray using the productId and update its time
        const productToUpdate = productArray.find(product => product.id === productId);
        if (productToUpdate) {
            productToUpdate.time = newTime;
            modeling.updateProperties(executorElement, {
                product: productArray
            });
        }

        setSelectedProducts(newProducts);

    }, []);


    const handleAttachExecutor = useCallback((executor) => {
        const originalElement = element;

        const modeling = modeler.get('modeling');
        const elementRegistry = modeler.get('elementRegistry');

        const sourceMid = getMid(element);
        const targetMid = getMid(executor);

        const connection = {
            type: 'custom:Connection',
            waypoints: [
                sourceMid,
                targetMid
            ]
        };

        modeling.connect(element, executor, connection);
        element = originalElement;
    }, [element, modeler]);



    const handleDetachExecutor = useCallback((executor) => {
        const elementRegistry = modeler.get('elementRegistry');
        const connections = elementRegistry.filter(component => {
            return (component.type === 'custom:Connection' &&
                (component.source === element && component.target === executor) || (component.source === executor && component.target === element));
        });
        const modeling = modeler.get('modeling');
        connections.forEach((connection) => {
            modeling.removeElements([connection]);
        });
        handleDeleteExecutor(executor);
    }, [modeler, handleDeleteExecutor]);



    return (
        <div className="element-properties" key={element ? element.id : ''}>
            {element && (
                <>
                    <h3 className="element-type">{getElementType()}</h3>
                    <div className="general">
                        <div className="id">
                            <label>ID</label>
                            <input value={element.id} readOnly></input>
                        </div>
                        <div className="name">
                            <label>Name</label>
                            <input value={name} onChange={handleNameChange} />
                        </div>
                    </div>
                    {is(element, 'custom:Executor') &&

                        <div className="properties">
                            <div className="properties-title">
                                <label>Connected Products</label>
                            </div>
                            <div className="product-container">
                                {Object.values(selectedProducts).map((obj, index) => (
                                    <React.Fragment key={index}>
                                        <div>
                                            <div className="selection" onClick={() => handleProductExpansion(selectedProducts[index]?.id, selectedProducts[index]?.idActivity)}>
                                                {/*
                                                    <FontAwesomeIcon icon={faXmark}
                                                        onClick={() => handleDeleteProduct(selectedProducts[index], element.id, selectedProducts[index].idActivity)}
                                                        className="delete-icon"
                                                    />
                                               */}
                                                <FontAwesomeIcon
                                                    icon={productExpanded[selectedProducts[index]?.id] ? faAngleDown : faAngleRight}
                                                    className="expand-icon"
                                                />
                                                <span>{selectedProducts[index]?.name} - {getActivityName(selectedProducts[index]?.idActivity)}</span>
                                            </div>

                                            {productExpanded[`${selectedProducts[index]?.id}-${selectedProducts[index]?.idActivity}`] && (
                                                <div key={index} className="product-list">
                                                    <div className="time-input">
                                                        <span>Time : </span>
                                                        <input type="number"
                                                            value={selectedProducts[index]?.time || 0}
                                                            onChange={(e) => handleTimeChange(e, index)} />

                                                        <select value={selectedProducts[index]?.timeUnit || 's'} /*onChange={(e) => handleTimeUnitChange(e, index)}*/>
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

                                {/*
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className="search-icon"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setshowInputProduct(!showInputProduct);
                                    }} />
                                */}
                            </div>
                        </div>
                    }
                    {!is(element, 'custom:Executor') && is(element, 'bpmn:Task') &&
                        <div className="properties" onClick={() => setIsPropertiesExpanded(!isPropertiesExpanded)}>

                            <div className="properties-title">
                                <label>Connected Executors</label>
                                <FontAwesomeIcon icon={isPropertiesExpanded ? faAngleDown : faAngleRight} />
                            </div>
                            {isPropertiesExpanded && (
                                <div className="executor-container">
                                    <div>
                                        {selectedExecutors.map((executor, index) => (
                                            <React.Fragment key={index}>
                                                <div className="executor-obj">
                                                    <div className="selection" onClick={(event) => handleExecutorClick(event, executor)}>
                                                        <FontAwesomeIcon
                                                            icon={executorExpanded[executor.id] ? faAngleDown : faAngleRight}
                                                            className="expand-icon"
                                                        />
                                                        <span>{executor.businessObject.name}</span>
                                                        <FontAwesomeIcon icon={faXmark} className="delete-icon" onClick={() => handleDetachExecutor(executor)} />
                                                    </div>
                                                    {executorExpanded[executor.id] && (
                                                        <div ref={searchBarRef} className="product-list">
                                                            {(selectedProducts[executor.id] || []).map((product, index) => (
                                                                <div key={index}>
                                                                    <div className="selection" onClick={(event) => handleProductExpansionExec(event, product.id, element.id, executor.id)}>
                                                                        <FontAwesomeIcon
                                                                            icon={productExpandedExec[product.id] ? faAngleDown : faAngleRight}
                                                                            className="expand-icon"
                                                                        />
                                                                        <span>{product.name}</span>
                                                                        <FontAwesomeIcon
                                                                            icon={faXmark}
                                                                            className="delete-icon"
                                                                            onClick={() => handleDeleteProduct(product, executor.id, element.id)}
                                                                        />
                                                                    </div>
                                                                    {productExpandedExec[`${executor.id}-${product.id}-${element.id}`] && (
                                                                        <div key={index} className="product-list">
                                                                            <div className="time-input">
                                                                                <span>Time : </span>
                                                                                <input
                                                                                    type="number"
                                                                                    value={product.time || 0}
                                                                                    onChange={(e) => handleTimeChangeExe(e, index, executor.id, product.id)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                                <select value={product.timeUnit || 's'} /*onChange={(e) => handleTimeUnitChange(e, index)}*/ onClick={(e) => e.stopPropagation()}>
                                                                                    <option value="s">s</option>
                                                                                    <option value="m">m</option>
                                                                                    <option value="h">h</option>
                                                                                    <option value="d">d</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <div className="search-product">
                                                                {showInputProduct[executor.id] && (
                                                                    <input
                                                                        placeholder="Search product"
                                                                        value={productSearchInput[executor.id] || ''}
                                                                        onChange={(event) => handleSearchProducts(event, executor.id)}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                    />
                                                                )}
                                                                {productDropdownOpen[executor.id] && (
                                                                    <div className="dropdown-menu">
                                                                        {productSearchResults[executor.id]?.map((result, index) => (
                                                                            <div key={index} onClick={(event) => handleSelectProduct(event, result, executor.id)}>
                                                                                <label>{result.name}</label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <FontAwesomeIcon
                                                                        icon={faPlus}
                                                                        className="search-icon-product"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleToggleSearchInput(executor.id)
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>


                                                        </div>
                                                    )}
                                                </div>

                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="search-container">

                                        {showInputExecutor && (
                                            <input
                                                placeholder="Search executor"
                                                value={executorSearchInput}
                                                onChange={(event) => handleSearchExecutor(event)}
                                                onClick={(event) => event.stopPropagation()}
                                            />
                                        )}
                                        {executorDropdownOpen && (
                                            <div className="dropdown-menu">
                                                {executorSearchResults.map((result, index) => (
                                                    <div key={index} onClick={(event) => {
                                                        handleSelectExecutor(event, result);
                                                        handleAttachExecutor(result);
                                                    }}>
                                                        <label>{result.businessObject.name}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="search-icon"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setshowInputExecutor(!showInputExecutor);
                                            }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    }

                </>
            )}
        </div>
    );
}

export default ElementProperties;
