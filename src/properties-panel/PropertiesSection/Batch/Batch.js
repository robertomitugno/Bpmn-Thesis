import './Batch.css';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons'

function Batch({ element, modeler }) {

    const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(false);

    const [batch, setBatch] = useState();

    function handleBatchChange(e) {
        let newBatch = e.target.value;
        newBatch = newBatch.replace(/^0+/, '');


        const modeling = modeler.get('modeling');
        const activity = modeler.get('elementRegistry').get(element.id);

        const batch = {
            batch: newBatch
        };

        modeling.updateProperties(activity, batch);

        setBatch(newBatch);
    }

    return (
        <div className="element-properties" key={element ? element.id : ''}>
            {element && (
                <>
                    <div className="batch" onClick={() => setIsPropertiesExpanded(!isPropertiesExpanded)}>

                        <div className="properties-title">
                            <label>Batch</label>
                            <FontAwesomeIcon icon={isPropertiesExpanded ? faAngleDown : faAngleRight} />
                        </div>
                        {isPropertiesExpanded && (
                            <div className="batch-container">
                                <div className="batch-input">
                                    <span>Number of element for batch: </span>
                                    <input type="number"
                                        value={element.businessObject.$attrs.batch || 0}
                                        onChange={(e) => handleBatchChange(e)}
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


export default Batch;
