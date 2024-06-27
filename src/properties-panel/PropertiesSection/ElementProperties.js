import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ElementProperties.css';
import React, { useCallback, useState } from 'react';

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

    const getElementType = useCallback(() => {
        if (element && element.type) {
            return element.type.replace('bpmn:', '').replace('factory:', '');
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
                    {is(element, 'factory:Executor') && (
                        <div className="properties-list">
                            <ConnectedProducts element={element} modeler={modeler} products={products} />
                        </div>
                    )}
                    {
                        (element.type === 'bpmn:Task' || is(element, 'factory:Batch')) && (
                            <div className="properties-list">
                                <ConnectedExecutors element={element} modeler={modeler} products={products} />
                                <Priority element={element} modeler={modeler} />
                            </div>
                        )
                    }
                </>
            )}
        </div>
    );
}

export default ElementProperties;
