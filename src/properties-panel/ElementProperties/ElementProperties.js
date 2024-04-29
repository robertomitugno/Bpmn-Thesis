import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect, useRef } from 'react';


function ElementProperties({ element, modeler, products }) {

    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchBarRef = useRef(null);
    const [searchResults, setSearchResults] = useState([]);

    const [searchInput, setSearchInput] = useState('');
    const [tasks, setTasks] = useState([]);
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productSearchResults, setProductSearchResults] = useState([]);
    const [productSearchInput, setProductSearchInput] = useState('');

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
        const allTasks = modeler.get('elementRegistry').filter(element => is(element, 'bpmn:Task'));
        setTasks(allTasks);
    }, []);

    const getElementType = useCallback(() => {
        if (element && element.type) {
            return element.type.replace('bpmn:', '').replace('custom:', '');
        }
        return 'Process';
    }, [element]);

    const handleSearch = useCallback(() => {
        if (!searchInput) {
            setSearchResults([]);
        } else {
            setSearchResults(tasks.filter(task => task.businessObject.name.toLowerCase().includes(searchInput.toLowerCase())));
        }
    }, [searchInput, tasks]);

    const handleSelectTask = useCallback((task) => {
        modeler.get('selection').select(task);
        setSelectedTasks(prevSelectedTasks => [...prevSelectedTasks, task]);
        setSearchInput('');
        setTasks(prevTasks => prevTasks.filter(t => t !== task));
        setSearchResults([]);
    }, [modeler]);


    const handleSearchProducts = useCallback((event, task) => {
        const input = event.target.value;
        setProductSearchInput(input);
        if (!input) {
            setProductSearchResults([]);
        } else {
            setProductSearchResults(products.filter(product => product.name.toLowerCase().includes(input.toLowerCase())));
        }
    }, [products]);



    const handleSelectProduct = useCallback((product, task) => {
        setSelectedProducts(prevSelectedProducts => [...prevSelectedProducts, product]);
        setProductSearchInput('');
        setProductSearchResults(prevResults => prevResults.filter(p => p !== product));
    }, []);

    const handleDeleteTask = useCallback((task) => {
        const modeling = modeler.get('modeling');
        modeling.removeElements([task]);
        setSelectedTasks(prevSelectedTasks => prevSelectedTasks.filter(t => t !== task));
        setSelectedProducts(prevSelectedProducts => prevSelectedProducts.filter(p => !task.businessObject.extensionElements.values.filter(ve => ve.name === 'productIds').find(pi => pi.value === p.id)));
    }, []);

    const handleNameChange = useCallback((event) => {
        const newName = event.target.value;
        setName(newName);
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            name: newName
        });
    }, [element, modeler]);

    const handleTaskClick = useCallback((task) => {
        setShowSearchBar(prevShowSearchBar => {
            const newShowSearchBar = { ...prevShowSearchBar };
            newShowSearchBar[task.id] = !newShowSearchBar[task.id];
            return newShowSearchBar;
        });
    }, []);

    function updateTopic(topic) {
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            'custom:topic': topic
        });
    }

    function makeMessageEvent() {
        const bpmnReplace = modeler.get('bpmnReplace');
        bpmnReplace.replaceElement(element, {
            type: element.businessObject.$type,
            eventDefinitionType: 'bpmn:MessageEventDefinition'
        });
    }

    function makeServiceTask() {
        const bpmnReplace = modeler.get('bpmnReplace');
        bpmnReplace.replaceElement(element, {
            type: 'bpmn:ServiceTask'
        });
    }

    function attachTimeout() {
        const modeling = modeler.get('modeling');
        const autoPlace = modeler.get('autoPlace');
        const selection = modeler.get('selection');
        const attrs = {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
        };
        const position = {
            x: element.x + element.width,
            y: element.y + element.height
        };
        const boundaryEvent = modeling.createShape(attrs, position, element, { attach: true });
        const taskShape = append(boundaryEvent, {
            type: 'bpmn:Task'
        });
        selection.select(taskShape);
    }

    function isTimeoutConfigured(element) {
        const attachers = element.attachers || [];
        return attachers.some(e => hasDefinition(e, 'bpmn:TimerEventDefinition'));
    }

    function append(element, attrs) {
        const autoPlace = modeler.get('autoPlace');
        const elementFactory = modeler.get('elementFactory');
        var shape = elementFactory.createShape(attrs);
        return autoPlace.append(element, shape);
    }

    return (
        <div className="element-properties" key={element ? element.id : ''}>
            {element && (
                <>
                    <h3>{getElementType()}</h3>
                    <fieldset>
                        <label>id</label>
                        <span>{element.id}</span>
                    </fieldset>

                    <fieldset>
                        <label>name</label>
                        <input
                            value={name}
                            onChange={handleNameChange}
                        />
                    </fieldset>
                    {is(element, 'custom:TopicHolder') &&
                        <fieldset>
                            <label>topic (custom)</label>
                            <input
                                value={element.businessObject.get('custom:topic') || ''}
                                onChange={(event) => {
                                    updateTopic(event.target.value)
                                }}
                            />
                        </fieldset>
                    }

                    <fieldset>
                        <label>actions</label>

                        {is(element, 'bpmn:Task') && !is(element, 'bpmn:ServiceTask') &&
                            <button onClick={makeServiceTask}>Make Service Task</button>
                        }

                        {is(element, 'bpmn:Event') && !hasDefinition(element, 'bpmn:MessageEventDefinition') &&
                            <button onClick={makeMessageEvent}>Make Message Event</button>
                        }

                        {is(element, 'bpmn:Task') && !isTimeoutConfigured(element) &&
                            <button onClick={attachTimeout}>Attach Timeout</button>
                        }
                    </fieldset>

                    {is(element, 'bpmn:Task') &&
                        <fieldset>
                            <label>Search Executors</label>
                            <input
                                value={searchInput}
                                onChange={(event) => {
                                    setSearchInput(event.target.value);
                                    handleSearch();
                                }}
                            />
                            {searchResults.map((result, index) => (
                                <div key={index}>
                                    <label>{result.businessObject.name}</label>
                                    <button onClick={() => handleSelectTask(result)}>Select</button>
                                </div>
                            ))}
                            <br /><br />
                            <label>Selected Executors</label>
                            <div>
                                {selectedTasks.map((task, index) => (
                                    <React.Fragment key={index}>
                                        <div>
                                            <span onClick={() => handleTaskClick(task)}>{task.businessObject.name}</span>
                                            {showSearchBar[task.id] && (
                                                <div ref={searchBarRef}>
                                                    <input
                                                        value={productSearchInput}
                                                        onChange={handleSearchProducts}
                                                    />
                                                    {productSearchResults.map((result, index) => (
                                                        <div key={index}>
                                                            <label>{result.name}</label>
                                                            <button onClick={() => handleSelectProduct(result, task)}>Select</button>
                                                        </div>
                                                    ))}
                                                    {selectedProducts.map((product, index) => (
                                                        <div key={index}>
                                                            <label>{product.name}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <button onClick={() => handleDeleteTask(task)}>Remove</button>
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
