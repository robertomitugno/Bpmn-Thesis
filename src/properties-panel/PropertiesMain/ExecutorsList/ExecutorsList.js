import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ExecutorsList.css';
import React, { useEffect, useState } from 'react';

function ExecutorsList({ modeler }) {
  const [executors, setExecutors] = useState([]);

  useEffect(() => {
    modeler.on('selection.changed', updateExecutors);

    updateExecutors();

    return () => {
      modeler.off('elements.changed', updateExecutors);
    };
  }, []);

  const updateExecutors = () => {
    const elementRegistry = modeler.get('elementRegistry');
    const elements = elementRegistry.filter(element => is(element, 'factory:Executor'));
    const executors = elements.map(element => ({ id: element.id, name: element.businessObject.name }));
    setExecutors(executors);
  };

  return (
    <div>
      <h3 className="title">Executors</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {executors.map(executor => (
            <tr key={executor.id}>
              <td>{executor.name}</td>
              <td>{executor.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExecutorsList;
