import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect } from 'react';

import ConnectedExecutors from './ConnectedExecutors/ConnectedExecutors';
import ConnectedProducts from './ConnectedProducts/ConnectedProducts';
import Priority from './Priority/Priority';

function ElementProperties({ element, modeler, products }) {

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
            name: newName
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
                    {is(element, 'custom:Executor') &&  // Se l'elemento è un Executor
                        <div className="properties-list">
                            <ConnectedProducts element={element} modeler={modeler} products={products} />
                        </div>
                    }
                    {is(element, 'bpmn:Task') && element.type === 'bpmn:Task' &&  // Se l'elemento è un Task
                        <div className="properties-list">
                            <ConnectedExecutors element={element} modeler={modeler} products={products} />
                            <Priority element={element} modeler={modeler} />
                        </div>
                    }

                </>
            )}
        </div>
    );
}

export default ElementProperties;
