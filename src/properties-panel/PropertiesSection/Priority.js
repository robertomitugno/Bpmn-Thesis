import './Priority.css';
import React, { useCallback, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons'

function Priority({ element, modeler }) {

    const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(false);

    // Initialize the priority state with the task's priority or 0 if it's not set
    const [priority, setPriority] = useState();

    function handlePriorityChange(e) {
        let newPriority = e.target.value;
        newPriority = newPriority.replace(/^0+/, '');


        const modeling = modeler.get('modeling');
        const activity = modeler.get('elementRegistry').get(element.id);

        const taskPriority = {
            priority: newPriority
        };

        modeling.updateProperties(activity, taskPriority);

        setPriority(newPriority);
    }

    return (
        <div className="element-properties" key={element ? element.id : ''}>
            {element && (
                <>
                    <div className="priority" onClick={() => setIsPropertiesExpanded(!isPropertiesExpanded)}>

                        <div className="properties-title">
                            <label>Activity Priority</label>
                            <FontAwesomeIcon icon={isPropertiesExpanded ? faAngleDown : faAngleRight} />
                        </div>
                        {isPropertiesExpanded && (
                            <div className="priority-container">
                                <div className="priority-input">
                                    <span>Priority: </span>
                                    <input type="number"
                                        value={element.businessObject.$attrs.priority || 0}
                                        onChange={(e) => handlePriorityChange(e)}
                                        onClick={(event) => event.stopPropagation()} />
                                </div>
                            </div>
                        )}
                    </div>

                </>
            )}
        </div>
    );
}


export default Priority;
