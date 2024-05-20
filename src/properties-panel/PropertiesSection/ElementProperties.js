import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import ConnectedExecutors from './ConnectedExecutors';
import ConnectedProducts from './ConnectedProducts';

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
                        <ConnectedProducts element={element} modeler={modeler} products={products} />

                    }
                    {!is(element, 'custom:Executor') && is(element, 'bpmn:Task') &&  // Se l'elemento è un Task
                        <ConnectedExecutors element={element} modeler={modeler} products={products} />
                    }

                </>
            )}
        </div>
    );
}

export default ElementProperties;
