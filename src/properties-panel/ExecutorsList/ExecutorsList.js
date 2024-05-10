import { is } from 'bpmn-js/lib/util/ModelUtil';
import './ExecutorsList.css';
import React, { useEffect, useRef, useState } from 'react';

function ExecutorsList({ modeler }) {
  const [activities, setActivities] = useState([]);
  const modelerRef = useRef(modeler);

  useEffect(() => {
    modelerRef.current = modeler;
  }, [modeler]);

  useEffect(() => {
    const eventBus = modelerRef.current.get('eventBus');

    eventBus.on('elements.changed', updateActivities);

    updateActivities();

    return () => {
      eventBus.off('elements.changed', updateActivities);
    };
  }, []);

  const updateActivities = () => {
    const elementRegistry = modelerRef.current.get('elementRegistry');
    const elements = elementRegistry.filter(element => is(element, 'custom:Executor'));
    const activities = elements.map(element => ({ id: element.id, name: element.businessObject.name }));
    setActivities(activities);
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
          {activities.map(activity => (
            <tr key={activity.id}>
              <td>{activity.name}</td>
              <td>{activity.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExecutorsList;
