import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect } from 'react';

import ConnectedExecutors from './ConnectedExecutors/ConnectedExecutors';
import ConnectedProducts from './ConnectedProducts/ConnectedProducts';
import Priority from './Priority/Priority';
import Batch from './Batch/Batch';

function ElementProperties({ element, modeler, products }) {
    const [name, setName] = useState(() => {
        if (element) {
            return element.businessObject.name || '';
        }
        return '';
    });

    const [isExecutorConnectedToBatch, setIsExecutorConnectedToBatch] = useState(false);

    if (element && element.labelTarget) {
        element = element.labelTarget;
    }


    const isExecutorConnected = useCallback(() => {
        if (is(element, 'custom:Executor')) {
            const executor = element.id;
            const batches = modeler.get('elementRegistry').filter((el) => is(el, 'custom:Batch'));
            
            for (const batch of batches) {
                const incomingConnections = batch.incoming;
                const outgoingConnections = batch.outgoing;

                if (incomingConnections) {
                    for (const connection of incomingConnections) {
                        if (is(connection, 'custom:Connection') && (connection.source.id === executor || connection.target.id === executor)) {
                            return true;
                        }
                    }
                }

                if (outgoingConnections) {
                    for (const connection of outgoingConnections) {
                        if (is(connection, 'custom:Connection') && (connection.source.id === executor || connection.target.id === executor)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }, [element, modeler]);



    useEffect(() => {
        if (element) {
            setName(element.businessObject.name || '');
            setIsExecutorConnectedToBatch(isExecutorConnected());
        }
    }, [element, isExecutorConnected]);

    const getElementType = useCallback(() => {
        if (element && element.type) {
            return element.type.replace('bpmn:', '').replace('custom:', '');
        }
        return 'Process';
    }, [element]);

    const handleNameChange = useCallback((event) => {
        const newName = event.target.value;
        setName(newName);
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            name: newName,
        });
    }, [element, modeler]);

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
                    {is(element, 'custom:Executor') && (
                        <div className="properties-list">
                            <ConnectedProducts element={element} modeler={modeler} products={products} />
                            {isExecutorConnectedToBatch && <Batch element={element} modeler={modeler} />}
                        </div>
                    )}
                    {is(element, 'bpmn:Task') && element.type === 'bpmn:Task' && (
                        <div className="properties-list">
                            <ConnectedExecutors element={element} modeler={modeler} products={products} />
                            <Priority element={element} modeler={modeler} />
                        </div>
                    )}
                    {is(element, 'custom:Batch') && (
                        <div className="properties-list">
                            <ConnectedExecutors element={element} modeler={modeler} products={products} />
                            <Priority element={element} modeler={modeler} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ElementProperties;
