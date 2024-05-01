import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { CiCircleRemove } from "react-icons/ci";


function ElementProperties({ element, modeler, products }) {

    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchBarRef = useRef(null);

    const [executorSearchResults, setExecutorSearchResults] = useState([]);
    const [executorSearchInput, setExecutorSearchInput] = useState('');
    const [selectedExecutors, setSelectedExecutors] = useState([]);
    const [executors, setExecutors] = useState([]);

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

    useEffect(() => {
        if (element) {
            setName(element.businessObject.name || '');
        }
    }, [element]);


    const handleOutsideClick = useCallback((event) => {
        if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
            setShowSearchBar(false);
        }
    }, []);


    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [handleOutsideClick]);

    useEffect(() => {
        const allExecutors = modeler.get('elementRegistry').filter(element => is(element, 'custom:Hexagon'));
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
            setExecutorSearchResults(executors.filter(executor => (executor.businessObject && executor.businessObject.name) ? executor.businessObject.name.toLowerCase().includes(input.toLowerCase()) : false));
        }
        setExecutorDropdownOpen(true);
    }, [executors]);


    const handleSelectExecutor = useCallback((executor) => {
        setSelectedExecutors(prevSelectedExecutors => [...prevSelectedExecutors, executor]);
        setExecutorSearchInput('');
        setExecutors(prevExecutors => prevExecutors.filter(t => t !== executor));
        setExecutorSearchResults([]);
        setExecutorDropdownOpen(false);
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
    }, []);


    const handleDeleteProduct = useCallback((product, executorId) => {
        setSelectedProducts(prevSelectedProducts => ({
            ...prevSelectedProducts,
            [executorId]: prevSelectedProducts[executorId].filter(p => p !== product)
        }));
    }, []);


    const handleDeleteExecutor = useCallback((executor) => {
        setSelectedExecutors(prevSelectedExecutors => prevSelectedExecutors.filter(t => t !== executor));
        setSelectedProducts(prevSelectedProducts => prevSelectedProducts.filter(p => !executor.businessObject.extensionElements.values.filter(ve => ve.name === 'productIds').find(pi => pi.value === p.id)));
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
    }, []);


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

                    {is(element, 'bpmn:Task') &&
                        <fieldset>
                            <label>Search Executors</label>
                            <input
                                value={executorSearchInput}
                                onChange={(event) => handleSearchExecutor(event)}
                            />
                            {executorDropdownOpen && (
                                <div className="dropdown-menu">
                                    {executorSearchResults.map((result, index) => (
                                        <div key={index} onClick={() => handleSelectExecutor(result)}>
                                            <label>{result.businessObject.name}</label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <br /><br />
                            <label>Selected Executors</label>
                            <div>
                                {selectedExecutors.map((executor, index) => (
                                    <React.Fragment key={index}>
                                        <div>
                                            <div className="selection">
                                                <CiCircleRemove onClick={() => handleDeleteExecutor(executor)} />
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
