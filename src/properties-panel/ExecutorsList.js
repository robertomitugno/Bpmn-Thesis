import { is } from 'bpmn-js/lib/util/ModelUtil';
import React, { Component } from 'react';

class ExecutorsList extends Component {
  state = {
    activities: []
  };

  componentDidMount() {
    const { modeler } = this.props;

    modeler.on('elements.changed', () => {
      this.updateActivities();
    });

    this.updateActivities();
  }

  updateActivities = () => {
    const { modeler } = this.props;
    const elements = modeler.get('elementRegistry').filter(element => is(element, 'bpmn:Task'));
    const activities = elements.map(element => ({ id: element.id, name: element.businessObject.name }));
    this.setState({ activities });
  };

  render() {
    return (
      <div>
        <h3>Executors</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {this.state.activities.map(activity => (
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
}

export default ExecutorsList;
