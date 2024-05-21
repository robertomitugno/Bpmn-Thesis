import ReactDOM from 'react-dom';
import React from 'react';

import PropertiesMain from './PropertiesMain/PropertiesMain';

export default class PropertiesPanel {

  constructor(options) {

    const {
      modeler,
      container
    } = options;

    const root = ReactDOM.createRoot(container);
    root.render(
      <PropertiesMain modeler={modeler} />
    );
  }
}
