import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { CiCircleRemove } from "react-icons/ci";
import { GrSearchAdvanced } from "react-icons/gr";

function ElementProperties({ element, modeler, products }) {

    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchBarRef = useRef(null);

    const [executorSearchResults, setExecutorSearchResults] = useState([]);
    const [executorSearchInput, setExecutorSearchInput] = useState('');
    const [selectedExecutors, setSelectedExecutors] = useState([]);
    const [executors, setExecutors] = useState([]);
    const [showInput, setShowInput] = useState(false);

    const [productSearchInput, setProductSearchInput] = useState('');
    const [selectedProducts, setSelectedProducts] = useState({});
    const [productSearchResults, setProductSearchResults] = useState([]);

    const [executorDropdownOpen, setExecutorDropdownOpen] = useState(false);
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);

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

        elementRegistry.filter(element => is(element, 'bpmn:SequenceFlow')).forEach(sequenceFlow => {
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
            setShowInput(false);
            setProductDropdownOpen(false);
            setExecutorDropdownOpen(false);
        }
    }, [element, getConnectedExecutors]);


    const handleOutsideClick = useCallback((event) => {
        if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
            setShowSearchBar(false);
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


    const handleSelectExecutor = useCallback((executor) => {
        setSelectedExecutors(prevSelectedExecutors => [...prevSelectedExecutors, executor]);
        setExecutorSearchInput('');
        setShowInput(false);
        setExecutors(prevExecutors => prevExecutors.filter(t => t !== executor));
        setExecutorSearchResults([]);
        setExecutorDropdownOpen(false);
        setProductDropdownOpen(false);
    }, [modeler]);


    const handleSearchProducts = useCallback((event, executorId) => {
        const input = event.target.value;
        setProductSearchInput(input);
        if (!input) {
            setProductSearchResults([]);
        } else {
            const filteredProducts = products.filter(product => product.name.toLowerCase().includes(input.toLowerCase()));
            const selectedProductIds = selectedProducts[executorId]?.map(p => p.id) || [];
            setProductSearchResults(filteredProducts.filter(product => !selectedProductIds.includes(product.id)));
        }
        setProductDropdownOpen(true);
    }, [products, selectedProducts]);


    const handleSelectProduct = useCallback((product, executorId) => {
        setSelectedProducts(prevSelectedProducts => ({
            ...prevSelectedProducts,
            [executorId]: [...(prevSelectedProducts[executorId] || []), product]
        }));
        setProductSearchInput('');
        setProductSearchResults(prevResults => prevResults.filter(p => p !== product));
        setProductDropdownOpen(false);
        setShowInput(false);

        const modeling = modeler.get('modeling');
        const moddle = modeler.get('moddle');
        const executor = modeler.get('elementRegistry').filter(element => is(element, 'custom:Executor')).find(executor => executor.id === executorId);

        if (executor) {
            let extensionElements = executor.businessObject.product;

            if (!extensionElements) {
                console.log("entro");
                extensionElements = moddle.create("custom:Products", { values: [] });
                modeling.updateProperties(executor, { extensionElements });
            }

            const newProduct = moddle.create("custom:Product");
            newProduct.id = product.id;
            newProduct.name = product.name;
            newProduct.time = "tempo";
            newProduct.idActivity = element.id;

            extensionElements.push(newProduct);

        }
    }, []);



    const handleDeleteProduct = useCallback((product, executorId) => {
        setSelectedProducts(prevSelectedProducts => ({
            ...prevSelectedProducts,
            [executorId]: prevSelectedProducts[executorId].filter(p => p !== product)
        }));
    }, []);


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



    const handleExecutorClick = useCallback((executor) => {

        setShowSearchBar(prevShowSearchBar => {
            const newShowSearchBar = { ...prevShowSearchBar };
            newShowSearchBar[executor.id] = !newShowSearchBar[executor.id];
            return newShowSearchBar;
        });

        const productElement = executor.businessObject.get('custom:product');
        //let extensionElements = executor.businessObject.product;
        let selectedProductsUpdate = {};

        console.log(executor);
        console.log(executor.businessObject);
        console.log(productElement);
        //console.log(extensionElements);


        if (productElement) {
            console.log("entro product");
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

        /*if (extensionElements) {
            console.log("entro extension");
            const filteredProducts = extensionElements.filter(product => element.id === product.idActivity);
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
        }*/

        setSelectedProducts(prevSelectedProducts => ({
            ...prevSelectedProducts,
            ...selectedProductsUpdate
        }));

    }, [element]);



    const handleAttachExecutor = useCallback((executor) => {
        const originalElement = element;

        const modeling = modeler.get('modeling');
        const connection = {
            type: 'bpmn:SequenceFlow',
            waypoints: [
                { x: element.x + element.width, y: element.y + element.height / 2 },
                { x: executor.x, y: executor.y }
            ]
        };

        modeling.connect(element, executor, connection);
        element = originalElement;
    }, [element, modeler]);


    const handleDetachExecutor = useCallback((executor) => {
        const elementRegistry = modeler.get('elementRegistry');
        const connections = elementRegistry.filter(component => {
            return (component.type === 'bpmn:SequenceFlow' &&
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
                    <h3>{getElementType()}</h3>
                    <fieldset>

                        <label>Id</label>
                        <span>{element.id}</span>

                        <label>Name</label>
                        <input value={name} onChange={handleNameChange} />

                    </fieldset>
                    {is(element, 'custom:Executor') &&
                        <fieldset>
                            <label>Search Product</label>
                            <input
                                value={executorSearchInput}
                                onChange={(event) => handleSearchExecutor(event)}
                            />
                            <br /><br />
                            <label>Selected Product</label>
                            <div>
                            </div>
                        </fieldset>
                    }
                    {!is(element, 'custom:Executor') && is(element, 'bpmn:Task') &&
                        <fieldset>
                            <div className="search-container">
                                <label>Connected Executors</label>
                                <GrSearchAdvanced
                                    className="search-icon"
                                    onClick={() => setShowInput(!showInput)}
                                />
                            </div>
                            {showInput && (
                                <input
                                    value={executorSearchInput}
                                    onChange={(event) => handleSearchExecutor(event)}
                                />
                            )}
                            {executorDropdownOpen && (
                                <div className="dropdown-menu">
                                    {executorSearchResults.map((result, index) => (
                                        <div key={index} onClick={() => {
                                            handleSelectExecutor(result);
                                            handleAttachExecutor(result);
                                        }}>
                                            <label>{result.businessObject.name}</label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div>
                                {selectedExecutors.map((executor, index) => (
                                    <React.Fragment key={index}>
                                        <div>
                                            <div className="selection">
                                                <CiCircleRemove onClick={() => handleDetachExecutor(executor)} />
                                                <span onClick={() => handleExecutorClick(executor)}>{executor.businessObject.name}</span>
                                            </div>
                                            {showSearchBar[executor.id] && (
                                                <div ref={searchBarRef} className="product-search">
                                                    <input
                                                        value={productSearchInput}
                                                        onChange={(event) => handleSearchProducts(event, executor.id)}
                                                    />
                                                    {productDropdownOpen && (
                                                        <div className="dropdown-menu">
                                                            {productSearchResults.map((result, index) => (
                                                                <div key={index} onClick={() => handleSelectProduct(result, executor.id)}>
                                                                    <label>{result.name}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {(selectedProducts[executor.id] || []).map((product, index) => (
                                                        <div key={index}>
                                                            <div className="selection">
                                                                <CiCircleRemove onClick={() => handleDeleteProduct(product, executor.id)} />
                                                                <label>{product.name}</label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </fieldset>
                    }

                </>
            )}
        </div>
    );
}

function hasDefinition(event, definitionType) {
    const definitions = event.businessObject.eventDefinitions || [];
    return definitions.some(d => is(d, definitionType));
}

export default ElementProperties;
