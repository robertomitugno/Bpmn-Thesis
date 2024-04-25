import { is } from 'bpmn-js/lib/util/ModelUtil';
import React, { Component } from 'react';
import './PropertiesView.css';
import ExecutorsList from './ExecutorsList';
import ProductList from './ProductList';
import ElementProperties from './ElementProperties';


export default class PropertiesView extends Component {
  state = {
    selectedElements: [],
    element: null,
    products: [],
    productName: '',
    productId: 1
  };

  componentDidMount() {
    const { modeler } = this.props;
    modeler.on('selection.changed', this.handleSelectionChange);

    // Aggiorna l'elenco degli esecutori quando il componente viene montato
    this.updateExecutorsList();
  }

  componentWillUnmount() {
    const { modeler } = this.props;
    modeler.off('selection.changed', this.handleSelectionChange);
  }

  handleSelectionChange = e => {
    this.setState({
      selectedElements: e.newSelection,
      element: e.newSelection[0]
    });
  };

  updateExecutorsList = () => {
    const { modeler } = this.props;
    modeler.on('elements.changed', () => {
      this.refs.executorsList.updateActivities();
    });
    this.refs.executorsList.updateActivities();
  };

  handleProductNameChange = event => {
    this.setState({ productName: event.target.value });
  };

  handleAddProduct = () => {
    const { productName, productId } = this.state;
    if (productName.trim() !== '') {
      const newProduct = { id: productId, name: productName };
      this.setState(prevState => ({
        products: [...prevState.products, newProduct],
        productName: '',
        productId: prevState.productId + 1
      }));
    }
  };
  render() {
    const { modeler } = this.props;
    const { selectedElements, element, products, productName } = this.state;

    return (
      <div>
        {selectedElements.length === 1 && (
          <div>
            <ElementProperties modeler={modeler} element={element} />
          </div>
        )}
        {selectedElements.length === 0 && (
          <div>
            <ExecutorsList ref="executorsList" modeler={modeler} />
            <ProductList
              products={products}
              productName={productName}
              onProductNameChange={this.handleProductNameChange}
              onAddProduct={this.handleAddProduct}
            />
          </div>
        )}
        {selectedElements.length > 1 && <span>Please select a single element.</span>}
      </div>
    );
  }
}
