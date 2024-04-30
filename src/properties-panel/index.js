import ReactDOM from 'react-dom';
import React from 'react';

import PropertiesView from './PropertiesView/PropertiesView';

export default class PropertiesPanel {

  constructor(options) {

    const {
      modeler,
      container
    } = options;

    const root = ReactDOM.createRoot(container);
    root.render(
      <PropertiesView modeler={modeler} />
    );
  }
}
