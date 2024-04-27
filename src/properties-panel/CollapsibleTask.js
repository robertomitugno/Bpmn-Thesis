import React from 'react';
import ProductSearchBar from './ProductSearchBar';

const CollapsibleTask = ({ task, handleRemoveTask }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{task.businessObject.name}</button>
      {isOpen && <ProductSearchBar />}
      <button onClick={() => handleRemoveTask(task)}>Remove</button>
    </div>
  );
};

export default CollapsibleTask;
