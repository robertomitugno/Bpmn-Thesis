import { is } from 'bpmn-js/lib/util/ModelUtil';
import '../ElementProperties.css';
import './ConnectedExecutors.css';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleRight, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import { getMid } from 'diagram-js/lib/layout/LayoutUtil.js';

function ConnectedExecutors({ element, modeler, products }) {

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
    const [productExpandedExec, setProductExpandedExec] = useState({});

    const [isExecutorConnectedToBatch, setIsExecutorConnectedToBatch] = useState(false);
    const [isBatchEnabled, setIsBatchEnabled] = useState({});


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
            setSelectedExecutors(getConnectedExecutors());
            setSelectedProducts({});
            setshowInputExecutor(false);
            setProductDropdownOpen(false);
            setExecutorDropdownOpen(false);
        }
        if (element.type === 'factory:Batch') {
            setIsExecutorConnectedToBatch(true);
        }
    }, [element, getConnectedExecutors]);


    useEffect(() => {
        const allExecutors = modeler.get('elementRegistry').filter(element => is(element, 'factory:Executor'));
        setExecutors(allExecutors);
    }, []);


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


    const handleSelectExecutor = useCallback((executor) => {
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


    const handleSelectProduct = useCallback((product, executorId) => {
        setProductSearchInput('');

        setProductSearchResults(prevResults => ({
            ...prevResults,
            [executorId]: prevResults[executorId].filter(p => p !== product)
        }));

        setshowInputExecutor(false);

        const modeling = modeler.get('modeling');
        const moddle = modeler.get('moddle');
        const executor = modeler.get('elementRegistry').filter(element => is(element, 'factory:Executor')).find(executor => executor.id === executorId);

        if (executor) {
            let extensionElements = executor.businessObject.product;

            if (!Array.isArray(extensionElements)) {
                extensionElements = [];
            }

            const newProduct = moddle.create("factory:Product");
            newProduct.id = product.id;
            newProduct.time = 0;
            newProduct.timeUnit = 's';
            newProduct.batch = 1;
            newProduct.idActivity = element.id;

            extensionElements.push(newProduct);

            modeling.updateProperties(executor, {
                product: extensionElements
            });

            setSelectedProducts(prevSelectedProducts => ({
                ...prevSelectedProducts,
                [executorId]: [...(prevSelectedProducts[executorId] || []), { ...product, time: 0 }]
            }));

            renderBatchGraphics(element);
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
                product: updatedProducts.length > 0 ? updatedProducts : moddle.create('factory:Product', { values: [] })
            });
        }

        renderBatchGraphics(element);
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

    const handleExecutorClick = useCallback((executor) => {
        setExecutorExpanded((prevState) => ({
            ...prevState,
            [executor.id]: !prevState[executor.id],
        }));

        const productElement = executor.businessObject.get('factory:product');
        let selectedProductsUpdate = {};

        if (productElement && productElement.length > 0) {
            const filteredProducts = productElement.filter(product => element.id === product.idActivity);
            selectedProductsUpdate = {
                ...selectedProductsUpdate,
                [executor.id]: [
                    ...(selectedProductsUpdate[executor.id] || []),
                    ...filteredProducts.map(product => ({
                        id: product.id,
                        name: products.find(p => p.id === product.id)?.name || product.name,
                        time: product.time,
                        timeUnit: product.timeUnit,
                        batch: product.batch,
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


    const handleProductExpansionExec = useCallback((id, idActivity, executorId) => {
        setProductExpandedExec(prevState => ({
            ...prevState,
            [`${executorId}-${id}-${idActivity}`]: !prevState[`${executorId}-${id}-${idActivity}`]
        }));
    }, []);


    const handleToggleSearchInput = useCallback((executorId) => {
        setshowInputProduct((prevState) => ({
            ...prevState,
            [executorId]: !prevState[executorId],
        }));
    }, []);


    const handleTimeUnitChange = useCallback((e, index, executorId, productId) => {
        const newTimeUnit = e.target.value;
        let newProducts = { ...selectedProducts };

        setSelectedProducts(prevSelectedProducts => {
            if (!prevSelectedProducts[executorId]) {
                return prevSelectedProducts;
            }
            newProducts[executorId] = [...prevSelectedProducts[executorId]];
            newProducts[executorId][index] = { ...newProducts[executorId][index], timeUnit: newTimeUnit };
            return newProducts;
        });

        const modeling = modeler.get("modeling");
        const executorElement = modeler.get("elementRegistry").get(executorId);
        const productArray = executorElement.businessObject.product;

        const productToUpdate = productArray.find(product => product.id === productId && product.idActivity === element.id);
        if (productToUpdate) {
            productToUpdate.timeUnit = newTimeUnit;
            modeling.updateProperties(executorElement, {
                product: productArray
            });
        }

        setSelectedProducts(newProducts);

    }, []);

    const handleTimeChangeExe = useCallback((e, index, executorId, productId) => {

        let newTime = e.target.value;
        let newProducts = { ...selectedProducts };

        if (newTime.startsWith('0')) {
            newTime = newTime.substring(1);
        }

        setSelectedProducts(prevSelectedProducts => {
            if (!prevSelectedProducts[executorId]) {
                return prevSelectedProducts;
            }
            newProducts[executorId] = [...prevSelectedProducts[executorId]];
            newProducts[executorId][index] = { ...newProducts[executorId][index], time: newTime };
            return newProducts;
        });

        const modeling = modeler.get("modeling");
        const executorElement = modeler.get("elementRegistry").get(executorId);
        const productArray = executorElement.businessObject.product;


        const productToUpdate = productArray.find(product => product.id === productId && product.idActivity === element.id);
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

        const sourceMid = getMid(element);
        const targetMid = getMid(executor);

        const connection = {
            type: 'factory:Connection',
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
            return (component.type === 'factory:Connection' &&
                (component.source === element && component.target === executor) || (component.source === executor && component.target === element));
        });
        const modeling = modeler.get('modeling');
        connections.forEach((connection) => {
            modeling.removeElements([connection]);
        });
        handleDeleteExecutor(executor);
    }, [modeler, handleDeleteExecutor]);


    const handleBatchChange = useCallback((e, index, executorId, productId, oldBatch) => {
        let newBatch = e.target.value;
        let newProducts = { ...selectedProducts };

        if (oldBatch == '1' && e.nativeEvent.data != '1' && e.nativeEvent.data != '0') {
            newBatch = newBatch.substring(1);
        }
        if (newBatch < 1) {
            newBatch = 1;
        }

        setSelectedProducts(prevSelectedProducts => {
            if (!prevSelectedProducts[executorId]) {
                return prevSelectedProducts;
            }
            newProducts[executorId] = [...prevSelectedProducts[executorId]];
            newProducts[executorId][index] = { ...newProducts[executorId][index], batch: newBatch };
            return newProducts;
        });

        const modeling = modeler.get('modeling');
        const executorElement = modeler.get('elementRegistry').get(executorId);

        const productArray = executorElement.businessObject?.product;

        const productToUpdate = productArray.find(
            (product) => product.id === productId && product.idActivity === element.id
        );
        if (productToUpdate) {

            productToUpdate.batch = newBatch;
            modeling.updateProperties(executorElement, {
                product: productArray
            });

        }
        setSelectedProducts(newProducts);
        renderBatchGraphics(element);
    }, []);


    const handleBatchCheckboxChange = useCallback((executorId, productId, event) => {
        setIsBatchEnabled(prevState => ({
            ...prevState,
            [`${executorId}-${productId}-${element.id}`]: event.target.checked
        }));

        if (!event.target.checked) {
            const modeling = modeler.get('modeling');
            const executorElement = modeler.get('elementRegistry').get(executorId);
            const productArray = executorElement.businessObject.product;
            const productToUpdate = productArray.find(product => product.id === productId && product.idActivity === element.id);

            if (productToUpdate) {
                productToUpdate.batch = 1;
                modeling.updateProperties(executorElement, { product: productArray });
            }

            setSelectedProducts((prevSelectedProducts) => ({
                ...prevSelectedProducts,
                [executorId]: prevSelectedProducts[executorId].map((product) =>
                    product.id === productId && product.idActivity === element.id
                        ? { ...product, batch: 1 }
                        : product
                ),
            }));
        }
    }, []);


    function renderBatchGraphics(element) {
        const customRenderer = modeler.get('customRenderer');
        const parent = modeler.get('canvas').getGraphics(element);
        customRenderer.drawShape(parent, element);
    }

    return (
        <div className="element-properties" key={element ? element.id : ''}>
            {element && (
                <>
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
                                                <div className="selection" onClick={(event) => {
                                                    handleExecutorClick(executor);
                                                    event.stopPropagation();
                                                }}>
                                                    <FontAwesomeIcon
                                                        icon={executorExpanded[executor.id] ? faAngleDown : faAngleRight}
                                                        className="expand-icon"
                                                    />
                                                    <span>{executor.businessObject?.name}</span>
                                                    <FontAwesomeIcon icon={faXmark} className="delete-icon" onClick={() => handleDetachExecutor(executor)} />
                                                </div>
                                                {executorExpanded[executor.id] && (
                                                    <div ref={searchBarRef} className="products">

                                                        {(selectedProducts[executor.id] || []).map((product, index) => (
                                                            <div key={index}>
                                                                <div className="selection" onClick={(event) => {
                                                                    handleProductExpansionExec(product.id, element.id, executor.id);
                                                                    event.stopPropagation();
                                                                }
                                                                }>
                                                                    <FontAwesomeIcon
                                                                        icon={productExpandedExec[`${executor.id}-${product.id}-${element.id}`] ? faAngleDown : faAngleRight}
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
                                                                    <div key={index} className="products">
                                                                        {isExecutorConnectedToBatch &&
                                                                            <div>
                                                                                <div className="worksBatch-checkbox">
                                                                                    <span>Executor works in batch</span>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isBatchEnabled[`${executor.id}-${product.id}-${element.id}`]}
                                                                                        onChange={(e) => handleBatchCheckboxChange(executor.id, product.id, e)}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    />
                                                                                </div>
                                                                                <div className="batch-input">
                                                                                    <span>Number of element for batch: </span>
                                                                                    <input type="number"
                                                                                        value={product.batch || 1}
                                                                                        onChange={(e) => handleBatchChange(e, index, executor.id, product.id, product.batch)}
                                                                                        onClick={(event) => event.stopPropagation()}
                                                                                        disabled={!isBatchEnabled[`${executor.id}-${product.id}-${element.id}`]} />
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                        <div className="time-input">
                                                                            <span>Time : </span>
                                                                            <input
                                                                                type="number"
                                                                                value={product.time || 0}
                                                                                onChange={(e) => handleTimeChangeExe(e, index, executor.id, product.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                            <select value={product.timeUnit || 's'} onChange={(e) => handleTimeUnitChange(e, index, executor.id, product.id)} onClick={(e) => e.stopPropagation()}>
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
                                                                        <div key={index} onClick={(event) => {
                                                                            handleSelectProduct(result, executor.id);
                                                                            event.stopPropagation();
                                                                        }
                                                                        }>
                                                                            <label>{result.name}</label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="search-icon-container-product" onClick={(event) => {
                                                                handleToggleSearchInput(executor.id);
                                                                event.stopPropagation();
                                                            }}>
                                                                <FontAwesomeIcon
                                                                    icon={faPlus}
                                                                    className="search-icon-product"
                                                                />
                                                                <span className="add-product-text">add product</span>

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
                                                    handleSelectExecutor(result);
                                                    handleAttachExecutor(result);
                                                    event.stopPropagation();
                                                }}>
                                                    <label>{result.businessObject.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="search-icon-container" onClick={(event) => {
                                        setshowInputExecutor(!showInputExecutor);
                                        event.stopPropagation();
                                    }}>
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="search-icon"
                                        />
                                        <span className="add-executor-text">add executor</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </>
            )}
        </div>
    );
}

export default ConnectedExecutors;
