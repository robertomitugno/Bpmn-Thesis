import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect } from 'react';

// Questa funzione rappresenta le proprietà di un elemento del diagramma BPMN
function ElementProperties(props) {
    // Estrazione delle props
    let { element, modeler } = props;

    // Dichiarazione degli stati per la ricerca, gli elementi trovati, i task, i task selezionati e il nome dell'elemento
    const [searchResults, setSearchResults] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [tasks, setTasks] = useState([]);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [name, setName] = useState(() => {
        if (element) {
            return element.businessObject.name || '';
        }
        return '';
    });

    // Controllo se l'elemento ha un labelTarget e in tal caso lo imposta come elemento
    if (element && element.labelTarget) {
        element = element.labelTarget;
    }

    // Aggiornamento del nome dell'elemento quando cambia l'elemento
    useEffect(() => {
        if (element) {
            setName(element.businessObject.name || '');
        }
    }, [element]);

    // Recupero di tutti i task dal modeler all'inizio del caricamento del componente
    useEffect(() => {
        const allTasks = modeler.get('elementRegistry').filter(element => is(element, 'bpmn:Task'));
        setTasks(allTasks);
    }, []);

    // Funzione per ottenere il tipo di elemento
    const getElementType = useCallback(() => {
        if (element && element.type) {
            return element.type.replace('bpmn:', '').replace('custom:', '');
        }
        return 'Process';
    }, [element]);

    // Funzione per gestire la ricerca dei task
    const handleSearch = useCallback(() => {
        if (!searchInput) {
            setSearchResults([]);
        } else {
            setSearchResults(tasks.filter(task => task.businessObject.name.toLowerCase().includes(searchInput.toLowerCase())));
        }
    }, [searchInput, tasks]);

    // Funzione per gestire la selezione di un task
    const handleSelectTask = useCallback((task) => {
        modeler.get('selection').select(task);
        setSelectedTasks(prevSelectedTasks => [...prevSelectedTasks, task]);
        setSearchInput('');
        setSearchResults([]);
    }, [modeler]);

    // Funzione per gestire il cambiamento del nome dell'elemento
    const handleNameChange = useCallback((event) => {
        const newName = event.target.value;
        setName(newName);
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            name: newName
        });
    }, [element, modeler]);

    // Funzione per gestire la rimozione di un task selezionato
    const handleRemoveTask = useCallback((task) => {
        setSelectedTasks(prevSelectedTasks => prevSelectedTasks.filter(t => t !== task));
    }, []);

    // Funzione per aggiornare il topic dell'elemento
    function updateTopic(topic) {
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            'custom:topic': topic
        });
    }

    // Funzione per trasformare l'elemento in un MessageEvent
    function makeMessageEvent() {
        const bpmnReplace = modeler.get('bpmnReplace');
        bpmnReplace.replaceElement(element, {
            type: element.businessObject.$type,
            eventDefinitionType: 'bpmn:MessageEventDefinition'
        });
    }

    // Funzione per trasformare l'elemento in un ServiceTask
    function makeServiceTask() {
        const bpmnReplace = modeler.get('bpmnReplace');
        bpmnReplace.replaceElement(element, {
            type: 'bpmn:ServiceTask'
        });
    }

    // Funzione per aggiungere un timeout all'elemento
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

    // Funzione per verificare se l'elemento ha già un timeout configurato
    function isTimeoutConfigured(element) {
        const attachers = element.attachers || [];
        return attachers.some(e => hasDefinition(e, 'bpmn:TimerEventDefinition'));
    }

    // Funzione per aggiungere un elemento ad un altro
    function append(element, attrs) {
        const autoPlace = modeler.get('autoPlace');
        const elementFactory = modeler.get('elementFactory');
        var shape = elementFactory.createShape(attrs);
        return autoPlace.append(element, shape);
    }

    // Rendering del componente
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
                            <ul>
                                {selectedTasks.map((task, index) => (
                                    <li key={index}>{task.businessObject.name}</li>
                                ))}
                            </ul>
                        </fieldset>
                    }


                </>
            )}
        </div>
    );
}

// Funzione per verificare se un event ha una determinata definizione
function hasDefinition(event, definitionType) {
    const definitions = event.businessObject.eventDefinitions || [];
    return definitions.some(d => is(d, definitionType));
}

// Esportazione del componente
export default ElementProperties;
